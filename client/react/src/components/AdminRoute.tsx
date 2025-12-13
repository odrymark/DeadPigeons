import { useAtomValue } from "jotai";
import { Navigate } from "react-router-dom";
import { userAtom } from "../atoms/userAtom";
import type {JSX} from "react";

export default function AdminRoute({ children }: { children: JSX.Element }) {
    const user = useAtomValue(userAtom);

    if (!user) return <div>Loading...</div>;

    if (!user.isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}