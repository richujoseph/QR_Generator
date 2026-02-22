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
import { QR_TYPES, encodeData } from './qr-data-encoder.js';
import { detectContentType } from './smart-paste.js';
import { startScanner, stopScanner, isCameraAvailable } from './qr-scanner.js';

/* ── DOM References ────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const mainCard = $('#mainCard');
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
const fullscreenOverlay = $('#fullscreenOverlay');
const fullscreenImg = $('#fullscreenImg');
const fullscreenUrl = $('#fullscreenUrl');
const charCountText = $('#charCountText');
const charFill = $('#charFill');
const statTotal = $('#statTotal');
const qualityBadge = $('#qualityBadge');
const smartPasteHint = $('#smartPasteHint');

// Scanner
const scanBtn = $('#scanBtn');
const scannerOverlay = $('#scannerOverlay');
const scannerVideo = $('#scannerVideo');
const scannerCanvas = $('#scannerCanvas');
const scannerClose = $('#scannerClose');

// Type tabs
const typeTabs = $$('.type-tab');

// WiFi fields
const wifiFields = $('#wifiFields');
const wifiSsid = $('#wifiSsid');
const wifiPass = $('#wifiPass');
const wifiEnc = $('#wifiEnc');

// Email fields
const emailFields = $('#emailFields');
const emailAddress = $('#emailAddress');
const emailSubject = $('#emailSubject');
const emailBody = $('#emailBody');

// SMS fields
const smsFields = $('#smsFields');
const smsPhone = $('#smsPhone');
const smsMessage = $('#smsMessage');

// Options
const sizeSelect = $('#sizeSelect');
const errorLevelSelect = $('#errorLevelSelect');
const colorDarkInput = $('#colorDark');
const colorLightInput = $('#colorLight');
const colorDarkValue = $('#colorDarkValue');
const colorLightValue = $('#colorLightValue');

// Color presets
const colorPresets = $$('.color-preset');

/* ── State ─────────────────────────────────────── */
let isGenerated = false;
let currentType = 'url';
const STATS_KEY = 'qr_generator_stats';

/* ── Stats ─────────────────────────────────────── */
function loadStats() {
    try { return JSON.parse(localStorage.getItem(STATS_KEY)) || { total: 0 }; }
    catch { return { total: 0 }; }
}

function incrementStats() {
    const stats = loadStats();
    stats.total++;
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch { }
    if (statTotal) statTotal.textContent = stats.total;
    return stats;
}

function renderStats() {
    const stats = loadStats();
    if (statTotal) statTotal.textContent = stats.total;
}

/* ── Character Counter ─────────────────────────── */
const MAX_QR_CHARS = 4296;

function updateCharCounter(length) {
    if (!charCountText || !charFill) return;

    const pct = Math.min((length / MAX_QR_CHARS) * 100, 100);
    charFill.style.width = pct + '%';
    charCountText.textContent = `${length} / ${MAX_QR_CHARS}`;

    charCountText.className = 'char-counter__text';
    charFill.className = 'char-counter__fill';

    if (pct > 90) {
        charCountText.classList.add('is-danger');
        charFill.classList.add('is-danger');
    } else if (pct > 70) {
        charCountText.classList.add('is-warning');
        charFill.classList.add('is-warning');
    }
}

/* ── Quality Score ─────────────────────────────── */
function updateQualityBadge(dataLength, ecLevel, size) {
    if (!qualityBadge) return;

    // Score based on: data usage ratio, error correction, and output size
    const usageRatio = dataLength / MAX_QR_CHARS;
    const ecScore = { H: 4, Q: 3, M: 2, L: 1 }[ecLevel] || 2;
    const sizeScore = size >= 300 ? 3 : size >= 220 ? 2 : 1;

    // Calculate composite score (lower usage + higher EC + bigger size = better)
    let score = 0;
    score += usageRatio < 0.3 ? 3 : usageRatio < 0.6 ? 2 : usageRatio < 0.85 ? 1 : 0;
    score += ecScore >= 3 ? 3 : ecScore >= 2 ? 2 : 1;
    score += sizeScore;

    let level, label;
    if (score >= 8) {
        level = 'excellent'; label = 'Excellent scan quality';
    } else if (score >= 6) {
        level = 'good'; label = 'Good scan quality';
    } else if (score >= 4) {
        level = 'fair'; label = 'Fair — increase size or error correction';
    } else {
        level = 'poor'; label = 'Poor — reduce data or increase settings';
    }

    qualityBadge.innerHTML = `
        <span class="quality-badge quality-badge--${level}">
            <span class="quality-badge__dot"></span>
            ${label}
        </span>
    `;
}

