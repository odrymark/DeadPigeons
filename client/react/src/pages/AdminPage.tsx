import {useNavigate} from "react-router-dom";
import {handleGetWeekIncome} from "../api";
import {useEffect, useState} from "react";

export default function AdminPage()
{
    const navigate = useNavigate();
    const [income, setIncome] = useState<number>(0);

    useEffect(() => {
        (async () => {
            const i = await handleGetWeekIncome();
            setIncome(i);
        })();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center flex-1 w-full h-full">

            <div className="mb-6">
                <span className="text-xl font-bold">Week's Income: {income} DKK</span>
            </div>

            <div className="flex flex-col items-center gap-6">
                <button className="btn btn-secondary btn-lg w-64" onClick={() => navigate("weekWinners")}>
                    Week's Winners
                </button>

                <button className="btn btn-secondary btn-lg w-64" onClick={() => navigate("winningNumbers")}>
                    Add Winning Numbers
                </button>

                <button className="btn btn-secondary btn-lg w-64" onClick={() => navigate("addUser")}>
                    Add User
                </button>

                <button className="btn btn-secondary btn-lg w-64" onClick={() => navigate("addPayment")}>
                    Add User Payment
                </button>

                <button className="btn btn-secondary btn-lg w-64" onClick={() => navigate("userHistory")}>
                    User History
                </button>
            </div>
        </div>
    );
}