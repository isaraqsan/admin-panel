import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readMultipartFormData(event)

    if (!body) return { success: false, error: 'No form data provided' }

    const titleField = body.find(i => i.name === 'title')
    const file = body.find(i => i.name === 'image')
    const companyIdField = body.find(i => i.name === 'companyId')

    if (!titleField?.data || !file?.data || !companyIdField?.data) {
      return { success: false, error: 'Title, Image & Company ID required' }
    }

    if (!file.filename) {
      return { success: false, error: 'Image filename required' }
    }

    const title = titleField.data.toString()
    const companyId = parseInt(companyIdField.data.toString(), 10)
    const ext = extname(file.filename)
    const filename = `${randomUUID()}${ext}`
    const filepath = join(process.cwd(), 'public/uploads', filename)

    await fs.writeFile(filepath, file.data)

    const gallery = await prisma.gallery.create({
      data: {
        title,
        image: `/uploads/${filename}`,
        company: { connect: { id: companyId } },
      },
    })

    return { success: true, data: gallery }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})
