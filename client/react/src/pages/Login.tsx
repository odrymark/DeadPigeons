import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/userAtom.ts";

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [, setUser] = useAtom(userAtom);

    useEffect(() => {
        (async () => {
            const u = await apiService.getCurrentUser();
            if (u) {
                setUser(u);
                navigate("/dashboard");
            }
        })();
    }, [navigate, setUser]);

    const handleLogin = async () => {
        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }

        setLoading(true);
        try {
            const u = await apiService.login({ username, password });
            if (u) {
                setUser(u);
                navigate("/dashboard");
            } else {
                alert("Invalid username, password or the user is inactive.");
            }
        } catch (err) {
            alert("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col">
                <div className="card w-full max-w-sm shadow-2xl bg-base-100">
                    <fieldset className="border border-base-300 rounded-box p-8">
                        <legend className="text-2xl font-semibold px-4">Login</legend>

                        <div className="form-control mt-6">
                            <label className="label">
                                <span className="label-text font-medium">Username</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter username"
                                className="input input-bordered"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text font-medium">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                className="input input-bordered"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-control mt-8">
                            <button
                                className="btn btn-primary w-full"
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="loading loading-dots loading-lg"></span>
                                ) : (
                                    "Login"
                                )}
                            </button>
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    );
}