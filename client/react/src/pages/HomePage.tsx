import { useNavigate } from "react-router-dom";
import BoardsTable from "../components/tables/BoardsTable";
import { useEffect, useState } from "react";
import { type BoardGet, type CurrGameCloseGet, apiService } from "../api";

export default function MainPage() {
    const navigate = useNavigate();

    const [currGameClose, setCurrGameClose] = useState<CurrGameCloseGet | null>(null);
    const [lastGameNums, setLastGameNums] = useState<number[]>([]);
    const [currentBoards, setCurrentBoards] = useState<BoardGet[]>([]);
    const [previousBoards, setPreviousBoards] = useState<BoardGet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [
                    close,
                    nums,
                    cBoards,
                    pBoards
                ] = await Promise.all([
                    apiService.getCurrentGameClosing(),
                    apiService.getLastGameNums(),
                    apiService.getCurrentBoardsForUser(),
                    apiService.getPreviousBoardsForUser()
                ]);

                setCurrGameClose(close ?? null);
                setLastGameNums(nums ?? []);
                setCurrentBoards(cBoards ?? []);
                setPreviousBoards(pBoards ?? []);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center">
                <span className="loading loading-dots loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen p-6 flex justify-center">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* LEFT SIDE */}
                <div className="flex flex-col justify-start space-y-8">

                    <div className="text-center space-y-3">
                        <h2 className="text-xl font-bold">Current Game Closes:</h2>
                        <p className="text-lg font-semibold">
                            {currGameClose
                                ? new Date(currGameClose.closeDate).toLocaleString()
                                : "–"}
                        </p>

                        <button
                            onClick={() => navigate("/dashboard/buyBoard")}
                            className="btn btn-primary mt-2"
                        >
                            Buy Board
                        </button>
                    </div>

                    {/* Current Boards */}
                    <div className="w-full">
                        <h2 className="text-xl font-bold mb-3 text-center lg:text-left">
                            Your currently playing boards:
                        </h2>

                        <div className="border rounded-xl p-4 shadow">
                            <BoardsTable boards={currentBoards} />
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex flex-col justify-start space-y-8">

                    <div className="text-center mt-6">
                        <h2 className="text-xl font-bold mb-1">
                            Last Game Winning Numbers:
                        </h2>
                        <p className="text-lg font-semibold">
                            {lastGameNums.length > 0
                                ? lastGameNums.join(", ")
                                : "–"}
                        </p>
                    </div>

                    {/* Previous Boards */}
                    <div className="w-full mt-11">
                        <h2 className="text-xl font-bold mb-3 text-center lg:text-left">
                            Your boards from last game:
                        </h2>

                        <div className="border rounded-xl p-4 shadow">
                            <BoardsTable boards={previousBoards} />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}