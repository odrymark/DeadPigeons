import { type BoardGet, apiService } from "../../api";
import { useState, useEffect } from "react";
import { useToast } from "../ToastProvider";

interface Props {
    boards: BoardGet[];
}

export default function BoardsTable({ boards }: Props) {
    const [localBoards, setLocalBoards] = useState<BoardGet[]>(boards);
    const toast = useToast();

    useEffect(() => {
        setLocalBoards(boards);
    }, [boards]);

    const clearRepeats = async (id: string) => {
        const confirmed = window.confirm("Are you sure you want to clear repeats for this board?");
        if (!confirmed) return;

        try {
            await apiService.endRepeat(id);

            setLocalBoards((prev) =>
                prev.map((board) =>
                    board.id === id ? { ...board, repeats: 0 } : board
                )
            );

            toast("Repeats cleared successfully!", "success");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Something went wrong";
            toast(message, "error");
        }
    };

    return (
        <div className="bg-base-200 overflow-x-auto max-w-3xl mx-auto w-full">
            <table className="table table-zebra bg-base-200 w-full shadow-md rounded-box">
                <thead>
                <tr>
                    <th className="text-left">Date</th>
                    <th className="text-left">Numbers</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Repeats</th>
                </tr>
                </thead>

                <tbody>
                {localBoards.map((b) => (
                    <tr key={b.id} className="hover">
                        <td>{new Date(b.createdAt).toLocaleDateString()}</td>

                        <td className="wrap-break-word">{b.numbers.join(", ")}</td>

                        <td className="text-center">
                                <span
                                    className={`font-bold ${
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
                                </span>
                        </td>

                        <td className="text-center">
                            <div className="flex items-center justify-center gap-2">
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
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {localBoards.length === 0 && (
                <div className="bg-base-200 text-center py-8 text-base-content/60">
                    No boards found.
                </div>
            )}
        </div>
    );
}