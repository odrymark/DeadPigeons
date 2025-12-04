import {useState} from "react";
import {apiService} from "../../api";

export default function AddUser() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!username || !password || !email || !phone) {
            setError("All fields are required");
            return;
        }

        await apiService.addUser({username: username, password: password, email:email, phoneNumber: phone});
        setUsername("");
        setPassword("");
        setEmail("");
        setPhone("");

    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200">
            <h1 className="text-2xl font-bold mb-6">Add New User</h1>

            <form
                className="flex flex-col gap-4 w-full max-w-md bg-base-100 p-6 rounded-lg shadow"
                onSubmit={handleSubmit}
            >
                {error && <div className="text-error font-semibold">{error}</div>}

                <input
                    type="text"
                    placeholder="Username"
                    className="input input-bordered w-full"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="input input-bordered w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="tel"
                    placeholder="Phone Number"
                    className="input input-bordered w-full"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <button type="submit" className="btn btn-primary w-full mt-2">
                    Add User
                </button>
            </form>
        </div>
    );
}