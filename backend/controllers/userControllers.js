import User from "../models/userModel.js";
import Meeting from "../models/meetingModel.js";
import wrapAsync  from "../utils/wrapAsync.js";
import  ExpressError  from "../utils/ExpressError.js";



import bcrypt from "bcrypt";
import crypto from "crypto";


const signup = wrapAsync(async (req, res, next) => {
    const { name,userName, password } = req.body;
    const user = await User.findOne({ username:userName });
    if (user) {
        return next(new ExpressError(400, "Username not avilable"));
    }
  
    const newUser = new User({ 
        name: name,
        username: userName, 
        password:password });

    let token=crypto.randomBytes(20).toString("hex");
    newUser.token=token;   
    
    console.log(newUser);

    await newUser.save();
    res.status(201).json({ username: userName, name:name,token:token });
});

const login = wrapAsync(async (req, res, next) => {
    const {userName, password } = req.body;
    console.log(userName);
    const user = await User.findOne({ username:userName });
    console.log(user)
    if (!user) {
        return next(new ExpressError(400, "User not found"));
    }
    
    const isPass=await bcrypt.compare(password, user.password)
    if (isPass ) {
        let token=crypto.randomBytes(20).toString("hex");
        user.token=token;    
        await user.save(); 
        return res.status(200).json({ username: userName, name:user.name,token:token });
       
    };
    return next(new ExpressError(400, "Incorrect Password"));


  
});

const getHistoryOfUser = wrapAsync(async (req, res, next) => {
   
    if (!req.user) {
        return next(new ExpressError(400, "User not found"));
    }
    const history = await Meeting.find({user_id:req.user._id});
    return res.status(200).json(
        
            history.map(meeting => ({
                meetingCode: meeting.meetingCode,
                date: meeting.date
            }))
        );
        
    
});

const addToUserHistory = wrapAsync(async (req, res, next) => {
    if (!req.user) {
        return next(new ExpressError(400, "User not found"));
    }
    const { meeting_code} = req.body;
    if (!meeting_code) {
        return next(new ExpressError(400, "Meeting code not found"));
    }
    const newHistory = new Meeting({
        user_id: req.user._id,
        meetingCode: meeting_code,
        date: new Date().toISOString(),
    })

    await newHistory.save();
    return res.status(200).json({ message: "Meeting added to history" });
    
});

export { signup, login, getHistoryOfUser, addToUserHistory };