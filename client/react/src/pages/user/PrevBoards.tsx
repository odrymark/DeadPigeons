import {useEffect, useState} from "react";
import {type BoardGet, handleGetBoards} from "../../api";
import BoardsTable from "../../components/tables/BoardsTable.tsx";

export default function PrevBoards() {
    const [boards, setBoards] = useState<BoardGet[]>([]);

    useEffect(() => {
        async function fetchBoards() {
            const data = await handleGetBoards();
            if (data) setBoards(data);
        }
        fetchBoards();
    }, []);

    return (
        <div className="bg-base-200 w-full flex flex-col p-6 box-border">
            <BoardsTable boards={boards}/>
        </div>
    );
}