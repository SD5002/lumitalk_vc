import { Router } from "express";
import { login, signup,getHistoryOfUser, addToUserHistory } from "../controllers/userControllers.js";
import auth from "../middleware/auth.js";

const router = Router();

router.route("/login")
                .post(login);
router.route("/signup")
                .post(signup);
router.route("/add_to_activity")
                .post(auth,addToUserHistory)
router.route("/get_all_activity")
                .get(auth,getHistoryOfUser)

export default router;