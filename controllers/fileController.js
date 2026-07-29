import File from "../models/files.js";

export const getFiles = async (req, res) => {
    try {
        const files = await File.find({ user: req.params.userId });
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const uploadFile = async (req, res) => {
    try {
        const newFile = new File({
            user: req.user.userId,
            file_name: req.file.originalname,
            file_key: req.file.originalname,
            file_size: req.file.size,
            mime_type: req.file.mimetype
        });
        await newFile.save();
        res.status(201).json({ message: "File uploaded successfully", file: newFile });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
