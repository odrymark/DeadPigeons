import { useState, useEffect } from "react";
import { apiService } from "../../api";
import type { PaymentGet, PaymentApprovePost, UserInfoGet } from "../../api";
import { useToast } from "../../components/ToastProvider";

export default function ApprovePay() {
    const [users, setUsers] = useState<UserInfoGet[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [payments, setPayments] = useState<PaymentGet[]>([]);
    const [editingAmountId, setEditingAmountId] = useState<string | null>(null);
    const [tempAmount, setTempAmount] = useState<string>("");

    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingPayments, setLoadingPayments] = useState(false);

    const toast = useToast();

    useEffect(() => {
        (async () => {
            setLoadingUsers(true);
            try {
                const u = await apiService.getAllUsers();
                setUsers(u);
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Something went wrong";
                toast(message, "error");
            } finally {
                setLoadingUsers(false);
            }
        })();
    }, [toast]);

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
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Something went wrong";
                toast(message, "error");
            } finally {
                setLoadingPayments(false);
            }
        })();
    }, [selectedUser, toast]);

    const startEditAmount = (payment: PaymentGet) => {
        setEditingAmountId(payment.id);
        setTempAmount(payment.amount?.toString() ?? "");
    };

    const commitAmountEdit = (paymentId: string): boolean => {
        const numAmount = Number(tempAmount);

        if (isNaN(numAmount) || numAmount <= 0) {
            toast("Please enter a valid positive number for the amount.", "error");
            const current = payments.find((p) => p.id === paymentId);
            setTempAmount(current?.amount?.toString() ?? "");
            return false;
        }

        setPayments((prev) =>
            prev.map((p) => (p.id === paymentId ? { ...p, amount: numAmount } : p))
        );

        setEditingAmountId(null);
        return true;
    };

    const handleApproveButton = async (payment: PaymentGet, approved: boolean) => {
        let currentPayment = { ...payment };

        if (editingAmountId === payment.id) {
            const valid = commitAmountEdit(payment.id);
            if (!valid && approved) {
                return;
            }
            const updated = payments.find((p) => p.id === payment.id);
            if (updated) currentPayment = updated;
        }

        if (approved) {
            if (
                currentPayment.amount === undefined ||
                currentPayment.amount === null ||
                currentPayment.amount <= 0
            ) {
                toast("Please enter a valid positive amount before approving.", "error");
                return;
            }
        }

        const selectedUsername =
            users.find((u) => u.id === selectedUser)?.username || "";

        const req: PaymentApprovePost = {
            id: currentPayment.id,
            username: selectedUsername,
            paymentNumber: currentPayment.paymentNumber,
            amount: currentPayment.amount ?? 0,
            isApproved: approved,
        };

        try {
            await apiService.approvePayment(req);

            toast(
                approved ? "Payment approved successfully!" : "Payment rejected.",
                approved ? "success" : "info"
            );

            setPayments((p) => p.filter((x) => x.id !== currentPayment.id));
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Something went wrong";
            toast(message, "error");
        }
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
                                            onBlur={() => commitAmountEdit(p.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    commitAmountEdit(p.id);
                                                } else if (e.key === "Escape") {
                                                    setEditingAmountId(null);
                                                    setTempAmount(p.amount?.toString() ?? "");
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