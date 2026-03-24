import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { registerSchema } from "../validations/authValidation.js"
import { sendEmail } from "../utils/sendEmail.js";
import { redisCilent } from "../app.js";
import {
    generateAccessToken,
    generateRefreshToken
} from "../utils/generateToken.js";
import crypto from "crypto";
import sgMail from "../utils/sendGrid.js";


dotenv.config()

export const registerUser = async (req, res) => {

    try {
        
        const data = registerSchema.parse(req.body)

        

        const { name, email, password } = data

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" })
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        sendEmail(email, token)

        res.json({
            message: "Verification email sent"
        })

    } catch (err) {

        // res.status(400).json(err)
        if (err.errors) {
            return res.status(400).json({
                errors: err.errors.map(e => e.message)
            });
        }
        console.log(err)
        return res.status(400).json({
            message: err || "Something went wrong"
        });

    }

}


export const verifyEmail = async (req, res) => {

    try {

        const { token } = req.params
        console.log(token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decoded.id)

        user.isVerified = true

        await user.save()

        res.json({
            message: "Email verified"
        })

    } catch (err) {
        console.log("err", err)
        res.status(400).json({
            message: "Invalid token"
        })

    }

}




export const loginUser = async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }

    if (user.isBlocked) {
        return res.status(403).json({
            message: "Your account is blocked by admin"
        });
    }

   

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return res.status(400).json({ message: "Invalid password" });
    }

    if (!user.isVerified) {
        return res.status(400).json({
            message: "Please verify email first"
        });
    }

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    // Redis me store (7 days)
    await redisCilent.set(
        `refresh:${user._id}`,
        refreshToken,
        "EX",
        7 * 24 * 60 * 60
    );

    // cookie
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 15 * 60 * 1000,
        sameSite: "None",
         path: "/",

    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
        message: "Login success",
        user
    });

};


export const refreshToken = async (req, res) => {

    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ message: "No refresh token" });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.REFRESH_SECRET
        );

        const storedToken = await redisCilent.get(`refresh:${decoded.id}`);

        if (storedToken !== token) {
            return res.status(403).json({
                message: "Invalid refresh token"
            });
        }

        const newAccessToken = generateAccessToken({
            _id: decoded.id
        });

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000
        });

        res.json({
            message: "New access token generated"
        });

    } catch (err) {
        console.log(err);

        res.status(403).json({
            message: "Refresh token expired"
        });

    }

};



export const logoutUser = async (req, res) => {

    try {

        const token = req.cookies.refreshToken;

        if (token) {

            const decoded = jwt.verify(
                token,
                process.env.REFRESH_SECRET
            );

            // Redis se refresh token delete
            await redisCilent.del(`refresh:${decoded.id}`);
        }

        // cookies clear
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        });
        // res.clearCookie("accessToken");
        // res.clearCookie("refreshToken");

        res.json({
            message: "Logged out successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Logout error"
        });

    }

};


export const getMe = async (req, res) => {

    const user = await User.findById(req.user.id)
        .select("-password");

    res.json({ user });

}



// GET /api/admin/users

export const getAllUsers = async (req, res) => {

    const users = await User.find({ role: "user", isVerified: true }); // 🔥 admin exclude

    res.json({ users });

};


// PATCH /api/admin/block/:id

export const toggleBlockUser = async (req, res) => {

    const user = await User.findById(req.params.id);

    user.isBlocked = !user.isBlocked;

    await user.save();

    res.json({
        message: user.isBlocked ? "User blocked" : "User unblocked"
    });

};



// import User from "../models/User.js";

// export const forgotPassword = async (req, res) => {
//     try {
//         const { email } = req.body;

//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(404).json({
//                 message: "User not found"
//             });
//         }

//         // 🔐 Generate token
//         const token = crypto.randomBytes(32).toString("hex");

//         // Save token + expiry
//         user.resetPasswordToken = token;
//         user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min

//         await user.save();

//         // 🔗 Reset link
//         const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

//         // 📧 Send Email (SendGrid)
//         const msg = {
//             to: user.email,
//             from: process.env.SENDGRID_EMAIL, // verified sender
//             subject: "Password Reset Request",
//             html: `
//                 <h2>Password Reset</h2>
//                 <p>You requested to reset your password.</p>
//                 <a href="${resetLink}" style="color:blue;">Click here to reset</a>
//                 <p>This link expires in 15 minutes.</p>
//             `
//         };

//         await sgMail.send(msg);

//         res.json({
//             message: "Reset link sent to your email"
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: "Server error"
//         });
//     }
// };


export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

        const msg = {
            to: user.email,
            from: {
                email: process.env.EMAIL_FROM,
                name: "Auth App"
            },
            subject: "Password Reset",
            html: `
                <h2>Password Reset</h2>
                <p>Click below:</p>
                <a href="${resetLink}">${resetLink}</a>
            `
        };

        await sgMail.send(msg);

        res.json({ message: "Reset link sent successfully" });

    } catch (error) {
        console.log(error);
        
        console.log("❌ SendGrid Error:", error.response?.body);
        res.status(500).json({ message: "Error sending email" });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired token"
            });
        }

        // 🔐 Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear token
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({
            message: "Password reset successful"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};