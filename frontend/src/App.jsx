import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import NewProject from "./components/NewProject";
import Sidebar from "./components/Sidebar";
import Post from "./components/Post";
import Notification from "./components/Notification";
import Message from "./components/Message";
import Profile_Inspect from "./components/Profile_Inspect";
import Contribution from "./components/Contribution";
import LandingPage from "./components/Landing";

const Layout = () => {
  return (
    <>
      <Navbar />
      <div className="flex h-[91.5vh] bg-gray-200">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
};

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/home", element: <Home /> },
      { path: "/message", element: <Home /> },
      { path: "/profile", element: <Profile /> },
      { path: "/profile/edit", element: <EditProfile /> },
      { path: "/newproject", element: <NewProject /> },
      { path: "/load-post", element: <Post /> },
      { path: "/notification", element: <Notification /> },
      { path: "/chat", element: <Message /> },
      { path: "/load-profile", element: <Profile_Inspect /> },
      { path: "/contribution", element: <Contribution /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
