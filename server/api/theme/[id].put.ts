import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // pastikan params ada
  const params = event.context.params as { companyId?: string } | undefined
  if (!params?.companyId) {
    return { success: false, error: 'companyId is required' }
  }

  const companyId = Number(params.companyId)
  const body = await readBody(event)

  const theme = await prisma.theme.update({
    where: { companyId },
    data: {
      name: body.name,
      fontFamily: body.fontFamily,
      fontHeading: body.fontHeading,
      fontBody: body.fontBody,
      colors: {
        deleteMany: {},
        create: body.colors || []
      }
    },
    include: {
      colors: true
    }
  })

  return { success: true, data: theme }
})
