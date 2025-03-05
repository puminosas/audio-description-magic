import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to recursively read project files
const readProjectFiles = (dir) => {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      // Skip node_modules and hidden files/folders
      if (
        file.startsWith('.') || 
        file === 'node_modules' || 
        file === 'dist' ||
        file === 'build' ||
        file === 'coverage'
      ) {
        return;
      }
      
      if (stat && stat.isDirectory()) {
        results = results.concat(readProjectFiles(filePath));
      } else {
        results.push({
          path: filePath,
          name: file,
          type: getFileType(file)
        });
      }
    });
  } catch (error) {
    console.error('Error reading directory:', error);
  }
  return results;
};

// Determine file type based on extension
const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    return 'script';
  } else if (['.css', '.scss', '.less'].includes(ext)) {
    return 'style';
  } else if (['.html', '.md', '.txt'].includes(ext)) {
    return 'document';
  } else if (['.json', '.xml', '.yml', '.yaml'].includes(ext)) {
    return 'config';
  } else {
    return 'unknown';
  }
};

// List project files
router.get('/files', (req, res) => {
  try {
    const projectPath = path.join(process.cwd(), 'project-files');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }
    
    const files = readProjectFiles(projectPath);
    res.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list project files' });
  }
});

// Get file content
router.get('/file-content', (req, res) => {
  try {
    const { filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    // Security check - do not allow to go outside "project-files" directory
    const fullPath = path.resolve(filePath);
    const projectFilesDir = path.resolve(path.join(process.cwd(), 'project-files'));
    
    if (!fullPath.startsWith(projectFilesDir)) {
      return res.status(403).json({ error: 'Access denied to this file path' });
    }
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    res.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Save file content
router.post('/edit-file', (req, res) => {
  try {
    const { filePath, newContent } = req.body;
    
    if (!filePath || newContent === undefined) {
      return res.status(400).json({ error: 'File path and content are required' });
    }
    
    // Security check - do not allow to go outside "project-files" directory
    const fullPath = path.resolve(filePath);
    const projectFilesDir = path.resolve(path.join(process.cwd(), 'project-files'));
    
    if (!fullPath.startsWith(projectFilesDir)) {
      return res.status(403).json({ error: 'Access denied to this file path' });
    }
    
    // Create parent directories if they don't exist
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, newContent, 'utf8');
    res.json({ success: true, message: 'File updated successfully' });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

// Analyze file with AI
router.post('/analyze', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    // Security check - do not allow to go outside "project-files" directory
    const fullPath = path.resolve(filePath);
    const projectFilesDir = path.resolve(path.join(process.cwd(), 'project-files'));
    
    if (!fullPath.startsWith(projectFilesDir)) {
      return res.status(403).json({ error: 'Access denied to this file path' });
    }
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const fileExtension = path.extname(filePath).toLowerCase();
    
    // Create context for AI model based on file type
    let systemPrompt = "You are a helpful code review assistant. Analyze the code and provide suggestions for improvements.";
    
    if (['.js', '.jsx', '.ts', '.tsx'].includes(fileExtension)) {
      systemPrompt = "You are a JavaScript/TypeScript expert. Analyze the code for bugs, performance issues, and provide recommendations following best practices. Be specific about what to change.";
    } else if (['.css', '.scss'].includes(fileExtension)) {
      systemPrompt = "You are a CSS expert. Analyze the stylesheet for improvements in organization, performance, and maintainability. Suggest specific changes.";
    } else if (['.md', '.txt'].includes(fileExtension)) {
      systemPrompt = "You are a technical writer. Review this document for clarity, structure, and completeness. Suggest improvements.";
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `Please analyze this file (${path.basename(filePath)}):\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    res.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error('Error analyzing file:', error);
    res.status(500).json({ error: 'Failed to analyze file' });
  }
});

// Chat with AI
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful AI assistant for a web application that helps create audio descriptions for visuals. You help users with code, project management, and technical questions. Be concise but thorough in your responses." 
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    res.json(response.choices[0].message);
  } catch (error) {
    console.error('Error in chat completion:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

export default router;