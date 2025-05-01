import { defineMiddleware } from 'astro:middleware'
import { validateSessionToken } from '~/db/auth/api'
import {
  COOKIE_NAME,
  deleteSessionTokenCookie,
  setSessionTokenCookie
} from '~/db/auth/cookies'

export const onRequest = defineMiddleware(async ({ cookies, locals }, next) => {
  const token = cookies.get(COOKIE_NAME)?.value ?? null
  if (!token) {
    locals.user = null
    locals.session = null
    return next()
  }

  const { user, session } = await validateSessionToken({ token })
  if (!!session) {
    setSessionTokenCookie({ cookies, token, expires: session.expiresAt })
  } else {
    deleteSessionTokenCookie({ cookies })
  }

  locals.user = user
  locals.session = session
  return next()
})
