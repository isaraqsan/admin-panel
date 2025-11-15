import { PrismaClient } from '@prisma/client';
import { H3Event } from 'h3';

const prisma = new PrismaClient();

export default defineEventHandler(async (event: H3Event) => {
  try {
    const users = await prisma.user.findMany(); // TypeScript otomatis tahu ini User[]
    return { success: true, data: users };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
