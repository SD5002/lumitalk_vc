import { Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import {useContext, useState,useEffect } from "react";
import { TextField} from "@mui/material";
import HistoryIcon from '@mui/icons-material/History';
import { AuthContext } from "../contexts/AuthContext";
import CancelIcon from '@mui/icons-material/Cancel';




 const HomePage = () => {
    const navigate = useNavigate();
    const [code,setCode]=useState("");
    const [error,setError]=useState("");
    const [history,setHistory]=useState([{}]);

    const {addToUserHistory} = useContext(AuthContext);
    const {getHistoryOfUser} = useContext(AuthContext);

    useEffect(() => {

        let fetchHistory = async () => {
        try {
            const data = await getHistoryOfUser(); 

           const formatted=         
           data.map((item) => {
            const currDate = new Date(item.date);
            return {
                meetingCode: item.meetingCode,
                date: currDate.toLocaleDateString("en-GB"),

                time: currDate.toLocaleTimeString("en-GB", {hour12: true,}),
            };
        });
           setHistory(formatted);
  
            
        } catch (error) {
            console.log(error);
        }}
        fetchHistory();
        

    }, []);

    const handleJoin=async()=>{
        setError("");
        if(!code){
            setError("Meeting Code is required");
            return;
        }
        await addToUserHistory(code);
        
        navigate(`/${code}`)
    }
    return (
        <div className="landingPageContainer">

        <div className="box">
        <nav className="mb-5">
            <div className="navHeader">
                <h1>Lumi Talk</h1>
            </div>
            <div className="navList">
               
            <div className="link" data-bs-toggle="modal" data-bs-target="#historyModal">
                            <p><HistoryIcon /> History</p>
                        </div>
       
            <div className="link" onClick={() => {
                localStorage.removeItem("token");
                navigate("/auth")}}>
                <p>Logout</p>
            </div>
            
                
            </div>
        </nav>
        <div className="landMainContainerHomePage row ps-5 pe-5">
           
        <div className="leftSectionHomePage col-8   ">
        <h3>Turning miles into moments — connect effortlessly, anytime.</h3>

        <div className="createOrjoin mt-5"><h4>Join Meet</h4><p>If you are joining someone's meeting, enter the code they gave you.</p></div>
        <div className="createOrjoin"> <h4>Create Meet</h4><p>If you want to create your own meeting, write your own code!</p></div>
        <div className="meeting-code mt-2 ps-4">
                 <div
                    className="errorContainer"
                    style={{
                    height: "2rem",
                    visibility: error ? "visible" : "hidden"
                    }}
                >
              {error && <p className="error-message">{error}</p>}
              </div>
              <TextField id="outlined-basic" label="Meeting Code" variant="outlined"  value={code} onChange={(e)=>setCode(e.target.value)} />
              <Button variant="contained" onClick={() => {handleJoin()}} >Join</Button>

              </div>

             

        </div>

              <div className="rightSectionHomePage col-4 ps-5 ">
                <img src="homePage.png" style={{width:"80%"}}></img>
              </div>
              
             
        </div>
        </div>


        {/* Bootstrap MODAL */}
        <div className="modal fade" id="historyModal" tabIndex="-1" role="dialog" aria-labelledby="historyModalLabel" aria-hidden="true">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="historyModalLabel" style={{color:"rgb(230, 74, 25)"}}><HistoryIcon/> History</h5>
                    <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                    <CancelIcon style={{color:"red"}}/>
                    </button>
                </div>
                <div className="modal-body">
                <div className="historyTable">
                        <table>
                            <thead>
                                <tr>
                                    <th>Meeting Code</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.meetingCode}</td>
                                        <td>{item.date}</td>
                                        <td>{item.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary close-button" data-bs-dismiss="modal">Close</button>
                </div>
                </div>
            </div>
            </div>

        
    </div>

    
    )
}


export default HomePage