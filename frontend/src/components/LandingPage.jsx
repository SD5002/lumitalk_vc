import React from "react";

import { Link } from "react-router-dom";
export default function LandingPage() {
    return (
        <div className="landingPageContainer">

            <div className="box">
            <nav>
                <div className="navHeader">
                    <h1>Lumi Talk</h1>
                </div>
                <div className="navList">
                   <Link to="/auth" className="link">Signup</Link>
           
                   <Link to="/auth" className="link">Login</Link>
                    
                </div>
            </nav>
            <div className="landMainContainer row ps-5 pe-5">
               
            <div className="leftSection col-6 ps-5 pt-5 ">
                    <h1>Connect</h1>
                    <p className="main">with your circle in a fun way!</p>
                     
                    <hr style={{backgroundColor:"hsl(26, 100.00%, 60.80%)",height:"3px",border:"none"}}></hr>
                    <p className="pt-4">
                    Connecting you with friends, family, and colleagues — anytime, anywhere. Experience seamless video calls with just one click!
                    </p>
                    <Link to="/auth" className="btn rounded-pill" >
                             Get Started
                    </Link>

            </div>

                  <div className="rightSection col-6">
                    <img src="mainImg.jpg" style={{width:"108%"}}></img>
                  </div>
                  
            </div>
            </div>
        </div>
    )
}