'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
    <div className="header-inner">
      <Link className="brand" href="/" aria-label="Digital Notepad home"><img src="/logo.svg" width="32" height="32" alt="" />Digital Notepad</Link>
      <nav aria-label="Main navigation">
        <a className="section-link" href="#steps">How it works</a>
        <a className="section-link" href="#features">Features</a>
        <a className="section-link" href="#faq">FAQ</a>
        <Link className="nav-download" href="/download">Download <span aria-hidden="true">↓</span></Link>
      </nav>
    </div>
  </header>;
}
