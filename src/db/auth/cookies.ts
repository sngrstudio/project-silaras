import type { AstroCookies } from 'astro'

export const COOKIE_NAME = 'auth_session' as const

export const setSessionTokenCookie = ({
  cookies,
  token,
  expires
}: {
  cookies: AstroCookies
  token: string
  expires: Date
}) => {
  cookies.set(COOKIE_NAME, token, {
    expires,
    path: '/',
    httpOnly: true,
    sameSite: import.meta.env.PROD ? 'strict' : 'lax',
    secure: import.meta.env.PROD
  })
}

export const deleteSessionTokenCookie = ({
  cookies
}: {
  cookies: AstroCookies
}) => {
  cookies.delete(COOKIE_NAME)
}
