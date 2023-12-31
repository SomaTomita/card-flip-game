import cors from "cors";
import express, { Application, Request, Response } from "express";

const app: Application = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


app.get('/', (req: Request, res: Response) => {
  console.log("getリクエストを受け付けました。");
  return res.status(200).json({ message: "hello world" });
})