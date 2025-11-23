import { useEffect, useState } from "react";
import { type GamesGet, handleGetAllGames } from "../api";

function getWeekNumber(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default function GameHistory() {
    const [games, setGames] = useState<GamesGet[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchGames() {
            const data = await handleGetAllGames();
            if (data) {
                setGames(data);
                setCurrentIndex(0);
            }
        }
        fetchGames();
    }, []);

    const nextGame = () => {
        if (currentIndex < games.length - 1)
            setCurrentIndex(currentIndex + 1);
    };

    const prevGame = () => {
        if (currentIndex > 0)
            setCurrentIndex(currentIndex - 1);
    };

    if (games.length === 0) {
        return (
            <div className="w-full text-center py-10 text-xl">
                Loading games...
            </div>
        );
    }

    const game = games[currentIndex];

    return (
        <div className="bg-base-200 w-full flex flex-col p-6 box-border">

            <div className="flex items-center justify-between max-w-2xl mx-auto w-full mb-4">

                <button
                    onClick={nextGame}
                    disabled={currentIndex === games.length - 1}
                    className="btn btn-circle btn-outline"
                >
                    ❮
                </button>

                {/* GAME INFO */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold">
                        Week {getWeekNumber(new Date(game.createdAt))} of {new Date(game.createdAt).getFullYear()}
                    </h2>

                    <p className="text-sm opacity-70 mt-1">
                        Created: {new Date(game.createdAt).toLocaleString()}
                    </p>

                    <p className="mt-4 text-xl font-semibold">
                        Winning Numbers:
                    </p>
                    <p className="text-xl font-bold tracking-wide">
                        {game.winningNums.join(", ")}
                    </p>
                </div>

                <button
                    onClick={prevGame}
                    disabled={currentIndex === 0}
                    className="btn btn-circle btn-outline"
                >
                    ❯
                </button>
            </div>

            {/* HEADER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto w-full bg-base-100 p-4 rounded-lg shadow font-bold text-lg border-b">
                <div>Username</div>
                <div>Number of Winning Boards</div>
            </div>

            {/* LIST */}
            <div className="mt-4 flex flex-col gap-4 max-w-2xl mx-auto w-full">
                {game.winners.map((w) => (
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