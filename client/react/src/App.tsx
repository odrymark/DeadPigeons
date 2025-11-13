import {createBrowserRouter, type RouteObject, RouterProvider} from "react-router-dom";
import Login from "./pages/Login.tsx";

const routes : RouteObject[] = [
    {
        path: "/",
        element: <Login/>
    }
]

function App() {
    return <RouterProvider router={createBrowserRouter(routes)}/>
}

export default App