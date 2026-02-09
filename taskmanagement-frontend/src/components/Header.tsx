// src/components/Header.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";
import { FaBell } from "react-icons/fa";
import { getNotifications } from "../api/notifications";
import { useToast } from "./ToastProvider";

// ✅ Type for notifications from backend
type NotificationResponse = { message?: string; createdAt?: string } | string;

interface Notification {
  message: string;
  createdAt: string;
}

const Header: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [newNotifFlash, setNewNotifFlash] = useState(false);

  const prevMessagesRef = useRef<string[]>([]);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleAuthSuccess = (token: string) => {
    navigate("/dashboard");
  };

  // ✅ Kafka polling for backend notifications
  // Kafka polling for backend notifications
  useEffect(() => {
    const fetchKafka = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; // stop API call if logged out

      try {
        const res = await getNotifications();
        const newMessages: NotificationResponse[] = Array.isArray(res) ? res : [];

        const oldMessages = prevMessagesRef.current;

        const newOnes = newMessages.filter(
          (msg) =>
            !oldMessages.includes(typeof msg === "string" ? msg : msg.message ?? "")
        );

        if (newOnes.length > 0) {
          setNewNotifFlash(true);
          setTimeout(() => setNewNotifFlash(false), 1000);
        }

        prevMessagesRef.current = newMessages.map((msg) =>
          typeof msg === "string" ? msg : msg.message ?? JSON.stringify(msg)
        );

        const mappedNotifs: Notification[] = newMessages.map((msg) => ({
          message: typeof msg === "string" ? msg : msg.message ?? JSON.stringify(msg),
          createdAt:
            typeof msg === "string"
              ? new Date().toISOString()
              : msg.createdAt ?? new Date().toISOString(),
        }));

        setNotifications((prev) => {
          const seen = new Set(prev.map((n) => n.message));
          return [...mappedNotifs.filter((n) => !seen.has(n.message)), ...prev];
        });
      } catch (error) {
        console.error("Failed to fetch kafka notifications", error);
      }
    };

    fetchKafka(); // initial fetch
    const interval = setInterval(fetchKafka, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔔 Instant notifications from frontend
  useEffect(() => {
    const handleInstant = (e: any) => {
      const rawMessage = e.detail?.message ?? "";
      const message = typeof rawMessage === "string" ? rawMessage : JSON.stringify(rawMessage);

      setNotifications((prev) => [
        { message, createdAt: new Date().toISOString() },
        ...prev,
      ]);

      setNewNotifFlash(true);
      setTimeout(() => setNewNotifFlash(false), 1000);
    };

    window.addEventListener("taskMoved", handleInstant);
    window.addEventListener("taskCreated", handleInstant);
    window.addEventListener("taskUpdated", handleInstant);
    window.addEventListener("taskDeleted", handleInstant);

    return () => {
      window.removeEventListener("taskMoved", handleInstant);
      window.removeEventListener("taskCreated", handleInstant);
      window.removeEventListener("taskUpdated", handleInstant);
      window.removeEventListener("taskDeleted", handleInstant);
    };
  }, []);

  // Unauthorized interceptor
  useEffect(() => {
    const onUnauthorized = (e: any) => {
      addToast(e.detail?.message ?? "Session expired", "error");
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    };
    window.addEventListener("apiUnauthorized", onUnauthorized);
    return () => window.removeEventListener("apiUnauthorized", onUnauthorized);
  }, [addToast]);

  const openNotifDropdown = async () => {
    try {
      const persisted = await getNotifications();
      const array = Array.isArray(persisted) ? persisted : [];

      const mapped = array.map((n: any) => ({
        message: typeof n === "string" ? n : n.message ?? JSON.stringify(n),
        createdAt: n.createdAt ?? new Date().toISOString(),
      }));

      setNotifications((prev) => {
        const seen = new Set(prev.map((x) => x.message));
        const merged = [...mapped.filter((n) => !seen.has(n.message)), ...prev];
        return merged;
      });
    } catch (err) {
      console.warn("Failed to fetch persisted notifications", err);
      addToast("Failed to load notifications", "error");
    }
  };
  useEffect(() => {
    const handler = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("apiUnauthorized", handler);
    return () => window.removeEventListener("apiUnauthorized", handler);
  }, []);

  useEffect(() => {
    const stopOnLogout = () => {
      setNotifications([]); // clear notifications
      prevMessagesRef.current = []; // reset old messages
    };

    window.addEventListener("apiUnauthorized", stopOnLogout);
    return () => window.removeEventListener("apiUnauthorized", stopOnLogout);
  }, []);



  return (
    <>
      <header className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg p-4 flex items-center justify-between flex-wrap md:flex-nowrap">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-white font-bold text-xl sm:text-lg">
            <span className="truncate">TaskManagement</span>
          </div>
        </div>

        <div className="flex items-center mt-2 md:mt-0 space-x-4 relative">
          <div className="relative">
            <button
              className={`text-white text-xl focus:outline-none transition-transform duration-300 ${
                newNotifFlash ? "animate-ping" : ""
              }`}
              onClick={async () => {
                setShowNotifDropdown(!showNotifDropdown);
                if (!showNotifDropdown) await openNotifDropdown();
              }}
            >
              <FaBell />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-auto bg-white text-gray-800 rounded-md shadow-lg z-50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm">No notifications</div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div key={idx} className="p-3 border-b last:border-b-0 text-sm">
                      <div>{notif.message}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-md shadow-md hover:bg-gray-100 transition text-sm sm:text-xs"
            onClick={() => setShowAuth(true)}
          >
            Signup
          </button>
        </div>
      </header>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
};

export default Header;
