import { Router } from "express";
import { getAllCards, createCard } from "../controllers/card.controller";

const router = Router();

router.get("/", getAllCards);

router.post("/cards", createCard);

export default router;
