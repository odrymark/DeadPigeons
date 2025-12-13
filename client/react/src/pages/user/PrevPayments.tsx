import {useEffect, useState} from "react";
import {apiService, type PaymentGet} from "../../api";
import PaymentsTable from "../../components/tables/PaymentsTable.tsx";

export default function PrevPayments() {
    const [payments, setPayments] = useState<PaymentGet[]>([]);

    useEffect(() => {
        async function fetchBoards() {
            const data = await apiService.getPayments();
            if (data) setPayments(data);
        }
        fetchBoards();
    }, []);

    return (
        <div className="bg-base-200 w-full flex flex-col p-6 box-border">
            <PaymentsTable payments={payments}/>
        </div>
    );
}