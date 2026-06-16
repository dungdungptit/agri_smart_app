const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const assetsDir = path.join(distDir, 'assets');
const fontsDir = path.join(distDir, 'assets', 'fonts');
const indexPath = path.join(distDir, 'index.html');

// Find font files in dist/assets (deep search)
function findFontFile(dir, name) {
    if (!fs.existsSync(dir)) return null;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const found = findFontFile(full, name);
            if (found) return found;
        } else if (entry.name.startsWith(name)) {
            return full;
        }
    }
    return null;
}

const fontNames = [
    { family: 'Ionicons',               prefix: 'Ionicons.' },
    { family: 'MaterialCommunityIcons', prefix: 'MaterialCommunityIcons.' },
    { family: 'MaterialIcons',          prefix: 'MaterialIcons.' },
    { family: 'FontAwesome',            prefix: 'FontAwesome.' },
    { family: 'Feather',                prefix: 'Feather.' },
    { family: 'AntDesign',              prefix: 'AntDesign.' },
];

// Ensure fonts output dir exists
if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

const fonts = fontNames.map(({ family, prefix }) => {
    const src = findFontFile(assetsDir, prefix);
    if (!src) return null;
    const destName = path.basename(src);
    const dest = path.join(fontsDir, destName);
    // Copy font to /assets/fonts/ so server doesn't block node_modules path
    fs.copyFileSync(src, dest);
    return { family, url: `/assets/fonts/${destName}` };
}).filter(Boolean);

console.log('patchWebIndex: copied fonts:', fonts.map(f => f.family).join(', '));

const preloads = fonts
    .map(f => `  <link rel="preload" href="${f.url}" as="font" type="font/ttf" crossorigin>`)
    .join('\n');

const fontFaces = fonts
    .map(f => `    @font-face { font-family: '${f.family}'; src: url('${f.url}') format('truetype'); font-display: block; }`)
    .join('\n');

const injection = `${preloads}\n  <style>\n${fontFaces}\n  </style>`;

let html = fs.readFileSync(indexPath, 'utf8');

// Remove any previous patch
html = html.replace(/<link rel="preload"[^>]*as="font"[^>]*>\n?/g, '');
html = html.replace(/<style>\s*@font-face[\s\S]*?<\/style>\n?/g, '');

html = html.replace('</head>', `${injection}\n</head>`);
fs.writeFileSync(indexPath, html, 'utf8');
console.log('patchWebIndex: index.html patched with', fonts.length, 'font faces → /assets/fonts/');
