import type { APIContext } from 'astro'

export const setSessionTokenCookie = (
  context: APIContext,
  token: string,
  expiresAt: Date
) => {
  const { cookies } = context
  cookies.set('session', token, {
    expires: expiresAt,
    path: '/',
    httpOnly: true,
    sameSite: import.meta.env.PROD ? 'strict' : 'lax',
    secure: import.meta.env.PROD
  })
}

export const deleteSessionTokenCookie = (context: APIContext) => {
  const { cookies } = context
  cookies.delete('session', {
    path: '/',
    httpOnly: true,
    sameSite: import.meta.env.PROD ? 'strict' : 'lax',
    secure: import.meta.env.PROD
  })
}
