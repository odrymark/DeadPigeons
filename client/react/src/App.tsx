import {createBrowserRouter, type RouteObject, RouterProvider} from "react-router-dom";
import Login from "./pages/Login.tsx";
import Main from "./pages/Dashboard.tsx";
import './style.css'

const routes : RouteObject[] = [
    {
        path: "/",
        element: <Login/>
    },
    {
        path: "/dashboard",
        element: <Main/>
    }
]

function App() {
    return <RouterProvider router={createBrowserRouter(routes)}/>
}

export default App