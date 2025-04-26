import type { FC } from 'react'
import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'

const LogoutButton: FC = () => {
  const handleLogout = async () => {
    await actions.auth.logout()
    navigate('/')
  }
  return <button onClick={() => handleLogout()}>Logout</button>
}

export default LogoutButton
