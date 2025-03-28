import { Server } from "socket.io";

let connections = {};
let timeOnline = {};
let messages = {};

const connectToServer = (server) => {
    
   
    const io = new Server(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        },
        transports: ["websocket", "polling"]
    });
    
    

   

    io.on("connection", (socket) => {

        socket.on("join-call", ({ path, username }) => {
            if (!connections[path]) {
                connections[path] = [];
            }
        
            connections[path].push({ id: socket.id, username });
        
            timeOnline[socket.id] = new Date();
            
            

            socket.on("ping", () => {
                socket.emit("pong"); 
            });
        
            // Ensure all users get the correct usernames
            connections[path].forEach(({ id }) => {
                io.to(id).emit("user-joined", { id: socket.id, username });
            });
        
            // Send full user list to the new user
            io.to(socket.id).emit("user-list", connections[path]);
        });
        
    

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data) => {
           
            const foundRoom = Object.entries(connections).find(([_, users]) =>
                users.some(user => user.id === socket.id)
            );
        
            if (foundRoom) {
                const [matchingRoom] = foundRoom;
                if (!messages[matchingRoom]) {
                    messages[matchingRoom] = [];
                }
        
                messages[matchingRoom].push({
                    data,
                    "socket-id-sender": socket.id
                });
        
             
        
                connections[matchingRoom].forEach(({ id }) => {
                    io.to(id).emit("chat-message", {
                        text: data.text,
                        username: data.username
                    });
                });
            }
        });
        
        

        socket.on("disconnect", () => {
            let timeSpent = Math.abs(new Date() - timeOnline[socket.id]);
          
        
            // Find the room the user is in
            const foundRoom = Object.entries(connections).find(([_, users]) =>
                users.some(user => user.id === socket.id)
            );
        
            if (foundRoom) {
                const [roomKey, users] = foundRoom;
        
                // Notify others that the user has left
                users.forEach(({ id }) => {
                    if (id !== socket.id) {
                        io.to(id).emit("user-disconnected", socket.id);
                    }
                });
        
                // Remove the user from the list
                connections[roomKey] = users.filter(user => user.id !== socket.id);
        
                // If the room is empty, delete it from memory
                if (connections[roomKey].length === 0) {
                    delete messages[roomKey];
                    delete connections[roomKey];
                }
            }
        
            delete timeOnline[socket.id];
        });
        
    });
};


export default connectToServer;
