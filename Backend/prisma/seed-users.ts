import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting user seeding...\n');

  const password = 'Test1234!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const users = [
    {
      email: 'admin@test.com',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      emailVerified: true,
      onboardingCompleted: true,
      taxInfo: {
        filingYear: 2024,
        state: 'California',
        filingStatus: 'single',
        incomeBand: '200k+',
        priorYearLosses: 0,
      },
    },
    {
      email: 'user1@test.com',
      name: 'John Smith',
      firstName: 'John',
      lastName: 'Smith',
      emailVerified: true,
      onboardingCompleted: true,
      taxInfo: {
        filingYear: 2024,
        state: 'New York',
        filingStatus: 'married',
        incomeBand: '100k-200k',
        priorYearLosses: 5000,
      },
    },
    {
      email: 'user2@test.com',
      name: 'Sarah Johnson',
      firstName: 'Sarah',
      lastName: 'Johnson',
      emailVerified: true,
      onboardingCompleted: true,
      taxInfo: {
        filingYear: 2024,
        state: 'Texas',
        filingStatus: 'single',
        incomeBand: '50k-100k',
        priorYearLosses: 0,
      },
    },
    {
      email: 'demo@cointally.com',
      name: 'Demo User',
      firstName: 'Demo',
      lastName: 'User',
      emailVerified: true,
      onboardingCompleted: false,
      taxInfo: null,
    },
    {
      email: 'test@example.com',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      emailVerified: false,
      onboardingCompleted: false,
      taxInfo: null,
    },
  ];

  for (const userData of users) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create new user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: hashedPassword,
          name: userData.name,
          firstName: userData.firstName,
          lastName: userData.lastName,
          emailVerified: userData.emailVerified,
          onboardingCompleted: userData.onboardingCompleted,
          taxInfo: userData.taxInfo || Prisma.JsonNull,
          twoFactorEnabled: false,
        },
      });

      console.log(`✅ Created user: ${user.email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      if (userData.taxInfo) {
        console.log(`   Tax Info: ${userData.taxInfo.state}, ${userData.taxInfo.filingStatus}`);
      }
      console.log('');
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
    }
  }

  console.log('\n🎉 User seeding completed!');
  console.log('\n📝 Login credentials for all users:');
  console.log('   Password: Test1234!');
  console.log('\n📧 Available test accounts:');
  users.forEach(u => {
    console.log(`   - ${u.email} (${u.name})`);
  });
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });