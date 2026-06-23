const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'src/content/blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

let modifiedCount = 0;

for (const file of files) {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to match image blocks at the end of the file.
  // It handles <img...>, <p><a><img...></a></p>, <figure><img...></figure> etc.
  // We look for these tags appearing at the very end of the content (allowing for whitespace/newlines)
  
  // A pattern that matches a block containing an img tag, potentially wrapped in other tags, at the end of the string.
  // We use [\s\S]*? to match the wrapped stuff.
  const regex = /(?:<p[^>]*>)?(?:<a[^>]*>)?(?:<figure[^>]*>)?\s*<img[^>]+>\s*(?:<\/a>)?(?:<\/p>)?(?:<figcaption>.*?<\/figcaption>)?(?:<\/figure>)?\s*(?:\[caption.*?\[\/caption\])?\s*$/i;

  // Wait, the grep output showed some [caption...]<img...>[/caption]
  const captionRegex = /\[caption[^\]]*\].*?<img[^>]+>.*?\[\/caption\]\s*$/i;
  
  // General img tag at the bottom
  const generalRegex = /(<p[^>]*>\s*)?(<a[^>]*>\s*)?(<figure[^>]*>\s*)?<img[^>]+>(\s*<\/a>)?(\s*<\/p>)?(\s*<figcaption[^>]*>.*?<\/figcaption>)?(\s*<\/figure>)?\s*$/i;

  let original = content;

  // Try replacing caption block first
  if (captionRegex.test(content)) {
    content = content.replace(captionRegex, '');
  } else if (generalRegex.test(content)) {
    content = content.replace(generalRegex, '');
  } else {
    // some might have just an img tag followed by random newlines
    const rawImgRegex = /<img[^>]+>\s*$/i;
    if (rawImgRegex.test(content)) {
      content = content.replace(rawImgRegex, '');
    }
  }

  // Also remove trailing `&nbsp;` or empty `<p></p>` if left over
  content = content.replace(/(?:&nbsp;|<p>\s*<\/p>|\s)+$/, '\n');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedCount++;
  }
}

console.log(`Cleaned images from ${modifiedCount} files.`);
