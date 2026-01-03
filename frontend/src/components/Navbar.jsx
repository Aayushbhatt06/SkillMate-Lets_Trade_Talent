import React, { useState, useEffect, useRef } from "react";
import { Menu, Search, Bell, LogOut, MoreVertical, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../Redux/userSlice";
import { useNavigate } from "react-router-dom";
import { sendConnection } from "./SendConnection";

const DEFAULT = "Let's Trade Talent!!!";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tagline, setTagline] = useState("");
  const [tags, setTags] = useState([]);
  const typingRef = useRef(null);
  const cycleRef = useRef(null);
  const isMounted = useRef(true);
  const lastIndexRef = useRef(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [searchRes, setSearchRes] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const [searchInput, setSearch] = useState("");
  const handelOnChange = (e) => setSearch(e.target.value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const query = searchInput.trim();

    if (query.length <= 2) {
      setSearchRes([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(() => {
      runSearch();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const runSearch = async () => {
    try {
      const search = searchInput.trim().split(" ");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/findskilled`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ search }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setSearchRes(data.users || []);
      } else {
        setSearchRes([]);
      }
    } catch (err) {
      console.error(err);
      setSearchRes([]);
    }
  };

  const clearTyping = () => {
    if (typingRef.current) {
      clearInterval(typingRef.current);
      typingRef.current = null;
    }
  };

  const typeText = (text, speed = 100) => {
    clearTyping();
    let i = 0;
    setTagline("");
    typingRef.current = setInterval(() => {
      if (!isMounted.current) return clearTyping();
      i += 1;
      setTagline(text.slice(0, i));
      if (i >= text.length) clearTyping();
    }, speed);
  };

  const nextRandomIndex = (len) => {
    if (len <= 1) return 0;
    let idx = Math.floor(Math.random() * len);
    if (idx === lastIndexRef.current) {
      idx = (idx + 1) % len;
    }
    lastIndexRef.current = idx;
    return idx;
  };

  const getTag = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tagline`
      );
      if (!res.ok) {
        typeText(DEFAULT);
        return;
      }

      let data = null;
      try {
        data = await res.json();
      } catch {
        typeText(DEFAULT);
        return;
      }

      const list = Array.isArray(data?.tagLines)
        ? data.tagLines.filter(Boolean)
        : [];
      if (!list.length) {
        setTags([]);
        typeText(DEFAULT);
        return;
      }
      setTags(list);
      const firstIdx = nextRandomIndex(list.length);
      typeText(list[firstIdx] || DEFAULT);
    } catch {
      typeText(DEFAULT);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    getTag();

    const cycleMs = 6000;
    cycleRef.current = setInterval(() => {
      clearTyping();
      const list = tags && tags.length ? tags : [DEFAULT];
      const idx = nextRandomIndex(list.length);
      setTimeout(() => typeText(list[idx] || DEFAULT), 100);
    }, cycleMs);

    return () => {
      isMounted.current = false;
      clearTyping();
      if (cycleRef.current) clearInterval(cycleRef.current);
    };
  }, [tags.length]);

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    localStorage.removeItem("profileData");
    localStorage.removeItem("ProjectsCache");
    localStorage.removeItem("Posts");
    localStorage.removeItem("connectionsData");
    dispatch(logout());
    window.location.reload();
  };

  const handleConnection = async (receiverId) => {
    const res = await sendConnection(receiverId);

    if (!res.ok || res.data.success === false) {
      setError(true);
      setMessage(res.data?.message || "Something went wrong");
    } else {
      setError(false);
      setMessage(res.data?.message || "Request Sent Successfully");
    }

    setTimeout(() => {
      setMessage("");
      setError(false);
    }, 4000);
  };

  return (
    <>
      {message && (
        <div
          className={`
      fixed bottom-6 right-6 z-50
      px-5 py-3 rounded-xl shadow-lg
      text-white font-semibold text-sm
      backdrop-blur-md 
      animate-bounce
      ${error ? "bg-red-500/80" : "bg-green-500/80"}
    `}
        >
          {message}
        </div>
      )}

      <div
        className={`users ${
          searchInput.length > 2 ? "block" : "hidden"
        } fixed left-1/2 -translate-x-1/2 top-16 md:top-20
  w-[90vw] md:w-[30vw] max-h-[350px] overflow-y-auto 
  z-50 bg-white shadow-lg border border-gray-200 rounded-lg
  divide-y divide-gray-100`}
      >
        {searchRes.map((res) => (
          <div
            key={res._id}
            className="flex justify-between items-center px-3 md:px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
          >
            <div className="flex gap-2 md:gap-3 items-center">
              <img
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                src={res.image || "image.png"}
                alt="profile"
              />
              <span className="text-sm md:text-base text-gray-700 font-medium truncate">
                {res.name}
              </span>
            </div>

            <button
              onClick={() => {
                handleConnection(res._id);
              }}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm shadow-sm whitespace-nowrap"
            >
              Connect
            </button>
          </div>
        ))}
      </div>

      <header className="bg-slate-800">
        <div className="mx-auto flex items-center justify-between gap-2 px-3 md:px-4 py-2.5 md:py-3">
          <div className="flex items-center gap-2 flex-shrink-0 w-[120px] lg:w-[350px]">
            <h6
              onClick={() => navigate("/home")}
              className="text-sm md:text-base cursor-pointer font-semibold text-white whitespace-nowrap"
            >
              SkillMate
            </h6>
            <h6 className="hidden lg:block text-sm md:text-base font-semibold text-white truncate">
              : {tagline}
            </h6>
          </div>

          <div className="flex-1 max-w-md mx-2 md:mx-4">
            <div className="relative" role="search">
              <span className="pointer-events-none absolute inset-y-0 left-2 md:left-3 flex items-center text-slate-600">
                <Search size={16} className="md:w-[18px] md:h-[18px]" />
              </span>

              <input
                onChange={handelOnChange}
                value={searchInput}
                type="search"
                placeholder="Search..."
                className="w-full rounded-full bg-white/90 pl-8 md:pl-12 pr-3 md:pr-4 py-1.5 md:py-2.5 text-xs md:text-sm text-slate-800 placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-white-300"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 flex-shrink-0 w-[180px] justify-end">
            <button
              className="text-white hover:text-gray-300 transition"
              onClick={() => navigate("/notification")}
            >
              <Bell size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="flex gap-2 bg-red-700 hover:bg-red-800 transition px-4 py-2 rounded text-white text-sm font-medium"
            >
              Logout <LogOut />
            </button>
          </div>

          <div
            className="md:hidden relative flex-shrink-0 w-[40px]"
            ref={menuRef}
          >
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-white p-1.5 hover:bg-slate-700 rounded-lg transition"
            >
              {showMenu ? <X size={20} /> : <MoreVertical size={20} />}
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                <button
                  onClick={() => {
                    navigate("/notification");
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                >
                  <Bell size={18} className="text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">
                    Notifications
                  </span>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-left border-t border-gray-100"
                >
                  <LogOut size={18} className="text-red-600" />
                  <span className="text-sm text-red-600 font-medium">
                    Logout
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
