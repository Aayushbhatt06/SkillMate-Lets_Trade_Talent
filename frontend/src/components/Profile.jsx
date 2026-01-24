import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Profile = () => {
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user.id);

  const [name, setName] = useState("");
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [connections, setConnections] = useState([]);
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("image.png");
  const [skills, setSkills] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [showConnections, setShowConnections] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfileData();
    fetchConnections();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Unable to fetch profile data");

      const data = await res.json();

      setName(data.user?.name || "");
      setSkills(data.user?.skills || []);
      setBio(data.user?.bio || "");
      setImage(data.user?.image || "image.png");
      setPosts(data.posts || []);
      setProjects(data.projects || []);
      setPostCount(data.posts?.length || 0);
      setProjectCount(data.projects?.length || 0);
    } catch (error) {
      console.error(error);
      setError(true);
      setMessage("Failed to load profile");
    }
  };

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/connection/fetchcon`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(userId ? { userId } : {}),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Something went wrong");
      }

      setConnections(data.connections || []);
    } catch (err) {
      setError(true);
      setMessage(err.message || "Network error");
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setError(false);
      setMessage("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const handlePostClick = (post) => {
    navigate(`/load-post?postId=${post._id}`);
  };

  const handleProjectClick = (project) => {
    navigate(`/load-project?projId=${project._id}`);
  };

  const handleProfileNavigate = (id) => {
    navigate(`/load-profile?id=${id}`);
  };

  const sortedByName = [...connections].sort((a, b) =>
    a.user.name.localeCompare(b.user.name),
  );

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <img src="Spinner.gif" className="w-16 h-16" alt="loading" />
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      )}

      {message && (
        <div
          className={`fixed bottom-8 right-8 px-6 py-3 rounded-lg shadow-lg text-white ${
            error ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {message}
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-8">
          <div className="flex flex-col md:flex-row gap-8 border-b pb-8">
            <img
              src={image}
              alt="profile"
              className="w-36 h-36 rounded-full object-cover border-4 border-gray-100"
            />

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-3xl font-bold">{name}</h2>
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Edit Profile
                </button>
              </div>

              <div className="flex gap-8 mb-4">
                <div>
                  <p className="text-xl font-bold">{postCount}</p>
                  <p className="text-sm text-gray-600">Posts</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{projectCount}</p>
                  <p className="text-sm text-gray-600">Projects</p>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => setShowConnections(true)}
                >
                  <p className="text-xl font-bold">{connections.length}</p>
                  <p className="text-sm text-gray-600">Connections</p>
                </div>
              </div>

              {bio && <p className="text-gray-700 mb-3">{bio}</p>}

              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            {posts.map((p, i) => (
              <div
                key={i}
                onDoubleClick={() => handlePostClick(p)}
                className="cursor-pointer rounded-lg overflow-hidden shadow"
              >
                <img
                  src={p.image || "image.png"}
                  className="w-full h-40 object-cover"
                />
              </div>
            ))}
            {projects.map((p, i) => (
              <div
                key={i}
                onDoubleClick={() => handleProjectClick(p)}
                className="cursor-pointer rounded-lg overflow-hidden shadow"
              >
                <img
                  src={p.image || "project.png"}
                  className="w-full h-40 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {showConnections && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Connections</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {sortedByName.map((c, i) => (
                <div
                  key={i}
                  onDoubleClick={() => handleProfileNavigate(c.user._id)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <img
                    src={c.user.image || "image.png"}
                    className="w-10 h-10 rounded-full"
                  />
                  <p>{c.user.name}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowConnections(false)}
              className="mt-4 text-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
