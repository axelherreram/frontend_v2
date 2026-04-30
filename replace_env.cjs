const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Reemplazar template strings
    content = content.replace(/`http:\/\/localhost:3000\/api([^`]*)`/g, '`${import.meta.env.VITE_API_URL}$1`');
    // Reemplazar single quotes
    content = content.replace(/'http:\/\/localhost:3000\/api([^']*)'/g, '`${import.meta.env.VITE_API_URL}$1`');
    // Reemplazar double quotes
    content = content.replace(/"http:\/\/localhost:3000\/api([^"]*)"/g, '`${import.meta.env.VITE_API_URL}$1`');

    // Casos donde la URL esta suelta sin comillas (por concatenaciones extrañas)
    content = content.replace(/http:\/\/localhost:3000\/api/g, '${import.meta.env.VITE_API_URL}');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
      console.log(`Updated: ${filePath}`);
    }
  }
});

console.log(`Finished. Modified ${modifiedFiles} files.`);
