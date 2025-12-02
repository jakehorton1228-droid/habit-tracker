import { useState, useEffect } from 'react'

export default function useAuth() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // placeholder: fetch user or check cookie / token
  }, [])

  return { user, setUser }
}
