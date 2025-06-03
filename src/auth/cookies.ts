import type { APIContext } from 'astro'
import type { ActionAPIContext } from 'astro:actions'

export const AUTH_COOKIE_NAME = 'auth_session' as const

export const setSessionTokenCookie = (
  ctx: APIContext | ActionAPIContext,
  token: string,
  expiresAt: Date
) => {
  ctx.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: import.meta.env.PROD,
    expires: expiresAt,
    path: '/'
  })
}

export const deleteSessionTokenCookie = (
  ctx: APIContext | ActionAPIContext
) => {
  ctx.cookies.delete(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'strict',
    secure: import.meta.env.PROD,
    path: '/'
  })
}
