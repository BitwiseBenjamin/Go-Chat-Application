import React, { useState, useRef, useContext, useEffect } from 'react'
import ChatBody from '../../components/chat_body'
import { WebsocketContext } from '../../modules/websocket_provider'
import { useRouter } from 'next/router'
import { API_URL } from '../../constants'
import autosize from 'autosize'
import { AuthContext } from '../../modules/auth_provider'

export type Message = {
  content: string
  client_id: string
  username: string
  room_id: string
  type: 'recv' | 'self'
}

const Index = () => {
  const [messages, setMessage] = useState<Array<Message>>([])
  const textarea = useRef<HTMLTextAreaElement>(null)
  const { conn } = useContext(WebsocketContext)
  const [users, setUsers] = useState<Array<{ username: string }>>([])
  const { user } = useContext(AuthContext)

  const router = useRouter()

    const [hasFetchedData, setHasFetchedData] = useState(false);
  
    //runs get all messages once 
    useEffect(() => {
      if (!hasFetchedData) {
        if (conn === null) {
          router.push('/')
          return
        }
        const roomId = conn.url.split('/')[5]
        getOldMessages(roomId);
        setHasFetchedData(true);
      }
    }, [hasFetchedData]);

  useEffect(() => {
    if (conn === null) {
      router.push('/')
      return
    }

    const roomId = conn.url.split('/')[5]
    
    async function getUsers() {
      try {
        const res = await fetch(`${API_URL}/ws/getClients/${roomId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await res.json()

        setUsers(data)
      } catch (e) {
        console.error(e)
      }
    }
    getUsers()
  }, [])

  useEffect(() => {
    if (textarea.current) {
      autosize(textarea.current)
    }

    if (conn === null) {
      router.push('/')
      return
    }

    conn.onmessage = (message) => {
      const m: Message = JSON.parse(message.data)
      if (m.content == 'A new user has joined the room') {
        setUsers([...users, { username: m.username }])
      }

      if (m.content == 'user left the chat') {
        const deleteUser = users.filter((user) => user.username != m.username)
        setUsers([...deleteUser])
        setMessage([...messages, m])
        return
      }

      user?.username == m.username ? (m.type = 'self') : (m.type = 'recv')

      m.room_id = conn.url.split('/')[5]
      //send message to backend
      sendMessageToBackend(m)

      setMessage([...messages, m])
    }

    conn.onclose = () => {}
    conn.onerror = () => {}
    conn.onopen = () => {}
  }, [textarea, messages, conn, users])


  const sendMessageToBackend = async (message: Message) => {
    try{
      const res = await fetch(`${API_URL}/createMessage/${message.room_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message.content,
          roomid: message.room_id,
          username: message.username,
        }),
      })
      const data = await res.json()
      //error check result
    } catch (e) {
      console.error(e)
    }}


  const sendMessage = () => {
    if (!textarea.current?.value) return
    if (conn === null) {
      router.push('/')
      return
    }
    
    conn.send(textarea.current.value)
    textarea.current.value = ''
    return
  }

  const toHomepage = () => {
    router.push('/')
  }

  async function getOldMessages(roomId: string){
    try{
        const res = await fetch(`${API_URL}/GetAllMessages/${roomId}`, {
          method: 'GET',
        })
        const data = await res.json()

        if (data.messages !== undefined) {
          if (data.messages !== null) {
          const messageObjects: Message[] = data.messages.map((messageData: any) => {
            return {
              content: messageData.content,
              client_id: '', // Fill this with the appropriate value if needed
              username: messageData.username,
              room_id: messageData.roomid,
              type: messageData.username === user.username ? 'self': 'recv', 
            };
          });

          setMessage(messageObjects);
        }
      }
      } catch (e) {
        console.error(e)
      }
  
     return null
      }


  return (
    <>
      <div className='flex flex-col w-full'>
        <div className='p-4 md:mx-6 mb-14'>
          <ChatBody data={messages} />
        </div>
        <div className='fixed bottom-0 mt-4 w-full'>
          <div className='flex md:flex-row px-4 py-2 bg-grey md:mx-4 rounded-md'>
          <button
                className='p-2 mr-3 rounded-md bg-red text-white'
                onClick={toHomepage}
              >
                exit
              </button>
            <div className='flex w-full mr-4 rounded-md border border-blue'>
              <textarea
                ref={textarea}
                placeholder='type your message here'
                className='w-full h-10 p-2 rounded-md focus:outline-none'
                style={{ resize: 'none' }}
              />
            </div>
            <div className='flex items-center'>
              <button
                className='p-2 rounded-md bg-blue text-white'
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Index
