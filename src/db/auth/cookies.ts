import type { AstroCookies } from 'astro'

export const setSessionTokenCookie = (
  cookies: AstroCookies,
  token: string,
  expiresAt: Date
) => {
  cookies.set('user-session', token, {
    expires: expiresAt,
    path: '/',
    httpOnly: true,
    sameSite: import.meta.env.PROD ? 'strict' : 'lax',
    secure: import.meta.env.PROD
  })
}

export const deleteSessionTokenCookie = (cookies: AstroCookies) => {
  cookies.delete('user-session', {
    path: '/',
    httpOnly: true,
    sameSite: import.meta.env.PROD ? 'strict' : 'lax',
    secure: import.meta.env.PROD
  })
}
