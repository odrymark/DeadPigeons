import {useEffect, useState} from "react";
import {handleGetPayments, type PaymentGet} from "../api";

export default function PrevPay() {
    const [payments, setPayments] = useState<PaymentGet[]>([]);

    useEffect(() => {
        async function fetchBoards() {
            const data = await handleGetPayments();
            if (data) setPayments(data);
        }
        fetchBoards();
    }, []);

    return (
        <div className="bg-base-200 w-full flex flex-col p-6 box-border">

            {/* HEADER */}
            <div className="grid grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto w-full bg-base-100 p-4 rounded-lg shadow font-bold text-lg border-b">
                <div>Date</div>
                <div>Amount</div>
                <div>Payment Number</div>
            </div>

            {/* LIST */}
            <div className="mt-4 flex flex-col gap-4 max-w-3xl mx-auto w-full">
                {payments.map((p) => (
                    <div
                        key={p.id}
                        className="grid grid-cols-1 sm:grid-cols-3 bg-base-100 p-4 shadow rounded-lg items-center gap-2"
                    >
                        <div>{new Date(p.createdAt).toLocaleDateString()}</div>
                        <div className="font-bold">{p.amount} DKK</div>
                        <div>{p.paymentNumber}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}