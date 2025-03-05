import 'dotenv/config';
import express from 'express';
import routes from './routes.js';

const app = express();
app.use(express.json());

// Naudojame maršrutus su prefiksu /api
app.use('/api', routes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});