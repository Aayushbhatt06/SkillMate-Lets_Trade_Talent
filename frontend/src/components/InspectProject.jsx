import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Share, ClipboardCheck } from "lucide-react";

// Assuming we have same sendConnection functionality available
import { sendConnection } from "./SendConnection";

const InspectProject = () => {
  const [searchParams] = useSearchParams();
  const projId = searchParams.get("projId");
  const navigate = useNavigate();

  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [shareLogo, setShareLogo] = useState(false);

  // Project details
  const [project, setProject] = useState(null);

  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 30) return `${days} days ago`;
    return `${months} months ago`;
  };

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/load-project`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ projId }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setError(true);
        setMessage(data.message || "Something Went Wrong!!");
        setLoading(false);
        return;
      }

      setProject(data.project);
      setError(false);
      setLoading(false);
    } catch (error) {
      setError(true);
      setMessage(error.message || "Error fetching project details");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projId) {
      fetchProjectDetails();
    }
  }, [projId]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage("");
      setError(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleConnection = async (receiverId) => {
    if (!receiverId) return;
    const res = await sendConnection(receiverId);

    if (!res.ok || res.data?.success === false) {
      setError(true);
      setMessage(res.data?.message || "Something went wrong");
    } else {
      setError(false);
      setMessage(res.data?.message || "Request Sent Successfully");
    }
  };

  const sendContriReq = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/contribution/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ projId: project._id }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(true);
        setMessage(data.message || "Something went wrong");
        setActionLoading(false);
        return;
      }

      setError(false);
      setMessage(data.message || "Request sent successfully");
    } catch (error) {
      console.error("Send contribution request error:", error);
      setError(true);
      setMessage(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `${import.meta.env.VITE_FRONTEND_URL}/load-project?projId=${projId}`
    );
    setShareLogo(true);
    setTimeout(() => setShareLogo(false), 5000);
  };

  const isVideo = (url) => {
    return /\.(mp4|webm|mov|quicktime|mkv)$/i.test(url);
  };

  if (!project && !loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl font-semibold text-gray-500">Project Not Found</p>
      </div>
    );
  }

  const owner = project?.userId || {};

  return (
    <>
      <div
        className={`${
          loading ? "flex" : "hidden"
        } flex-col justify-center items-center fixed inset-0 bg-white/70 backdrop-blur-sm z-50`}
      ></div>
      
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

      {project && (
        <div className="container mx-auto flex flex-col items-center mb-6 mt-6 justify-center">
          <div className="post bg-white rounded-xl p-6 min-w-[60vw] max-w-[60vw] shadow-md">
            <div className="header flex justify-between items-center mb-4">
              <div className="header1 flex gap-4 items-center">
                <img
                  className="w-12 h-12 rounded-full object-cover cursor-pointer"
                  src={owner.image || "image.png"}
                  alt={`${owner.name}'s profile`}
                  onClick={() => navigate(`/load-profile?id=${owner._id}`)}
                />
                <div className="nametime">
                  <button
                    onClick={() => navigate(`/load-profile?id=${owner._id}`)}
                    className="font-semibold text-lg hover:underline focus:outline-none cursor-pointer"
                  >
                    {owner.name}
                  </button>
                  <p className="text-sm text-gray-500">{timeAgo(project.createdAt)}</p>
                </div>
              </div>
              <button 
                onClick={() => handleConnection(owner._id)}
                className="bg-blue-600 text-white px-4 py-2 !rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Connect
              </button>
            </div>

            {project.image && (
              <div className="w-full rounded-lg overflow-hidden mb-4 bg-black">
                {isVideo(project.image) ? (
                  <video
                    src={project.image}
                    className="w-full object-cover rounded"
                    controls={true}
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img
                    src={project.image}
                    alt="Project visual"
                    className="w-full max-h-[70vh] object-cover"
                  />
                )}
              </div>
            )}

            <div className="flex justify-between items-start mb-2">
              <div className="title text-2xl font-bold">{project.name}</div>
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 text-gray-600 hover:text-green-500 cursor-pointer"
              >
                {shareLogo ? <ClipboardCheck /> : <Share size={20} />}
                <span className="text-sm">Share</span>
              </button>
            </div>
            
            <div className="desc text-lg text-gray-700 mb-4">{project.description}</div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
              <div className="requiredskills mb-3">
                <strong className="text-gray-900 block mb-2">Required Skills:</strong>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills?.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="status flex items-center gap-2">
                <strong className="text-gray-900">Status: </strong>
                <span className={`px-2 py-1 rounded-md text-sm font-medium ${project.fulfilled ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                  {project.fulfilled ? "Fulfilled" : "Open"}
                </span>
              </div>
            </div>

            <div className="button flex justify-center mt-2">
              <button
                onClick={sendContriReq}
                disabled={actionLoading || project.fulfilled}
                className={`w-full py-3 !rounded-xl text-white font-bold transition cursor-pointer ${
                  project.fulfilled 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {actionLoading ? "Requesting..." : (project.fulfilled ? "Project Closed" : "Enroll")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InspectProject;
