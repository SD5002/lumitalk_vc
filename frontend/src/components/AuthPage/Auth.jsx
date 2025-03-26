import React from "react";
import Login from "./Login";
import SignUp from "./Signup";
import { useState } from "react";



export default function Auth() {
    const [toggle, setToggle] = useState(true);
    return(
        <div className="authContainer">
           
            
                <div className=" login-box">
                    <div className="col-6">
                        <img src="/auth.jpg" alt="#"></img>
                    </div>
                    <div className="col-6 p-5"> {toggle? <Login setToggle={setToggle}/> : <SignUp setToggle={setToggle}/>}           </div>
               
                
            </div>
        </div>
    )
}