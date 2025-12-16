import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {apiService} from "../api";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/userAtom.ts";

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [, setUser] = useAtom(userAtom);

    useEffect(() => {
        (async () => {
            const u = await apiService.getCurrentUser();
            if (u)
            {
                setUser(u);
                navigate("/dashboard");
            }
        })();
    }, []);

    return (
        <div className="hero min-h-screen min-w-screen">
            <div className="hero-content flex-col text-center w-full">
                <h1 className="text-5xl font-bold mb-8">Dead Pigeons</h1>

                <div className="flex flex-col items-center gap-4 w-full">
                    <input
                        type="text"
                        placeholder="Username"
                        className="input input-bordered w-64"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="input input-bordered w-64"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        className="btn btn-primary w-64"
                        onClick={async () => {
                            const u = await apiService.login({ username, password });
                            if (u)
                            {
                                setUser(u);
                                navigate("/dashboard");
                            }
                        }}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}