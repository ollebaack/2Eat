import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../Pages/HomePage";
import LeaderBoardPage from "../Pages/LeaderBoardPage";
import UserPage from "../Pages/UserPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "user/:id",
        element: <UserPage />,
      },
      {
        path: "leaderboard",
        element: <LeaderBoardPage />,
      },
    ],
  },
]);
