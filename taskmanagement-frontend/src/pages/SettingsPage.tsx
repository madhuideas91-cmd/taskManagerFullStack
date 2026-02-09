// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../api/axiosInstance";
import { FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../api/notifications";

type NotificationType =
  | "TASK_ASSIGNED"
  | "STATUS_CHANGED"
  | "COMMENT_MENTION"
  | "PROJECT_UPDATES";

interface NotificationPref {
  type: NotificationType;
  emailEnabled: boolean;
  inAppEnabled: boolean;
}

type NotificationChannel = {
  email: boolean;
  inApp: boolean;
};

type NotificationPreferences = {
  taskAssigned: NotificationChannel;
  statusChanged: NotificationChannel;
  commentMention: NotificationChannel;
  projectUpdates: NotificationChannel;
};

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
}

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    "Profile" | "Account" | "Appearance" | "Notifications"
  >("Profile");


  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Appearance
  const storedTheme = localStorage.getItem("theme");
  const [theme, setTheme] = useState<"light" | "dark">(
    storedTheme === "dark" ? "dark" : "light"
  );

  const [sidebarCollapse, setSidebarCollapse] = useState(
    localStorage.getItem("sidebarCollapse") === "true" || false
  );
  const [density, setDensity] = useState<"compact" | "comfortable">(
    (localStorage.getItem("density") as "compact" | "comfortable") ||
      "comfortable"
  );

  // Notifications
  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences>({
      taskAssigned: { email: true, inApp: true },
      statusChanged: { email: false, inApp: true },
      commentMention: { email: true, inApp: true },
      projectUpdates: { email: false, inApp: true },
    });

  const toggleNotification = (
    key: keyof NotificationPreferences,
    channel: "email" | "inApp"
  ) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: !prev[key][channel] },
    }));
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const sectionStyle =
    "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-[var(--app-density-padding)] rounded-xl shadow mb-6";

  const navigate = useNavigate();

  // ------------------- Effects -------------------

  // Theme & density
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
    document.documentElement.style.setProperty(
      "--app-density-padding",
      density === "compact" ? "0.5rem" : "1rem"
    );
    localStorage.setItem("density", density);
    localStorage.setItem("sidebarCollapse", String(sidebarCollapse));

    window.dispatchEvent(
      new CustomEvent("sidebarPreferenceChanged", { detail: sidebarCollapse })
    );
  }, [theme, density, sidebarCollapse]);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get<UserProfile>("/api/auth/profile");
       // const res = await axiosInstance.get<UserProfile>("/auth/profile");
        setProfile(res.data);
        setLoadingProfile(false);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch notification prefs
  useEffect(() => {
    if (activeSection !== "Notifications") return;
    const fetchPrefs = async () => {
      try {
        const prefs = await getNotificationPreferences();
        const mapped: NotificationPreferences = {
          taskAssigned: {
            email: prefs[0]?.emailEnabled ?? true,
            inApp: prefs[0]?.inAppEnabled ?? true,
          },
          statusChanged: {
            email: prefs[1]?.emailEnabled ?? false,
            inApp: prefs[1]?.inAppEnabled ?? true,
          },
          commentMention: {
            email: prefs[2]?.emailEnabled ?? true,
            inApp: prefs[2]?.inAppEnabled ?? true,
          },
          projectUpdates: {
            email: prefs[3]?.emailEnabled ?? false,
            inApp: prefs[3]?.inAppEnabled ?? true,
          },
        };
        setNotificationPrefs(mapped);
      } catch (err) {
        console.error("Failed to load notification preferences", err);
      }
    };
    fetchPrefs();
  }, [activeSection]);

  // Save notification prefs
  useEffect(() => {
    if (activeSection !== "Notifications") return;
    const timeout = setTimeout(async () => {
      try {
        const payload: NotificationPref[] = Object.entries(
          notificationPrefs
        ).map(([key, val]) => {
          const type: NotificationType =
            key.toUpperCase() === "TASKASSIGNED"
              ? "TASK_ASSIGNED"
              : key.toUpperCase() === "STATUSCHANGED"
              ? "STATUS_CHANGED"
              : key.toUpperCase() === "COMMENTMENTION"
              ? "COMMENT_MENTION"
              : "PROJECT_UPDATES";
          return { type, emailEnabled: val.email, inAppEnabled: val.inApp };
        });
        await updateNotificationPreferences(payload);
        console.log("Notification preferences saved");
      } catch (err) {
        console.error("Failed to save notification preferences", err);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [notificationPrefs, activeSection]);

  // Live notifications via WebSocket
  useEffect(() => {
    let idCounter = 0;

    const interval = setInterval(() => {
      idCounter += 1;
      const mockNotif: NotificationItem = {
        id: `mock-${Date.now()}-${idCounter}`,
        type: "TASK_ASSIGNED",
        message: `You have a new task assigned (#${idCounter}).`,
        timestamp: new Date().toLocaleTimeString(),
      };

      // Always append new notifications at the top
      setNotifications((prev) => {
        // Keep max 20 notifications
        const updated = [mockNotif, ...prev];
        return updated.slice(0, 20);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);



  // ------------------- Handlers -------------------

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
       await axiosInstance.put("/api/auth/profile", {
        //await axiosInstance.put("/auth/profile", {
        name: profile.name,
        email: profile.email,
      });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile");
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      setPasswordLoading(true);
        await axiosInstance.put("/api/auth/change-password", {
        //await axiosInstance.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      alert("Password changed. Please login again.");
      localStorage.clear();
      navigate("/", { replace: true });
    } catch (err: any) {
      alert(err.response?.data || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ------------------- Render -------------------

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-[var(--app-density-padding)] md:p-8">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Menu */}
          <div className="w-full md:w-64 bg-white p-4 rounded-xl shadow self-start">
            {[
              "Profile",
              "Account",
              "Appearance",
              "Notifications",
            ].map((sec) => (
              <div
                key={sec}
                className={`cursor-pointer px-4 py-2 rounded mb-2 transition-colors duration-200 ${
                  activeSection === sec
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() =>
                  setActiveSection(
                    sec as
                      | "Profile"
                      | "Account"
                      | "Appearance"
                      | "Notifications"
                  )
                }
              >
                {sec}
              </div>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1">
            {/* Profile */}
            {activeSection === "Profile" && (
              <div className={sectionStyle}>
                <h2 className="font-semibold text-xl mb-4">Profile Settings</h2>
                {loadingProfile ? (
                  <p>Loading...</p>
                ) : profile ? (
                  <>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-3xl">
                        <FaUser />
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          className="border p-2 rounded w-64"
                          disabled={!isEditing}
                          value={profile.name}
                          onChange={(e) =>
                            setProfile({ ...profile, name: e.target.value })
                          }
                        />
                        <input
                          type="email"
                          className="border p-2 rounded w-64"
                          disabled={!isEditing}
                          value={profile.email}
                          onChange={(e) =>
                            setProfile({ ...profile, email: e.target.value })
                          }
                        />
                        <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-sm w-max">
                          {profile.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <button
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <>
                          <button
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                            onClick={handleSaveProfile}
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-red-500">Failed to load profile.</p>
                )}
              </div>
            )}

            {/* Account */}
            {activeSection === "Account" && (
              <div className={sectionStyle}>
                <h2 className="font-semibold text-xl mb-4">Account & Security</h2>
                <div className="flex flex-col gap-3 w-80">
                  {[
                    {
                      placeholder: "Current Password",
                      value: currentPassword,
                      setValue: setCurrentPassword,
                      show: showCurrentPassword,
                      setShow: setShowCurrentPassword,
                    },
                    {
                      placeholder: "New Password",
                      value: newPassword,
                      setValue: setNewPassword,
                      show: showNewPassword,
                      setShow: setShowNewPassword,
                    },
                    {
                      placeholder: "Confirm Password",
                      value: confirmPassword,
                      setValue: setConfirmPassword,
                      show: showConfirmPassword,
                      setShow: setShowConfirmPassword,
                    },
                  ].map(({ placeholder, value, setValue, show, setShow }) => (
                    <div className="relative" key={placeholder}>
                      <input
                        type={show ? "text" : "password"}
                        placeholder={placeholder}
                        className="border p-2 rounded w-full pr-10"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                      />
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                        onClick={() => setShow(!show)}
                      >
                        {show ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  ))}
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    onClick={handlePasswordUpdate}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeSection === "Appearance" && (
              <div className={sectionStyle}>
                <h2 className="font-semibold text-xl mb-4">Appearance</h2>
                <div className="flex flex-col gap-4 w-80">
                  {/* Theme */}
                  <div>
                    <span className="font-medium">Theme:</span>
                    <div className="flex gap-4 mt-2">
                      {["light", "dark"].map((t) => (
                        <label key={t} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="theme"
                            value={t}
                            checked={theme === t}
                            onChange={() => setTheme(t as "light" | "dark")}
                          />
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Sidebar collapse */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sidebarCollapse}
                      onChange={(e) => setSidebarCollapse(e.target.checked)}
                    />
                    <span>Auto-collapse sidebar on mobile</span>
                  </div>
                  {/* Density */}
                  <div>
                    <span className="font-medium">Density:</span>
                    <div className="flex gap-4 mt-2">
                      {["compact", "comfortable"].map((d) => (
                        <label key={d} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="density"
                            value={d}
                            checked={density === d}
                            onChange={() =>
                              setDensity(d as "compact" | "comfortable")
                            }
                          />
                          {d.charAt(0).toUpperCase() + d.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === "Notifications" && (
              <div className={sectionStyle}>
                <h2 className="font-semibold text-xl mb-4">Notifications</h2>
                <div className="flex flex-col gap-3 w-96">
                  {[
                    { key: "taskAssigned", label: "Task Assigned" },
                    { key: "statusChanged", label: "Status Changed" },
                    { key: "commentMention", label: "Comment Mention" },
                    { key: "projectUpdates", label: "Project Updates" },
                  ].map(({ key, label }) => {
                    const pref =
                      notificationPrefs[key as keyof NotificationPreferences];
                    return (
                      <div
                        key={key}
                        className="flex justify-between items-center border p-2 rounded"
                      >
                        <span>{label}</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={pref.email}
                              onChange={() =>
                                toggleNotification(
                                  key as keyof NotificationPreferences,
                                  "email"
                                )
                              }
                            />
                            Email
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={pref.inApp}
                              onChange={() =>
                                toggleNotification(
                                  key as keyof NotificationPreferences,
                                  "inApp"
                                )
                              }
                            />
                            In-App
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live notifications panel */}
                <div className="mt-6 border p-3 rounded max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-700">
                  <h3 className="font-semibold mb-2">Live Notifications</h3>
                  {notifications.length === 0 && <span>No notifications</span>}
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="border rounded p-2 bg-white dark:bg-gray-800 mb-2"
                    >
                      <span className="font-medium">{n.type.replace("_", " ")}</span>
                      <p className="text-sm">{n.message}</p>
                      <span className="text-xs text-gray-500">{n.timestamp}</span>
                    </div>
                  ))}
                </div>

                {/* Email preview */}
                <div className="mt-6 border p-3 rounded bg-gray-50 dark:bg-gray-700">
                  <h3 className="font-semibold mb-2">Email Preview</h3>
                  <p><strong>Subject:</strong> New task assigned!</p>
                  <p>Hello {profile?.name},</p>
                  <p>A new task "<span className="font-medium">Design Homepage</span>" has been assigned to you.</p>
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">View Task</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
