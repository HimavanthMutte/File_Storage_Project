import express from "express"
import dotenv from "dotenv"

import multer from "multer"

import fs from "fs/promises";


const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

import { authMiddleware } from "./middlewares/authMiddleware.js"
import { signup, login } from "./controllers/auth/authController.js"
import { getFiles, uploadFile, getFileById, getFileByName } from "./controllers/fileController.js"

dotenv.config()

import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"

import s3 from "./services/s3Client.js"

const app = express()

import mongoose from "mongoose"

await mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected"))

app.use(express.json())

app.post('/signup', signup)

app.post('/login', login)

app.post('/files/upload', authMiddleware, upload.single("file"), async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "File not found!"
            })
        }
        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: `users/${req.user.userId}/${req.file.originalname}`,
            Body: req.file.buffer,
        });

        const s3Response = await s3.send(uploadCommand);

        console.log(s3Response)

        const savedFile = await uploadFile({
            user: req.user.userId,
            file_name: req.file.originalname,
            file_key: `users/${req.user.userId}/${req.file.originalname}`,
            file_size: req.file.size,
            mime_type: req.file.mimetype
        });

        return res.status(200).json({
            message: "Uploaded Successfully!"
        })
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).json({
            message: "Something went wrong.."
        })
    }
})

app.get("/files", authMiddleware, async (req, res) => {

    try {

        const dbResponse = await getFiles(req.user.userId)

        const formattedDbResponse = dbResponse.map(response => ({
            fileId: response._id,
            fileName: response.file_name,
            fileKey: response.file_key,
            fileSize: response.file_size,
            mimeType: response.mime_type,
            createdAt: response.createdAt,
            updatedAt: response.updatedAt,
        }))

        return res.status(200).json({
            data: formattedDbResponse
        })
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message: "Something went wrong.."
        })
    }
})

app.get("/files/:fileId", authMiddleware, async (req, res) => {
    const { fileId } = req.params

    const dbResponse = await getFileById(fileId, req.user.userId)

    if (!dbResponse) {
        return res.status(404).json({
            message: "File not found!"
        })
    }

    const formattedDbResponse = {
        fileId: dbResponse._id,
        fileName: dbResponse.file_name,
        fileKey: dbResponse.file_key,
        fileSize: dbResponse.file_size,
        mimeType: dbResponse.mime_type,
        createdAt: dbResponse.createdAt,
        updatedAt: dbResponse.updatedAt,
    }

    return res.status(200).json({
        data: formattedDbResponse
    })

})

app.get("/files/:fileName/download", authMiddleware, async (req, res) => {
    try {
        const { fileName } = req.params

        const dbResponse = await getFileByName(fileName, req.user.userId)

        if (!dbResponse) {
            return res.status(404).json({
                message: "File not found!"
            })
        }

        const downloadCommand = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: `users/${req.user.userId}/${fileName}`
        })

        await fs.mkdir("downloads", { recursive: true });

        const s3Response = await s3.send(downloadCommand)

        const buffer = await s3Response.Body.transformToByteArray();

        await fs.writeFile(`downloads/${fileName}`, Buffer.from(buffer));

        return res.download(`downloads/${fileName}`)
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message: "Something went wrong.."
        })

    }
})

app.get('/health', (req, res) => {
    return res.status(200).json({
        message: "OK! Himavanth doing good.."
    })
})

app.listen(process.env.PORT, () => {
    console.log(`Server Started on ${process.env.PORT}`)
})