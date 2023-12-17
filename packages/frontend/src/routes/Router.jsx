import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Dashboard from "@/pages/Dashboard";
import ErrorPage from "@/pages/ErrorPage";

const Router = () => {
    const browserRouter = createBrowserRouter([
        {
            path: "/",
            element: <Dashboard />,
            errorElement: <ErrorPage />,
        },
    ]);

    return (
        <RouterProvider router={browserRouter}/>
    )
}

export default Router;