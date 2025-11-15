import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { userAtom } from "../atoms/userAtom.ts";
import {useEffect} from "react";
import {handleUserAuth} from "../api";

export default function Dashboard() {
    const [user, setUser] = useAtom(userAtom);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const u = await handleUserAuth();
            if (u) setUser(u);
            else navigate("/");
        })();
    }, []);

    if (!user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-base-200 w-screen flex flex-col">
            {/* Navbar */}
            <div className="navbar bg-base-100 shadow-md">
                <div className="flex-1 justify-center">
                    <span className="text-xl font-bold">Dead Pigeons</span>
                </div>
                <div className="flex-none pr-4 flex flex-col items-end gap-1">
                    <span className="badge badge-primary">{user!.username}</span>
                    <span className="badge badge-secondary">Balance: 100DKK</span>
                </div>
            </div>

            {/* Main Dashboard Buttons */}
            <div className="flex flex-col items-center justify-center flex-1 w-full h-full">
                <div className="flex flex-col items-center gap-6">
                    <button className="btn btn-secondary btn-lg w-64" onClick={() => navigate("buyBoard")}>Buy Board</button>
                    <button className="btn btn-secondary btn-lg w-64" onClick={() => navigate("prevBoards")}>Previous Boards</button>
                </div>
            </div>
        </div>
    );
}