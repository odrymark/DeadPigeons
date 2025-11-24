import {createBrowserRouter, type RouteObject, RouterProvider, Navigate} from "react-router-dom";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PrevBoards from "./pages/PrevBoards.tsx";
import BuyBoard from "./pages/BuyBoard.tsx";
import PrevPayments from "./pages/PrevPayments.tsx";
import './style.css'
import DashboardIndex from "./pages/DashboardIndex.tsx";
import AddUser from "./pages/AddUser.tsx";
import WinningNumbers from "./pages/WinningNumbers.tsx";
import AddPayment from "./pages/AddPayment.tsx";
import GameHistory from "./pages/GameHistory.tsx";
import AdminRoute from "./components/AdminRoute.tsx";
import UserHistory from "./pages/UserHistory.tsx";
import ApprovePay from "./pages/ApprovePay.tsx";

const routes : RouteObject[] = [
    {
        path:"/",
        element: <Navigate to="/login" replace />
    },
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/dashboard",
        element: <Dashboard/>,
        children: [
            {
                path: "/dashboard/",
                element: <DashboardIndex/>
            },
            {
                path: "buyBoard",
                element: <BuyBoard/>
            },
            {
                path: "prevBoards",
                element: <PrevBoards/>
            },
            {
                path: "prevPay",
                element: <PrevPayments/>
            },
            {
                path: "addUser",
                element: (
                    <AdminRoute>
                        <AddUser/>
                    </AdminRoute>
                )
            },
            {
                path: "winningNumbers",
                element: (
                    <AdminRoute>
                        <WinningNumbers/>
                    </AdminRoute>
                )
            },
            {
                path: "addPayment",
                element: <AddPayment/>
            },
            {
                path: "gameHistory",
                element: (
                    <AdminRoute>
                        <GameHistory/>
                    </AdminRoute>
                )
            },
            {
                path: "userHistory",
                element: (
                    <AdminRoute>
                        <UserHistory/>
                    </AdminRoute>
                )
            },
            {
                path: "approvePay",
                element: (
                    <AdminRoute>
                        <ApprovePay/>
                    </AdminRoute>
                )
            }
        ]
    },
]

function App() {
    return <RouterProvider router={createBrowserRouter(routes)}/>
}

export default App