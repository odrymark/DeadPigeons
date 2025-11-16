import {createBrowserRouter, type RouteObject, RouterProvider, Navigate} from "react-router-dom";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PrevBoards from "./pages/PrevBoards.tsx";
import BuyBoard from "./pages/BuyBoard.tsx";
import MainPage from "./pages/MainPage.tsx";
import PrevPay from "./pages/prevPay.tsx";
import './style.css'

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
                element: <PrevPay/>
            }
        ]
    },
]

function App() {
    return <RouterProvider router={createBrowserRouter(routes)}/>
}

export default App