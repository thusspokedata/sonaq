import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ Falta DATABASE_URL en el entorno.");
  process.exit(1);
}

const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Administrador";

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL y ADMIN_PASSWORD son requeridos.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`✓ El usuario ${email} ya existe, no se creó uno nuevo.`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log(`✓ Admin creado: ${user.email}`);
  console.log(`  Nombre: ${user.name}`);
  console.log(`  Role:   ${user.role}`);
  console.log(`\n  ⚠️  Cambiá la contraseña después del primer login.`);
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
