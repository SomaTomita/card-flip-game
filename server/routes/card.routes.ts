import { Router, Request, Response } from 'express';
import { Card } from '../models/card.model';


const router = Router();


router.get('/', async (req: Request, res: Response) => {
    try {
        const cards = await Card.findAll();
        res.status(200).json(cards);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error);
    }
});


router.post('/cards', async (req: Request, res: Response) => {
    const { content } = req.body;
    const newCard = await Card.create({ content });
    res.status(201).json(newCard);
});

export default router;