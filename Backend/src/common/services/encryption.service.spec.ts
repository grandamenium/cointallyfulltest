import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;
  const ENCRYPTION_KEY = 'a'.repeat(64); // 32 bytes = 64 hex characters

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = ENCRYPTION_KEY;
    service = new EncryptionService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should throw error when ENCRYPTION_KEY is not set', () => {
      delete process.env.ENCRYPTION_KEY;
      expect(() => new EncryptionService()).toThrow(
        'ENCRYPTION_KEY environment variable is required',
      );
    });

    it('should throw error when ENCRYPTION_KEY has invalid length', () => {
      process.env.ENCRYPTION_KEY = 'short';
      expect(() => new EncryptionService()).toThrow(
        'ENCRYPTION_KEY must be 32 bytes',
      );
    });
  });

  describe('encrypt', () => {
    it('should encrypt a string', () => {
      const plaintext = 'Hello, World!';
      const encrypted = service.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:encrypted
    });

    it('should produce different ciphertext for same plaintext', () => {
      const plaintext = 'test data';
      const encrypted1 = service.encrypt(plaintext);
      const encrypted2 = service.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2); // Different IVs
    });

    it('should encrypt empty string', () => {
      const plaintext = '';
      const encrypted = service.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted.split(':')).toHaveLength(3);
    });

    it('should encrypt special characters', () => {
      const plaintext = '!@#$%^&*()_+-={}[]|:;"<>,.?/~`';
      const encrypted = service.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt unicode characters', () => {
      const plaintext = '你好世界 🚀 émojis';
      const encrypted = service.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('decrypt', () => {
    it('should decrypt an encrypted string', () => {
      const plaintext = 'Secret Message';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for invalid encrypted text format', () => {
      const invalidEncrypted = 'not:valid';
      expect(() => service.decrypt(invalidEncrypted)).toThrow(
        'Invalid encrypted text format',
      );
    });

    it('should throw error for tampered ciphertext', () => {
      const plaintext = 'test';
      const encrypted = service.encrypt(plaintext);
      const parts = encrypted.split(':');
      // Tamper with the encrypted data
      const tampered = `${parts[0]}:${parts[1]}:${parts[2]}abc`;

      expect(() => service.decrypt(tampered)).toThrow();
    });

    it('should throw error for tampered auth tag', () => {
      const plaintext = 'test';
      const encrypted = service.encrypt(plaintext);
      const parts = encrypted.split(':');
      // Tamper with the auth tag
      const tampered = `${parts[0]}:ffffffffffffffffffffffffffffffff:${parts[2]}`;

      expect(() => service.decrypt(tampered)).toThrow();
    });
  });

  describe('hash', () => {
    it('should hash a string', () => {
      const text = 'test data';
      const hash = service.hash(text);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it('should produce same hash for same input', () => {
      const text = 'consistent data';
      const hash1 = service.hash(text);
      const hash2 = service.hash(text);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = service.hash('data1');
      const hash2 = service.hash('data2');

      expect(hash1).not.toBe(hash2);
    });

    it('should hash empty string', () => {
      const hash = service.hash('');

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });
  });

  describe('round-trip encryption', () => {
    it('should correctly encrypt and decrypt API keys', () => {
      const apiKey = 'sk_live_123456789abcdef';
      const encrypted = service.encrypt(apiKey);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(apiKey);
    });

    it('should correctly encrypt and decrypt long text', () => {
      const longText = 'a'.repeat(10000);
      const encrypted = service.encrypt(longText);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(longText);
    });

    it('should correctly encrypt and decrypt JSON data', () => {
      const jsonData = JSON.stringify({
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        metadata: { foo: 'bar' },
      });

      const encrypted = service.encrypt(jsonData);
      const decrypted = service.decrypt(encrypted);
      const parsed = JSON.parse(decrypted);

      expect(parsed.apiKey).toBe('test-key');
      expect(parsed.apiSecret).toBe('test-secret');
      expect(parsed.metadata.foo).toBe('bar');
    });
  });
});
