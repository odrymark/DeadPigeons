import { useAtom } from "jotai";
import { useNavigate, Outlet } from "react-router-dom";
import { userAtom } from "../atoms/userAtom.ts";
import {useEffect} from "react";
import {handleLogout, handleUserAuth} from "../api";
import logoutIcon from "../assets/logout.png"

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

                <div className="flex-none pr-4 flex items-center gap-2">
                    <div className="flex flex-col items-end gap-1">
                        <span className="badge badge-primary">{user!.username}</span>
                        <span className="badge badge-secondary">Balance: 100DKK</span>
                    </div>

                    <button className="btn btn-error p-0 w-15 h-15 flex items-center justify-center rounded-full" onClick={async () => {
                        await handleLogout();
                        navigate("/login");
                    }}>
                        <img
                            src={logoutIcon}
                            alt="Logout"
                            className="h-6 w-6 object-contain"
                        />
                    </button>
                </div>
            </div>

            <Outlet />
        </div>
    );
}