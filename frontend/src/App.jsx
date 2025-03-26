import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import LandingPage from "./components/LandingPage.jsx"; 
import Auth from "./components/AuthPage/Auth.jsx";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import VideoMeet from "./components/VideoMeet.jsx";
import HomePage from "./components/HomePage.jsx";
import History from "./components/History.jsx";
import PageNotFound from "./utils/PageNotFound.jsx";


function App() {
  const [count, setCount] = useState(0);

  return (
    <Router> 
    <AuthProvider>
    
      <Routes>
    
      
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth/>} />
        
        <Route path='/home' element={<HomePage />} />
        <Route path='/history' element={<History />} />
        <Route path='/:url' element={<VideoMeet />} />
        <Route path='*' element={<PageNotFound />} />
    

     
      </Routes>
  
    </AuthProvider>
    </Router>
  );
}

export default App;
