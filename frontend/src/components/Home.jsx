import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../Redux/userSlice";
import PostFeed from "./PostFeed";
import ProjectFeed from "./ProjectFeed";
import { socket } from "../../utils/Socket";

const HomePage = () => {
  const dispatch = useDispatch();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/fetchposts`,
        {
          method: "GET",
        },
      );
      if (!res.ok) {
        alert("unable to fetch posts");
      }
      const data = await res.json();
      setPosts(data.posts);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();

        const userPayload = {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          image: data.user.image,
          skills: data.user.skills || [],
        };

        dispatch(login(userPayload));
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchPosts();
    socket.connect();
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("userOnline", (data) => {
      console.log("userOnline", data);
    });

    return () => {
      socket.off("connect");
      socket.off("userOnline");
    };
  }, []);

  return (
    <>
      <div
        className={`${
          loading ? "flex" : "hidden"
        } flex-col justify-center items-center fixed inset-0 bg-gradient-to-br from-blue-50/95 via-white/95 to-purple-50/95 backdrop-blur-md z-50`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <img
            className="w-20 h-20 relative z-10"
            src="Spinner.gif"
            alt="Loading..."
          />
        </div>
        <p className="text-gray-700 mt-4 font-semibold text-lg">
          Loading your feed...
        </p>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="container mx-auto max-w-7xl px-0 lg:px-8">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-lg pt-3 pb-3 px-4 lg:hidden border-b border-blue-100/50 shadow-sm">
            <div className="flex gap-2 bg-gradient-to-r from-slate-100 to-blue-50 rounded-2xl p-1.5 shadow-md border border-white/50">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform ${
                  activeTab === "posts"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                    : "text-gray-600 hover:bg-white/80 hover:shadow-sm"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                  Posts
                </span>
              </button>
              <button
                onClick={() => setActiveTab("projects")}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform ${
                  activeTab === "projects"
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]"
                    : "text-gray-600 hover:bg-white/80 hover:shadow-sm"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Projects
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:gap-8 lg:pt-6">
            <div
              className={`${
                activeTab === "posts" ? "block" : "hidden"
              } lg:block w-full lg:flex-1`}
            >
              <PostFeed posts={posts} setPosts={setPosts} />
            </div>

            <div
              className={`${
                activeTab === "projects" ? "block" : "hidden"
              } lg:block w-full lg:flex-1`}
            >
              <ProjectFeed />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
