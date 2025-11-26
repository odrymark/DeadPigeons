import {useNavigate} from "react-router-dom";

export default function UserBtns({ close }: { close?: () => void }) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-3 mt-4">
            <button
                className="btn btn-primary w-full"
                onClick={() => {
                    navigate("/dashboard/buyBoard");
                    close?.();
                }}
            >
                Buy Board
            </button>

            <button
                className="btn btn-primary w-full"
                onClick={() => {
                    navigate("/dashboard/addPayment");
                    close?.();
                }}
            >
                Add Payment
            </button>

            <button
                className="btn btn-primary w-full"
                onClick={() => {
                    navigate("/dashboard/prevBoards");
                    close?.();
                }}
            >
                Previous Boards
            </button>

            <button
                className="btn btn-primary w-full"
                onClick={() => {
                    navigate("/dashboard/prevPay");
                    close?.();
                }}
            >
                Previous Payments
            </button>
        </div>
    );
}