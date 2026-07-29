import { findByEmail, addUser } from "../userController.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        const existingUser = await findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await addUser({
            user_name: userName,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User created successfully"
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await findByEmail(email);
        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign({
            userId: user._id,
            userName: user.user_name
        }, process.env.JWT_SECRET);

        res.status(200).json({
            token,
            message: "Logged in successfully"
        });

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: "Server error"
        });
    }
};
