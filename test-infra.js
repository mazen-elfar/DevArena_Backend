import { getPrisma } from './src/config/database.js';

async function testConnection() {
  console.log('--- DevArena Infrastructure Audit ---');
  const prisma = getPrisma();
  try {
    console.log('Testing PostgreSQL/Prisma connection...');
    await prisma.$connect();
    console.log('✅ PostgreSQL Status: CONNECTED');
    
    const userCount = await prisma.user.count();
    console.log(`✅ Prisma Status: OPERATIONAL (Found ${userCount} users)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database Status: DISCONNECTED');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testConnection();
