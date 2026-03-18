const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

let corrected = content.replace(
  /<h1 className="text-\[2rem\] sm:text-6xl md:text-7xl font-normal tracking-tighter text-\[#0f172a\] leading-\[1\.1\]">/,
  '            </div>\n            <h1 className="text-[2rem] sm:text-6xl md:text-7xl font-normal tracking-tighter text-[#0f172a] leading-[1.1]">'
);

fs.writeFileSync('src/App.jsx', corrected);
