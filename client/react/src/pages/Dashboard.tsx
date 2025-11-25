import { useAtom } from "jotai";
import { useNavigate, Outlet } from "react-router-dom";
import { userAtom } from "../atoms/userAtom.ts";
import {useEffect, useEffectEvent} from "react";
import {handleLogout, handleUserAuth, handleGetBalance} from "../api";
import logoutIcon from "../assets/logout.png";
import homeIcon from "../assets/home.png";
import {balanceAtom} from "../atoms/balanceAtom.ts";

export default function Dashboard() {
    const [user, setUser] = useAtom(userAtom);
    const [balance, setBalance] = useAtom(balanceAtom);
    const navigate = useNavigate();

    const loadData = useEffectEvent(() => {
        (async () => {
            const u = await handleUserAuth();
            if (u) setUser(u);
            else navigate("/");

            const bal = await handleGetBalance();
            setBalance(bal);
        })();
    });

    useEffect(() => {
        loadData();
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

                        {user!.isAdmin ? (
                            <span className="badge badge-warning">Admin</span>
                        ) : (
                            <span className="badge badge-secondary">Balance: {balance} DKK</span>
                        )}
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