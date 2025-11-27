import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook for global keyboard shortcuts
 * Implements WCAG 2.1 AA keyboard navigation requirements
 */
export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd/Ctrl + K for search (future feature)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // TODO: Open search modal when implemented
      }

      // Cmd/Ctrl + D to navigate to Dashboard
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        router.push('/dashboard');
      }

      // Cmd/Ctrl + T to navigate to Transactions
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        router.push('/transactions');
      }

      // Cmd/Ctrl + W to navigate to Wallets
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        router.push('/wallets');
      }

      // Cmd/Ctrl + P to navigate to Profile
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        router.push('/profile');
      }

      // ? to show keyboard shortcuts help (future feature)
      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        // TODO: Open keyboard shortcuts help modal
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [router]);
}
