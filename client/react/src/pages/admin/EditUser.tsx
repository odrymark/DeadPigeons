import { useEffect, useState } from "react";
import {apiService, type UserInfoGet} from "../../api";

export default function EditUser() {
    const [users, setUsers] = useState<UserInfoGet[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [isActive, setIsActive] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingUser, setLoadingUser] = useState(false);

    // 🔹 Load users for dropdown (id + username only)
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const result = await apiService.getAllUsers();
                setUsers(result);
            } catch {
                setError("Failed to load users");
            }
        };

        loadUsers();
    }, []);

    useEffect(() => {
        if (!selectedUserId) return;

        const loadUserInfo = async () => {
            try {
                setLoadingUser(true);
                setError("");

                const user = await apiService.getUserInfo(selectedUserId);
                if (!user) {
                    setError("User not found");
                    return;
                }

                setUsername(user.username);
                setEmail(user.email!);
                setPhone(user.phoneNumber!);
                setIsActive(user.isActive!);
            } catch {
                setError("Failed to load user info");
            } finally {
                setLoadingUser(false);
            }
        };

        loadUserInfo();
    }, [selectedUserId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!selectedUserId || !username || !email || !phone) {
            setError("All fields are required");
            return;
        }

        try {
            setLoading(true);

            await apiService.editUser({
                id: selectedUserId,
                username,
                password: "",
                email,
                phoneNumber: phone,
                isActive
            });
        } catch {
            setError("Failed to update user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200">
            <h1 className="text-2xl font-bold mb-6">Edit User</h1>

            <form
                className="flex flex-col gap-4 w-full max-w-md bg-base-100 p-6 rounded-lg shadow"
                onSubmit={handleSubmit}
            >
                {error && <div className="text-error font-semibold">{error}</div>}

                <select
                    className="select select-bordered w-full"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                >
                    <option value="">Select a user</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.username}
                        </option>
                    ))}
                </select>

                {loadingUser && (
                    <div className="text-sm text-base-content/70">
                        Loading user info…
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Username"
                    className="input input-bordered w-full"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!selectedUserId || loadingUser}
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!selectedUserId || loadingUser}
                />

                <input
                    type="tel"
                    placeholder="Phone Number"
                    className="input input-bordered w-full"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!selectedUserId || loadingUser}
                />

                <label className="flex items-center gap-3 cursor-pointer">
                    <span className="font-medium">Active</span>
                    <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        disabled={!selectedUserId || loadingUser}
                    />
                </label>

                <button
                    type="submit"
                    className="btn btn-primary w-full mt-2"
                    disabled={!selectedUserId || loading || loadingUser}
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}
