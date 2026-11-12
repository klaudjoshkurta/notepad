export default function manifest() {
  return {
    name: 'Digital Notepad',
    short_name: 'Notepad',
    start_url: '/',
    display: 'browser',
    background_color: '#ffd600',
    theme_color: '#ffd600',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
