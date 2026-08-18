import prisma from '../../config/database';

export async function generateDonorCode(): Promise<string> {
  const count = await prisma.donor.count();
  const nextNum = 1001 + count;
  let code = `DNR-${nextNum}`;

  // Ensure uniqueness
  let exists = await prisma.donor.findUnique({ where: { donorCode: code } });
  let suffix = 1;
  while (exists) {
    code = `DNR-${nextNum + suffix}`;
    exists = await prisma.donor.findUnique({ where: { donorCode: code } });
    suffix++;
  }

  return code;
}
