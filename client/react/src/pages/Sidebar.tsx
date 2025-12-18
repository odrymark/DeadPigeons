import { useAtom } from "jotai";
import { useNavigate, Outlet } from "react-router-dom";
import { userAtom } from "../atoms/userAtom.ts";
import { themeAtom } from "../atoms/themeAtom.ts";
import { useEffect, useState } from "react";
import { apiService } from "../api";
import logoutIcon from "../assets/logout.png";
import homeIcon from "../assets/home.png";
import { balanceAtom } from "../atoms/balanceAtom.ts";
import UserBtns from "../components/sidebarBtns/UserBtns.tsx";
import AdminBtns from "../components/sidebarBtns/AdminBtns.tsx";

export default function Sidebar() {
    const [user, setUser] = useAtom(userAtom);
    const [balance, setBalance] = useAtom(balanceAtom);
    const [theme, setTheme] = useAtom(themeAtom);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const darkThemeName = "dark";
    const lightThemeName = "light";

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    useEffect(() => {
        async function fetchUserData() {
            setLoading(true);
            try {
                const u = await apiService.getCurrentUser();
                if (u) {
                    setUser(u);

                    if (!u.isAdmin) {
                        const bal = await apiService.getBalance();
                        setBalance(bal);
                    }
                } else {
                    navigate("/");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [navigate, setUser, setBalance]);

    const toggleTheme = () => {
        const newTheme = theme === lightThemeName ? darkThemeName : lightThemeName;
        setTheme(newTheme);
        document.documentElement.dataset.theme = newTheme;
    };

    if (loading) {
        return (
            <div className="min-h-screen w-screen flex justify-center items-center bg-base-200">
                <span className="loading loading-dots loading-lg"></span>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const isDark = theme === darkThemeName;

    return (
        <div className="min-h-screen bg-base-200 w-screen flex flex-col relative overflow-hidden">
            <button
                className="btn btn-primary absolute top-4 left-4 z-50"
                onClick={() => setOpen(true)}
            >
                ☰
            </button>

            {open && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
                    onClick={() => setOpen(false)}
                />
            )}

            <div
                className={`fixed top-0 left-0 h-full w-64 bg-base-100 shadow-xl z-50 transform transition-transform duration-300 flex flex-col ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="shrink-0 p-4 border-b border-base-300">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-lg font-bold">{user.username}</span>
                            {user.isAdmin ? (
                                <span className="badge badge-warning w-fit">Admin</span>
                            ) : (
                                <span className="badge badge-secondary w-fit">
                                    Balance: {balance} DKK
                                </span>
                            )}
                        </div>

                        <label className="swap swap-rotate">
                            <input
                                type="checkbox"
                                className="theme-controller"
                                checked={isDark}
                                onChange={toggleTheme}
                            />
                            <svg
                                className="swap-off h-7 w-7 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                            </svg>
                            <svg
                                className="swap-on h-7 w-7 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                            </svg>
                        </label>
                    </div>

                    <button
                        className="btn btn-primary w-full mt-6 flex items-center gap-2"
                        onClick={() => {
                            navigate("/dashboard");
                            setOpen(false);
                        }}
                    >
                        <img src={homeIcon} alt="Home" className="h-6 w-6" /> Home
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center px-4 overflow-y-auto">
                    <div className="w-full">
                        {user.isAdmin ? (
                            <AdminBtns close={() => setOpen(false)} />
                        ) : (
                            <UserBtns close={() => setOpen(false)} />
                        )}
                    </div>
                </div>

                <div className="shrink-0 p-4 border-t border-base-300">
                    <button
                        className="btn btn-error w-full flex items-center justify-center gap-2"
                        onClick={async () => {
                            await apiService.logout();
                            navigate("/login");
                        }}
                    >
                        <img src={logoutIcon} alt="Logout" className="h-5 w-5" /> Logout
                    </button>
                </div>
            </div>

            <Outlet />
        </div>
    );
}