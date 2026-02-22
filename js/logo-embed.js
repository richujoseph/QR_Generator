/**
 * ══════════════════════════════════════════════════
 *  Logo Embed — Overlay a logo on the QR canvas
 * ══════════════════════════════════════════════════
 */

let logoImage = null;

/**
 * Load a logo from a file input.
 * @param {File} file
 * @returns {Promise<HTMLImageElement|null>}
 */
export function loadLogo(file) {
    return new Promise((resolve) => {
        if (!file || !file.type.startsWith('image/')) {
            resolve(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                logoImage = img;
                resolve(img);
            };
            img.onerror = () => resolve(null);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

/**
 * Apply the loaded logo to a QR canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {number} [ratio=0.22] — Logo size as fraction of QR size
 */
export function applyLogo(canvas, ratio = 0.22) {
    if (!logoImage || !canvas) return;

    const ctx = canvas.getContext('2d');
    const logoSize = Math.floor(canvas.width * ratio);
    const x = Math.floor((canvas.width - logoSize) / 2);
    const y = Math.floor((canvas.height - logoSize) / 2);

    // White background circle for logo
    const padding = 4;
    ctx.beginPath();
    ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2 + padding, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Clip to circle and draw logo
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImage, x, y, logoSize, logoSize);
    ctx.restore();
}

/**
 * Check if a logo is loaded.
 */
export function hasLogo() {
    return logoImage !== null;
}

/**
 * Remove the current logo.
 */
export function removeLogo() {
    logoImage = null;
}

/**
 * Get the logo image element.
 */
export function getLogoImage() {
    return logoImage;
}
