import {useEffect, useEffectEvent, useState} from "react";
import {type BoardGet, type PaymentGet, type UserInfoGet, apiService} from "../../api";
import PaymentsTable from "../../components/tables/PaymentsTable.tsx";
import BoardsTable from "../../components/tables/BoardsTable.tsx";
import InfoTable from "../../components/tables/InfoTable.tsx";

export default function UserHistory() {
    const [payments, setPayments] = useState<PaymentGet[]>([]);
    const [boards, setBoards] = useState<BoardGet[]>([]);
    const [userInfo, setUserInfo] = useState<UserInfoGet | null>(null);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [selectedMode, setSelectedMode] = useState<string>("General");
    const [users, setUsers] = useState<UserInfoGet[]>([]);
    const modes = ["General", "Payments", "Boards"];

    const loadUsers = useEffectEvent(async () => {
        const u = await apiService.getAllUsers();
        setUsers(u);
    });

    const loadDataForMode = useEffectEvent(async () => {
        if (!selectedUser) {
            setPayments([]);
            setBoards([]);
            setUserInfo(null);
            return;
        }

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
            setUserInfo(data);
            setPayments([]);
            setBoards([]);
        }
    });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        loadDataForMode();
    }, [selectedUser, selectedMode]);


    return (
        <div className="bg-base-200 w-full flex flex-col p-6 box-border">

            {/* DROPDOWNS */}
            <div className="flex gap-4 max-w-3xl mx-auto mb-4">

                {/* User dropdown */}
                <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="select select-bordered min-w-[200px] md:w-1/2"
                >
                    <option value="" disabled title="Select User">
                        Select User
                    </option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id} title={u.username}>
                            {u.username}
                        </option>
                    ))}
                </select>

                {/* Mode dropdown */}
                <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="select select-bordered min-w-[200px] md:w-1/2"
                >
                    {modes.map((m) => (
                        <option key={m} value={m} title={m}>
                            {m}
                        </option>
                    ))}
                </select>

            </div>

            {selectedMode === "Payments" && <PaymentsTable payments={payments} />}
            {selectedMode === "Boards" && <BoardsTable boards={boards} />}
            {selectedMode === "General" && <InfoTable userInfo={userInfo} />}

        </div>
    );
}