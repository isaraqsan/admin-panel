import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    const form = await readMultipartFormData(event)
    if (!form) throw new Error("Invalid form data")

    // Get existing record
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) throw new Error("Product not found")

    let name = product.name
    let description = product.description
    let price: number | null = product.price
    let companyId: number | null = product.companyId
    let newImagePath: string | null = null

    for (const field of form) {
      if (field.name === 'name') name = field.data.toString()
      if (field.name === 'description') description = field.data.toString()
      if (field.name === 'price') price = parseFloat(field.data.toString())
      if (field.name === 'companyId') companyId = Number(field.data.toString())

      // Handle file upload
      if (field.filename) {
        const uploadDir = 'public/uploads/products'
        const fileName = Date.now() + '-' + field.filename
        const fullPath = path.join(uploadDir, fileName)

        await fs.mkdir(uploadDir, { recursive: true })
        await fs.writeFile(fullPath, field.data)

        // Delete old image
        if (product.image) {
          const oldPath = path.join('public', product.image)
          fs.unlink(oldPath).catch(() => null)
        }

        newImagePath = '/uploads/products/' + fileName
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        image: newImagePath || product.image,
        companyId: companyId!,
      }
    })

    return { success: true, data: updated }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
