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
            <div className="grid grid-cols-1 sm:grid-cols-4 max-w-3xl mx-auto w-full bg-base-100 p-4 rounded-t-box shadow font-bold text-lg border-b">
                <div>Date</div>
                <div>Numbers</div>
                <div>Status</div>
                <div>Repeats</div>
            </div>

            {/* LIST */}
            <ul className="list bg-base-100 rounded-b-box shadow-md max-w-3xl mx-auto w-full">
                {localBoards.map((b) => (
                    <li key={b.id} className="list-row p-4">
                        <div>{new Date(b.createdAt).toLocaleDateString()}</div>

                        <div className="list-col-grow break-words text-center sm:text-left">
                            {b.numbers.join(", ")}
                        </div>

                        <div
                            className={`font-bold text-center sm:text-right ${
                                b.isWinner === null
                                    ? "text-warning"
                                    : b.isWinner
                                        ? "text-success"
                                        : "text-error"
                            }`}
                        >
                            {b.isWinner === null
                                ? "In Game"
                                : b.isWinner
                                    ? "Win"
                                    : "Loss"}
                        </div>

                        <div className="flex items-center justify-center sm:justify-end gap-2">
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
                    </li>
                ))}
            </ul>
        </>
    );
}