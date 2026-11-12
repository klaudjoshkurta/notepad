import { Google_Sans } from 'next/font/google';
import './globals.css';

const googleSans = Google_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-google-sans' });

export const metadata = {
  title: 'Digital Notepad — A little space for your thoughts',
  description: 'A clean, always-on-top notepad for Windows. Capture ideas, keep your notes locally, and get back to what matters. Free and open source.',
  applicationName: 'Digital Notepad',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return <html lang="en" data-scroll-behavior="smooth"><body className={googleSans.variable}>{children}</body></html>;
}
