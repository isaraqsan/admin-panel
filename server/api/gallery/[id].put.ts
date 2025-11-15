import { PrismaClient } from '@prisma/client'
import { readBody, getQuery } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    const body = await readBody(event)
    const { title, image } = body

    const updated = await prisma.gallery.update({
      where: { id },
      data: { title, image }
    })

    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
