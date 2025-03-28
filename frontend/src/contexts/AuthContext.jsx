import axios from "axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: "https://lumitalk-vc-backend.onrender.com/api/user",
  withCredentials: true,
});


client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("Token expired or invalid. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "/auth"; 
    }
    return Promise.reject(error);
  }
);


export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (name, userName, password) => {
    try {
      const response = await client.post("/signup", {
        name,
        userName,
        password,
      });

      
      setUserData(response.data.user);
      localStorage.setItem("token", response.data.token); 
      navigate("/home");
    } catch (err) {
      
      const errorMessage = err.response?.data?.error || "Network Issue. Please try later.";
      console.error("Signup error:", errorMessage);
      return errorMessage;
    }
  };

  const handleLogin = async (userName, password) => {
    try {
      const response = await client.post("/login", { userName, password });

      setUserData(response.data.user);
      localStorage.setItem("token", response.data.token); 

      navigate("/home");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Login failed. Please try again later.";
      console.error("Login error:", errorMessage);
      return errorMessage;
    }
  };

  const getHistoryOfUser = async () => {
    try {
      const response = await client.get("/get_all_activity", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
        },
      },);
      
      return response.data;
    
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Can't get history. Network issue.";
      return errorMessage;
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      const response = await client.post(
        "/add_to_activity",
        { meeting_code: meetingCode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, 
          },
        }
      );
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Something went wrong while adding data to history.";
      return errorMessage;
    }
  };

  const data = {
    userData,
    handleSignUp,
    handleLogin,
    addToUserHistory,
    getHistoryOfUser,
    setUserData,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
