import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
	pages: {
		signIn: '/login',
	},
	providers: [],
	session: { strategy: 'jwt' },
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.id = user.id
				token.email = user.email
			}
			return token
		},
		session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string
				session.user.email = token.email as string
			}
			return session
		},
		authorized({ auth, request }) {
			const { pathname } = request.nextUrl

			// API 路由由各 handler 自行鉴权，避免返回 HTML 重定向
			if (pathname.startsWith('/api/')) {
				return true
			}

			const isLoggedIn = !!auth?.user
			const isAuthPage =
				pathname.startsWith('/login') || pathname.startsWith('/register')

			if (isAuthPage) {
				if (isLoggedIn) {
					return Response.redirect(new URL('/', request.nextUrl))
				}
				return true
			}

			return isLoggedIn
		},
	},
} satisfies NextAuthConfig
