import Link from 'next/link';
import { NotePreview } from './note-preview';
import { repository, releasesUrl } from '../lib/downloads.mjs';

function Mark() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="5" y="3" width="22" height="26" rx="5" stroke="currentColor" strokeWidth="1.8" /><path d="M11 11h10M11 16h10M11 21h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

export default function Home() {
  return <>
    <header className="site-header wrap"><Link className="brand" href="/" aria-label="Digital Notepad home"><Mark />Digital Notepad<span className="brand-dot">.</span></Link><nav aria-label="Main navigation"><a className="features-link" href="#features">The little things</a><a className="source-link" href={repository} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a></nav></header>
    <main>
      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow"><span /> A little less complicated</p><h1 id="hero-title">Your thoughts.<br />A little more<br /><span>breathing room.</span></h1><p className="intro">A quiet place for the things on your mind. Digital Notepad stays close, saves your notes, and lets you get on with your day.</p><Link className="button button-dark" href="/download"><WindowsIcon />Download for Windows<span aria-hidden="true">↓</span></Link><p className="download-meta">Windows x64 <span>·</span> Free & open source</p></div>
        <NotePreview />
      </section>
      <section id="features" className="features wrap" aria-labelledby="features-title"><div className="section-heading"><p className="eyebrow">Just what you need</p><h2 id="features-title">Small on purpose.</h2></div><div className="feature-list">
        <article><span className="feature-number">01 /</span><h3>Right where you left it.</h3><p>Always on top, so your notes stay beside whatever you’re working on. No more switching windows to catch a thought.</p></article>
        <article><span className="feature-number">02 /</span><h3>Your notes. Your computer.</h3><p>Notes save locally as you write. No account to create, no cloud to configure. Export a backup whenever you need one.</p></article>
        <article><span className="feature-number">03 /</span><h3>A space that feels like you.</h3><p>Light or dark. One page or a few. Familiar menus and keyboard shortcuts keep the small things effortless.</p></article>
      </div></section>
      <section className="closing wrap" aria-labelledby="closing-title"><div><p className="eyebrow">Less setup. More writing.</p><h2 id="closing-title">Make a little room<br />for your next idea.</h2></div><div className="closing-action"><Link className="button button-light" href="/download">Get Digital Notepad <span aria-hidden="true">↓</span></Link><a href={releasesUrl}>Browse releases <span aria-hidden="true">↗</span></a></div></section>
    </main>
    <footer className="site-footer wrap"><span>Digital Notepad. A little space for thought.</span><div><span>Built for Windows</span><span>MIT licensed</span></div></footer>
  </>;
}

function WindowsIcon() { return <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M2 3.5 9 2.5V9H2zm8-1.2 8-1.2V9h-8zM2 10h7v6.5l-7-1zm8 0h8v7.9l-8-1.2z" /></svg>; }
