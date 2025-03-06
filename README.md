import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { Configuration, OpenAIApi } from 'openai';
import aiRoutes from './aiRoutes.js';

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

app.use('/api', router);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ac7e9b4e-a04e-4d13-bf02-c919a1ce8f40

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ac7e9b4e-a04e-4d13-bf02-c919a1ce8f40) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ac7e9b4e-a04e-4d13-bf02-c919a1ce8f40) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
