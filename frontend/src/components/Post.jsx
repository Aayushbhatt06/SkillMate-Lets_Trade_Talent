import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Heart, ClipboardCheck, Share } from "lucide-react";
import CommentCard from "./CommentCard";

const Post = () => {
  const [SearchParams] = useSearchParams();
  const postId = SearchParams.get("postId");
  const navigate = useNavigate();

  const [error, setError] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Hello message test");

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");
  const [like, setLike] = useState(0);
  const [createdAt, setCreatedAt] = useState("");
  const [comments, setComments] = useState([]);
  const [shareLogo, setShareLogo] = useState(false);

  const timeAgo = (dateString) => {
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

  const handleLike = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/like`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(true);
        setMessage(data.message);
        return;
      }

      setLike(data.updatedPost.like);
    } catch (error) {
      setMessage(error);
      setError(true);
    }
  };

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/load-post`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ postId }),
        },
      );
      const data = await res.json();

      if (!res.ok) {
        setError(true);
        setMessage(data.message || "Something Went Wrong!!");
        setLoading(false);
        return;
      }

      setUserId(data.post.userId._id);
      setUserName(data.post.userId.name);
      setProfilePic(data.post.userId.image);
      setTitle(data.post.title);
      setDesc(data.post.desc);
      setImage(data.post.image);
      setLike(data.post.like);
      setCreatedAt(data.post.createdAt);
      setComments(data.comments || []);
      setError(false);
      setLoading(false);
    } catch (error) {
      setError(true);
      setMessage(error.message || "Error fetching post details");
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setMessage("");
      setError(false);
    }, 5000);
  }, [setMessage]);

  useEffect(() => {
    fetchPostDetails();
  }, []);
  const handleShare = () => {
    navigator.clipboard.writeText(
      `${import.meta.env.VITE_FRONTEND_URL}/load-post?postId=${postId}`,
    );
    setShareLogo(true);
    setTimeout(() => setShareLogo(false), 5000);
  };

  const isVideo = (url) => {
    return /\.(mp4|webm|mov|quicktime|mkv)$/i.test(url);
  };

  const isImage = (url) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  return (
    <>
      <div
        className={`${
          loading ? "flex" : "hidden"
        } flex-col justify-center items-center fixed inset-0 bg-white/70 backdrop-blur-sm z-50`}
      ></div>
      <div className="container mx-auto flex flex-col items-center mb-6 mt-6 justify-center">
        <div className="post bg-white rounded-xl p-6 min-w-[60vw] shadow-md">
          <div className="header flex justify-between items-center mb-4">
            <div className="header1 flex gap-4 items-center">
              <img
                className="w-12 h-12 rounded-full object-cover"
                src={profilePic}
                alt={`${userName}'s profile`}
              />
              <div className="nametime">
                <button
                  onClick={() => navigate(`/load-profile?id=${userId}`)}
                  className="font-semibold text-lg hover:underline focus:outline-none"
                >
                  {userName}
                </button>
                <p className="text-sm text-gray-500">{timeAgo(createdAt)}</p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 !rounded-lg hover:bg-blue-700 transition">
              Connect
            </button>
          </div>

          {image && (
            <div className="w-full max-w-[58vw] rounded-lg overflow-hidden mb-4 bg-black">
              {isVideo(image) ? (
                <video
                  src={image}
                  className="w-full object-cover rounded"
                  controls={true}
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              ) : (
                <img
                  src={image}
                  alt="Post"
                  className="w-full max-h-[70vh] object-cover"
                />
              )}
            </div>
          )}

          <div className="title text-2xl font-bold mb-2">{title}</div>
          <div className="desc text-lg text-gray-700 mb-4">{desc}</div>

          <div className="likes flex items-center gap-5 mb-6">
            <div className="inLikes gap-1 flex">
              <button
                onClick={handleLike}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition"
              >
                <Heart size={20} />
              </button>
              <span className="text-sm">{like || 0}</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 text-gray-600 hover:text-green-500"
            >
              {shareLogo ? <ClipboardCheck /> : <Share size={20} />}
              <span className="text-sm">Share</span>
            </button>
          </div>

          <div className="comments space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  navigate={navigate}
                  timeAgo={timeAgo}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center">No comments yet</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
