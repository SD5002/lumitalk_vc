import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import jwt from "jsonwebtoken";


const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String
    }
});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
   next();
  });


  
const User= mongoose.model("User", userSchema);

export default User;