import { generateToken } from "../lib/Utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";

export async function signup(req, res) {
    const { fullName, email, password } = req.body || {};
    try {
        if (!email || !password || !fullName)
            return res.status(400).json({ message: "All fields are mandatory." });


        if (password.length < 8)
            return res.status(400).json({ message: "Password must contain at least 8 characters." });

        const user = await User.findOne({ email });
        if (user)
            return res.status(400).json({ message: "User already exists. Please login!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if (newUser) {
            //incase of success -- generating jwt token
            generateToken(newUser._id, res);
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        } else {
            res.status(400).json({ message: "Invalid user data!" });
        }
    } catch (error) {
        console.log("Error occured while signup, Error: ", error.message ?? error.stack ?? err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function login(req, res) {
    const { email, password } = req.body || {};
    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).json({ message: "Invalid login credentials." });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(400).json({ message: "Invalid login credentials." });

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        });
    } catch (error) {
        console.log("Error occured while login, Error: ", error.message ?? error.stack ?? err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function signout(req, res) {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.log("Error occured while logout, Error: ", error.message ?? error.stack ?? err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function updateProfileAvatar(req, res) {
    try {
        const { profilePic } = req.body;
        const userid = req.user._id;

        if (!profilePic)
            return res.status(400).json({ message: "Profile pic is required." });

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userid, { profilePic: uploadResponse.secure_url }, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error occured while updating profile avatar, Error: ", error.message ?? error.stack ?? err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function checkAuthentication(req, res) {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error occured while checking user authentication, Error: ", error.message ?? error.stack ?? err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}