import express from "express"
import dotenv from "dotenv"

import multer from "multer"

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

import connectDB from "./services/mongoClient.js"

dotenv.config()

import { PutObjectCommand } from "@aws-sdk/client-s3"
import { ListObjectsCommand } from "@aws-sdk/client-s3"
import s3 from "./services/s3Client.js"

const app = express()
const username = "himavanth"


app.post('/upload', upload.single("file"), async (req, res) => {

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

app.get("/users/:userId/files", async (req, res) => {
    const { userId } = req.params

    const listFilesCommand = new ListObjectsCommand({
        Bucket: process.env.BUCKET_NAME,
        Prefix: `users/${username}/`
    })

    const response = await s3.send(listFilesCommand);

    const files = response.Contents.map(fileContent => ({
        fileName: fileContent.Key.split("/").at(-1),
        lastModified: fileContent.LastModified,
        size: fileContent.Size,
        format: fileContent.Key.split("/").at(-1).split(".").at(-1),
    }))

    return res.status(200).json({
        data: files
    })
})

app.get('/health', (req, res) => {
    connectDB()
    return res.status(200).json({
        message: "OK! Himavanth doing good.."
    })
})

app.listen(process.env.PORT, () => {
    console.log(`Server Started on ${process.env.PORT}`)
})