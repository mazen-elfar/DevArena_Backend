import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function testModels() {
  const models = [
    'user', 'profile', 'role', 'permission', 'rolePermission', 'userPermission', 
    'userRole', 'userProvider', 'skillCategory', 'skill', 'userSkill', 'post', 
    'comment', 'reaction', 'savedPost', 'follow', 'developerCircle', 'circleMember', 
    'friendship', 'conversation', 'conversationParticipant', 'message', 'questCategory', 
    'quest', 'testCase', 'submission', 'battle', 'battlePlayer', 'battleSubmission', 
    'matchmakingQueue', 'rank', 'rankHistory', 'tournament', 'tournamentRegistration', 
    'tournamentParticipant', 'tournamentResult', 'reputation', 'notification', 'xpLog', 
    'userRankHistory', 'userAchievement', 'coinTransaction', 'streak', 'organizationMember', 
    'teamMember', 'teamInvite', 'verificationRequest', 'userTitle', 'adminAction', 'report'
  ];

  const report = [];

  for (const model of models) {
    try {
      if (typeof prisma[model] === 'undefined') {
        report.push({ model, status: 'UNDEFINED', error: 'Not exported in Prisma Client' });
        continue;
      }
      await prisma[model].count();
      report.push({ model, status: 'OK' });
    } catch (error) {
      report.push({ model, status: 'FAILED', error: error.message });
    }
  }

  await prisma.$disconnect();
  fs.writeFileSync('prisma-test-report.json', JSON.stringify(report, null, 2));
  console.log('Report written to prisma-test-report.json');
}

testModels();
