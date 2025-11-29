import {createBrowserRouter, type RouteObject, RouterProvider, Navigate} from "react-router-dom";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PrevBoards from "./pages/user/PrevBoards.tsx";
import BuyBoard from "./pages/user/BuyBoard.tsx";
import PrevPayments from "./pages/user/PrevPayments.tsx";
import AddUser from "./pages/admin/AddUser.tsx";
import WinningNumbers from "./pages/admin/WinningNumbers.tsx";
import AddPayment from "./pages/user/AddPayment.tsx";
import GameHistory from "./pages/admin/GameHistory.tsx";
import AdminRoute from "./components/AdminRoute.tsx";
import UserHistory from "./pages/admin/UserHistory.tsx";
import ApprovePay from "./pages/admin/ApprovePay.tsx";
import MainPage from "./pages/HomePage.tsx";

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
                element: <MainPage/>
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