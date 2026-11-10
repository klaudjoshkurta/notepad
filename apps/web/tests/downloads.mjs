import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectInstaller } from '../lib/downloads.mjs';

const url = 'https://github.com/klaudjoshkurta/notepad/releases/download/v1.0.0/Digital%20Notepad-Setup-1.0.0.exe';
const release = { assets: [{ name: 'Digital Notepad-Portable-1.0.0.exe', browser_download_url: url }, { name: 'Digital Notepad-Setup-1.0.0.exe', browser_download_url: url }] };
test('downloads select the Windows installer instead of the portable asset', () => assert.equal(selectInstaller(release), url));
test('unpublished, prerelease, malformed, and untrusted downloads are unavailable', () => {
  for (const value of [null, {}, { ...release, draft: true }, { ...release, prerelease: true }, { assets: [] }, { assets: [{ name: 'Digital Notepad-Setup-1.0.0.exe', browser_download_url: 'https://example.com/download.exe' }] }]) assert.equal(selectInstaller(value), null);
});
test('existing releases under the original app name remain downloadable', () => assert.equal(selectInstaller({ assets: [{ name: 'Notepad-Setup-1.0.0.exe', browser_download_url: url }] }), url));
