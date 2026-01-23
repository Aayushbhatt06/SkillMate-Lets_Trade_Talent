import React, { useEffect, useRef, useState } from "react";
import { Heart, CircleArrowRight, CircleArrowLeft } from "lucide-react";

const LIMIT = 5;

const Shorts = () => {
  const [shorts, setShorts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const videoRef = useRef(null);

  const currentShort = shorts[currentIndex];
  const handleLike = () => {
    console.log("Liked short:", currentShort?._id);
  };

  const fetchShorts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const fetchedIds = shorts.map((s) => s._id).join(",");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/getshort?limit=${LIMIT}&exclude=${fetchedIds}`,
        { credentials: "include" },
      );

      const data = await res.json();

      if (!res.ok) return;

      if (data.exhausted || data.shorts.length === 0) {
        setHasMore(false);
        return;
      }

      setShorts((prev) => [...prev, ...data.shorts]);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Failed to fetch shorts", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchShorts();
  }, []);

  useEffect(() => {
    if (!currentShort) return;

    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
      setIsPaused(false);
    }

    if (hasMore && currentIndex >= shorts.length - 2) {
      fetchShorts();
    }
    console.log(shorts.length);
  }, [currentIndex]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="h-[91vh] w-full flex justify-center items-center relative overflow-hidden bg-black/10 backdrop-blur-md">
      {buffering && (
        <div className="absolute z-20 text-black text-sm animate-pulse">
          Buffering...
        </div>
      )}
      {currentShort && (
        <video
          ref={videoRef}
          src={currentShort.videoUrl}
          className="h-[95vh] w-full sm:w-auto sm:max-w-[50vw] object-cover sm:rounded-xl mx-auto"
          playsInline
          autoPlay
          loop
          preload="metadata"
          onClick={togglePlayPause}
          onWaiting={() => setBuffering(true)}
          onCanPlay={() => setBuffering(false)}
          onEnded={handleNext}
        />
      )}

      <div
        onClick={handlePrev}
        className="hidden sm:flex absolute top-0 left-0 w-1/3 h-full z-10 items-center justify-start group hover:bg-gradient-to-l hover:from-transparent hover:to-black/20"
      >
        <div
          className="ml-4 p-3 rounded-full bg-white/60 backdrop-blur-md shadow-md
                  opacity-0 group-hover:opacity-100 transition "
        >
          <CircleArrowLeft size={32} className="text-black/70" />
        </div>
      </div>

      <div
        onClick={handleNext}
        className="hidden sm:flex absolute top-0 right-0 w-1/3 h-full z-10 items-center justify-end group hover:bg-gradient-to-r hover:from-transparent hover:to-black/20"
      >
        <div
          className="mr-4 p-3 rounded-full bg-white/60 backdrop-blur-md shadow-md
                  opacity-0 group-hover:opacity-100 transition"
        >
          <CircleArrowRight size={32} className="text-black/70" />
        </div>
      </div>

      <div className="sm:hidden absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 z-10 pointer-events-none">
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="pointer-events-auto p-2 rounded-full bg-white/60 backdrop-blur-md shadow-md active:scale-95 transition"
          >
            <CircleArrowLeft size={24} className="text-black/70" />
          </button>
        )}
        <div className="flex-1"></div>
        {currentIndex < shorts.length - 1 && (
          <button
            onClick={handleNext}
            className="pointer-events-auto p-2 rounded-full bg-white/60 backdrop-blur-md shadow-md active:scale-95 transition"
          >
            <CircleArrowRight size={24} className="text-black/70" />
          </button>
        )}
      </div>

      {currentShort && (
        <div className="absolute bottom-4 sm:bottom-6 left-3 sm:left-4 right-3 sm:right-4 flex justify-between items-end z-20">
          <div className="max-w-[70%] sm:max-w-[75%]">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <img
                src={currentShort.user.image}
                alt={currentShort.user.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-black/20"
              />
              <p className="font-bold text-black text-base sm:text-lg">
                {currentShort.user.name}
              </p>
            </div>

            {currentShort.caption && (
              <p className="text-xs sm:text-sm text-black leading-snug line-clamp-3">
                {currentShort.caption}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <button
              onClick={handleLike}
              className="flex flex-col items-center text-black hover:text-red-500 active:scale-95 transition"
            >
              <Heart size={24} className="sm:w-7 sm:h-7" />
              <span className="text-[10px] sm:text-xs mt-1">
                {currentShort.likeCount || 0}
              </span>
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute bottom-2 text-black text-xs">
          Loading more...
        </div>
      )}
    </div>
  );
};

export default Shorts;
