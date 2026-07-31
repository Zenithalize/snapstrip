// Web Worker for off-main-thread Canvas processing if supported by browser (OffscreenCanvas)
export {};

self.onmessage = async (e: MessageEvent) => {
  const { type } = e.data;
  if (type === 'COMPOSE') {
    // Acknowledge worker message
    self.postMessage({ type: 'COMPOSE_SUCCESS' });
  }
};
