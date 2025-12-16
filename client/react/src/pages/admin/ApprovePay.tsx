import { useState, useEffect } from "react";
import { apiService } from "../../api";
import type { PaymentGet, PaymentApprovePost, UserInfoGet } from "../../api";

export default function ApprovePay() {
    const [users, setUsers] = useState<UserInfoGet[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [payments, setPayments] = useState<PaymentGet[]>([]);
    const [editingAmountId, setEditingAmountId] = useState<string | null>(null);
    const [tempAmount, setTempAmount] = useState<string>("");

    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingPayments, setLoadingPayments] = useState(false);

    useEffect(() => {
        (async () => {
            setLoadingUsers(true);
            try {
                const u = await apiService.getAllUsers();
                setUsers(u);
            } finally {
                setLoadingUsers(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!selectedUser) {
            setPayments([]);
            return;
        }

        (async () => {
            setLoadingPayments(true);
            try {
                const allPayments = await apiService.getPayments(selectedUser);
                const pending = allPayments.filter(
                    (p) => p.isApproved === undefined || p.isApproved === null
                );
                setPayments(pending);
            } finally {
                setLoadingPayments(false);
            }
        })();
    }, [selectedUser]);

    const handleApproveButton = async (payment: PaymentGet, approved: boolean) => {
        if (editingAmountId === payment.id) {
            const updatedAmount = Number(tempAmount);
            if (isNaN(updatedAmount) || updatedAmount <= 0) {
                alert("Please enter a valid positive number for the amount.");
                return;
            }

            setPayments((p) =>
                p.map((row) =>
                    row.id === payment.id ? { ...row, amount: updatedAmount } : row
                )
            );
            setEditingAmountId(null);
        }

        if (payment.amount === undefined || payment.amount === null || payment.amount <= 0) {
            alert("Please enter a valid amount before approving/rejecting.");
            return;
        }

        const selectedUsername =
            users.find((u) => u.id === selectedUser)?.username || "";

        const req: PaymentApprovePost = {
            id: payment.id,
            username: selectedUsername,
            paymentNumber: payment.paymentNumber,
            amount: payment.amount,
            isApproved: approved,
        };

        await apiService.approvePayment(req);

        setPayments((p) => p.filter((x) => x.id !== payment.id));
    };

    const startEditAmount = (payment: PaymentGet) => {
        setEditingAmountId(payment.id);
        setTempAmount(payment.amount?.toString() ?? "");
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-start p-6 bg-base-200 w-full">
            <div className="w-full max-w-md mb-8">
                <select
                    className="select select-bordered w-full"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    disabled={loadingUsers}
                >
                    <option value="" disabled>
                        {loadingUsers ? "Loading users..." : "Select a User"}
                    </option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.username}
                        </option>
                    ))}
                </select>
            </div>

            {loadingPayments && (
                <div className="w-full flex justify-center items-center py-20">
                    <span className="loading loading-dots loading-lg"></span>
                </div>
            )}

            {!loadingPayments && selectedUser && (
                <div className="overflow-x-auto w-full max-w-4xl mx-auto">
                    <table className="table table-zebra w-full bg-base-100 shadow-xl rounded-box">
                        <thead>
                        <tr className="text-base">
                            <th>Date</th>
                            <th>Amount (DKK)</th>
                            <th>Payment Number</th>
                            <th className="text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {payments.map((p) => (
                            <tr key={p.id} className="hover">
                                <td>{new Date(p.createdAt).toLocaleDateString()}</td>

                                <td>
                                    {editingAmountId === p.id ? (
                                        <input
                                            type="number"
                                            className="input input-bordered input-sm w-28"
                                            value={tempAmount}
                                            onChange={(e) => setTempAmount(e.target.value)}
                                            onBlur={() => setEditingAmountId(null)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    setEditingAmountId(null);
                                                }
                                            }}
                                            autoFocus
                                        />
                                    ) : (
                                        <span
                                            className="font-bold cursor-pointer hover:underline"
                                            onClick={() => startEditAmount(p)}
                                        >
                                                {p.amount ?? "—"}
                                            </span>
                                    )}
                                </td>

                                <td>{p.paymentNumber}</td>

                                <td className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleApproveButton(p, true)}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="btn btn-sm btn-error"
                                            onClick={() => handleApproveButton(p, false)}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {payments.length === 0 && (
                        <div className="text-center py-12 text-base-content/60">
                            No pending payments for this user.
                        </div>
                    )}
                </div>
            )}

            {!loadingPayments && !selectedUser && !loadingUsers && (
                <div className="text-center py-12 text-base-content/60">
                    Please select a user to view pending payments.
                </div>
            )}
        </div>
    );
}