import React, { useEffect, useState, useRef } from "react"
import { checkLogin, getStorage, resetStorage } from "./util"
import { ToastContainer, toast } from 'react-toastify'
import { useHistory } from 'react-router-dom'
import socketIOClient from "socket.io-client"
import constants from "./constants"
import axios from "axios"

export default function Chat() {
  const messagesEndRef = useRef(null)
  const history = useHistory()
  const my_user_id = getStorage("user_id")

  const [username, setUsername] = useState("")
  const [search_text, setSearchText] = useState("")
  const [chat_text, setChatText] = useState("")
  const [current_chat_user, setCurrentChatId] = useState("")
  const [users, setUsers] = useState([])
  const [room, setRoom] = useState("")
  const [chat_data, setChatData] = useState([])
  const [socket, setSocket] = useState({})
  const [typing_who, setTypingWho] = useState(false)
  const [typing, setTyping] = useState(false)


  // cdm
  useEffect(async () => {

    // redirect to login if not logged in
    if (checkLogin()) {
      setUsername(getStorage("username"))
    } else {
      history.push("/login")
    }

  }, [])


  // // socket
  // useEffect(async () => {

  //   // console.log("socket:")
  //   // console.log(socket)
  //   // console.log(socket["connected"])
  //   // redirect to login if not logged in
  //   if (socket && !socket_considered) {
  //     if (Object.keys(socket).length > 0) {
  //       // console.log("socket::")
  //       // console.log(socket)
  //       setSocketConsideration(true)
  //       socket.on("chat_message", message => {
  //         console.log("incomgin message")
  //         console.log(message)
  //       })
  //     }
  //   }

  // }, [socket])

  // register socket user once available
  useEffect(async () => {
    if (username.length > 0) {
      // socket for realtime chat
      if (Object.keys(socket).length == 0) {
        console.log("Defining socket connection")

        const socket = socketIOClient(constants.socket)
        setSocket(socket)

        let timer;

        socket.on("user_type_msg", typing_person => {
          setTyping(true)
          setTypingWho(typing_person)

          if (timer) {
            clearTimeout(timer)
          }

          timer = setTimeout(() => {
            setTyping(false)
            setTypingWho("")
          }, 1500);
        })

        socket.on("chat_message", message => {
          console.log("incoming message")
          console.log([...chat_data])
          console.log(message)
          setChatData(chat_data => [...chat_data, message])
        })

        socket.emit("register_me", { username })

        if (username && !current_chat_user) {
          // fetch users to display in sidebar
          await fetchUsers()
        }


      }

      // register a room once the users are available and default user to chat with is selected
      if (users.length > 0 && username && current_chat_user) {
        const chat_with = users.find(user => user._id == current_chat_user)["username"]
        const room_name = [username, chat_with].sort((a, b) => a.localeCompare(b)).join("")
        console.log(`will register with ${room_name} room`)
        socket.emit("register_room", room_name)
        setRoom(room_name)
      }

    }

  }, [username, current_chat_user])

  // get the chat if user changed
  useEffect(async () => {
    await fetchChat()
  }, [current_chat_user])

  // set the user if users are available
  useEffect(async () => {
    for (const user of users) {
      if (user.username !== username) {
        setCurrentChatId(user["_id"])
        // const chat_with = users.find(user => user._id == current_chat_user)["username"]
        console.log("2")
        // socket.emit("register_room", [username, user.username])
        break
      }
    }
  }, [users])

  // leave the chat room - so user doesn't get the message again
  const changeChat = async (user_id) => {
    socket.emit("remove_me", room)
    setCurrentChatId(user_id)
  }

  // fetch all methods
  const fetchUsers = async () => {
    const req_obj = {
      url: constants.users,
      method: "get"
    }
    try {
      const resp = await axios(req_obj)
      if (resp.status == 200) {
        // for (const user of resp.data.data) {
        // if (user.username !== username) {
        // setCurrentChatId(user["_id"])
        // const chat_with = users.find(user => user._id == current_chat_user)["username"]
        // console.log("2")
        // socket.emit("register_room", [username, user.username])
        // break
        // }
        // }
        setUsers(resp.data.data)
      }
    } catch (error) {
      console.error("error in fetching the users")
      console.error(error)
    }
  }

  const fetchChat = async () => {
    if (current_chat_user && getStorage("user_id")) {
      const req_obj = {
        url: constants.chat,
        params: {
          from_user: getStorage("user_id"),
          to_user: current_chat_user
        },
        method: "get"
      }
      try {
        const resp = await axios(req_obj)
        if (resp.status == 200) {
          // ...
          // for (const message_index in data) {
          //   if (data[message_index].from_user == getStorage("user_id")) data[message_index]["type"] == "outgoing"
          //   else data[message_index]["type"] == "incoming"
          // }
          console.log("data>")
          console.log(resp.data.data)
          setChatData([])
          setChatData(resp.data.data)
        }
      } catch (error) {
        console.error("error in fetching the chat")
        console.error(error)
      }
    }
  }

  // logout method
  const logout = () => {
    resetStorage()
    toast(`Bye ${username}!`, { onClose: () => history.push("/login"), autoClose: 1500 })
  }


  // data for user display purpose
  let filtered_users = users
  if (search_text.trim().length > 0) {
    filtered_users = filtered_users.filter(user => user.username.toLowerCase().includes(search_text.trim()))
  }
  let chatting_with = users.find(user => user._id == current_chat_user) ? users.find(user => user._id == current_chat_user)["username"] : ""
  const sorted_data = [...chat_data]
  sorted_data.sort((a, b) => (+ new Date(a)) - (+ new Date(b)))

  console.log("...chat_data...")
  console.log(chat_data)

  // send message to server
  const sendMessage = async e => {
    e.preventDefault()
    socket.emit('send', { chat_text, my_user_id, current_chat_user, room })
    setChatText("")
  }

  const messageTyping = e => {
    socket.emit('typing', { username, room })
    setChatText(e.target.value)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [sorted_data]);


  return (
    <div className="chat-container">

      <ToastContainer />

      <div className="sidebar">
        <div className="title chat">Chats</div>
        <input className="my-input login-out" placeholder="search user" type="text" value={search_text} onChange={e => setSearchText(e.target.value.toLowerCase())} />
        {
          current_chat_user.length > 0
            ?
            filtered_users.map(user => {
              if (user.username !== username) {
                return <div className={`user-chat-container ${current_chat_user == user._id ? "active" : ""}`} key={user._id} onClick={e => changeChat(user._id)}>{user.username}</div>
              }
            })
            :
            <></>
        }

      </div>
      <div className="chat-body">

        <div className="chat-head">
          <p className="chat-title">Chat with <span>{chatting_with}</span></p>
          <div className="logged-user-info">
            <p>Logged in as <b>{username}</b></p>
            <div className="logout" onClick={() => logout()} />
          </div>
        </div>

        <div className="chat-area">

          {
            sorted_data.map(chat_block =>
              <div className={`chat-box-line ${chat_block.from_user == my_user_id ? "outgoing" : "incoming"}`} key={chat_block.message}>
                <p className="chat-box">{chat_block.message} {chat_block.to_user == current_chat_user ? chat_block.read ? <div className="double-tick" /> : <div className="tick" /> : <></>}</p>
                {/* <p className="chat-box">{chat_block.message}</p> */}
                <p className="chat-time">{new Date(chat_block.createdAt).toLocaleString('en-US', { hour12: true })}</p>
              </div>
            )
          }
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <div className={`typing-alert ${(typing_who && chatting_with && typing_who.toLowerCase() == chatting_with.toLowerCase() && typing) ? "show" : ""}`}>{typing_who} is typing ...</div>
          <div className="chat-input-line">
            <form className="chat-form" method="post" onSubmit={e => sendMessage(e)}>
              <input autoFocus className="my-input chat" placeholder="message" type="text" value={chat_text} onChange={e => messageTyping(e)} />
              <button type="submit" className={`send-button ${chat_text.trim().length > 0 ? "" : "hide"}`}>
                <div className="send-image" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