/* ── Type Switching ────────────────────────────── */
function switchType(type) {
    currentType = type;

    typeTabs.forEach(tab => {
        const isActive = tab.dataset.type === type;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
    });

    const mainInputGroup = $('.input-group');
    if (mainInputGroup) mainInputGroup.style.display = (type === 'wifi' || type === 'email' || type === 'sms') ? 'none' : 'flex';

    wifiFields?.classList.toggle('is-visible', type === 'wifi');
    emailFields?.classList.toggle('is-visible', type === 'email');
    smsFields?.classList.toggle('is-visible', type === 'sms');

    const typeInfo = QR_TYPES.find(t => t.id === type);
    if (typeInfo && urlInput) {
        urlInput.placeholder = typeInfo.placeholder;
        if (type === 'text') urlInput.type = 'text';
        else if (type === 'phone') urlInput.type = 'tel';
        else urlInput.type = 'url';
    }

    if (type !== 'url' && urlInput) urlInput.value = '';
    updateCharCounter(0);
}

/* ── Helpers ───────────────────────────────────── */

function getOptions() {
    return {
        size: parseInt(sizeSelect?.value || CONFIG.qr.defaultSize, 10),
        colorDark: colorDarkInput?.value || CONFIG.qr.defaultColorDark,
        colorLight: colorLightInput?.value || CONFIG.qr.defaultColorLight,
        correctLevel: errorLevelSelect?.value || CONFIG.qr.defaultCorrectLevel,
    };
}

function collectData() {
    switch (currentType) {
        case 'url': case 'text': case 'phone':
            return { value: urlInput?.value || '' };
        case 'wifi':
            return { ssid: wifiSsid?.value || '', password: wifiPass?.value || '', encryption: wifiEnc?.value || 'WPA' };
        case 'email':
            return { address: emailAddress?.value || '', subject: emailSubject?.value || '', body: emailBody?.value || '' };
        case 'sms':
            return { phone: smsPhone?.value || '', message: smsMessage?.value || '' };
        default:
            return { value: urlInput?.value || '' };
    }
}

/** Trigger QR generation */
function handleGenerate(overrideUrl) {
    let encodedText;

    if (overrideUrl) {
        encodedText = overrideUrl;
    } else {
        const data = collectData();
        const result = encodeData(currentType, data);
        if (!result.valid) {
            showToast(result.error, 'error');
            urlInput?.classList.add('input--error');
            urlInput?.focus();
            return;
        }
        encodedText = result.encoded;
    }

    urlInput?.classList.remove('input--error');

    if (['url', 'text', 'phone'].includes(currentType) && !overrideUrl) {
        urlInput.value = encodedText;
    }

    const options = getOptions();

    // Show QR section
    qrSection.classList.remove('is-hidden');

    // Re-trigger animation
    const wrapper = qrSection.querySelector('.qr-wrapper');
    wrapper.classList.remove('is-animating');
    void wrapper.offsetWidth;
    wrapper.classList.add('is-animating');

    // Generate
    QREngine.generate(qrContainer, encodedText, options);

    // Update label & counter
    qrLabel.textContent = encodedText;
    updateCharCounter(encodedText.length);

    // Quality badge
    updateQualityBadge(encodedText.length, options.correctLevel, options.size);

    // Persist to history
    addToHistory(encodedText);
    renderHistory();

    // Stats
    incrementStats();

    isGenerated = true;
    showToast('QR code generated!', 'success');
}

/* ══════════════════════════════════════════════════
   Event Listeners
   ══════════════════════════════════════════════════ */

/* ── Type Tab clicks ───────────────────────────── */
typeTabs.forEach(tab => {
    tab.addEventListener('click', () => switchType(tab.dataset.type));
});

/* ── Generate button ───────────────────────────── */
generateBtn.addEventListener('click', () => handleGenerate());

/* ── Enter key in inputs ───────────────────────── */
function onEnterKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); handleGenerate(); }
}
urlInput?.addEventListener('keydown', onEnterKey);
wifiSsid?.addEventListener('keydown', onEnterKey);
wifiPass?.addEventListener('keydown', onEnterKey);
emailAddress?.addEventListener('keydown', onEnterKey);
smsPhone?.addEventListener('keydown', onEnterKey);

/* ── Clear error on input ──────────────────────── */
urlInput?.addEventListener('input', () => {
    urlInput.classList.remove('input--error');
    updateCharCounter((urlInput.value || '').length);
});

/* ── Download PNG ──────────────────────────────── */
downloadPngBtn?.addEventListener('click', () => {
    if (!isGenerated) { showToast('Generate a QR code first', 'error'); return; }
    const ok = QREngine.downloadPNG(qrContainer);
    showToast(ok ? 'PNG downloaded!' : 'Download failed', ok ? 'success' : 'error');
});

