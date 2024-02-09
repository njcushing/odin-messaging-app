import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Landing from "@/pages/Landing";
import ErrorPage from "@/pages/ErrorPage";

const Router = () => {
    const browserRouter = createBrowserRouter([
        {
            path: "/",
            element: <Landing />,
            errorElement: <ErrorPage />,
        },
    ]);

    return (
        <RouterProvider router={browserRouter} />
    )
}

export default Router;