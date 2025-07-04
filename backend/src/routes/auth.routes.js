import express from "express";
import { signup, login, signout, updateProfileAvatar, checkAuthentication } from "../controllers/auth.controller.js";
import { isUserAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/signout", signout);

router.post("/update-profile", isUserAuthenticated, updateProfileAvatar);

router.get("/check", isUserAuthenticated, checkAuthentication); // incase user refreshes the app, user should be authenticated

export default router;