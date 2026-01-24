import React, { useState } from "react";
import { Heart, MessageCircle, Share, ClipboardCheck } from "lucide-react";
import CommentCard from "./CommentCard";
import { useSelector } from "react-redux";

const defImg = "image.png";

const PostCard = ({ post, navigate, timeAgo, setPosts, onConnect }) => {
  const user = useSelector((state) => state.user);

  const [showComments, setShowComments] = useState(false);
  const [shareLogo, setShareLogo] = useState(false);
  const [newComment, setNewComment] = useState("");

  const authorId =
    typeof post.userId === "string" ? post.userId : post.userId?._id;

  const authorName =
    (typeof post.userId === "object" && post.userId?.name) ||
    post.username ||
    "Anonymous";

  const authorImage =
    (typeof post.userId === "object" && post.userId?.image) ||
    post.pic ||
    defImg;

  const handleLike = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/like`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post._id }),
      });

      if (!res.ok) return;

      const data = await res.json();
      const updatedPost = data.updatedPost;

      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p)),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const toggleLikeStyle = (liked) => (liked ? "text-red-500" : "text-gray-600");

  const handleNewComment = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/comment`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: newComment, postId: post._id }),
        },
      );

      if (!res.ok) return;

      const data = await res.json();
      const updatedPost = data.post;

      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p)),
      );
      setNewComment("");
      setShowComments(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `${import.meta.env.VITE_FRONTEND_URL}/load-post?postId=${post._id}`,
    );
    setShareLogo(true);
    setTimeout(() => setShareLogo(false), 5000);
  };

  const isVideo = (url) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  const isImage = (url) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div
          onClick={() => navigate(`/load-profile?id=${authorId}`)}
          className="flex items-center cursor-pointer space-x-3"
        >
          <img
            src={authorImage}
            alt={`${authorName} avatar`}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{authorName}</h3>
            <p className="text-sm text-gray-500">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (authorId && onConnect) onConnect(authorId);
          }}
          className="bg-blue-500 text-white px-3 py-1 !rounded-lg"
        >
          Connect
        </button>
      </div>

      <div className="px-4 pb-3">
        <h6>{post.title}</h6>
        <p className="text-gray-800 leading-relaxed">{post.desc}</p>
      </div>

      {post.image && (
        <div
          className="cursor-pointer bg-black"
          onDoubleClick={() => navigate(`/load-post?postId=${post._id}`)}
        >
          {isVideo(post.image) ? (
            <video
              src={post.image}
              className="w-full object-cover rounded"
              controls={true}
              muted
              loop
              playsInline
              autoPlay
            />
          ) : (
            <img
              src={post.image}
              alt="Post content"
              className="w-full max-h-[500px] object-cover rounded"
            />
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-3 items-center space-x-4">
            <div className="likes gap-1 flex items-center">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 hover:text-red-500 ${toggleLikeStyle(
                  post.likedByUser,
                )}`}
              >
                <Heart size={20} />
              </button>
              <span className="text-sm">{post.like || 0}</span>
            </div>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-500"
            >
              <MessageCircle size={20} />
              <span className="text-sm">{post.comments?.length || 0}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-1 text-gray-600 hover:text-green-500"
            >
              {shareLogo ? <ClipboardCheck /> : <Share size={20} />}
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-3">
          <img
            src={user.image || defImg}
            alt="Your avatar"
            className="w-8 h-8 rounded-full"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newComment.trim() !== "") {
                handleNewComment();
                e.preventDefault();
              }
            }}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-100 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="px-3 mx-2 py-1 bg-red-500 text-white rounded"
            onClick={handleNewComment}
          >
            Comment
          </button>
        </div>

        {showComments && (
          <div className="commentsection flex flex-col space-y-4 mt-4">
            {post.comments?.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                navigate={navigate}
                timeAgo={timeAgo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
