/**
 * Canvas Export Utility for PNG, JPG, Web Share API, and Browser Print Dialog
 */

export function downloadCanvasBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadPng(canvas: HTMLCanvasElement, filename = 'snapstrip.png') {
  canvas.toBlob((blob) => {
    if (blob) {
      downloadCanvasBlob(blob, filename);
    }
  }, 'image/png');
}

export function downloadJpg(canvas: HTMLCanvasElement, filename = 'snapstrip.jpg') {
  canvas.toBlob(
    (blob) => {
      if (blob) {
        downloadCanvasBlob(blob, filename);
      }
    },
    'image/jpeg',
    0.92
  );
}

export async function shareStrip(
  canvas: HTMLCanvasElement,
  title = 'My SnapStrip Photobooth Photo'
): Promise<boolean> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }

      if (navigator.canShare && navigator.share) {
        try {
          const file = new File([blob], 'snapstrip.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title,
              text: 'Check out my photobooth strip created with SnapStrip! 📸✨',
              files: [file],
            });
            resolve(true);
            return;
          }
        } catch {
          // User cancelled share or share failed
        }
      }
      resolve(false);
    }, 'image/png');
  });
}

export function printStrip(canvas: HTMLCanvasElement) {
  const dataUrl = canvas.toDataURL('image/png');
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // Fallback: trigger window.print directly if popup blocked
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print SnapStrip</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #ffffff;
          }
          img {
            max-width: 95vw;
            max-height: 95vh;
            object-fit: contain;
          }
          @page {
            size: auto;
            margin: 0mm;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.print(); window.close();" />
      </body>
    </html>
  `);
  printWindow.document.close();
}
