import { prisma } from '../../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { H3Event } from 'h3';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event);
    const { email, password } = body;

    if (!email || !password) {
      return { success: false, error: 'Email & password required' };
    }

    // Cari user + company relation
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }, // ambil info company
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid password' };
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          company: {
            id: user.company.id,
            name: user.company.name,
            email: user.company.email,
            phone: user.company.phone,
            logo: user.company.logo
          },
        },
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});
