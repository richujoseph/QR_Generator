/**
 * ══════════════════════════════════════════════════
 *  QR Code Scanner — Camera-based QR code reader
 *  using jsQR library for decode.
 * ══════════════════════════════════════════════════
 */

let videoStream = null;
let animationFrame = null;
let scanCallback = null;

/**
 * Start the camera scanner.
 * @param {HTMLVideoElement} videoEl
 * @param {HTMLCanvasElement} canvasEl
 * @param {Function} onScan - called with decoded text
 * @returns {Promise<boolean>}
 */
export async function startScanner(videoEl, canvasEl, onScan) {
    scanCallback = onScan;

    try {
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        videoEl.srcObject = videoStream;
        videoEl.setAttribute('playsinline', 'true');
        await videoEl.play();

        const ctx = canvasEl.getContext('2d', { willReadFrequently: true });

        function tick() {
            if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
                canvasEl.width = videoEl.videoWidth;
                canvasEl.height = videoEl.videoHeight;
                ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

                const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);

                // Use jsQR if available
                if (typeof jsQR !== 'undefined') {
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'dontInvert',
                    });
                    if (code && code.data) {
                        if (scanCallback) scanCallback(code.data);
                        stopScanner(videoEl);
                        return;
                    }
                }
            }
            animationFrame = requestAnimationFrame(tick);
        }

        animationFrame = requestAnimationFrame(tick);
        return true;
    } catch (err) {
        console.error('Camera access denied:', err);
        return false;
    }
}

/**
 * Stop the camera scanner and release resources.
 * @param {HTMLVideoElement} videoEl
 */
export function stopScanner(videoEl) {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    if (videoStream) {
        videoStream.getTracks().forEach(t => t.stop());
        videoStream = null;
    }
    if (videoEl) {
        videoEl.srcObject = null;
    }
    scanCallback = null;
}

/**
 * Check if camera is available.
 * @returns {boolean}
 */
export function isCameraAvailable() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
