const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'src/content/blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

let modifiedCount = 0;

for (const file of files) {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to remove blocks containing ONLY an image (and optional whitespace/links/figures)
  // This removes:
  // <figure class="..."> <img src="..." /> <figcaption>...</figcaption> </figure>
  // <p> <a href="..."> <img src="..." /> </a> </p>
  // <div ...> <a ...> <img ... /> </a> </div>
  // <img ... />
  
  const regexes = [
    // Remove figure blocks
    /<figure[^>]*>.*?<img[^>]+>.*?<\/figure>/gis,
    // Remove div containing only a or img
    /<div[^>]*>\s*<a[^>]*>\s*<img[^>]+>\s*<\/a>\s*<\/div>/gis,
    // Remove p containing only a or img
    /<p[^>]*>\s*<a[^>]*>\s*<img[^>]+>\s*<\/a>\s*<\/p>/gis,
    /<p[^>]*>\s*<img[^>]+>\s*<\/p>/gis,
    // Remove naked img tags or those inside h3 (from about-us)
    /<h3[^>]*>\s*<img[^>]+>\s*<\/h3>/gis,
    /<img[^>]+>/gi
  ];

  let original = content;

  for (const regex of regexes) {
    content = content.replace(regex, '');
  }

  // clean up extra newlines
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedCount++;
  }
}

console.log(`Cleaned remaining images from ${modifiedCount} files.`);
