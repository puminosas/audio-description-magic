const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware to check admin role
function checkAdmin(req, res, next) {
  // Patikrink vartotojo rolę (pvz., JWT ar sesijos autentifikacija)
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
}

app.get('/api/files', checkAdmin, (req, res) => {
  const directoryPath = path.join(__dirname, 'project-files');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan files');
    }
    const fileList = files.map(file => ({ name: file, path: path.join(directoryPath, file) }));
    res.json(fileList);
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});