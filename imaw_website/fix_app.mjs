import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

// The missing tags were causing App.jsx to break on build.
// We need to close the `flex-1` div before the h1, and we need to close the <main> block properly.

// First, fix the double unclosed div around the H1
content = content.replace(
  /<div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start">\n\s*<h1 className="text-\[2rem\]/,
  '<div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start">\n              <h1 className="text-[2rem]'
);

// Then fix the bottom of the hero section where the tags were deleted
content = content.replace(
  /<\/div>\n          \{\/\* CLI image — desktop side column only \*\/}/,
  '            </div>\n          </div>\n          {/* CLI image — desktop side column only */}'
);

content = content.replace(
  /<\/div>\n      <\/main>/,
  '          </div>\n        </div>\n      </main>'
);

// And finally the bottom of the file
content = content.replace(
  /<\/footer>\n  \);\n}/,
  '        </footer>\n      </div>\n    </div>\n  );\n}'
);

fs.writeFileSync('src/App.jsx', content);
