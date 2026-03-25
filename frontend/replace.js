const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src');

function walk(directory) {
    let results = [];
    const list = fs.readdirSync(directory);
    list.forEach(function(file) {
        file = path.join(directory, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

walk(dir).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('http://localhost:5000')) {
        content = content.replace(/['"`]http:\/\/localhost:5000([^'"`]*)['"`]/g, "(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`)");
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
