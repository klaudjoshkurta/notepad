import Link from 'next/link';
import { redirect } from 'next/navigation';
import { latestInstaller, releasesUrl } from '../../lib/downloads.mjs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Download Digital Notepad' };

export default async function Download() {
  const installer = await latestInstaller();
  if (installer) redirect(installer);
  return <main className="download-page wrap"><Link className="back-link" href="/">← Digital Notepad</Link><div><p className="eyebrow">A little patience</p><h1>Your next note<br />is nearly here.</h1><p>We couldn’t find a published Windows installer right now. Check the releases page for available downloads, or try again a little later.</p><a className="button button-dark" href={releasesUrl}>Check GitHub releases <span aria-hidden="true">↗</span></a></div><p className="download-meta">Digital Notepad for Windows x64</p></main>;
}
