import express, { Application } from 'express';
import cors from 'cors';
import { sequelize } from './config/db.config';
import cardRoutes from './routes/card.routes';

const app: Application = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use('/api', cardRoutes);


async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
