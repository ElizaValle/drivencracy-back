import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import joi from "joi"
import { resolveSoa } from "dns"

const app = express()
app.use(express.json())
app.use(cors())
dotenv.config()

// banco de dados
const mongoClient = new MongoClient(process.env.DATABASE_URL)
try {
    await mongoClient.connect()
    console.log("MongoDB conectado!")
} catch (err) {
    console.log(err.message)
}
const db = mongoClient.db()

// schemas
const pollSchema = joi.object({
    title: joi.string().required(),
    expireAt: joi.string().isoDate()
})

// rotas
app.post("/poll", async (req, res) => {
    const { title, expireAt } = req. body

    const validation = pollSchema.validate(req.body, { abortEarly: false })
    if (validation.error) return res.sendStatus(422)

    const defaultExpireAt = new Date()
    defaultExpireAt.setDate(defaultExpireAt.getDate() + 30)

    const newPoll = {
        title,
        expireAt: expireAt || defaultExpireAt.toISOString()
    }

    try {
        const poll = await db.collection("polls").insertOne(newPoll)

        const insertPoll = {
            _id: poll.insertedId,
            ...newPoll
        }

        res.status(201).send(insertPoll)

    } catch (err) {
        return res.status(500).send(err.message)
    }
})

app.get("/poll", async (req, res) => {
    try {
        const polls = await db.collection("polls").find().toArray()

        const poll = polls.map(p => ({
            _id: p._id,
            title: p.title,
            expireAt: p.expireAt
        }))

        res.send(poll)

    } catch (err) {
        return res.status(500).send(err.message)
    }
})

const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))