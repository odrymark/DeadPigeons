import {createBrowserRouter, type RouteObject, RouterProvider, Navigate} from "react-router-dom";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PrevBoards from "./pages/PrevBoards.tsx";
import BuyBoard from "./pages/BuyBoard.tsx";
import PrevPay from "./pages/prevPay.tsx";
import './style.css'
import DashboardIndex from "./pages/DashboardIndex.tsx";
import AddUser from "./pages/AddUser.tsx";
import WinningNumbers from "./pages/WinningNumbers.tsx";
import AddPayment from "./pages/AddPayment.tsx";
import WeekWinners from "./pages/WeekWinners.tsx";

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
                element: <PrevPay/>
            },
            {
                path: "addUser",
                element: <AddUser/>
            },
            {
                path: "winningNumbers",
                element: <WinningNumbers/>
            },
            {
                path: "addPayment",
                element: <AddPayment/>
            },
            {
                path: "weekWinners",
                element: <WeekWinners/>
            }
        ]
    },
]

function App() {
    return <RouterProvider router={createBrowserRouter(routes)}/>
}

export default App