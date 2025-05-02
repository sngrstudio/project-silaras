declare namespace App {
  interface Locals {
    user: import('./db/auth/api').ValidatedSessionToken['user']
    session: import('./db/auth/api').ValidatedSessionToken['session']
  }

  interface SessionData {
    token: string
  }
}
