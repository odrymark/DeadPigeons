import { type PaymentGet } from "../../api";

interface Props {
    payments: PaymentGet[];
}

export default function PaymentsTable({ payments }: Props) {
    return (
        <>
            {/* HEADER */}
            <div className="grid grid-cols-1 sm:grid-cols-4 max-w-3xl mx-auto w-full bg-base-100 p-4 rounded-lg shadow font-bold text-lg border-b">
                <div>Date</div>
                <div>Status</div>
                <div>Amount</div>
                <div>Payment Number</div>
            </div>

            {/* LIST */}
            <div className="mt-4 flex flex-col gap-4 max-w-3xl mx-auto w-full">
                {payments.map((p) => (
                    <div
                        key={p.id}
                        className="grid grid-cols-1 sm:grid-cols-4 bg-base-100 p-4 shadow rounded-lg items-center gap-2"
                    >
                        <div>{new Date(p.createdAt).toLocaleDateString()}</div>
                        <div
                            className={
                                p.isApproved === null
                                    ? "text-yellow-500 font-semibold"
                                    : p.isApproved
                                        ? "text-green-600 font-semibold"
                                        : "text-red-600 font-semibold"
                            }
                        >
                            {p.isApproved === null ? "Pending" : p.isApproved ? "Approved" : "Rejected"}
                        </div>
                        <div className="font-bold">
                            {p.isApproved === false || p.amount === null ? "" : `${p.amount} DKK`}
                        </div>
                        <div>{p.paymentNumber}</div>
                    </div>
                ))}
            </div>
        </>
    );
}