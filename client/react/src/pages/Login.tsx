import {useState} from "react";
import {handleUserLogin, type User} from "../api";

export default function Login () {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState<User | null>(null)

    return (
        <>
            <input placeholder="Username" type="text" onChange={(e) => setUsername(e.target.value)} value={username}/>
            <br/>
            <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} value={password}/>
            <br/>
            <button onClick={async () => {
                const u = await handleUserLogin({username, password});
                if (u) setUser(u)
            }}
            >Login</button>

            {user && (
                <div>
                    Logged in as: {user.username}
                </div>
            )}
        </>
    )
}