import type {BoardGet} from "../../api";

interface Props {
    boards: BoardGet[];
}

export default function BoardsTable({ boards }: Props) {
    return (
        <>
            {/* HEADER */}
            <div className="grid grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto w-full bg-base-100 p-4 rounded-lg shadow font-bold text-lg border-b">
                <div>Date</div>
                <div>Numbers</div>
                <div>Status</div>
            </div>

            {/* LIST */}
            <div className="mt-4 flex flex-col gap-4 max-w-3xl mx-auto w-full">
                {boards.map((b) => (
                    <div
                        key={b.id}
                        className="grid grid-cols-1 sm:grid-cols-3 bg-base-100 p-4 shadow rounded-lg items-center gap-2"
                    >
                        <div>{new Date(b.createdAt).toLocaleDateString()}</div>
                        <div className="break-words">{b.numbers.join(", ")}</div>
                        <div className={b.isWinner === null ? "text-warning font-bold" : b.isWinner ? "text-success font-bold" : "text-error font-bold"}>
                            {b.isWinner === null ? "In Game" : b.isWinner ? "Win" : "Loss"}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}