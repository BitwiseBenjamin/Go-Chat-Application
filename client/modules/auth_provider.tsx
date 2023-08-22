import { useState, createContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { API_URL } from '../constants'

export type UserInfo = {
  username: string
  id: string
}


export const AuthContext = createContext<{
  authenticated: boolean
  setAuthenticated: (auth: boolean) => void
  user: UserInfo
  setUser: (user: UserInfo) => void
}>({
  authenticated: false,
  setAuthenticated: () => {},
  user: { username: '', id: '' },
  setUser: () => {},
})

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<UserInfo>({ username: '', id: '' })

  const router = useRouter()

  useEffect(() => {

    const jwtCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('jwt='));

      console.log("Cookie:?" + jwtCookie)

      if (jwtCookie) {
        const jwtToken = jwtCookie.split('=')[1];

        fetch(`${API_URL}/validateToken`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
          .then(response => response.json())
          .then(data => {
            if (data.valid) {
              setUser({
                username: data.username,
                id: data.id,
              });
              setAuthenticated(true);
            } else {
              // Token is not valid, redirect to login
              router.push('/login');
            }
          })
          .catch(error => {
            console.error('Token validation error:', error);
            router.push('/login');
          });
    }
  }, [authenticated])

  return (
    <AuthContext.Provider
      value={{
        authenticated: authenticated,
        setAuthenticated: setAuthenticated,
        user: user,
        setUser: setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider
