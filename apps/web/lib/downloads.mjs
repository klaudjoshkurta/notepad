export const repository = 'https://github.com/klaudjoshkurta/notepad';
export const releasesUrl = `${repository}/releases`;

export function selectInstaller(release) {
  if (!release || release.draft || release.prerelease || !Array.isArray(release.assets)) return null;
  const asset = release.assets.find(asset => /^(?:Digital[ .-]Notepad|Notepad)-Setup-[\d.]+\.exe$/i.test(asset.name));
  if (!asset) return null;
  try {
    const url = new URL(asset.browser_download_url);
    return url.protocol === 'https:' && url.hostname === 'github.com' && url.pathname.startsWith('/klaudjoshkurta/notepad/releases/download/') ? url.href : null;
  } catch { return null; }
}

export async function latestInstaller() {
  try {
    const response = await fetch('https://api.github.com/repos/klaudjoshkurta/notepad/releases/latest', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    return response.ok ? selectInstaller(await response.json()) : null;
  } catch { return null; }
}
