import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  MessageSquare,
  User,
  Proportions,
  PieChart,
  Menu,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { socket } from "../../utils/Socket";

const Sidebar = () => {
  const [SearchConn, setSearchConn] = useState("");
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState([]);
  const [processedConn, setProcessedConn] = useState(connections);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [current, setCurrent] = useState("Home");

  const userId = useSelector((state) => state.user.id);

  const navigate = useNavigate();

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
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(true);
        setMessage(data.message || "Something went wrong");
        setConnections([]);
        return;
      }
      setConnections(data.connections || []);
    } catch (err) {
      setError(true);
      setMessage(err?.message || "Network error");
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!message && !error) return;
    const timer = setTimeout(() => {
      setError(false);
      setMessage("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, error]);

  useEffect(() => {
    const handleConnectionUpdated = (conn) => {
      setConnections((prev) => {
        let next;

        const exists = prev.some((c) => c._id === conn._id);

        if (exists) {
          next = prev.map((c) => (c._id === conn._id ? conn : c));
        } else {
          next = [conn, ...prev];
        }
        return [...next].sort(
          (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );
      });
    };

    socket.on("connectionUpdated", handleConnectionUpdated);

    fetchConnections();

    return () => {
      socket.off("connectionUpdated", handleConnectionUpdated);
    };
  }, []);

  useEffect(() => {
    if (SearchConn.trim().length > 1) {
      const filtered = connections.filter((conn) =>
        conn.user.name.toLowerCase().includes(SearchConn.toLowerCase())
      );
      setProcessedConn(filtered);
    } else {
      setProcessedConn(connections);
    }
  }, [SearchConn, connections]);

  const handleChatNavigation = (user, id) => {
    navigate(`/chat?id=${id}`, {
      state: { otherUser: user },
    });
    setIsMobileMenuOpen(false);
  };

  const msgAt = (createdAt) => {
    return new Date(createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div
        className={`${
          loading ? "flex" : "hidden"
        } flex-col justify-center items-center fixed inset-0 bg-white/70 backdrop-blur-sm z-50`}
      >
        <img
          className="w-16 h-16 sm:w-20 sm:h-20"
          src="Spinner.gif"
          alt="Loading..."
        />
        <p className="text-gray-700 mt-2 font-semibold text-sm sm:text-base">
          Loading...
        </p>
      </div>
      {message && (
        <div
          className={`
            fixed bottom-4 right-4 left-4 sm:bottom-6 sm:right-6 sm:left-auto z-50
            px-4 py-3 sm:px-5 rounded-xl shadow-lg
            text-white font-semibold text-xs sm:text-sm
            backdrop-blur-md 
            animate-bounce
            ${error ? "bg-red-500/80" : "bg-green-500/80"}
          `}
        >
          {message}
        </div>
      )}

      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-none p-2 !rounded-lg shadow-lg border-none"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      <div
        className={`
          fixed md:sticky top-0 left-0 z-40 md:z-auto
          w-[80vw] sm:w-[60vw] md:w-[20vw] 
          bg-white h-full border-r border-gray-200 
          p-3 sm:p-4
          transform transition-transform duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
          overflow-y-auto
        `}
      >
        <nav className="bg-slate-50 rounded-lg space-y-2 mt-12 md:mt-0 p-2">
          <Link
            to="/home"
            onClick={() => {
              setCurrent("Home");
              closeMobileMenu();
            }}
            className={`flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base ${
              current === "Home" ? "text-blue-600" : "text-gray-700"
            } hover:bg-gray-100 rounded-lg transition-colors duration-300 font-medium !no-underline`}
          >
            <Home size={18} className="sm:w-5 sm:h-5" />
            <span>Home</span>
          </Link>

          <Link
            to="/profile"
            onClick={() => {
              setCurrent("Profile");
              closeMobileMenu();
            }}
            className={`flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base ${
              current === "Profile" ? "text-blue-600" : "text-gray-700"
            } hover:bg-gray-100 rounded-lg transition-colors duration-300 !no-underline`}
          >
            <User size={18} className="sm:w-5 sm:h-5" />
            <span>Profile</span>
          </Link>

          <Link
            to="/newproject"
            onClick={() => {
              setCurrent("newproject");
              closeMobileMenu();
            }}
            className={`flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base ${
              current === "newproject" ? "text-blue-600" : "text-gray-700"
            } hover:bg-gray-100 rounded-lg transition-colors duration-300 !no-underline`}
          >
            <Proportions size={18} className="sm:w-5 sm:h-5" />
            <span>New Project</span>
          </Link>

          <Link
            to="/contribution"
            onClick={() => {
              setCurrent("contributions");
              closeMobileMenu();
            }}
            className={`flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base ${
              current === "contributions" ? "text-blue-600" : "text-gray-700"
            } hover:bg-gray-100 rounded-lg transition-colors duration-300 !no-underline`}
          >
            <PieChart size={18} className="sm:w-5 sm:h-5" />
            <span>Contributions</span>
          </Link>
        </nav>

        <div className="messages mt-4 p-3 sm:p-4 bg-slate-50 rounded-lg">
          <div className="msg_heading flex items-center gap-2 sm:gap-3 mb-3">
            <MessageSquare className="text-blue-700 w-5 h-5 sm:w-6 sm:h-6" />
            <h3 className="font-semibold text-sm sm:text-base text-blue-700/80">
              Messages
            </h3>
          </div>

          <input
            type="text"
            placeholder="Search connections..."
            value={SearchConn}
            onChange={(e) => setSearchConn(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 bg-white rounded-lg outline-none focus:ring-2 focus:ring-blue-300 mb-3"
          />

          <div className="space-y-2 max-h-[30vh] sm:max-h-[35vh] overflow-y-auto">
            {processedConn.map((conn) => (
              <div key={conn._id}>
                <div
                  onClick={() => handleChatNavigation(conn.user, conn.user._id)}
                  className="flex items-center gap-2 sm:gap-3 px-2 py-2 sm:px-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                >
                  <img
                    src={conn.user.image || "image.png"}
                    alt={conn.user.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex w-full gap-2 min-w-0">
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <p className="font-semibold text-[11px] sm:text-[12px] text-gray-900 truncate">
                          {conn.user.name}
                        </p>

                        {conn.unreadCount > 0 && (
                          <div className="bg-blue-600 text-white text-[10px] sm:text-[11px] rounded-full h-4 sm:h-5 min-w-4 sm:min-w-5 px-1.5 sm:px-2 flex items-center justify-center shrink-0">
                            {conn.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span
                          className={`text-[9px] sm:text-[10px] truncate ${
                            conn.unreadCount > 0
                              ? "font-semibold text-gray-800"
                              : "text-gray-500"
                          }`}
                        >
                          {conn.lastMessage || "No messages yet"}
                        </span>

                        <p className="text-[9px] sm:text-[10px] text-gray-400 shrink-0">
                          {msgAt(conn.lastMessageAt) || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-b border-gray-200 ml-10 sm:ml-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
