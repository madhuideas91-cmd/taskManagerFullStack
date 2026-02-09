// // src/api/notifications.ts
// import axios from "axios";
// const API_BASE = "http://localhost:8083";
//
// export const getNotifications = async () => {
//   const response = await axios.get(`${API_BASE}/notifications`);
//   return response.data;
// };
//
// export const createNotification = async (payload: { message: string }) => {
//   const response = await axios.post(
//     `${API_BASE}/notifications/create`,
//     payload
//   );
//   return response.data;
// };

// src/api/notifications.ts
 import axiosNotifInstance from "./axiosInstanceNotifications";

 //const API_BASE = "";
 const API_BASE = "/notifications";


 export interface NotificationPref {
   type: "TASK_ASSIGNED" | "STATUS_CHANGED" | "COMMENT_MENTION" | "PROJECT_UPDATES";
   emailEnabled: boolean;
   inAppEnabled: boolean;
 }

 // Fetch all notifications
 export const getNotifications = async () => {
   //const response = await axiosNotifInstance.get(API_BASE);
   const response = await axiosNotifInstance.get("/"); // calls /api/notifications/
   return response.data;
 };

 // Create new notification
 export const createNotification = async (payload: { message: string }) => {
   const response = await axiosNotifInstance.post(`${API_BASE}/create`, payload);
   return response.data;
 };

 // Fetch current user's notification preferences
 export const getNotificationPreferences = async (): Promise<NotificationPref[]> => {
   const res = await axiosNotifInstance.get<NotificationPref[]>(`${API_BASE}/preferences`);
   return res.data;
 };

 // Update current user's notification preferences
 export const updateNotificationPreferences = async (prefs: NotificationPref[]) => {
   await axiosNotifInstance.put(`${API_BASE}/preferences`, prefs);
 };

export const fetchNotifications = async () => {
  const token = localStorage.getItem("token");
  if (!token) return []; // stop API call after logout
  //return axiosNotifInstance.get("/notifications").then(res => res.data);
 // return axiosNotifInstance.get("/").then(res => res.data);
  return axiosNotifInstance.get(API_BASE).then(res => res.data);

};
