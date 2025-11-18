import { useAtomValue } from "jotai";
import { userAtom } from "../atoms/userAtom.ts";
import UserPage from "./UserPage.tsx";
import AdminPage from "./AdminPage.tsx";

export default function DashboardIndex() {
    const user = useAtomValue(userAtom);

    if (!user) return "Loading...";

    return user.isAdmin ? <AdminPage /> : <UserPage />;
}