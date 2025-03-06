
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Helper function to get file extension
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

// Helper function to determine file type
function getFileType(ext) {
  const scriptExts = ['js', 'jsx', 'ts', 'tsx'];
  const styleExts = ['css', 'scss', 'less', 'sass'];
  const documentExts = ['md', 'txt', 'html', 'xml', 'json'];
  const configExts = ['json', 'config', 'yml', 'yaml', 'toml', 'env'];
  
  if (scriptExts.includes(ext)) return 'script';
  if (styleExts.includes(ext)) return 'style';
  if (documentExts.includes(ext)) return 'document';
  if (configExts.includes(ext)) return 'config';
  return 'unknown';
}

// Recursive function to read directory
function readDirectory(dir, rootPath, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip node_modules, hidden directories, and other unwanted files
    if (file.startsWith('.') || 
        file === 'node_modules' || 
        file === 'dist' || 
        file === 'build' ||
        file === '.git') {
      return;
    }
    
    if (stat.isDirectory()) {
      readDirectory(filePath, rootPath, fileList);
    } else {
      const relativePath = path.relative(rootPath, filePath);
      const ext = getFileExtension(file);
      fileList.push({
        path: relativePath,
        name: file,
        file: relativePath,
        type: getFileType(ext)
      });
    }
  });
  
  return fileList;
}

// Get list of project files
router.get('/files', (req, res) => {
  try {
    const files = readDirectory(projectRoot, projectRoot);
    res.json(files);
  } catch (error) {
    console.error('Error reading files:', error);
    res.status(500).json({ error: 'Failed to read project files' });
  }
});

// Get file content
router.get('/file-content', (req, res) => {
  try {
    const { filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    const fullPath = path.join(projectRoot, filePath);
    
    // Check if path is attempting directory traversal
    if (!fullPath.startsWith(projectRoot)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    res.json({ 
      filePath, 
      content,
      language: getFileExtension(filePath)
    });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file content' });
  }
});

// Update file content
router.post('/edit-file', express.json(), (req, res) => {
  try {
    const { filePath, content } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    if (content === undefined) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const fullPath = path.join(projectRoot, filePath);
    
    // Check if path is attempting directory traversal
    if (!fullPath.startsWith(projectRoot)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    res.json({ success: true, message: 'File updated successfully' });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: 'Failed to update file content' });
  }
});

export default router;
