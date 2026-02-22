/**
 * ══════════════════════════════════════════════════
 *  Main Application — Orchestrates all modules
 * ══════════════════════════════════════════════════
 */

import { CONFIG } from './config.js';
import { validateUrl } from './validators.js';
import { showToast } from './toast.js';
import * as QREngine from './qr-engine.js';
import { addToHistory } from './history.js';
import { initHistoryUI, render as renderHistory } from './history-ui.js';

/* ── DOM References ────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const urlInput = $('#urlInput');
const generateBtn = $('#generateBtn');
const qrSection = $('#qrSection');
const qrContainer = $('#qrcode');
const qrLabel = $('#qrLabel');
const downloadPngBtn = $('#downloadPngBtn');
const downloadSvgBtn = $('#downloadSvgBtn');
const shareBtn = $('#shareBtn');
const copyImgBtn = $('#copyImgBtn');
const optionsToggle = $('#optionsToggle');
const optionsPanel = $('#optionsPanel');

// Options
const sizeSelect = $('#sizeSelect');
const errorLevelSelect = $('#errorLevelSelect');
const colorDarkInput = $('#colorDark');
const colorLightInput = $('#colorLight');
const colorDarkValue = $('#colorDarkValue');
const colorLightValue = $('#colorLightValue');

/* ── State ─────────────────────────────────────── */
let isGenerated = false;

/* ── Helpers ───────────────────────────────────── */

/** Read current options from the UI */
function getOptions() {
    return {
        size: parseInt(sizeSelect?.value || CONFIG.qr.defaultSize, 10),
        colorDark: colorDarkInput?.value || CONFIG.qr.defaultColorDark,
        colorLight: colorLightInput?.value || CONFIG.qr.defaultColorLight,
        correctLevel: errorLevelSelect?.value || CONFIG.qr.defaultCorrectLevel,
    };
}

/** Trigger QR generation for a given URL */
function handleGenerate(rawUrl) {
    const result = validateUrl(rawUrl);

    if (!result.valid) {
        showToast(result.error, 'error');
        urlInput.classList.add('input--error');
        urlInput.focus();
        return;
    }

    urlInput.classList.remove('input--error');
    urlInput.value = result.url;

    const options = getOptions();

    // Show QR section
    qrSection.classList.remove('is-hidden');

    // Re-trigger animation
    const wrapper = qrSection.querySelector('.qr-wrapper');
    wrapper.classList.remove('is-animating');
    void wrapper.offsetWidth;
    wrapper.classList.add('is-animating');

    // Generate
    QREngine.generate(qrContainer, result.url, options);

    // Update label
    qrLabel.textContent = result.url;

    // Persist to history
    addToHistory(result.url);
    renderHistory();

    isGenerated = true;
    showToast('QR code generated!', 'success');
}

/* ── Event: Generate ───────────────────────────── */
generateBtn.addEventListener('click', () => handleGenerate(urlInput.value));

/* ── Event: Enter key ──────────────────────────── */
urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleGenerate(urlInput.value);
    }
});

/* ── Event: Clear error styling on input ───────── */
urlInput.addEventListener('input', () => {
    urlInput.classList.remove('input--error');
});

/* ── Event: Download PNG ───────────────────────── */
downloadPngBtn?.addEventListener('click', () => {
    if (!isGenerated) { showToast('Generate a QR code first', 'error'); return; }
    const ok = QREngine.downloadPNG(qrContainer);
    if (ok) showToast('PNG downloaded!', 'success');
    else showToast('Download failed', 'error');
});

/* ── Event: Download SVG ───────────────────────── */
downloadSvgBtn?.addEventListener('click', () => {
    if (!isGenerated) { showToast('Generate a QR code first', 'error'); return; }
    const ok = QREngine.downloadSVG(qrContainer);
    if (ok) showToast('SVG downloaded!', 'success');
    else showToast('Download failed', 'error');
});

/* ── Event: Share ──────────────────────────────── */
shareBtn?.addEventListener('click', async () => {
    if (!isGenerated) { showToast('Generate a QR code first', 'error'); return; }
    const result = await QREngine.shareUrl();
    if (result === 'copied') showToast('Link copied to clipboard!', 'info');
    else if (result === 'failed') showToast('Share not available', 'error');
});

/* ── Event: Copy image to clipboard ────────────── */
copyImgBtn?.addEventListener('click', async () => {
    if (!isGenerated) { showToast('Generate a QR code first', 'error'); return; }
    const ok = await QREngine.copyImageToClipboard(qrContainer);
    if (ok) showToast('QR image copied!', 'success');
    else showToast('Copy not supported in this browser', 'error');
});

/* ── Event: Options toggle ─────────────────────── */
optionsToggle?.addEventListener('click', () => {
    const expanded = optionsToggle.getAttribute('aria-expanded') === 'true';
    optionsToggle.setAttribute('aria-expanded', String(!expanded));
    if (optionsPanel) {
        optionsPanel.style.display = expanded ? 'none' : 'grid';
    }
});

/* ── Event: Color picker value display ─────────── */
colorDarkInput?.addEventListener('input', () => {
    if (colorDarkValue) colorDarkValue.textContent = colorDarkInput.value;
});
colorLightInput?.addEventListener('input', () => {
    if (colorLightValue) colorLightValue.textContent = colorLightInput.value;
});

/* ── Event: Live-regenerate on option change ───── */
[sizeSelect, errorLevelSelect, colorDarkInput, colorLightInput].forEach(el => {
    el?.addEventListener('change', () => {
        if (isGenerated && QREngine.getCurrentURL()) {
            handleGenerate(QREngine.getCurrentURL());
        }
    });
});

/* ── History: init & wire up ───────────────────── */
initHistoryUI((url) => {
    urlInput.value = url;
    handleGenerate(url);
});

/* ── Auto-generate on load ─────────────────────── */
if (urlInput.value.trim()) {
    handleGenerate(urlInput.value);
}
