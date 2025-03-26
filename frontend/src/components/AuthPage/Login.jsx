import React, { useState, useRef } from "react";
import axios from "axios";
import Auth from "./Auth";
import { useAuth } from "../../contexts/AuthContext";


function Login({ setToggle }) {
  const { handleLogin } = useAuth();
  const [loginInfo, setLoginInfo] = useState({
    userName: "",
    password: "",
    
  });

  const [error, setError] = useState("");
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo({ ...loginInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const form = formRef.current;
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const { userName, password } = loginInfo;
     const err=await handleLogin(userName, password);
     if(err){
      setError(err);
     }
  };

  return (
    <div className="login-container">
   
        <h2 style={{color:"#ff5722"}} className="pb-5">Login</h2>
        {error && <p className="error-message">{error}</p>}

        <form ref={formRef} noValidate className="needs-validation" onSubmit={handleSubmit}>
       

        
        
        
          <div className="input-group">
           
            <input
              placeholder="Username"
              type="text"
              name="userName"
              value={loginInfo.userName}
              id="userName"
              onChange={handleChange}
              required
            />
            <div className="invalid-feedback">Username required</div>
          </div>

          <div className="input-group">
           
            <input
              placeholder="Password"
              type="password"
              name="password"
              value={loginInfo.password}
              id="password"
              onChange={handleChange}
              required
            />
            <div className="invalid-feedback">Password required</div>
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>

        <p className="switch-text">
          Don't have an account? <span onClick={() => setToggle(false)}>Signup</span>
        </p>

    </div>
  );
}

export default Login;
