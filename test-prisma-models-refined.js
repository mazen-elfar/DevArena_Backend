import { PrismaClient } from '@prisma/client';

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

  console.log('--- START_REPORT ---');

  for (const model of models) {
    try {
      if (typeof prisma[model] === 'undefined') {
        console.log(`MODEL:${model}|STATUS:UNDEFINED|ERROR:Not exported in Prisma Client`);
        continue;
      }
      await prisma[model].count();
      console.log(`MODEL:${model}|STATUS:OK`);
    } catch (error) {
      console.log(`MODEL:${model}|STATUS:FAILED|ERROR:${error.message.replace(/\n/g, ' ')}`);
    }
  }

  await prisma.$disconnect();
  console.log('--- END_REPORT ---');
}

testModels();
