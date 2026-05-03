'use strict';
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../public/img/icons');

// Core paths from favicon.svg (cleaned, no Inkscape metadata)
const FAVICON_INNER = `
  <polygon fill="#ff6600"
    transform="matrix(3.116444,0,0,3.116444,-322.0654,-2.2980867)"
    points="126.5,21.2 133.3,10.8 128,10.8 123.9,17.2 119.7,10.8 114.5,10.8 121.3,21.2 114.5,31.7 119.7,31.7 123.9,25.2 128.1,31.7 133.3,31.7"/>
  <path fill="#ff6600" stroke-width="3.11645"
    d="m 64.062015,5.4930233 c -32.411018,0 -58.5891466,26.1781287 -58.5891466,58.5891467
       0,32.411018 26.1781286,58.58915 58.5891466,58.58915
       32.411014,0 58.589145,-26.178132 58.589145,-58.58915
       0,-32.411018 -26.178131,-58.5891467 -58.589145,-58.5891467 z
       M 105.19907,105.21923 H 22.924955 V 22.94511 h 82.274115 z"/>
`;

function plainSvg() {
  return `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">${FAVICON_INNER}</svg>`;
}

function maskableSvg(size) {
  const inner = Math.round(size * 0.8);
  const offset = Math.round(size * 0.1);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#2196f3"/>
    <svg x="${offset}" y="${offset}" width="${inner}" height="${inner}" viewBox="0 0 128 128"
         xmlns="http://www.w3.org/2000/svg">
      ${FAVICON_INNER}
    </svg>
  </svg>`;
}

function render(svgStr, size) {
  const resvg = new Resvg(svgStr, { fitTo: { mode: 'width', value: size } });
  return resvg.render().asPng();
}

const icons = [
  { size: 16,  files: ['favicon-16x16.png'] },
  { size: 32,  files: ['favicon-32x32.png'] },
  { size: 60,  files: ['apple-touch-icon-60x60.png'] },
  { size: 76,  files: ['apple-touch-icon-76x76.png'] },
  { size: 120, files: ['apple-touch-icon-120x120.png'] },
  { size: 144, files: ['msapplication-icon-144x144.png'] },
  { size: 150, files: ['mstile-150x150.png'] },
  { size: 152, files: ['apple-touch-icon-152x152.png'] },
  { size: 180, files: ['apple-touch-icon-180x180.png', 'apple-touch-icon.png'] },
  { size: 192, files: ['android-chrome-192x192.png'] },
  { size: 512, files: ['android-chrome-512x512.png'] },
];

const maskable = [
  { size: 192, files: ['android-chrome-maskable-192x192.png'] },
  { size: 512, files: ['android-chrome-maskable-512x512.png'] },
];

for (const { size, files } of icons) {
  const buf = render(plainSvg(), size);
  for (const file of files) {
    fs.writeFileSync(path.join(ICONS_DIR, file), buf);
    console.log(`  plain  ${size}x${size}  →  ${file}`);
  }
}

for (const { size, files } of maskable) {
  const buf = render(maskableSvg(size), size);
  for (const file of files) {
    fs.writeFileSync(path.join(ICONS_DIR, file), buf);
    console.log(`  masked ${size}x${size}  →  ${file}`);
  }
}

console.log('\nDone — all icons generated from favicon.svg');
