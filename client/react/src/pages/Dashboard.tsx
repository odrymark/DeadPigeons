import { useAtom } from "jotai";
import { useNavigate, Outlet } from "react-router-dom";
import { userAtom } from "../atoms/userAtom.ts";
import {useEffect, useState} from "react";
import {handleLogout, handleUserAuth, handleGetBalance} from "../api";
import logoutIcon from "../assets/logout.png";
import homeIcon from "../assets/home.png";

export default function Dashboard() {
    const [user, setUser] = useAtom(userAtom);
    const [balance, setBal] = useState<number>(0);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const u = await handleUserAuth();
            if (u) setUser(u);
            else navigate("/");
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const bal = await handleGetBalance();
            setBal(bal);
        })();
    }, []);

    if (!user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-base-200 w-screen flex flex-col">
            {/* Navbar */}
            <div className="navbar bg-base-100 shadow-md">

                <div className="navbar-start">
                    <span className="text-xl font-bold pl-4">Dead Pigeons</span>
                </div>

                {/* Home Button */}
                <div className="navbar-center">
                    <button onClick={() => navigate("/dashboard")} className="btn btn-primary w-15 h-15 p-0 rounded-xl flex items-center justify-center">
                        <img
                            src={homeIcon}
                            alt="Home"
                            className="w-8 h-8 object-contain"
                        />
                    </button>
                </div>

                {/* User Info */}
                <div className="navbar-end pr-4 flex items-center gap-2">
                    <div className="flex flex-col items-end gap-1">
                        <span className="badge badge-primary">{user!.username}</span>
                        <span className="badge badge-secondary">Balance: {balance} DKK</span>
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