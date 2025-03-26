import User from "../models/userModel.js";
import ExpressError from "../utils/ExpressError.js";
import wrapAsync from "../utils/wrapAsync.js";

const auth = wrapAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ExpressError(401, "Unauthorized: No token provided"));
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer "

    if (!token) {
        return next(new ExpressError(401, "Unauthorized: Invalid token format"));
    }

    const user = await User.findOne({ token });

    if (!user) {
        return next(new ExpressError(401, "Unauthorized: Invalid token"));
    }

    req.user = user;
    next(); 
});

export default auth;
