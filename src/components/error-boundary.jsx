import { Component } from 'react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('Notepad render failed', error); }
  render() {
    if (this.state.failed) return <main id="app-ready" className="p-6 text-sm"><h1 className="font-medium">Something went wrong</h1><p className="my-3 text-muted-foreground">Reopen the app to reload your saved notes.</p><Button onClick={() => location.reload()}>Reload</Button><Button variant="ghost" onClick={() => window.notepad.close()}>Close</Button></main>;
    return this.props.children;
  }
}
