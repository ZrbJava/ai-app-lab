import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { authConfig } from '@/auth.config'
import { verifyUser } from '@/lib/users'

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	providers: [
		Credentials({
			credentials: {
				email: { label: '邮箱', type: 'email' },
				password: { label: '密码', type: 'password' },
			},
			authorize: async credentials => {
				const email = credentials?.email
				const password = credentials?.password
				if (typeof email !== 'string' || typeof password !== 'string') {
					return null
				}
				return verifyUser(email, password)
			},
		}),
	],
})
