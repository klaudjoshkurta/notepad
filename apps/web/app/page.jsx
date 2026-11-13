import Link from 'next/link';
import { NotePreview } from './note-preview';
import { SiteHeader } from './site-header';
import { repository, releasesUrl } from '../lib/downloads.mjs';

function Mark() {
  return <img src="/logo.svg" width="44" height="44" alt="" aria-hidden="true" />;
}

export default function Home() {
  return <>
    <SiteHeader />
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap">
        <div className="hero-copy">
          <h1 id="hero-title">A clear space.<br /><span>For whatever’s next.</span></h1>
          <p className="intro">Capture a thought. Keep it close. Get on with your day.<br className="desktop-break" /> A small, always-on-top notepad that stays out of your way.</p>
          <div className="hero-actions"><Link className="button button-dark" href="/download"><WindowsIcon />Download for Windows</Link></div>
        </div>
        <NotePreview />
        </div>
      </section>
      <section id="steps" className="steps wrap" aria-labelledby="steps-title">
        <div className="section-heading"><h2 id="steps-title">Less setup.<br /><span>More writing.</span></h2><p>Three small steps to a clearer head.</p><Link className="inline-download" href="/download">Get Digital Notepad <span aria-hidden="true">↗</span></Link></div>
        <ol className="steps-list">
          <li><span className="step-number">01</span><div><h3>Download. Open. Done.</h3><p>Install the Windows app. No account to create or workspace to configure.</p></div></li>
          <li><span className="step-number">02</span><div><h3>Give that thought a home.</h3><p>Start typing on a blank page. Your words save locally as you go.</p></div></li>
          <li><span className="step-number">03</span><div><h3>Get back to your day.</h3><p>Your note stays above your other windows, ready whenever you need it.</p></div></li>
        </ol>
      </section>
      <section id="features" className="features wrap" aria-labelledby="features-title">
        <div className="section-heading"><h2 id="features-title">Small app.<br /><span>Thoughtful details.</span></h2><p>Just the tools that make a notepad useful.</p></div>
        <div className="feature-list">
          <article className="feature-pin"><div className="feature-art windows-art" aria-hidden="true"><div className="back-window"><i /><i /><i /></div><div className="front-window"><span>One good idea.</span><i /><i /></div></div><h3>Right where you need it.</h3><p>An always-on-top window keeps your thoughts beside your work.</p></article>
          <article className="feature-local"><div className="feature-art local-art" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><rect x="9" y="8" width="30" height="23" rx="3" stroke="currentColor" strokeWidth="2" /><path d="M6 38h36M19 31v7m10-7v7m-10-18 4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Saved on your computer</span></div><h3>Your words stay yours.</h3><p>Local saving. No sign-in. Write offline, and export a backup any time.</p></article>
          <article><span className="feature-symbol" aria-hidden="true">◐</span><h3>Light, or lights out.</h3><p>Switch between light and dark. Keep your space comfortable.</p></article>
          <article><span className="feature-symbol" aria-hidden="true">＋</span><h3>A page for every thought.</h3><p>Separate your lists, reminders, and ideas. Find them in the Pages menu.</p></article>
          <article><span className="feature-symbol" aria-hidden="true">↗</span><h3>Easy to take with you.</h3><p>Export a page as text, or import and export a whole notebook as JSON.</p></article>
          <article><span className="feature-symbol shortcut-symbol" aria-hidden="true">Ctrl + N</span><h3>Familiar from the start.</h3><p>Find, create, and export with shortcuts you already know.</p></article>
        </div>
      </section>
      <section id="faq" className="faq wrap" aria-labelledby="faq-title">
        <div className="section-heading"><h2 id="faq-title">Good to know.</h2><p>A little clarity before you download.</p></div>
        <div className="faq-list">
          <details><summary>Is Digital Notepad free?</summary><p>Yes. Digital Notepad is free and open source, under the MIT license. You can explore the code on <a href={repository}>GitHub</a>.</p></details>
          <details><summary>Which operating systems are supported?</summary><p>Digital Notepad is built for Windows x64. A Windows installer and a portable version are available through <a href={releasesUrl}>GitHub Releases</a>.</p></details>
          <details><summary>Where are my notes saved?</summary><p>Your notes stay on your computer in the app’s local user profile. You don’t need an account, and notes don’t sync between devices. Export your notebook from the File menu to keep a separate backup.</p></details>
          <details><summary>Do I need an internet connection?</summary><p>You need a connection to download the app. Once installed, you can write, save, and manage your notes offline.</p></details>
          <details><summary>Can I recover a deleted page?</summary><p>Yes. The app keeps up to 20 deleted pages. Choose “Restore deleted page” from the Edit menu, or use Ctrl+Shift+T to restore the last deleted page.</p></details>
          <details><summary>Does the preview save what I type?</summary><p>The preview on this website is just a place to try writing and switch themes. Its text isn’t saved. Download the desktop app to keep your notes.</p></details>
        </div>
      </section>
      <section className="closing wrap" aria-labelledby="closing-title"><div><h2 id="closing-title">Your next idea starts here.</h2><p>Open a page. Make a little room.</p></div><Link className="button button-dark" href="/download">Get Digital Notepad <span aria-hidden="true">↓</span></Link></section>
    </main>
    <footer className="site-footer wrap"><Link className="brand" href="/" aria-label="Digital Notepad home"><Mark /></Link><span>A little space for thought.</span><div><a href={releasesUrl}>Releases ↗</a><a href={repository}>GitHub ↗</a></div></footer>
  </>;
}

function WindowsIcon() { return <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M2 3.5 9 2.5V9H2zm8-1.2 8-1.2V9h-8zM2 10h7v6.5l-7-1zm8 0h8v7.9l-8-1.2z" /></svg>; }
