import { useEffect, useState } from "react";
import { handleGetWinners, type WinnersGet } from "../api";

export default function WeekWinners() {
    const [winners, setWinners] = useState<WinnersGet[]>([]);

    useEffect(() => {
        async function fetchWinners() {
            const data = await handleGetWinners();
            if (data) setWinners(data);
        }
        fetchWinners();
    }, []);

    return (
        <div className="bg-base-200 w-full flex flex-col p-6 box-border">

            {/* HEADER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto w-full bg-base-100 p-4 rounded-lg shadow font-bold text-lg border-b">
                <div>Username</div>
                <div>Number of Winning Boards</div>
            </div>

            {/* LIST */}
            <div className="mt-4 flex flex-col gap-4 max-w-2xl mx-auto w-full">
                {winners.map((w) => (
                    <div
                        key={w.username}
                        className="grid grid-cols-1 sm:grid-cols-2 bg-base-100 p-4 shadow rounded-lg items-center gap-2"
                    >
                        <div>{w.username}</div>
                        <div className="font-bold">{w.winningBoardsNum}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}