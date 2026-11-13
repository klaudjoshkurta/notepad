const fs=require('fs');const sharp=require('sharp');const dir='public-assets/ghost-logo';
const ink='#172b2c',yellow='#ffeb79';
const body=`<path d="M64 143V65C64 29.1 92.7 0 128 0s64 29.1 64 65v78c0 6.8-8.1 10.2-12.9 5.5l-15.6-15.2a8 8 0 0 0-11.1 0l-18.8 18.2a8 8 0 0 1-11.2 0l-18.8-18.2a8 8 0 0 0-11.1 0l-15.6 15.2C72.1 153.2 64 149.8 64 143Z"/>`;
const eyes=`<rect x="91" y="49" width="23" height="39" rx="11.5"/><rect x="142" y="49" width="23" height="39" rx="11.5"/>`;
const point=`<path d="M106 174h44c4.5 0 6.8 5.4 3.6 8.7l-22 22.5a5 5 0 0 1-7.2 0l-22-22.5c-3.2-3.3-.9-8.7 3.6-8.7Z"/>`;
const variants=[
 {name:'01-refined',label:'01 / Refined',caption:'Balanced, compact, familiar.',body,eyes,point},
 {name:'02-character',label:'02 / Character',caption:'A softer, more curious expression.',body,eyes:`<rect x="91" y="52" width="23" height="36" rx="11.5"/><rect x="142" y="44" width="23" height="44" rx="11.5"/>`,point},
 {name:'03-pencil',label:'03 / Pencil',caption:'A more direct link to writing.',body:`<path d="M64 135V65C64 29.1 92.7 0 128 0s64 29.1 64 65v70c0 5.6-6.8 8.5-10.8 4.5l-13.5-13.3a7 7 0 0 0-10 .1l-24.6 25.3a7 7 0 0 1-10.2 0l-24.6-25.3a7 7 0 0 0-10-.1l-13.5 13.3c-4 4-10.8 1.1-10.8-4.5Z"/>`,eyes,point:`<path d="M111 171h34c4.4 0 6.6 5.3 3.5 8.4l-17 17.5a4.9 4.9 0 0 1-7 0l-17-17.5c-3.1-3.1-.9-8.4 3.5-8.4Z"/>`}
];
(async()=>{
 for(const v of variants){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><title>Ghost pencil — ${v.label}</title><defs><mask id="cutouts"><path fill="white" d="M0 0h256v256H0z"/><g fill="black" transform="translate(0 24)">${v.eyes}</g></mask></defs><g fill="${ink}" mask="url(#cutouts)" transform="translate(0 24)">${v.body}${v.point}</g></svg>`;
 // The eye mask is in the same local coordinate space as the body.
 const corrected=svg.replace('<g fill="black" transform="translate(0 24)">','<g fill="black">');
 fs.writeFileSync(`${dir}/${v.name}.svg`,corrected);
 await sharp(Buffer.from(corrected)).resize(1024).png().toFile(`${dir}/${v.name}.png`);
 }
 const sheet=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="560" viewBox="0 0 1200 560"><path fill="${yellow}" d="M0 0h1200v560H0z"/>${variants.map((v,i)=>`<g transform="translate(${i*400+72} 120)"><g fill="${ink}">${v.body}${v.point}</g><g fill="${yellow}">${v.eyes}</g></g><text x="${i*400+200}" y="425" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="600" fill="${ink}">${v.label}</text><text x="${i*400+200}" y="455" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="${ink}">${v.caption}</text>`).join('')}</svg>`;
 fs.writeFileSync(`${dir}/refinements.svg`,sheet);await sharp(Buffer.from(sheet)).png().toFile(`${dir}/refinements.png`);
})();
