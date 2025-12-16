import {useEffect, useState} from "react";
import {apiService, type PaymentGet} from "../../api";
import PaymentsTable from "../../components/tables/PaymentsTable.tsx";

export default function PrevPayments() {
    const [payments, setPayments] = useState<PaymentGet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBoards() {
            setLoading(true);
            try {
                const data = await apiService.getPayments();
                setPayments(data);
            }
            finally {
                setLoading(false);
            }
        }
        fetchBoards();
    }, []);

    if (loading) {
        return (
            <div className="w-full flex justify-center items-center py-20">
                <span className="loading loading-dots loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="bg-base-200 w-full flex flex-col p-6 box-border">
            <PaymentsTable payments={payments}/>
        </div>
    );
}