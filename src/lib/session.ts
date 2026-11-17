export type SessionUser = { name: string; email: string; avatar?: string }

export function getSessionUser(): SessionUser | null {
  if (typeof window === 'undefined') return null
  try {
    const direct = localStorage.getItem('nexus_user')
    if (direct) {
      const user = JSON.parse(direct) as SessionUser
      if (user?.name || user?.email) {
        return { name: user.name || '', email: user.email || '', avatar: user.avatar }
      }
    }
    const auth = localStorage.getItem('nexus_auth')
    if (auth) {
      const parsed = JSON.parse(auth) as { isLoggedIn?: boolean; user?: SessionUser }
      const user = parsed.user
      if (parsed.isLoggedIn && user && (user.name || user.email)) {
        return { name: user.name || '', email: user.email || '', avatar: user.avatar }
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

export function saveSessionUser(user: SessionUser) {
  localStorage.setItem('nexus_user', JSON.stringify(user))
  localStorage.setItem('nexus_auth', JSON.stringify({ isLoggedIn: true, user }))
}

export function clearSessionUser() {
  localStorage.removeItem('nexus_user')
  localStorage.removeItem('nexus_auth')
}
