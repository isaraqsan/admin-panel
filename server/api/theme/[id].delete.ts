import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const params = event.context.params as { companyId?: string } | undefined
  if (!params?.companyId) {
    return { success: false, error: 'companyId is required' }
  }

  const companyId = Number(params.companyId)

  // Hapus dulu colors supaya tidak error
  await prisma.themeColor.deleteMany({
    where: { theme: { companyId } }
  })

  const theme = await prisma.theme.delete({
    where: { companyId }
  })

  return { success: true, data: theme }
})
