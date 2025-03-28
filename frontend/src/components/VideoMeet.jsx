import React, { useEffect, useRef, useState } from 'react';
import { TextField, Button, IconButton, cardMediaClasses } from "@mui/material";

import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import { useNavigate } from 'react-router-dom';

import { io } from "socket.io-client";

import { useMemo } from 'react';


const server_url="https://lumitalk-vc-backend.onrender.com";
const peerConfigConnections = {
    iceServers: [
        { urls: ["stun:ss-turn1.xirsys.com"] }, 
        { 
            username: "uuakGVnALko-OylRzgAy2RHaBoM6w_0qn7pw2lEgup8oB3a4jq6CadCw1h6XTB-ZAAAAAGfmYgRzdWRlc2g=",
            credential: "36b5a2e0-0bb1-11f0-a227-0242ac140004",
            urls: [
                "turn:ss-turn1.xirsys.com:80?transport=udp",
                "turn:ss-turn1.xirsys.com:3478?transport=udp",
                "turn:ss-turn1.xirsys.com:80?transport=tcp",
                "turn:ss-turn1.xirsys.com:3478?transport=tcp",
                "turns:ss-turn1.xirsys.com:443?transport=tcp",
                "turns:ss-turn1.xirsys.com:5349?transport=tcp"
            ]
        }
    ]
};



