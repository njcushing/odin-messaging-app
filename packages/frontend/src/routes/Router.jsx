import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LogIn from "@/pages/LogIn";
import Dashboard from "@/pages/Dashboard";
import ErrorPage from "@/pages/ErrorPage";

const Router = () => {
    const browserRouter = createBrowserRouter([
        {
            path: "/log-in",
            element: <LogIn />,
            errorElement: <ErrorPage />,
        },
        {
            path: "/dashboard",
            element: <Dashboard />,
            errorElement: <ErrorPage />,
        },
    ]);

    return (
        <RouterProvider router={browserRouter}/>
    )
}

export default Router;