/* ── Download SVG ──────────────────────────────── */
downloadSvgBtn?.addEventListener('click', () => {
    if (!isGenerated) { showToast('Generate a QR code first', 'error'); return; }
    const ok = QREngine.downloadSVG(qrContainer);
    showToast(ok ? 'SVG downloaded!' : 'Download failed', ok ? 'success' : 'error');
});

/* ── Share ─────────────────────────────────────── */
shareBtn?.addEventListener('click', async () => {
    if (!isGenerated) { showToast('Generate a QR code first', 'error'); return; }
    const result = await QREngine.shareUrl();
    if (result === 'copied') showToast('Link copied to clipboard!', 'info');
    else if (result === 'failed') showToast('Share not available', 'error');
});

/* ── Copy image to clipboard ───────────────────── */
copyImgBtn?.addEventListener('click', async () => {
    if (!isGenerated) { showToast('Generate a QR code first', 'error'); return; }
    const ok = await QREngine.copyImageToClipboard(qrContainer);
    showToast(ok ? 'QR image copied!' : 'Copy not supported in this browser', ok ? 'success' : 'error');
});

/* ── Options toggle ────────────────────────────── */
optionsToggle?.addEventListener('click', () => {
    const expanded = optionsToggle.getAttribute('aria-expanded') === 'true';
    optionsToggle.setAttribute('aria-expanded', String(!expanded));
    if (optionsPanel) optionsPanel.style.display = expanded ? 'none' : 'grid';
});

/* ── Color picker value display ────────────────── */
colorDarkInput?.addEventListener('input', () => {
    if (colorDarkValue) colorDarkValue.textContent = colorDarkInput.value;
    // Deselect presets
    colorPresets.forEach(p => p.classList.remove('is-active'));
});
colorLightInput?.addEventListener('input', () => {
    if (colorLightValue) colorLightValue.textContent = colorLightInput.value;
    colorPresets.forEach(p => p.classList.remove('is-active'));
});

/* ── Live-regenerate on option change ──────────── */
[sizeSelect, errorLevelSelect, colorDarkInput, colorLightInput].forEach(el => {
    el?.addEventListener('change', () => {
        if (isGenerated && QREngine.getCurrentURL()) {
            handleGenerate(QREngine.getCurrentURL());
        }
    });
});

/* ══════════════════════════════════════════════════
   Color Presets
   ══════════════════════════════════════════════════ */
colorPresets.forEach(preset => {
    preset.addEventListener('click', () => {
        const fg = preset.dataset.fg;
        const bg = preset.dataset.bg;

        // Update color inputs
        if (colorDarkInput) { colorDarkInput.value = fg; colorDarkValue.textContent = fg; }
        if (colorLightInput) { colorLightInput.value = bg; colorLightValue.textContent = bg; }

        // Update active state
        colorPresets.forEach(p => p.classList.remove('is-active'));
        preset.classList.add('is-active');

        // Regenerate if QR exists
        if (isGenerated && QREngine.getCurrentURL()) {
            handleGenerate(QREngine.getCurrentURL());
        }
    });
});

/* ══════════════════════════════════════════════════
   Smart Paste Detection
   ══════════════════════════════════════════════════ */
urlInput?.addEventListener('paste', (e) => {
    // Wait for the paste to complete
    setTimeout(() => {
        const pasted = urlInput.value;
        if (!pasted) return;

        const detected = detectContentType(pasted);

        if (detected.type !== currentType && detected.type !== 'text') {
            switchType(detected.type);

            // Fill in the detected data
            switch (detected.type) {
                case 'email':
                    if (emailAddress) emailAddress.value = detected.data.address || '';
                    break;
                case 'phone':
                    urlInput.value = detected.data.value || '';
                    break;
                case 'wifi':
                    if (wifiSsid) wifiSsid.value = detected.data.ssid || '';
                    if (wifiPass) wifiPass.value = detected.data.password || '';
                    if (wifiEnc) wifiEnc.value = detected.data.encryption || 'WPA';
                    break;
            }

            // Show hint
            if (smartPasteHint) {
                smartPasteHint.textContent = `✨ Detected ${detected.type.toUpperCase()}!`;
                smartPasteHint.classList.add('is-visible');
                setTimeout(() => smartPasteHint.classList.remove('is-visible'), 2500);
            }

            showToast(`Smart paste: switched to ${detected.type.toUpperCase()} mode`, 'info');
        }
    }, 50);
});

/* ══════════════════════════════════════════════════
   Drag & Drop Support
   ══════════════════════════════════════════════════ */
let dragCounter = 0;

mainCard?.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    mainCard.classList.add('is-drag-over');
});

mainCard?.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
        dragCounter = 0;
        mainCard.classList.remove('is-drag-over');
    }
});

mainCard?.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

