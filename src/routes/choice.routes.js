import { Router } from "express"
import { getChoice, getResult, postChoice, postVote } from "../controllers/choice.controllers.js"

const choiceRouter = Router()

choiceRouter.post("/choice", postChoice)
choiceRouter.get("/poll/:id/choice", getChoice)
choiceRouter.post("/choice/:id/vote", postVote)
choiceRouter.get("/poll/:id/result", getResult)

export default choiceRouter