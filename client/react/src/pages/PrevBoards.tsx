import {useEffect, useState} from "react";
import {type Board, handleGetBoards} from "../api";

export default function PrevBoards() {
    const [boards, setBoards] = useState<Board[]>([]);

    useEffect(() => {
        async function fetchBoards() {
            const data = await handleGetBoards();
            if (data) setBoards(data);
        }
        fetchBoards();
    }, []);

    return (
        <div className="bg-base-200 w-full flex flex-col p-6 box-border">

        {/* HEADER */}
            <div className="grid grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto w-full bg-base-100 p-4 rounded-lg shadow font-bold text-lg border-b">
                <div>Date</div>
                <div>Numbers</div>
                <div>Winner</div>
            </div>

            {/* BOARD LIST */}
            <div className="mt-4 flex flex-col gap-4 max-w-3xl mx-auto w-full">
                {boards.map((b) => (
                    <div
                        key={b.id}
                        className="grid grid-cols-1 sm:grid-cols-3 bg-base-100 p-4 shadow rounded-lg items-center gap-2"
                    >
                        <div>{new Date(b.createdAt).toLocaleDateString()}</div>

                        <div className="break-words">{b.numbers.join(", ")}</div>

                        <div className={b.isWinner === null ? "" : b.isWinner ? "text-success font-bold" : "text-error font-bold"}>
                            {b.isWinner === null ? "" : b.isWinner ? "Yes" : "No"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}