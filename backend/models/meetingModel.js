import { Schema } from "mongoose";
import mongoose from "mongoose";

const meetingSchema = new Schema({
    user_id:{
        type: String,
        required: true},
    meetingCode: {
        type: String,
        required: true
    },   
    date: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
      
    },
    endTime: {
        type: String,
      
    },

}); 

const Meeting= mongoose.model("Meeting", meetingSchema);

export default Meeting;
