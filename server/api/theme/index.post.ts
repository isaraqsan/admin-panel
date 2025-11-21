import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const theme = await prisma.theme.upsert({
    where: { companyId: body.companyId },
    create: {
      companyId: body.companyId,
      name: body.name,
      fontFamily: body.fontFamily,
      fontHeading: body.fontHeading,
      fontBody: body.fontBody,
      colors: {
        create: body.colors || [] 
      }
    },
    update: {
      name: body.name,
      fontFamily: body.fontFamily,
      fontHeading: body.fontHeading,
      fontBody: body.fontBody,
      colors: {
        deleteMany: {},
        create: body.colors || []
      }
    }
  })

  return { success: true, data: theme }
})
