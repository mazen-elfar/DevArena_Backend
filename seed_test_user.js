import { getPrisma } from "./src/config/database.js";
import bcrypt from "bcryptjs";

const prisma = getPrisma();

async function run() {
  const email = "test@devarena.io";
  const password = "Test1234!";
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("User already exists:", email);
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });
    console.log("Password updated.");
  } else {
    console.log("Creating user:", email);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            username: "testuser",
            displayName: "Test User",
          }
        }
      }
    });
    console.log("User created:", user.id);
  }

  const roleName = "DEVELOPER";
  let role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    role = await prisma.role.create({ data: { name: roleName } });
  }

  const userRecord = await prisma.user.findUnique({ 
    where: { email },
    include: { roles: true }
  });

  if (!userRecord.roles.some(r => r.roleId === role.id)) {
    await prisma.userRole.create({
      data: {
        userId: userRecord.id,
        roleId: role.id
      }
    });
    console.log("DEVELOPER role added.");
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
