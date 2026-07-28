import express from "express"
import dotenv from "dotenv"

import multer from "multer"

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

dotenv.config()

const app = express()

app.post('/upload', upload.single("file"), (req, res) => {
    try {
        console.log(req.file)
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