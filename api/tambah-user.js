import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = "owner_ilham"; // Ganti sesuai keinginan
  const password = "password123"; // Ganti sesuai keinginan
  const role = "OWNER"; // Bisa OWNER atau KARYAWAN

  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.user.create({
    data: { username, password: hashedPassword, role }
  });

  console.log(`✅ Akun ${role} berhasil dibuat!`);
}

main();