import { defineMiddleware } from 'astro:middleware'
import {
  setSessionTokenCookie,
  deleteSessionTokenCookie,
  AUTH_COOKIE_NAME
} from '~/auth/cookies'
import { validateSessionToken } from '~/auth/api'

export const onRequest = defineMiddleware(async (ctx, next) => {
  const token = ctx.cookies.get(AUTH_COOKIE_NAME)?.value ?? undefined
  if (!token) {
    ctx.locals.user = undefined
    ctx.locals.session = undefined
    return next()
  }

  const { user, session } = await validateSessionToken(token)
  if (!session) {
    deleteSessionTokenCookie(ctx)
  } else {
    setSessionTokenCookie(ctx, token, session.expiresAt)
  }

  ctx.locals.user = user
  ctx.locals.session = session
  return next()
})
