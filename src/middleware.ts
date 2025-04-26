import { defineMiddleware } from 'astro:middleware'
import {
  setSessionTokenCookie,
  deleteSessionTokenCookie
} from './db/auth/cookies'
import { validateSessionToken } from './db/auth/api'

export const onRequest = defineMiddleware(async ({ cookies, locals }, next) => {
  const token = cookies.get('user-session')?.value ?? null
  if (!token) {
    locals.user = null
    locals.session = null
    return next()
  }

  const { user, session } = await validateSessionToken(token)
  if (!!session) {
    setSessionTokenCookie(cookies, token, session.expiresAt)
  } else {
    deleteSessionTokenCookie(cookies)
  }

  locals.user = user
  locals.session = session
  return next()
})
