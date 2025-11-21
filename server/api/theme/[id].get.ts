import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // pastikan params ada dan companyId tersedia
  const params = event.context.params as { id?: string } | undefined
  const companyId = params?.id

  if (!companyId) {
    return { success: false, error: 'companyId is required' }
  }

  const theme = await prisma.theme.findUnique({
    where: { companyId: Number(companyId) },
    include: {
      colors: true
    }
  })

  return { success: true, data: theme }
})
