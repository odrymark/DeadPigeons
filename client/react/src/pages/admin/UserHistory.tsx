import { useEffect, useState } from "react";
import {
    type BoardGet,
    type PaymentGet,
    type UserInfoGet,
    apiService,
} from "../../api";
import PaymentsTable from "../../components/tables/PaymentsTable.tsx";
import BoardsTable from "../../components/tables/BoardsTable.tsx";
import InfoTable from "../../components/tables/InfoTable.tsx";
import { useToast } from "../../components/ToastProvider";

export default function UserHistory() {
    const [payments, setPayments] = useState<PaymentGet[]>([]);
    const [boards, setBoards] = useState<BoardGet[]>([]);
    const [userInfo, setUserInfo] = useState<UserInfoGet | null>(null);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [selectedMode, setSelectedMode] = useState<string>("General");
    const [users, setUsers] = useState<UserInfoGet[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingData, setLoadingData] = useState(false);

    const toast = useToast();

    const modes = ["General", "Payments", "Boards"];

    useEffect(() => {
        async function loadUsers() {
            setLoadingUsers(true);
            try {
                const u = await apiService.getAllUsers();
                setUsers(u);
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Something went wrong";
                toast(message, "error");
            } finally {
                setLoadingUsers(false);
            }
        }

        loadUsers();
    }, []);

    useEffect(() => {
        if (!selectedUser) {
            setPayments([]);
            setBoards([]);
            setUserInfo(null);
            return;
        }

        async function loadDataForMode() {
            setLoadingData(true);
            try {
                if (selectedMode === "Payments") {
                    const data = await apiService.getPayments(selectedUser);
                    setPayments(data ?? []);
                    setBoards([]);
                    setUserInfo(null);
                } else if (selectedMode === "Boards") {
                    const data = await apiService.getBoards(selectedUser);
                    setBoards(data ?? []);
                    setPayments([]);
                    setUserInfo(null);
                } else if (selectedMode === "General") {
                    const data = await apiService.getUserInfo(selectedUser);
                    setUserInfo(data ?? null);
                    setPayments([]);
                    setBoards([]);
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Something went wrong";
                toast(message, "error");
                setPayments([]);
                setBoards([]);
                setUserInfo(null);
            } finally {
                setLoadingData(false);
            }
        }

        loadDataForMode();
    }, [selectedUser, selectedMode]);

    return (
        <div className="bg-base-200 w-full flex flex-col p-6 box-border">
            <div className="bg-base-200 flex gap-4 max-w-3xl mx-auto mb-8">
                <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="select select-bordered min-w-[200px] md:w-1/2"
                    disabled={loadingUsers}
                >
                    <option value="" disabled>
                        {loadingUsers ? "Loading users..." : "Select User"}
                    </option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.username}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="select select-bordered min-w-[200px] md:w-1/2"
                    disabled={!selectedUser || loadingData}
                >
                    {modes.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </select>
            </div>

            {loadingData && (
                <div className="w-full flex justify-center items-center py-20">
                    <span className="loading loading-dots loading-lg"></span>
                </div>
            )}

            {!loadingData && selectedUser && (
                <>
                    {selectedMode === "Payments" && <PaymentsTable payments={payments} />}
                    {selectedMode === "Boards" && <BoardsTable boards={boards} />}
                    {selectedMode === "General" && <InfoTable userInfo={userInfo} />}
                </>
            )}

            {!loadingData && !selectedUser && (
                <div className="text-center py-10 text-xl text-base-content/60">
                    Please select a user to view their history.
                </div>
            )}
        </div>
    );
}