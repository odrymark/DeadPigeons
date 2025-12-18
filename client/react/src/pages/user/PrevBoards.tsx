import { useEffect, useState } from "react";
import { type BoardGet, apiService } from "../../api";
import BoardsTable from "../../components/tables/BoardsTable.tsx";
import { useToast } from "../../components/ToastProvider";

export default function PrevBoards() {
    const [boards, setBoards] = useState<BoardGet[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        async function fetchBoards() {
            setLoading(true);
            try {
                const data = await apiService.getBoards();
                setBoards(data);
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Something went wrong";
                toast(message, "error");
            } finally {
                setLoading(false);
            }
        }
        fetchBoards();
    }, [toast]);

    if (loading) {
        return (
            <div className="w-full flex justify-center items-center py-20">
                <span className="loading loading-dots loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="bg-base-200 w-full flex flex-col p-6 box-border">
            <BoardsTable boards={boards} />
        </div>
    );
}