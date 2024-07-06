import { Request, Response } from "express";
import { Card } from "../models/card.model";

export const getAllCards = async (req: Request, res: Response) => {
  try {
    const cards = await Card.findAll();
    res.status(200).json(cards);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send(error);
  }
};

export const createCard = async (req: Request, res: Response) => {
  const { content } = req.body;
  const newCard = await Card.create({ content });
  res.status(201).json(newCard);
};
