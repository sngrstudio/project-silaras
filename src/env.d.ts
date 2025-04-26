declare namespace App {
  interface Locals {
    user: import('./db/schema/user').User | null
    session: import('./db/schema/user').Session | null
  }
}
