import {useState} from "react";

export default function Login () {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    return (
        <>
            <input placeholder="Username" type="text" onChange={(e) => setUsername(e.target.value)} value={username}/>
            <br/>
            <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} value={password}/>
            <br/>
            <button>Login</button>
        </>
    )
}