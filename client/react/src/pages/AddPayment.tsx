import { handleAddPayment, handleGetAllUsers } from "../api";
import { useState, useEffect } from "react";

export default function AddPaymentPage() {
    const [username, setUsername] = useState("");
    const [amount, setAmount] = useState<number | "">("");
    const [paymentNumber, setPaymentNumber] = useState("");
    const [users, setUsers] = useState<string[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const allUsers = await handleGetAllUsers();
            const filtered = allUsers.filter(u => u.toLowerCase() !== "admin");
            setUsers(filtered);
        };
        fetchUsers();
    }, []);

    const handleSubmit = async () => {
        if (!username || amount === "" || !paymentNumber) {
            alert("Please fill in all fields.");
            return;
        }

        await handleAddPayment({ username, amount: Number(amount), paymentNumber });

        setUsername("");
        setAmount("");
        setPaymentNumber("");
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-base-200">
            <h1 className="text-2xl font-bold mb-6">Add Payment</h1>

            <div className="flex flex-col gap-4 w-full max-w-md">

                <select
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="select select-bordered w-full"
                >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                        <option key={user} value={user}>
                            {user}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="input input-bordered w-full"
                />

                <input
                    type="text"
                    placeholder="Payment Number"
                    value={paymentNumber}
                    onChange={(e) => setPaymentNumber(e.target.value)}
                    className="input input-bordered w-full"
                />

                <button className="btn btn-primary w-full" onClick={handleSubmit}>
                    Add Payment
                </button>
            </div>
        </div>
    );
}