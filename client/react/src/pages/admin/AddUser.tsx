import { useState } from "react";
import { apiService } from "../../api";
import { useToast } from "../../components/ToastProvider";

export default function AddUser() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const toast = useToast();

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if (!username || !password || !email || !phone) {
            toast("All fields are required", "error");
            return;
        }

        setLoading(true);
        try {
            await apiService.addUser({
                username,
                password,
                email,
                phoneNumber: phone,
            });

            toast("User added successfully!", "success");

            setUsername("");
            setPassword("");
            setEmail("");
            setPhone("");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Something went wrong";
            toast(message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200 min-h-screen">
            <div className="card w-full max-w-lg bg-base-100 shadow-xl">
                <div className="card-body">
                    <h1 className="card-title text-2xl font-bold justify-center mb-6">
                        Add New User
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <fieldset className="fieldset border border-base-300 rounded-lg p-6">
                            <legend className="fieldset-legend text-lg font-semibold px-2">
                                User Information
                            </legend>

                            <div className="space-y-4">
                                <div>
                                    <label className="label">
                                        <span className="label-text font-medium">Username</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="label">
                                        <span className="label-text font-medium">Password</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="input input-bordered w-full"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label">
                                        <span className="label-text font-medium">Email</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="input input-bordered w-full"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label">
                                        <span className="label-text font-medium">Phone Number</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="input input-bordered w-full"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading loading-dots loading-lg"></span>
                            ) : (
                                "Add User"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}