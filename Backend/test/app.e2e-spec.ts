import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('CoinTally Backend (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  let exchangeConnectionId: string;
  let transactionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('/auth/register (POST) - should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'SecurePassword123!',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      accessToken = response.body.accessToken;
      userId = response.body.user.id;
    });

    it('/auth/register (POST) - should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePassword123!',
          name: 'Test User',
        })
        .expect(400);
    });

    it('/auth/register (POST) - should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          name: 'Test User',
        })
        .expect(400);
    });

    it('/auth/login (POST) - should login with valid credentials', async () => {
      const email = `login-${Date.now()}@example.com`;

      // Register first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'SecurePassword123!',
          name: 'Login Test',
        });

      // Then login
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: 'SecurePassword123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('/auth/login (POST) - should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('/auth/me (GET) - should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
        });
    });

    it('/auth/me (GET) - should fail without token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });
  });

  describe('User Profile', () => {
    it('/user/profile (GET) - should get user profile', () => {
      return request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('/user/profile (PATCH) - should update user profile', () => {
      return request(app.getHttpServer())
        .patch('/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
          onboardingCompleted: true,
        })
        .expect(200);
    });

    it('/user/tax-info (PUT) - should update tax information', () => {
      return request(app.getHttpServer())
        .put('/user/tax-info')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          country: 'US',
          taxMethod: 'FIFO',
          fiscalYearEnd: '12-31',
        })
        .expect(200);
    });
  });

  describe('Wallets Management', () => {
    it('/wallets/sources (GET) - should get available wallet sources (public)', () => {
      return request(app.getHttpServer())
        .get('/wallets/sources')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/wallets/connected (GET) - should get connected wallets', () => {
      return request(app.getHttpServer())
        .get('/wallets/connected')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('/wallets/connected (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/wallets/connected')
        .expect(401);
    });
  });

  describe('Exchange Management', () => {
    it('/exchanges (GET) - should get user exchange connections', () => {
      return request(app.getHttpServer())
        .get('/exchanges')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/exchanges (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/exchanges')
        .expect(401);
    });

    // Note: We can't test actual exchange connections without valid API keys
    it('/exchanges/connect (POST) - should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/exchanges/connect')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          exchangeName: 'coinbase',
          apiKey: 'invalid-key',
          apiSecret: 'invalid-secret',
        })
        .expect(400);
    });
  });

  describe('Transactions', () => {
    it('/transactions (GET) - should get user transactions', () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/transactions (GET) - should support filtering by category', () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .query({ category: 'buy' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('/transactions (GET) - should support pagination', () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .query({ limit: 10, page: 1 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('/transactions (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .expect(401);
    });
  });

  describe('CSV Import', () => {
    it('/transactions/import/templates (GET) - should get available CSV templates', () => {
      return request(app.getHttpServer())
        .get('/transactions/import/templates')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('templates');
          expect(Array.isArray(res.body.templates)).toBe(true);
        });
    });

    it('/transactions/import/csv (POST) - should require authentication', () => {
      return request(app.getHttpServer())
        .post('/transactions/import/csv')
        .send({
          csvContent: 'timestamp,type,asset,amount',
          sourceName: 'manual',
        })
        .expect(401);
    });
  });

  describe('Tax Forms', () => {
    it('/forms (GET) - should get user tax forms', () => {
      return request(app.getHttpServer())
        .get('/forms')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/forms/generate (POST) - should initiate form generation', () => {
      return request(app.getHttpServer())
        .post('/forms/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          taxYear: 2024,
          taxMethod: 'FIFO',
        })
        .expect(201);
    });

    it('/forms (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/forms')
        .expect(401);
    });
  });

  describe('Background Jobs', () => {
    it('/sync/stats (GET) - should get queue statistics', () => {
      return request(app.getHttpServer())
        .get('/sync/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('waiting');
          expect(res.body).toHaveProperty('active');
          expect(res.body).toHaveProperty('completed');
          expect(res.body).toHaveProperty('failed');
        });
    });

    it('/sync/status/:jobId (GET) - should get job status', () => {
      return request(app.getHttpServer())
        .get('/sync/status/test-job-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('Two-Factor Authentication', () => {
    it('/auth/2fa/setup (POST) - should setup 2FA', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/setup')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('secret');
      expect(response.body).toHaveProperty('qrCode');
    });

    it('/auth/2fa/setup (POST) - should require authentication', () => {
      return request(app.getHttpServer())
        .post('/auth/2fa/setup')
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404);
    });

    it('should return 400 for invalid request body', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          invalidField: 'value',
        })
        .expect(400);
    });

    it('should return 401 for protected routes without token', () => {
      return request(app.getHttpServer())
        .get('/user/profile')
        .expect(401);
    });
  });
});