mainCard?.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    mainCard.classList.remove('is-drag-over');

    // Try to get text (URL, email, etc.)
    const text = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
    if (text) {
        const detected = detectContentType(text.trim());
        switchType(detected.type);

        if (['url', 'text', 'phone'].includes(detected.type)) {
            urlInput.value = detected.data.value || text;
        } else if (detected.type === 'email' && emailAddress) {
            emailAddress.value = detected.data.address || '';
        } else if (detected.type === 'wifi') {
            if (wifiSsid) wifiSsid.value = detected.data.ssid || '';
            if (wifiPass) wifiPass.value = detected.data.password || '';
        }

        handleGenerate();
        showToast('Dropped & generated!', 'success');
    }
});

/* ══════════════════════════════════════════════════
   QR Code Scanner (Camera)
   ══════════════════════════════════════════════════ */
scanBtn?.addEventListener('click', async () => {
    if (!isCameraAvailable()) {
        showToast('Camera not available on this device', 'error');
        return;
    }

    scannerOverlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';

    const success = await startScanner(scannerVideo, scannerCanvas, (decodedText) => {
        // Close scanner
        scannerOverlay.classList.remove('is-visible');
        document.body.style.overflow = '';

        // Detect type and fill
        const detected = detectContentType(decodedText);
        switchType(detected.type);

        if (['url', 'text', 'phone'].includes(detected.type)) {
            urlInput.value = decodedText;
        } else if (detected.type === 'email' && emailAddress) {
            emailAddress.value = detected.data.address || '';
        } else if (detected.type === 'wifi') {
            if (wifiSsid) wifiSsid.value = detected.data.ssid || '';
            if (wifiPass) wifiPass.value = detected.data.password || '';
            if (wifiEnc) wifiEnc.value = detected.data.encryption || 'WPA';
        }

        showToast(`Scanned: ${detected.type.toUpperCase()} detected!`, 'success');

        // Auto-generate
        setTimeout(() => handleGenerate(), 200);
    });

    if (!success) {
        scannerOverlay.classList.remove('is-visible');
        document.body.style.overflow = '';
        showToast('Camera access denied', 'error');
    }
});

scannerClose?.addEventListener('click', () => {
    stopScanner(scannerVideo);
    scannerOverlay.classList.remove('is-visible');
    document.body.style.overflow = '';
});

/* ══════════════════════════════════════════════════
   Fullscreen QR Preview
   ══════════════════════════════════════════════════ */
qrSection?.addEventListener('click', (e) => {
    if (!e.target.closest('.qr-wrapper')) return;
    if (!isGenerated) return;

    const dataUrl = QREngine.getDataURL(qrContainer);
    if (!dataUrl || !fullscreenOverlay) return;

    fullscreenImg.src = dataUrl;
    fullscreenUrl.textContent = QREngine.getCurrentURL();
    fullscreenOverlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
});

fullscreenOverlay?.addEventListener('click', () => {
    fullscreenOverlay.classList.remove('is-visible');
    document.body.style.overflow = '';
});

/* ══════════════════════════════════════════════════
   Keyboard Shortcuts
   ══════════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    const isMeta = e.metaKey || e.ctrlKey;

    if (e.key === 'g' || e.key === 'G') { e.preventDefault(); urlInput?.focus(); }
    else if (isMeta && e.key === 'd') { e.preventDefault(); downloadPngBtn?.click(); }
    else if (isMeta && e.key === 's') { e.preventDefault(); downloadSvgBtn?.click(); }
    else if (e.key === 'f' || e.key === 'F') {
        if (isGenerated) {
            e.preventDefault();
            const dataUrl = QREngine.getDataURL(qrContainer);
            if (dataUrl && fullscreenOverlay) {
                fullscreenImg.src = dataUrl;
                fullscreenUrl.textContent = QREngine.getCurrentURL();
                fullscreenOverlay.classList.add('is-visible');
                document.body.style.overflow = 'hidden';
            }
        }
    }
    else if (e.key === 'Escape') {
        if (fullscreenOverlay?.classList.contains('is-visible')) {
            fullscreenOverlay.classList.remove('is-visible');
            document.body.style.overflow = '';
        }
        if (scannerOverlay?.classList.contains('is-visible')) {
            stopScanner(scannerVideo);
            scannerOverlay.classList.remove('is-visible');
            document.body.style.overflow = '';
        }
    }
});

/* ══════════════════════════════════════════════════
   History: init & wire up
   ══════════════════════════════════════════════════ */
initHistoryUI((url) => {
    switchType('url');
    urlInput.value = url;
    handleGenerate(url);
});

/* ══════════════════════════════════════════════════
   Init
   ══════════════════════════════════════════════════ */
renderStats();

// Hide scan button if no camera
if (!isCameraAvailable() && scanBtn) {
    scanBtn.style.display = 'none';
}

// Auto-generate on load
if (urlInput?.value.trim()) {
    handleGenerate(urlInput.value);
}
