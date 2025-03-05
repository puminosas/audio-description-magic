const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/analyze', checkAdmin, (req, res) => {
  const { filePath } = req.body;
  fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
      return res.status(500).send('Unable to read file');
    }
    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `Patikrink pateikto failo turinį, surask galimas klaidas, pasiūlyk patobulinimus ir, jei įmanoma, sugeneruok diff stiliaus pakeitimus.\n\n${data}`,
        max_tokens: 1500,
      });
      res.json({ result: response.data.choices[0].text });
    } catch (error) {
      res.status(500).send('Error analyzing file');
    }
  });
});
