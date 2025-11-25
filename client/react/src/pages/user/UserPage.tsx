import {useNavigate} from "react-router-dom";

export default function UserPage() {
    const navigate = useNavigate();

    return (
        <>
            <div className="flex flex-col items-center justify-center flex-1 w-full h-full">
                <div className="flex flex-col items-center gap-6">
                    <button className="btn btn-secondary btn-lg w-64" onClick={() => navigate("buyBoard")}>
                        Buy Board
                    </button>
                    <button className="btn btn-secondary btn-lg w-64" onClick={() => navigate("addPayment")}>
                        Add Payment
                    </button>
                    <button className="btn btn-secondary btn-lg w-64" onClick={() => navigate("prevBoards")}>
                        Previous Boards
                    </button>
                    <button className="btn btn-secondary btn-lg w-64" onClick={() => navigate("prevPay")}>
                        Previous Payments
                    </button>
                </div>
            </div>
        </>
    )
}