import { type PaymentGet } from "../../api";

interface Props {
    payments: PaymentGet[];
}

export default function PaymentsTable({ payments }: Props) {
    return (
        <div className="overflow-x-auto max-w-3xl mx-auto w-full">
            <table className="table table-zebra w-full shadow-md rounded-box">
                <thead>
                <tr>
                    <th className="text-left">Date</th>
                    <th className="text-left">Status</th>
                    <th className="text-center">Amount</th>
                    <th className="text-center">Payment Number</th>
                </tr>
                </thead>

                <tbody>
                {payments.map((p) => (
                    <tr key={p.id} className="hover">
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>

                        <td>
                                <span
                                    className={`font-semibold ${
                                        p.isApproved === null
                                            ? "text-warning"
                                            : p.isApproved
                                                ? "text-success"
                                                : "text-error"
                                    }`}
                                >
                                    {p.isApproved === null
                                        ? "Pending"
                                        : p.isApproved
                                            ? "Approved"
                                            : "Rejected"}
                                </span>
                        </td>

                        <td className="text-center font-bold">
                            {p.isApproved === false || p.amount === null
                                ? "–"
                                : `${p.amount} DKK`}
                        </td>

                        <td className="text-center">
                            {p.paymentNumber}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {payments.length === 0 && (
                <div className="text-center py-8 text-base-content/60">
                    No payments yet.
                </div>
            )}
        </div>
    );
}