import express from "express"
import dotenv from "dotenv"

import multer from "multer"

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

import { authMiddleware } from "./middlewares/authMiddleware.js"
import { signup, login } from "./controllers/auth/authController.js"
import { getFiles, uploadFile } from "./controllers/fileController.js"

dotenv.config()

import { PutObjectCommand } from "@aws-sdk/client-s3"
import { ListObjectsCommand } from "@aws-sdk/client-s3"
import s3 from "./services/s3Client.js"

const app = express()

import mongoose from "mongoose"

await mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected"))

app.use(express.json())

app.post('/signup', signup)

app.post('/login', login)


app.post('/upload', authMiddleware, upload.single("file"), async (req, res) => {

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

app.get('/health', (req, res) => {
    return res.status(200).json({
        message: "OK! Himavanth doing good.."
    })
})

app.listen(process.env.PORT, () => {
    console.log(`Server Started on ${process.env.PORT}`)
})