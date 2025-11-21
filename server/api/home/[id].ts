import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = Number(event.context.params?.id)
    const method = event.node.req.method

    if (method === 'GET') {
        try {
            const section = await prisma.homeSection.findUnique({
                where: { id },
                include: { banners: true, company: true },
            })

            if (!section) return { success: false, error: 'Home section not found' }
            return { success: true, data: section }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    if (method === 'PUT') {
        try {
            const body = await readBody(event)
            const { headline, subheadline } = body

            const updated = await prisma.homeSection.update({
                where: { id },
                data: { headline, subheadline },
            })

            return { success: true, data: updated }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    if (method === 'DELETE') {
        try {
            await prisma.homeSection.delete({ where: { id } })
            return { success: true, data: null, message: 'Deleted successfully' }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    return { success: false, error: 'Method not allowed' }
})
