import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { Configuration, OpenAIApi } from 'openai';
import routes from './routes.js';

const app = express();
app.use(express.json());

const router = express.Router();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Middleware, kuris tikrina, ar vartotojas yra admin
function checkAdmin(req, res, next) {
  console.log('Checking admin role for user:', req.user);
  if (req.user && req.user.role === 'admin') {
    console.log('User is admin');
    next();
  } else {
    console.log('User is not admin');
    res.status(403).send('Forbidden');
  }
}

// Maršrutas /api/files – grąžina projekto failų sąrašą
router.get('/files', checkAdmin, (req, res) => {
  const directoryPath = path.join(process.cwd(), 'project-files');
  console.log('Directory path:', directoryPath);
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Unable to scan files:', err);
      return res.status(500).send('Unable to scan files');
    }
    const fileList = files.map(file => ({
      name: file,
      path: path.join(directoryPath, file)
    }));
    console.log('File list:', fileList);
    res.json(fileList);
  });
});

// Maršrutas /api/analyze – analizuoja nurodyto failo turinį
router.post('/analyze', checkAdmin, (req, res) => {
  const { filePath } = req.body;
  console.log('Analyzing file:', filePath);
  fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
      console.error('Unable to read file:', err);
      return res.status(500).send('Unable to read file');
    }
    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `Patikrink pateikto failo turinį, surask galimas klaidas, pasiūlyk patobulinimus ir, jei įmanoma, sugeneruok diff stiliaus pakeitimus.\n\n${data}`,
        max_tokens: 1500,
      });
      console.log('Analysis result:', response.data.choices[0].text);
      res.json({ result: response.data.choices[0].text });
    } catch (error) {
      console.error('Klaida analizuojant failą:', error);
      res.status(500).send('Error analyzing file');
    }
  });
});

// Naudojame maršrutus su prefiksu /api
app.use('/api', routes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export default router;
