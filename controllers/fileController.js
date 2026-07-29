import File from "../models/files.js";

export const getFiles = async (req, res) => {
    try {
        const files = await File.find({
            user: req.params.userId
        });
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const uploadFile = async (fileData) => {
    const newFile = new File(fileData);
    await newFile.save();
    return newFile;
};
