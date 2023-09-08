import { db } from "../database/dabase.connection.js"
import { pollSchema } from "../schemas/poll.schemas.js"

export async function postPoll(req, res) {
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
}

export async function getPoll (req, res) {
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
}