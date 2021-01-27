import React, { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { checkLogin, getStorage, setStorage } from "./util"
import constants from "./constants"
import { useHistory } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import axios from "axios"


export default function Login_out() {
  const history = useHistory()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [page_type, setPageType] = useState("")

  // cdm
  useEffect(() => {
    setPageType(window.location.pathname)
    if(checkLogin()) {
      history.push("/chat")
    }
  }, [page_type])

  const validate = () => {
    if (username.trim().length == 0) {
      toast.error("Please enter the username", {autoClose: 3000})
      return "failed"
    } else if (password.trim().length == 0) {
      toast.error("Please enter the password", {autoClose: 3000})
      return "failed"
    }
    return "success"
  }

  // login method
  const login = async () => {
    if (validate() == "success") {
      try {
        const req_obj = {
          url: constants.login,
          method: "post",
          data: { username, password }
        }
        const resp = await axios(req_obj)
        if (resp.status == 200) {
          setStorage("user_id", resp.data.id)
          setStorage("username", resp.data.username)
          toast(`Hi ${username}, Welcome back!`, {onClose: () => history.push("/chat"), autoClose: 3000})
        } else {
          toast.error(resp.data.status, {autoClose: 3000})
        }
      } catch (error) {
        console.error("Error in user login")
        console.error(error)
        if (
          error.response
          &&
          error.response.data
          &&
          error.response.data.status
        ) {
          toast.error(error.response.data.status, {autoClose: 3000})
        }
      }
    }
  }
  
  // register method
  const register = async () => {
    if (validate() == "success") {
      try {
        const req_obj = {
          url: constants.register,
          method: "post",
          data: { username, password }
        }
        const resp = await axios(req_obj)
        if (resp.status == 201) {
          setStorage("user_id", resp.data.id)
          setStorage("username", resp.data.username)
          toast(`Hi ${username}, Your account has been created!`, {onClose: () => history.push("/chat"), autoClose: 3000})
        } else {
          toast.error(resp.data.status, {autoClose: 3000})
        }
      } catch (error) {
        console.error("Error in user registration")
        console.error(error)
        if (
          error.response
          &&
          error.response.data
          &&
          error.response.data.status
        ) {
          toast.error(error.response.data.status, {autoClose: 3000})
        }
      }
    }
  }

  const title = page_type.includes("register") ? "register" : "login"

  const formSubmit = e => {
    e.preventDefault()
    if (title == "register") register()
    else login()
  }

  return (
    <div className="login-out-bg">
      <ToastContainer />
      <div className="login-out-bg-container">
        <div className="login-out-bg-graphic" />
      </div>
      <div className="login-out-bg-box">
        <div className="title login-out">{title}</div>
        <form onSubmit={formSubmit}>
          <input autoFocus className="my-input login-out" placeholder="username" type="text" value={username} onChange={e => setUsername(e.target.value)} />
          <input className="my-input login-out" placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          {
            title == "register"
              ?
              <button className="login-out-button" type="submit">Create a New Account</button>
              :
              <button className="login-out-button" type="submit">Login to my Account</button>
          }
        </form>
        {
          page_type.includes("register")
            ?
            <Link to="/login" onClick={() => setPageType("login")}>
              <p className="instead-text">Are you an existing user? Sign in Instead.</p>
            </Link>
            :
            <Link to="/register" onClick={() => setPageType("register")}>
              <p className="instead-text">Don't have the account yet? Register Instead.</p>
            </Link>
        }
      </div>
    </div>
  )
}
