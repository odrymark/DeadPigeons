import {useNavigate} from "react-router-dom";

export default function AdminBtns({ close }: { close?: () => void }) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-3 mt-4">
            <button
                className="btn btn-primary w-full"
                onClick={() => {
                    navigate("/dashboard/gameHistory");
                    close?.();
                }}
            >
                Game History
            </button>

            <button
                className="btn btn-primary w-full"
                onClick={() => {
                    navigate("/dashboard/winningNumbers");
                    close?.();
                }}
            >
                Add Winning Numbers
            </button>

            <button
                className="btn btn-primary w-full"
                onClick={() => {
                    navigate("/dashboard/addUser");
                    close?.();
                }}
            >
                Add User
            </button>

            <button
                className="btn btn-primary w-full"
                onClick={() => {
                    navigate("/dashboard/approvePay");
                    close?.();
                }}
            >
                Approve User Payment
            </button>

            <button
                className="btn btn-primary w-full"
                onClick={() => {
                    navigate("/dashboard/userHistory");
                    close?.();
                }}
            >
                User History
            </button>
        </div>
    );
}