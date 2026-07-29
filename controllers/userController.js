import User from "../models/users.js";

export const findByEmail = async (email) => {
    return await User.findOne({ email });
};

export const addUser = async (userData) => {
    const newUser = new User(userData);
    await newUser.save();
    return newUser;
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
};
