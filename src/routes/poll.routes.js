import { Router } from "express"
import { getPoll, postPoll } from "../controllers/poll.controllers.js"

const pollRouter = Router()

pollRouter.post("/poll", postPoll)
pollRouter.get("/poll", getPoll)

export default pollRouter