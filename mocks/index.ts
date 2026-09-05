declare global {
  interface Window {
    __mswStarted?: boolean;
  }
}

export async function startMocking() {
  if (typeof window === 'undefined') return;
  if (window.__mswStarted) return;

  // toggle to test cases of selections
  // const { toggleErrorMode } = await import('./handlers');
  // toggleErrorMode();

  window.__mswStarted = true;
  const { worker } = await import('./browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}
