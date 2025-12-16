import { type PaymentGet } from "../../api";

interface Props {
    payments: PaymentGet[];
}

export default function PaymentsTable({ payments }: Props) {
    return (
        <>
            {/* HEADER */}
            <div className="grid grid-cols-1 sm:grid-cols-4 max-w-3xl mx-auto w-full bg-base-100 p-4 rounded-t-box shadow font-bold text-lg border-b">
                <div>Date</div>
                <div>Status</div>
                <div>Amount</div>
                <div>Payment Number</div>
            </div>

            {/* LIST */}
            <ul className="list bg-base-100 rounded-b-box shadow-md max-w-3xl mx-auto w-full">
                {payments.map((p) => (
                    <li key={p.id} className="list-row p-4">
                        <div>{new Date(p.createdAt).toLocaleDateString()}</div>

                        {/* Status */}
                        <div
                            className={`font-semibold text-center sm:text-left ${
                                p.isApproved === null
                                    ? "text-warning"
                                    : p.isApproved
                                        ? "text-success"
                                        : "text-error"
                            }`}
                        >
                            {p.isApproved === null ? "Pending" : p.isApproved ? "Approved" : "Rejected"}
                        </div>

                        <div className="font-bold text-center sm:text-left">
                            {p.isApproved === false || p.amount === null ? "–" : `${p.amount} DKK`}
                        </div>

                        <div className="text-right sm:text-left">
                            {p.paymentNumber}
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}