import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function check() {
  let output = '--- DB AUDIT SUMMARY ---\n';
  
  const users = await prisma.user.findMany({
    include: {
      profile: true,
      providers: true,
    },
  });

  const emailMap = {};
  const providerMap = {};

  users.forEach(u => {
    // Track by email
    if (!emailMap[u.email]) emailMap[u.email] = [];
    emailMap[u.email].push(u.id);

    // Track by provider
    u.providers.forEach(p => {
      const key = `${p.provider}:${p.providerUid}`;
      if (!providerMap[key]) providerMap[key] = [];
      providerMap[key].push(u.id);
    });

    output += `User: ${u.id}\n`;
    output += `  Email: ${u.email}\n`;
    if (u.profile) {
      output += `  Profile: ${u.profile.id} | Completed: ${u.profile.profileCompleted} | Username: ${u.profile.username}\n`;
    } else {
      output += `  Profile: MISSING\n`;
    }
  });

  output += '\n--- DUPLICATE CHECK ---\n';
  Object.keys(emailMap).forEach(email => {
    if (emailMap[email].length > 1) {
      output += `[!] DUPLICATE EMAIL found for ${email}: ${emailMap[email].join(', ')}\n`;
    }
  });

  Object.keys(providerMap).forEach(key => {
    if (providerMap[key].length > 1) {
      output += `[!] DUPLICATE PROVIDER ID found for ${key}: ${providerMap[key].join(', ')}\n`;
    }
  });

  fs.writeFileSync('audit-log.txt', output, 'utf8');
  console.log('Audit complete. See audit-log.txt');
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
