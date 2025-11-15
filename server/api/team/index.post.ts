import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)

    if (!formData) {
      return { success: false, error: 'No form data provided' }
    }

    const nameField = formData.find(i => i.name === 'name')
    const positionField = formData.find(i => i.name === 'position')
    const bioField = formData.find(i => i.name === 'bio')
    const photoFile = formData.find(i => i.name === 'photo')
    const companyIdField = formData.find(i => i.name === 'companyId')

    if (!nameField?.data || !positionField?.data || !companyIdField?.data) {
      return { success: false, error: 'Name, position, and companyId are required.' }
    }

    const companyId = parseInt(companyIdField.data.toString(), 10)

    let photoPath: string | null = null

    if (photoFile && photoFile.filename && photoFile.data) {
      const ext = extname(photoFile.filename)
      const filename = `${randomUUID()}${ext}`
      const uploadDir = join(process.cwd(), 'public/uploads')

      await fs.mkdir(uploadDir, { recursive: true })

      const filepath = join(uploadDir, filename)
      await fs.writeFile(filepath, photoFile.data)

      photoPath = `/uploads/${filename}`
    }

    const team = await prisma.team.create({
      data: {
        name: nameField.data.toString(),
        position: positionField.data.toString(),
        bio: bioField?.data?.toString() || null,
        photo: photoPath,
        company: { connect: { id: companyId } }, // relasi ke company
      },
    })

    return { success: true, data: team }
  } catch (e: any) {
    console.error('Error creating team:', e)
    return { success: false, error: e.message }
  }
})