export default function VideoMeet() {
    const [currentDateTime, setCurrentDateTime] = useState("");
    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoRef = useRef();
    const [videos, setVideos] = useState([]);
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [videoAvailable, setVideoAvailable] = useState(false);
    const [audioAvailable, setAudioAvailable] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [message, setMessage] = useState();
    const [day,setDay ] = useState({ date: "", time: "" });
    const intervalRef = useRef(null); 
    const [messages, setMessages] = useState([]);
    const [messageCount, setMessageCount] = useState(3);
    const navigate = useNavigate();


    
    useEffect(() => {
      if (askForUsername) {
        intervalRef.current = setInterval(() => {
          const now = new Date();
          const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          const formattedDate = now.toLocaleDateString(undefined, options);
          const formattedTime = now.toLocaleTimeString();
          
          setDay({ date: formattedDate, time: formattedTime });
        }, 1000);
      } else {
        clearInterval(intervalRef.current);
      }
    
      return () => clearInterval(intervalRef.current); 
    }, [askForUsername]);
    
    

    const stopVideo = () => {
        if (window.localStream) {
            const videoTrack = window.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const stopAudio = () => {
        if (window.localStream) {
            const audioTrack = window.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setAudioEnabled(audioTrack.enabled);
            }
        }
    };

    let connections = {};

    useEffect(() => {
        getPermissions();
    }, []);


    const getPermissions = async () => {
        try {
            const userMediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            if (userMediaStream) {
                window.localStream = userMediaStream;

                const videoTrack = userMediaStream.getVideoTracks()[0];
                if (videoTrack) {
                    setVideoAvailable(true);
                    setVideoEnabled(videoTrack.enabled);
                } else {
                    setVideoAvailable(false);
                    setVideoEnabled(false);
                }

                const audioTrack = userMediaStream.getAudioTracks()[0];
                if (audioTrack) {
                    setAudioAvailable(true);
                    setAudioEnabled(audioTrack.enabled);
                } else {
                    setAudioAvailable(false);
                    setAudioEnabled(false);
                }

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = userMediaStream;
                }
            }
        } catch (error) {
            console.error("Error accessing media devices:", error);
            setVideoAvailable(false);
            setAudioAvailable(false);
            setVideoEnabled(false);
            setAudioEnabled(false);
        }
    };

    const connectToSocketServer = () => {
        socketRef.current = io(server_url, {
            transports: ["websocket", "polling"]
        });
        
        
        
    
        socketRef.current.on("connect", () => {
            socketIdRef.current = socketRef.current.id;
            socketRef.current.emit("join-call", { path: window.location.href, username });


            
        });

        

        socketRef.current.on("user-joined", (user) => {
       
            createPeerConnection(user.id, user.username);
        });
        
        socketRef.current.on("user-list", (users) => {
          
            users.forEach(({ id, username }) => createPeerConnection(id, username));
        });
        
    
        socketRef.current.on("user-disconnected", (userId) => {
        
            if (connections[userId]) {
                connections[userId].close();
                delete connections[userId];
            }
            setVideos((prevVideos) => prevVideos.filter((vid) => vid.socketId !== userId));
        });
        
        socketRef.current.on("signal", gotMessageFromServer);
        socketRef.current.on("signal", (fromId, data) => {
            console.log("Received signal from:", fromId, "Data:", data);
        });
        
        
        socketRef.current.on("chat-message", (data) => {
          
            setMessages((prevMessages) => [...prevMessages, { text: data.text, username: data.username }]);
        });
        
    };
    

    const createPeerConnection = (userId, username) => {
        if (connections[userId]) return;
    
        let peerConnection = new RTCPeerConnection(peerConfigConnections);
        connections[userId] = peerConnection;
    
        window.localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, window.localStream);
        });
    
        peerConnection.ontrack = (event) => {
            setVideos((prevVideos) => {
                // Keep existing users and update only the new one
                let updatedVideos = prevVideos.map((vid) =>
                    vid.socketId === userId ? { ...vid, stream: event.streams[0] } : vid
                );
        
                // If the user is new, add them
                if (!updatedVideos.some((vid) => vid.socketId === userId)) {
                    updatedVideos.push({ socketId: userId, stream: event.streams[0], username });
                }
        
                return updatedVideos;
            });
        };
        
    
        peerConnection.onicecandidate = (event) => {
            
            if (event.candidate) {
                socketRef.current.emit("signal", userId, JSON.stringify({ ice: event.candidate }));
            }
            
        };
    
        peerConnection.createOffer()
            .then((offer) => peerConnection.setLocalDescription(offer))
            .then(() => {
                socketRef.current.emit("signal", userId, JSON.stringify({ sdp: peerConnection.localDescription }));
            })
            .catch((err) => console.error("Error creating offer:", err));
    };
    
   

    const gotMessageFromServer = (fromId, data) => {
        let signal = JSON.parse(data);

        if (!connections[fromId]) createPeerConnection(fromId);
        let peerConnection = connections[fromId];

        if (signal.sdp) {
            if (peerConnection.signalingState !== "stable") {
                peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === "offer") {
                            peerConnection.createAnswer()
                                .then((answer) => peerConnection.setLocalDescription(answer))
                                .then(() => {
                                    socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: peerConnection.localDescription }));
                                })
                                .catch((err) => console.error("Error creating answer:", err));
                        }
                    })
                    .catch((err) => console.error("Error setting remote description:", err));
            } 
        }
        

        if (signal.ice) {
            peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch((err) => console.error("Error adding ICE:", err));
        }
    };



    const renderedVideos = useMemo(() => {
        return videos
            .filter((vid) => vid.socketId !== socketIdRef.current)
            .map((vid) => (
                <div 
                    key={vid.socketId} 
                    className="video-box"
                    onClick={(e) => {
                        e.currentTarget.classList.toggle('fullscreen');
                    }}
                >
                    <video
                        ref={(ref) => {
                            if (ref && vid.stream) {
                                ref.srcObject = vid.stream;
                            }
                        }}
                        autoPlay
                        className="video-content"
                    />
                    
                    <h1 className="video-label">{vid.username || "Unknown"}</h1>
                </div>
            ));
    }, [videos]);
    
  
       
    const sendMessage = () => {
        if (socketRef.current && message.trim() !== "") {
            socketRef.current.emit("chat-message", { text: message, username }, socketIdRef.current);
            setMessage(""); 
        }
    };

    const addMessage = (data, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: data.text, username: data.username }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };






    
    let handleEndCall = () => {
        try {

          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
          socketRef.current.emit("user-disconnected", socketIdRef.current);
    
          
            socketRef.current.disconnect();
            
        } catch (e) {
            console.error("Error during end call:", e);
        }
    
        navigate("/home");
    };
    
    
    

    return (
        <div className={askForUsername ? "preview-container" : "video-container"}>
            {
                askForUsername && 
                <div className="flowerPot">
                    <img src="/plant.png"></img> 
                    <div className="preview-logo">LUMITALK</div>
                </div>
               
            }
            <div className={askForUsername ? "inner-preview-container" : "inner-video-container"}>
            
                <div className={askForUsername ? "my-video-box": ""}>
                    <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    className={askForUsername ? "before-connect" : "after-connect"}
                    ></video>
                    {askForUsername && 
                        <div className="cameraPreviewOptions">
                            
                        <IconButton style={{ color: "white" }} onClick={stopAudio} disabled={!audioAvailable}>
                            {audioAvailable ? (audioEnabled ? <MicRoundedIcon /> : <MicOffRoundedIcon />) : <MicOffRoundedIcon />}
                        </IconButton> 

                        <IconButton style={{ color: "white" }} onClick={stopVideo} disabled={!videoAvailable}>
                            {videoAvailable ? (videoEnabled ? <VideocamRoundedIcon /> : <VideocamOffRoundedIcon />) : <VideocamOffRoundedIcon />}
                        </IconButton>

                        </div>
                    }
                </div>
               
           
            {askForUsername ? (
                <div className="right-section-username">
                <div className="username-input">
                    <TextField
                        id="outlined-basic"
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Button variant="contained" onClick={() => {
                        setAskForUsername(false);
                        connectToSocketServer();
                    }}>
                        Connect
                    </Button>
                </div>
                <div className="calender"> <div className="time">{day.time}</div> <div className="date">{day.date}</div></div>
                </div>
            ) : (
                <>
                <div className="logo">
                    <h2>Lumi Talk</h2>
                </div>
                <div className="inner-inner-video-container">
                     {
                        videos.length === 1 ?
                         <div className="waitingToJoinImg"> <img src="/internet.png"></img>
                         <div className="waiting">Waiting for someone to join...</div></div>
                         : (renderedVideos)

                     }
               
                     
            
                                 
                           
                   </div>
                    <div className="button-container">
                        <IconButton style={{ color: "white" }} onClick={stopVideo} disabled={!videoAvailable}>
                            {videoAvailable ? (videoEnabled ? <VideocamRoundedIcon /> : <VideocamOffRoundedIcon />) : <VideocamOffRoundedIcon />}
                        </IconButton>
                        
                        <IconButton style={{ color: "white" }} onClick={handleEndCall}>
                            <CallEndRoundedIcon />
                        </IconButton>

                        <IconButton style={{ color: "white" }} onClick={stopAudio} disabled={!audioAvailable}>
                            {audioAvailable ? (audioEnabled ? <MicRoundedIcon /> : <MicOffRoundedIcon />) : <MicOffRoundedIcon />}
                        </IconButton>
                     
                 
                        </div>
                        
                    </>
                    
            )}
            
            </div>
        {!askForUsername  && <div className="chat-container">
      
            <div className="inner-chat-container">
              
                <div className="chat-header">
                    <h2>Chats</h2>
                </div>
                <div className="all-chats" >

                {messages.length === 0 && <div className="No-message-image"><img src="/chat.png" style={{height:"40%"}}/>
                <div className="no-message-text"><p>Your inbox is empty.</p><p> Drop a message to begin!</p></div></div>}


                {messages.map((msg, index) => (
                    <div key={index} className="message">
                     <p>{msg.username}</p>
                     <div className="text">{msg.text}</div>
                    </div>
                ))}
            </div>
            </div>
            <div className="input-container">
                <input style={{width:"100%"}} placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)}></input>
                <Button variant="contained " onClick={() => {sendMessage()}}>Send</Button>
            </div>
        </div> } 
        </div>
    );
}  