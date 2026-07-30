import File from "../models/files.js";

export const getFiles = async (userId) => {
    try {
        const files = await File.find({
            user: userId
        });
        return files;
    } catch (error) {
        console.log(error.message)
        throw error
    }
};

export const getFile = async (fileId, userId) => {
    try {
        const file = await File.findOne({
            user: userId,
            _id: fileId
        })
        return file
    }
    catch (error) {
        console.log(error.message)
        throw error
    }
}

export const uploadFile = async (fileData) => {
    const newFile = new File(fileData);
    await newFile.save();
    return newFile;
};

