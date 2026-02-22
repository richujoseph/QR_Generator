/**
 * ══════════════════════════════════════════════════
 *  Branded Frame — Download QR with decorative border
 *  and custom text label (poster-ready).
 * ══════════════════════════════════════════════════
 */

/**
 * Generate a branded frame canvas with the QR code.
 * @param {HTMLCanvasElement} qrCanvas
 * @param {Object} opts
 * @param {string} [opts.label='Scan Me!']
 * @param {string} [opts.sublabel='']
 * @param {string} [opts.bgColor='#ffffff']
 * @param {string} [opts.textColor='#1a1a2e']
 * @param {string} [opts.accentColor='#6d28d9']
 * @returns {HTMLCanvasElement}
 */
export function createBrandedFrame(qrCanvas, opts = {}) {
    const {
        label = 'Scan Me!',
        sublabel = '',
        bgColor = '#ffffff',
        textColor = '#1a1a2e',
        accentColor = '#6d28d9',
    } = opts;

    const qrSize = qrCanvas.width;
    const padding = 60;
    const headerHeight = 50;
    const footerHeight = sublabel ? 80 : 60;
    const accentBarHeight = 4;

    const totalWidth = qrSize + padding * 2;
    const totalHeight = qrSize + padding * 2 + headerHeight + footerHeight + accentBarHeight;

    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Accent bar at top
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, totalWidth, accentBarHeight);

    // QR code
    const qrX = padding;
    const qrY = accentBarHeight + headerHeight;
    ctx.drawImage(qrCanvas, qrX, qrY);

    // Very subtle border around QR
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.strokeRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2);

    // Label text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 24px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, totalWidth / 2, qrY + qrSize + 36);

    // Sublabel
    if (sublabel) {
        ctx.font = '14px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#888';
        ctx.fillText(sublabel, totalWidth / 2, qrY + qrSize + 58);
    }

    // Small branding at very bottom
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#ccc';
    ctx.fillText('Generated with QR Code Generator', totalWidth / 2, totalHeight - 8);

    return canvas;
}

/**
 * Download a branded frame PNG.
 * @param {HTMLCanvasElement} qrCanvas
 * @param {Object} opts
 */
export function downloadBrandedFrame(qrCanvas, opts = {}) {
    const frameCanvas = createBrandedFrame(qrCanvas, opts);
    const link = document.createElement('a');
    link.download = 'qr-code-framed.png';
    link.href = frameCanvas.toDataURL('image/png');
    link.click();
}
