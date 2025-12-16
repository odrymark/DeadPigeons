import { useEffect, useState } from "react";
import { type GameGet, apiService } from "../../api";

function getWeekNumber(date: Date): number {
    const d = new Date(date);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const diff = d.getTime() - yearStart.getTime();
    const days = diff / 86400000;
    return Math.ceil((days + 1) / 7);
}

export default function GameHistory() {
    const [games, setGames] = useState<GameGet[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [income, setIncome] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGames() {
            setLoading(true);
            try {
                const data = await apiService.getAllGames();
                if (data) {
                    setGames(data);
                    setCurrentIndex(0);
                }
            } finally {
                setLoading(false);
            }
        }
        fetchGames();
    }, []);

    useEffect(() => {
        if (games.length > 0) {
            const game = games[currentIndex];
            setIncome(game.income);
        }
    }, [currentIndex, games]);

    const nextGame = () => {
        if (currentIndex < games.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const prevGame = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    if (loading) {
        return (
            <div className="w-full flex justify-center items-center py-20">
                <span className="loading loading-dots loading-lg"></span>
            </div>
        );
    }

    if (games.length === 0) {
        return (
            <div className="w-full text-center py-10 text-xl text-base-content/60">
                No games found.
            </div>
        );
    }

    const game = games[currentIndex];

    return (
        <div className="bg-base-200 w-full flex flex-col p-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto w-full mb-8">
                <button
                    onClick={nextGame}
                    disabled={currentIndex === games.length - 1}
                    className="btn btn-circle btn-outline"
                >
                    ❮
                </button>

                <div className="text-center">
                    <h2 className="text-2xl font-bold">
                        Week {getWeekNumber(new Date(game.createdAt))} of {new Date(game.createdAt).getFullYear()}
                    </h2>
                    <p className="text-sm opacity-70 mt-1">
                        Created: {new Date(game.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-4 text-xl font-semibold">
                        Week's Income: {income} DKK
                    </p>
                    <p className="mt-4 text-xl font-semibold">Winning Numbers:</p>
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

            <div className="overflow-x-auto max-w-2xl mx-auto w-full">
                <table className="table w-full bg-base-100 shadow-md rounded-box">
                    <thead>
                    <tr className="bg-base-200">
                        <th className="text-left">Username</th>
                        <th className="text-center">Number of Winning Boards</th>
                    </tr>
                    </thead>
                    <tbody>
                    {game.winners.length === 0 ? (
                        <tr>
                            <td colSpan={2} className="text-center py-8 text-base-content/60">
                                No winners this week.
                            </td>
                        </tr>
                    ) : (
                        game.winners.map((w) => (
                            <tr key={w.username} className="hover">
                                <td>{w.username}</td>
                                <td className="text-center font-bold">{w.winningBoardsNum}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}