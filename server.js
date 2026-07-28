import express from "express"
import dotenv from "dotenv"

import multer from "multer"

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

dotenv.config()

import { PutObjectCommand } from "@aws-sdk/client-s3"
import s3 from "./services/s3Client.js"

const app = express()

app.post('/upload', upload.single("file"), async (req, res) => {
    const username = "himavanth"

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "File not found!"
            })
        }
        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: `users/${username}/${req.file.originalname}`,
            Body: req.file.buffer,
        });

        await s3.send(uploadCommand);

        return res.status(200).json({
            message: "Uploaded Successfully!",
            data: {
                name: req.file.originalname,
                format: req.file.mimetype
            }
        })
    }
    catch (err) {
        console.log(err.message)
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