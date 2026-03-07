import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export const userDataContext = createContext();

function UserContext({ children }) {
  const rawServerUrl = (import.meta.env.VITE_SERVER_URL || "https://talknex.onrender.com").replace(/\/+$/, "");
  const serverUrl = import.meta.env.DEV ? "" : rawServerUrl;
  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("talknex_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      setUserData(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        {
          withCredentials: true,
          headers: getAuthHeaders(),
          timeout: 16000,
        }
      );
      return result.data;
    } catch (error) {
      console.log(error);
      const apiMessage =
        (error?.code === "ECONNABORTED"
          ? "The AI request timed out. Please try again."
          : null) ||
        error?.response?.data?.response ||
        error?.response?.data?.message ||
        "I am unable to process that request right now.";
      return {
        type: "general",
        userInput: command,
        response: apiMessage,
      };
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse,
  };

  return <userDataContext.Provider value={value}>{children}</userDataContext.Provider>;
}

export default UserContext;
