import { useEffect, useState } from "react";
import { apiService, type UserInfoGet } from "../../api";

export default function EditUser() {
    const [users, setUsers] = useState<UserInfoGet[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [isActive, setIsActive] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingUser, setLoadingUser] = useState(false);

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
        if (!selectedUserId) {
            setUsername("");
            setPassword("");
            setEmail("");
            setPhone("");
            setIsActive(false);
            return;
        }

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
                setPassword("");
                setEmail(user.email ?? "");
                setPhone(user.phoneNumber ?? "");
                setIsActive(user.isActive ?? false);
            } catch {
                setError("Failed to load user info");
            } finally {
                setLoadingUser(false);
            }
        };

        loadUserInfo();
    }, [selectedUserId]);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
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
                password: password || "",
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
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200 min-h-screen">
            <div className="card w-full max-w-lg bg-base-100 shadow-xl">
                <div className="card-body">
                    <h1 className="card-title text-2xl font-bold justify-center mb-6">
                        Edit User
                    </h1>

                    {error && (
                        <div className="alert alert-error shadow-lg mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <fieldset className="fieldset border border-base-300 rounded-lg p-4">
                            <legend className="fieldset-legend text-lg font-semibold px-2">
                                Select User
                            </legend>

                            <select
                                className="select select-bordered w-full"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                required
                            >
                                <option value="">Choose a user...</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </fieldset>

                        <fieldset
                            className="fieldset border border-base-300 rounded-lg p-6"
                            disabled={!selectedUserId || loadingUser}
                        >
                            <legend className="fieldset-legend text-lg font-semibold px-2">
                                User Details
                            </legend>

                            {loadingUser && (
                                <div className="flex justify-center py-8">
                                    <span className="loading loading-dots loading-lg"></span>
                                </div>
                            )}

                            {!loadingUser && selectedUserId && (
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
                                        />
                                    </div>

                                    <div>
                                        <label className="label">
                                            <span className="label-text font-medium">
                                                New Password <span className="text-sm font-normal opacity-70">(leave blank to keep current)</span>
                                            </span>
                                        </label>
                                        <input
                                            type="password"
                                            className="input input-bordered w-full"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
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

                                    <label className="flex items-center gap-4 cursor-pointer py-2">
                                        <span className="font-medium">Account Active</span>
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-primary toggle-lg"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                        />
                                    </label>
                                </div>
                            )}

                            {!selectedUserId && !loadingUser && (
                                <div className="text-center py-8 text-base-content/60">
                                    Please select a user to edit their details.
                                </div>
                            )}
                        </fieldset>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={!selectedUserId || loading || loadingUser}
                        >
                            {loading ? (
                                <span className="loading loading-dots loading-lg"></span>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}