import type { APIContext } from 'astro'
import { defineMiddleware } from 'astro:middleware'
import {
  setSessionTokenCookie,
  deleteSessionTokenCookie
} from './db/auth/cookies'
import { validateSessionToken } from './db/auth/api'

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, locals } = context

  const token = cookies.get('session')?.value ?? null
  if (!token) {
    locals.user = null
    locals.session = null

    return next()
  }

  const { user, session } = await validateSessionToken(token)
  if (!!session) {
    setSessionTokenCookie(context, token, session.expiresAt)
  } else {
    deleteSessionTokenCookie(context)
  }

  locals.user = user
  locals.session = session
  return next()
})
