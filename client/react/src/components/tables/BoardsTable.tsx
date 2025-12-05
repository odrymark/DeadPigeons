import { type BoardGet, apiService } from "../../api";
import { useState, useEffect } from "react";

interface Props {
    boards: BoardGet[];
}

export default function BoardsTable({ boards }: Props) {
    const [localBoards, setLocalBoards] = useState<BoardGet[]>(boards);

    useEffect(() => {
        setLocalBoards(boards);
    }, [boards]);

    const clearRepeats = async (id: string) => {
        const ok = confirm("Are you sure you want to clear repeats for this board?");
        if (!ok) return;

        await apiService.endRepeat(id);

        setLocalBoards((prev) =>
            prev.map((board) =>
                board.id === id ? { ...board, repeats: 0 } : board
            )
        );
    };

    return (
        <>
            {/* HEADER */}
            <div className="grid grid-cols-1 sm:grid-cols-4 max-w-3xl mx-auto w-full bg-base-100 p-4 rounded-lg shadow font-bold text-lg border-b">
                <div>Date</div>
                <div>Numbers</div>
                <div>Status</div>
                <div>Repeats</div>
            </div>

            {/* LIST */}
            <div className="mt-4 flex flex-col gap-4 max-w-3xl mx-auto w-full">
                {localBoards.map((b) => (
                    <div
                        key={b.id}
                        className="grid grid-cols-1 sm:grid-cols-4 bg-base-100 p-4 shadow rounded-lg items-center gap-2"
                    >
                        <div>{new Date(b.createdAt).toLocaleDateString()}</div>

                        <div className="break-words">{b.numbers.join(", ")}</div>

                        <div
                            className={
                                b.isWinner === null
                                    ? "text-warning font-bold"
                                    : b.isWinner
                                        ? "text-success font-bold"
                                        : "text-error font-bold"
                            }
                        >
                            {b.isWinner === null
                                ? "In Game"
                                : b.isWinner
                                    ? "Win"
                                    : "Loss"}
                        </div>

                        {/* REPEATS COLUMN */}
                        <div className="flex items-center gap-2">
                            {b.repeats > 0 ? (
                                <>
                                    <span className="font-semibold">{b.repeats}x</span>
                                    <button
                                        className="btn btn-xs btn-error"
                                        onClick={() => clearRepeats(b.id)}
                                    >
                                        ✕
                                    </button>
                                </>
                            ) : (
                                <span className="opacity-50">–</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}