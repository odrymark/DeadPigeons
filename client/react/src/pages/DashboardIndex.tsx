import { useAtomValue } from "jotai";
import { userAtom } from "../atoms/userAtom.ts";
import UserPage from "./user/UserPage.tsx";
import AdminPage from "./admin/AdminPage.tsx";

export default function DashboardIndex() {
    const user = useAtomValue(userAtom);

    if (!user) return "Loading...";

    return user.isAdmin ? <AdminPage /> : <UserPage />;
}