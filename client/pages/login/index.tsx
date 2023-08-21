import { useState, useContext, useEffect } from 'react'
import { API_URL } from '../../constants'
import { useRouter } from 'next/router'
import { AuthContext, UserInfo } from '../../modules/auth_provider'



//type Visibility = 'visible' | 'hidden' | 'collapse';

const index = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { authenticated } = useContext(AuthContext)
  const [isVisible, setIsVisible] = useState(true)
  const [username, setUsername] = useState('')
  const router = useRouter()
  const [loginError, setLoginError] = useState(false)


  useEffect(() => {
    if (authenticated) {
      router.push('/')
      return
    }
  }, [authenticated])


  const changeHandler = (e: React.SyntheticEvent) => {
    e.preventDefault()

    setIsVisible(!isVisible)
    
  };



  const submitLoginHandler = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
     
      if (res.ok) {
        
        const user: UserInfo = {
          username: data.username,
          id: data.id,
        }

        localStorage.setItem('user_info', JSON.stringify(user))
        return router.push('/')
      }else {
          
          setLoginError(true)
      }
    } catch (err) {
      console.log(err)
    }
    
  }

  const submitSignupHandler = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username}),
      })

      const data = await res.json()
      if (res.ok) {
        const user: UserInfo = {
          username: data.username,
          id: data.id,
        }

        setIsVisible(true);
        return
      }else{
        setLoginError(true)
      }
    } catch (err) {
      console.log(err)
    }
  }



  return (
    <>
    <div className={`flex items-center justify-center min-h-screen min-w-full ${isVisible ? 'visible' : 'hidden'}`}>
      <form className='flex flex-col items-center justify-center md:w-1/5'>
        <div className='text-3xl font-bold text-center'>
          <span className='text-blue'>welcome!</span>
        </div>
        <div className={`${loginError ? 'visible' : 'hidden'} text-red font-bold`}>Login Error</div>
        <input
          placeholder='email'
          className='p-3 mt-8 rounded-md border-2 border-grey focus:outline-none focus:border-blue'
          value={email}
          onChange={(e) => {setEmail(e.target.value); setLoginError(false);}}
        />
        <input
          type='password'
          placeholder='password'
          className='p-3 mt-4 rounded-md border-2 border-grey focus:outline-none focus:border-blue'
          value={password}
          onChange={(e) => {setPassword(e.target.value); setLoginError(false);}}
        />
        <button
          className='p-3 mt-6 rounded-md bg-blue font-bold text-white'
          type='submit'
          onClick={submitLoginHandler}
        >
          login
        </button>
        <button
          className='p-2 mt-1 font-bold bg-white text-blue text-center'
          onClick={changeHandler}
        >
          sign up
        </button>
      </form>
    </div>


<div className={`flex items-center justify-center  min-h-screen min-w-full ${isVisible ? 'hidden' : 'visible'}`}>
<form className='flex flex-col md:w-1/5'>
  <div className='text-3xl font-bold text-center'>
    <span className='text-blue'>Hello new user!</span>
  </div>
  <div className={`${loginError ? 'visible' : 'hidden'} text-red font-bold`}>Signup Error</div>
  <input
    placeholder='username'
    className='p-3 mt-8 rounded-md border-2 border-grey focus:outline-none focus:border-blue'
    value={username}
    onChange={(e) => {setUsername(e.target.value); setLoginError(false);}}
  />
  <input
    placeholder='email'
    className='p-3 mt-8 rounded-md border-2 border-grey focus:outline-none focus:border-blue'
    value={email}
    onChange={(e) => {setEmail(e.target.value); setLoginError(false);}}
  />
  <input
    type='password'
    placeholder='password'
    className='p-3 mt-4 rounded-md border-2 border-grey focus:outline-none focus:border-blue'
    value={password}
    onChange={(e) => {setPassword(e.target.value); setLoginError(false);}}
  />
  <button
    className='p-3 mt-6 rounded-md bg-blue font-bold text-white'
    type='submit'
    onClick={submitSignupHandler}
  >
      sign up
  </button>
  <button
    className='p-2 mt-2 rounded-md bg-white font-bold text-blue'
    onClick={changeHandler}
  >
    go to login
  </button>
</form>
</div>
</>
  )
}

export default index
