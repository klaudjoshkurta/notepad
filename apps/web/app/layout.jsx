import '@fontsource-variable/inter';
import './globals.css';

export const metadata = {
  title: 'Digital Notepad — A little space for your thoughts',
  description: 'A clean, always-on-top notepad for Windows. Capture ideas, keep your notes locally, and get back to what matters. Free and open source.',
  applicationName: 'Digital Notepad',
};

export default function RootLayout({ children }) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
