const fs = require('node:fs');
const sharp = require('sharp');
const out = 'public-assets/icons';
const ink = 'currentColor';
const paper = '#ffd600';
const outline = `stroke="${ink}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"`;
const line = d => `<path d="${d}" fill="none" ${outline}/>`;
const face = d => `<path d="${d}" fill="${paper}" ${outline}/>`;
const solid = d => `<path d="${d}" fill="${ink}"/>`;
const depth = (d, details='') => `<path d="${d}" transform="translate(5 5)" fill="${ink}" ${outline}/>${face(d)}${details}`;
const tilted = body => `<g transform="translate(0 6) skewY(-7)">${body}</g>`;
const bolt = solid('M50 24 32 49h14l-4 20 23-28H51l5-17z');
const icons = {
  write: tilted(depth('M16 29H72V75H16Z',line('M25 57h20m-20 9h28')))+`<g transform="rotate(-28 55 38)">${depth('M49 12h12v42l-6 12-6-12z',line('M49 21h12m-6 3v26'))}</g>`,
  pin: `<g transform="rotate(25 48 48)">${solid('M45 59h6v24l-3 5-3-5z')}${depth('M32 13h32v9h-6v25l10 10v6H28v-6l10-10V22h-6z',line('M44 25v22'))}</g>`,
  local: tilted(depth('M16 20h60v43H16z',line('m32 42 9 9 19-20'))+solid('M40 64h12v13H40z')+line('M29 78h34')),
  pages: tilted(depth('M31 18h42v54H31z')+depth('M17 28h42v54H17z',line('M27 43h22m-22 11h22m-22 11h13'))),
  search: `<path d="m57 58 21 21" stroke="${ink}" stroke-width="14" stroke-linecap="round"/><circle cx="42" cy="41" r="25" fill="${ink}"/><circle cx="39" cy="37" r="24" fill="${paper}" ${outline}/>${line('M26 36a13 13 0 0 1 12-12')}<path d="m65 68 9 9" stroke="${paper}" stroke-width="3" stroke-linecap="round"/>`,
  download: tilted(depth('M17 57h12v12h34V57h12v24H17z'))+depth('M39 12h14v28h16L46 63 23 40h16z'),
  backup: tilted(depth('M17 30h58v48H17z',line('M17 43h58'))+face('M34 30v-9a12 12 0 0 1 24 0v9')+solid('M37 52h18v17H37z')+`<path d="M46 57v7" stroke="${paper}" stroke-width="3" stroke-linecap="round"/>`),
  shortcuts: tilted(depth('M13 29h66v45H13z', `<g fill="${ink}">${[24,35,46,57,68].map(x=>`<rect x="${x-3}" y="39" width="6" height="6" rx="1"/><rect x="${x-3}" y="50" width="6" height="6" rx="1"/>`).join('')}<rect x="29" y="61" width="34" height="5" rx="1"/></g>`)),
  theme: `<circle cx="51" cy="51" r="29" fill="${ink}"/><circle cx="46" cy="46" r="29" fill="${paper}" ${outline}/>${solid('M46 20a26 26 0 0 0 0 52z')}${solid('m59 30 2.5 6.5L68 39l-6.5 2.5L59 48l-2.5-6.5L50 39l6.5-2.5z')}${line('M46 8V4m0 84v-4M8 46H4m84 0h-4')}`,
  folder: tilted(depth('M14 27h24l9 10h30v40H14z',solid('m50 43-17 18h12l-4 13 22-23H50l6-8z'))),
  settings: (()=>{
    // Eight identical teeth on a circular body, rather than hand-drawn uneven points.
    const gear = Array.from({length:8},(_,i)=>{
      const a=i*Math.PI/4;
      return [ [-.24,25],[-.24,34],[.24,34],[.24,25] ].map(([delta,r])=>`${(46+Math.sin(a+delta)*r).toFixed(2)} ${(46-Math.cos(a+delta)*r).toFixed(2)}`).join(' L');
    }).join(' L');
    return depth('M'+gear+'Z')+`<circle cx="46" cy="46" r="13" fill="${ink}"/>`;
  })(),
  'quick-note': tilted(depth('M15 24h61v53H15z',bolt)),
};
(async()=>{
 for(const [name,body] of Object.entries(icons)) fs.writeFileSync(`${out}/${name}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none"><title>${name.replaceAll('-',' ')}</title>${body}</svg>\n`);
 const cells=Object.entries(icons).map(([name,body],i)=>{
 const x=55+(i%4)*225,y=145+Math.floor(i/4)*225;
 return `<g transform="translate(${x+32} ${y}) scale(1.3)" color="#111">${body}</g><text x="${x+95}" y="${y+162}" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#222">${name.replaceAll('-',' ')}</text>`;
 }).join('');
 const sheet=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="880" viewBox="0 0 1000 880"><path fill="${paper}" d="M0 0h1000v880H0z"/><text x="55" y="62" font-family="Arial,sans-serif" font-size="29" font-weight="700">Digital Notepad / Refined icons</text><text x="55" y="94" font-family="Arial,sans-serif" font-size="15">Consistent weight. Balanced shapes. A little depth.</text>${cells}</svg>`;
 fs.writeFileSync(`${out}/preview.svg`,sheet);await sharp(Buffer.from(sheet)).png().toFile(`${out}/preview.png`);
 fs.writeFileSync(`${out}/README.md`,'# Digital Notepad icons\n\n12 original SVG icons with consistent 4.5-unit outlines, 5-unit depth, and controlled 7-degree perspective. Each uses a 96 × 96 viewBox. Black uses currentColor; yellow faces use #ffd600. Intended for yellow backgrounds.\n\nPreview: preview.png / preview.svg. Source: generate.cjs.\n');
})();
