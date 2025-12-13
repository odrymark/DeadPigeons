import { useAtom } from "jotai";
import { useNavigate, Outlet } from "react-router-dom";
import { userAtom } from "../atoms/userAtom.ts";
import { useEffect, useState } from "react";
import { apiService } from "../api";
import logoutIcon from "../assets/logout.png";
import homeIcon from "../assets/home.png";
import { balanceAtom } from "../atoms/balanceAtom.ts";
import UserBtns from "../components/sidebarBtns/UserBtns.tsx";
import AdminBtns from "../components/sidebarBtns/AdminBtns.tsx";

export default function Dashboard() {
    const [user, setUser] = useAtom(userAtom);
    const [balance, setBalance] = useAtom(balanceAtom);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    {/*TODO: Make atom, if log out and log back in it gets messed up*/}
    const [isLightTheme, setLightTheme] = useState(true);
    const darkTheme = "forest";
    const lightTheme = "emerald";

    useEffect(() => {
        (async () => {
            const u = await apiService.getCurrentUser();
            if (u) setUser(u);
            else navigate("/");

            const bal = await apiService.getBalance();
            setBalance(bal);
        })();
    }, []);

    const toggleTheme = () => {
        const newTheme = isLightTheme ? darkTheme : lightTheme;
        setLightTheme(!isLightTheme);
        document.documentElement.dataset.theme = newTheme;
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-base-200 w-screen flex flex-col relative overflow-hidden">
            {/* Sidebar Toggle Button */}
            <button
                className="btn btn-primary absolute top-4 left-4 z-50"
                onClick={() => setOpen(true)}
            >
                ☰
            </button>

            {/* Sidebar Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}

            {/* Sidebar Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-base-100 shadow-xl z-50 transform transition-transform duration-300 flex flex-col p-4 gap-4 ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* User Info + Theme Toggle */}
                <div className="flex items-center justify-between pb-4 border-b border-base-300">
                    <div className="flex flex-col gap-1">
                        <span className="text-lg font-bold">{user.username}</span>
                        {user.isAdmin ? (
                            <span className="badge badge-warning w-fit">Admin</span>
                        ) : (
                            <span className="badge badge-secondary w-fit">Balance: {balance} DKK</span>
                        )}

                        {/* Login/Logout button */}
                        <button
                            className="btn btn-error btn-sm mt-2 w-fit flex items-center gap-2"
                            onClick={async () => {
                                await apiService.logout();
                                navigate("/login");
                            }}
                        >
                            <img src={logoutIcon} alt="Logout" className="h-5 w-5" /> Logout
                        </button>
                    </div>

                    {/*TODO: Add in a light bulb*/}

                    {/* Theme toggle */}
                    <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={isLightTheme}
                        onChange={toggleTheme}
                    />
                </div>

                {/* Home Button */}
                <button
                    className="btn btn-primary w-full flex items-center gap-2"
                    onClick={() => {
                        navigate("/dashboard");
                        setOpen(false);
                    }}
                >
                    <img src={homeIcon} alt="Home" className="h-6 w-6" /> Home
                </button>

                {/* Admin/User Buttons */}
                {user.isAdmin ? (
                    <AdminBtns close={() => setOpen(false)} />
                ) : (
                    <UserBtns close={() => setOpen(false)} />
                )}
            </div>

            <Outlet />
        </div>
    );
}