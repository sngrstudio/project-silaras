declare namespace App {
  interface Locals {
    user: import('~/auth/api').UserSession['user']
    session: import('~/auth/api').UserSession['session']
  }
}
