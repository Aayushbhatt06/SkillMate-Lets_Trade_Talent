import React, { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";

const LIMIT = 10;

const ProjectFeed = () => {
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 🔥 Initial fetch
  useEffect(() => {
    fetchProjects(0);
  }, []);

  const fetchProjects = async (pageToFetch = page) => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/fetchproject`,
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: pageToFetch,
            limit: LIMIT,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(true);
        setMessage(data.message || "Failed to fetch projects");
        return;
      }

      if (!data.Projects || data.Projects.length === 0) {
        setHasMore(false);
        return;
      }

      setProjects((prev) => [...prev, ...data.Projects]);
      setPage((prev) => prev + 1);
      setHasMore(data.hasMore);

      setError(false);
      setMessage("");
    } catch (err) {
      setError(true);
      setMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {message && (
        <div
          className={`
            fixed bottom-6 right-6 z-50
            px-5 py-3 rounded-xl shadow-lg
            text-white font-semibold text-sm
            backdrop-blur-md animate-bounce
            ${error ? "bg-red-500/80" : "bg-green-500/80"}
          `}
        >
          {message}
        </div>
      )}

      {loading && (
        <div className="flex flex-col justify-center items-center fixed inset-0 bg-white/70 backdrop-blur-sm z-50">
          <img className="w-20 h-20" src="Spinner.gif" alt="Loading..." />
          <p className="text-gray-700 mt-2 font-semibold">Loading...</p>
        </div>
      )}

      <div className="w-full lg:flex-1 lg:max-w-[40vw] lg:min-w-[35vw]">
        <div className="flex flex-col">
          {projects.map((project, i) => (
            <ProjectCard project={project} key={i} />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-6 mb-5">
            <button
              onClick={() => fetchProjects()}
              disabled={loading}
              className="
                px-6 py-3 rounded-xl
                bg-gradient-to-r from-purple-600 to-blue-600
                text-white font-semibold
                hover:opacity-90
                disabled:opacity-50
                transition-all
              "
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {!hasMore && (
          <p className="text-center text-gray-500 mt-6 mb-5">
            No more projects to show
          </p>
        )}
      </div>
    </>
  );
};

export default ProjectFeed;
