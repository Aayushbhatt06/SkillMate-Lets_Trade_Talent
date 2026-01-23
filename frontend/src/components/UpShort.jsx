import React, { useState, useRef, useEffect } from "react";
import { X, Video } from "lucide-react";

const MAX_DURATION = 90;

const UpShort = () => {
  const [caption, setCaption] = useState("");
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [duration, setDuration] = useState(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => {
      setMessage("");
      setError(false);
    }, 5000);
    return () => clearTimeout(t);
  }, [message]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const handleLoadedMetadata = () => {
    const videoDuration = videoRef.current.duration;
    setDuration(Math.floor(videoDuration));

    if (videoDuration > MAX_DURATION) {
      setError(true);
      setMessage("Video must be 90 seconds or less");
      setVideoFile(null);
      setVideoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      setError(true);
      setMessage("Please select a video");
      return;
    }

    setLoading(true);
    setError(false);
    setMessage("");

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("duration", duration);
    formData.append("video", videoFile);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/short`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setMessage("Short uploaded successfully 🚀");
      setCaption("");
      setVideoFile(null);
      setVideoPreview(null);
      setDuration(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(true);
      setMessage("Failed to upload short");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-50">
          <img className="w-20 h-20" src="Spinner.gif" alt="Loading" />
          <p className="mt-2 font-semibold">Uploading...</p>
        </div>
      )}

      {message && (
        <div
          className={`mx-5 mt-3 p-4 rounded-xl text-white font-semibold text-center
            ${error ? "bg-red-400" : "bg-green-400"}
          `}
        >
          {message}
        </div>
      )}

      <div className="flex-1 bg-white rounded-lg ml-5 mt-3 px-6 py-4 mr-5 min-h-[90vh]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="font-semibold">
            <label>Caption:</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={150}
              placeholder="Write something about your short..."
              className="block mt-1 bg-gray-100 rounded-md px-3 py-2 border w-3/4 h-20"
            />
            <p className="text-sm text-gray-500 mt-1">{caption.length}/150</p>
          </div>

          <div className="font-semibold">
            <label>Upload Short Video:</label>

            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 text-blue-600 hover:bg-slate-50 px-3 py-1 rounded mt-2"
            >
              <Video size={16} />
              Choose Video
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="video/*"
              onChange={handleVideoChange}
            />

            {videoPreview && (
              <div className="mt-4 max-w-xs rounded-lg overflow-hidden border bg-black">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  controls
                  playsInline
                  onLoadedMetadata={handleLoadedMetadata}
                  className="w-full max-h-[400px] object-cover"
                />
                <div className="p-2 text-sm text-gray-600 bg-white">
                  Duration: {duration}s
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Upload Short
          </button>
        </form>
      </div>
    </>
  );
};

export default UpShort;
