import { useState, useEffect } from "react";
import { apiService } from "../../api";
import type { PaymentGet, PaymentApprovePost, UserInfoGet } from "../../api";

export default function ApprovePay() {
    const [users, setUsers] = useState<UserInfoGet[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [payments, setPayments] = useState<PaymentGet[]>([]);
    const [editingAmountId, setEditingAmountId] = useState<string | null>(null);
    const [tempAmount, setTempAmount] = useState<string>("");

    useEffect(() => {
        (async () => {
            const u = await apiService.getAllUsers();
            setUsers(u);
        })();
    }, []);

    useEffect(() => {
        if (!selectedUser) return;

        (async () => {
            const allPayments = await apiService.getPayments(selectedUser);
            const pending = allPayments.filter(p => p.isApproved === undefined || p.isApproved === null);
            setPayments(pending);
        })();
    }, [selectedUser]);

    const handleApproveButton = async (payment: PaymentGet, approved: boolean) => {
        if (editingAmountId === payment.id) {
            const updatedAmount = Number(tempAmount);

            setPayments(p =>
                p.map(row =>
                    row.id === payment.id ? { ...row, amount: updatedAmount } : row
                )
            );

            payment.amount = updatedAmount;
            setEditingAmountId(null);
        }

        if (payment.amount === undefined || payment.amount === null) {
            alert("Please enter an amount before approving/rejecting.");
            return;
        }

        const selectedUsername = users.find(u => u.id === selectedUser)?.username || '';

        const req: PaymentApprovePost = {
            id: payment.id,
            username: selectedUsername,
            paymentNumber: payment.paymentNumber,
            amount: payment.amount,
            isApproved: approved,
        };

        await apiService.approvePayment(req);

        setPayments(p => {
            const updated = p.map(row =>
                row.id === payment.id ? { ...row, isApproved: approved } : row
            );

            return updated.filter(x => x.isApproved === undefined || x.isApproved === null);
        });
    };

    const startEditAmount = (payment: PaymentGet) => {
        setEditingAmountId(payment.id);
        setTempAmount(payment.amount?.toString() ?? "");
    };

    const finishEditAmount = (paymentId: string) => {
        setPayments(p =>
            p.map(row =>
                row.id === paymentId ? { ...row, amount: Number(tempAmount) } : row
            )
        );
        setEditingAmountId(null);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-start p-6 bg-base-200 w-full">

            {/* USER DROPDOWN */}
            <div className="w-full max-w-md mb-6 mt-4">
                <select
                    className="select select-bordered w-full"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                >
                    <option value="">Select a User</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.username}
                        </option>
                    ))}
                </select>
            </div>

            {/* HEADER */}
            <div className="grid grid-cols-4 max-w-3xl w-full bg-base-100 p-4 rounded-lg shadow font-bold text-lg border-b">
                <div>Date</div>
                <div>Amount</div>
                <div>Payment Number</div>
                <div>Approve</div>
            </div>

            {/* LIST */}
            <div className="mt-4 flex flex-col gap-4 max-w-3xl w-full">
                {payments.map((p) => (
                    <div
                        key={p.id}
                        className="grid grid-cols-4 bg-base-100 p-4 shadow rounded-lg items-center gap-2"
                    >
                        <div>{new Date(p.createdAt).toLocaleDateString()}</div>

                        <div>
                            {editingAmountId === p.id ? (
                                <input
                                    className="input input-bordered w-24"
                                    value={tempAmount}
                                    onChange={(e) => setTempAmount(e.target.value)}
                                    onBlur={() => finishEditAmount(p.id)}
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
                        </div>

                        <div>{p.paymentNumber}</div>

                        {/* APPROVE BUTTONS */}
                        <div className="flex gap-2">
                            <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleApproveButton(p, true)}
                            >
                                ✓
                            </button>

                            <button
                                className="btn btn-sm btn-error"
                                onClick={() => handleApproveButton(p, false)}
                            >
                                ✗
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}