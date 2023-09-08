import { db } from "../database/dabase.connection.js"
import { ObjectId } from "mongodb"
import { choiceSchema } from "../schemas/choice.schemas.js"

export async function postChoice(req, res) {
    const { title, pollId } = req.body

    const validation = choiceSchema.validate(req.body, { abortEarly: false })
    if (validation.error) return res.sendStatus(422)

    try {
        const poll = await db.collection("polls").findOne({ _id: new ObjectId(pollId) })
        if (!poll) return res.sendStatus(404)

        const now = new Date()
        const expireAt = new Date(poll.expireAt)
        if (now >= expireAt) return res.sendStatus(403)

        const newChoice = { title, pollId: new ObjectId(pollId) }

        const existChoice = await db.collection("choices").findOne(newChoice)
        if (existChoice) return res.sendStatus(409)

        await db.collection("choices").insertOne(newChoice)

        res.status(201).send(newChoice)

    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function getChoice(req, res) {
    const pollId = new ObjectId(req.params.id)

    try {
        const poll = await db.collection("polls").findOne({ _id: pollId })
        if (!poll) return res.sendStatus(404)

        const votingOptions = await db.collection("choices").find({ pollId }).toArray()

        res.send(votingOptions)

    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function postVote(req, res) {
    const choiceId = new ObjectId(req.params.id)

    try {
        const choice = await db.collection("choices").findOne({ _id: choiceId })
        if (!choice) return res.sendStatus(404)

        const poll = await db.collection("polls").findOne({ _id: choice.pollId })
        const now = new Date()
        const expireAt = new Date(poll.expireAt)

        if (now >= expireAt) return res.sendStatus(403)

        const vote = { choiceId, createdAt: new Date() }

        await db.collection("votes").insertOne(vote)

        res.sendStatus(201)

    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function getResult(req, res) {
    const pollId = new ObjectId(req.params.id)

    try {
        const poll = await db.collection("polls").findOne({ _id: pollId })
        if (!poll) return res.sendStatus(404)

        const choices = await db.collection("choices").find({ pollId }).toArray()

        let mostVotedOption = null
        let maxVotes = 0

        for (const choice of choices) {
            const votesCount = await db.collection("votes").countDocuments({ choiceId: choice._id })

            if (votesCount > maxVotes) {
                mostVotedOption = choice
                maxVotes = votesCount
            }
        }

        const result = {
            _id: poll._id,
            title: poll.title,
            expireAt: poll.expireAt,
            result: {
                _id: mostVotedOption._id,
                title: mostVotedOption.title,
                votes: maxVotes
            }
        }

        res.send(result)

    } catch (err) {
        return res.status(500).send(err.message)
    }
}
