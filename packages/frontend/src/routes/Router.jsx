import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LogIn from "@/pages/LogIn";
import CreateAccount from "@/pages/CreateAccount";
import Dashboard from "@/pages/Dashboard";
import ErrorPage from "@/pages/ErrorPage";

const Router = () => {
    const browserRouter = createBrowserRouter([
        {
            path: "/",
            errorElement: <ErrorPage />,
        },
        {
            path: "/log-in",
            element: <LogIn />,
            errorElement: <ErrorPage />,
        },
        {
            path: "/create-account",
            element: <CreateAccount />,
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