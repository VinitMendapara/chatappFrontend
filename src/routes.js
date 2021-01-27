import React from "react"
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom"
import Login_out from "./login_out"
import Chat from "./chat"

export default function Routes() {
    return (
        <Router>
            <Switch>
                <Route path="/chat" component={Chat} />
                <Route path="/login" component={Login_out} />
                <Route path="/register" component={Login_out} />
                <Route path="/" component={Login_out} />
            </Switch>
        </Router>
    )
}
