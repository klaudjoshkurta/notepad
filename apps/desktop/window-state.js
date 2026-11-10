const fs = require('node:fs');
const path = require('node:path');

function fitBounds(saved, displays) {
  const primary = displays[0].workArea;
  const valid = saved && ['x', 'y', 'width', 'height'].every(key => Number.isFinite(saved[key]));
  const area = valid ? displays.find(({ workArea: a }) => saved.x < a.x + a.width && saved.x + saved.width > a.x && saved.y < a.y + a.height && saved.y + saved.height > a.y)?.workArea ?? primary : primary;
  const width = Math.min(area.width, Math.max(280, Math.round(valid ? saved.width : 440)));
  const height = Math.min(area.height, Math.max(320, Math.round(valid ? saved.height : 620)));
  return { width, height, x: Math.max(area.x, Math.min(Math.round(valid ? saved.x : area.x + (area.width - width) / 2), area.x + area.width - width)), y: Math.max(area.y, Math.min(Math.round(valid ? saved.y : area.y + (area.height - height) / 2), area.y + area.height - height)) };
}
function readBounds(directory, displays) {
  let saved;
  try { saved = JSON.parse(fs.readFileSync(path.join(directory, 'window-state.json'), 'utf8')); } catch {}
  return fitBounds(saved, displays);
}
function saveBounds(directory, bounds) {
  try {
    const target = path.join(directory, 'window-state.json');
    fs.writeFileSync(`${target}.tmp`, JSON.stringify(bounds));
    fs.renameSync(`${target}.tmp`, target);
  } catch (error) { console.error('Could not save window position:', error.message); }
}
module.exports = { fitBounds, readBounds, saveBounds };
