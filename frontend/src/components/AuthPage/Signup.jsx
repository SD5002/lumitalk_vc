
import React, { useState, useRef } from "react";

import { useAuth } from "../../contexts/AuthContext";


function SignUp({ setToggle }) {
  const { handleSignUp } = useAuth();
  const [signInfo, setSignInfo] = useState({
    userName: "",
    password: "",
    name:"",
  });

  const [error, setError] = useState("");
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignInfo({ ...signInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const form = formRef.current;
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const { userName, password ,name } = signInfo;
   

     const err=await handleSignUp(name, userName, password);
     if(err){
      setError(err);
     }
   
  };

  return (
    <div className="login-container">
   
        <h2 style={{color:"#ff5722"}} className="pb-1">SignUp</h2>
        {error && <p className="error-message">{error}</p>}

        <form ref={formRef} noValidate className="needs-validation" onSubmit={handleSubmit}>
        <div className="input-group">
           
           <input
             placeholder="Name"
             type="text"
             name="name"
             value={signInfo.name}
             id="name"
             onChange={handleChange}
             required
           />
           <div className="invalid-feedback">Name required</div>
         </div>
         
         
          <div className="input-group">
  
            <input
              placeholder="Username"
              type="text"
              name="userName"
              value={signInfo.userName}
              id="userName"
              onChange={handleChange}
              required
            />
            <div className="invalid-feedback">Username required</div>
          </div>

          <div className="input-group">
          
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={signInfo.password}
              id="password"
              onChange={handleChange}
              required
            />
            <div className="invalid-feedback">Password required</div>
          </div>

          <button type="submit" className="login-btn">SignUp</button>
        </form>


        <p className="switch-text">
        Alredy have an account? <span onClick={() => setToggle(true)}>Login</span>
        </p>


    </div>
  );
}

export default SignUp;
