import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    const deleted = await prisma.company.delete({ where: { id } })
    return { success: true, data: deleted }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
