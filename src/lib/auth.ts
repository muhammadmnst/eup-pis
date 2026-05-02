import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { username, password } = parsed.data

        const admin = await prisma.admin.findUnique({
          where: { username },
        })

        if (!admin) return null

        const valid = await bcrypt.compare(password, admin.passwordHash)
        if (!valid) return null

        return {
          id: admin.id,
          name: admin.name ?? admin.username,
          email: admin.username,
        }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 jam
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    // ← Ini yang penting: proteksi route /admin/*
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl

      // Halaman login selalu boleh diakses
      if (pathname.startsWith('/admin/login')) return true

      // Semua route /admin/* lainnya butuh session
      if (pathname.startsWith('/admin')) {
        return !!auth?.user
      }

      return true
    },
  },
})

