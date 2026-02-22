/**
 * ══════════════════════════════════════════════════
 *  Main Application — Orchestrates all modules
 * ══════════════════════════════════════════════════
 */

import { CONFIG, getCorrectLevel } from './config.js';
import { showToast } from './toast.js';
import * as QREngine from './qr-engine.js';
import { addToHistory, getHistory } from './history.js';
import { initHistoryUI, render as renderHistory } from './history-ui.js';
import { QR_TYPES, encodeData } from './qr-data-encoder.js';
import { detectContentType } from './smart-paste.js';
import { startScanner, stopScanner, isCameraAvailable } from './qr-scanner.js';
import { TEMPLATES } from './templates.js';
import { LANGUAGES, initLang, setLang, getLang, t, applyTranslations } from './i18n.js';
import { loadLogo, applyLogo, hasLogo, removeLogo } from './logo-embed.js';
import { downloadBrandedFrame } from './branded-frame.js';

/* ── DOM References ────────────────────────────── */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

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

// Input fields
const wifiFields = $('#wifiFields');
const wifiSsid = $('#wifiSsid');
const wifiPass = $('#wifiPass');
const wifiEnc = $('#wifiEnc');
const emailFields = $('#emailFields');
const emailAddress = $('#emailAddress');
const emailSubject = $('#emailSubject');
const emailBody = $('#emailBody');
const smsFields = $('#smsFields');
const smsPhone = $('#smsPhone');
const smsMessage = $('#smsMessage');
const vcardFields = $('#vcardFields');
const vcardFirst = $('#vcardFirstName');
const vcardLast = $('#vcardLastName');
const vcardPhone = $('#vcardPhone');
const vcardEmail = $('#vcardEmail');
const vcardCompany = $('#vcardCompany');
const vcardTitle = $('#vcardTitle');
const vcardWebsite = $('#vcardWebsite');

// Options
const sizeSelect = $('#sizeSelect');
const errorLevelSelect = $('#errorLevelSelect');
const colorDarkInput = $('#colorDark');
const colorLightInput = $('#colorLight');
const colorDarkValue = $('#colorDarkValue');
const colorLightValue = $('#colorLightValue');
const colorPresets = $$('.color-preset');

// Logo
const logoFileInput = $('#logoFileInput');
const logoPreview = $('#logoPreview');
const logoRemoveBtn = $('#logoRemoveBtn');
const logoUploadBtn = $('#logoUploadBtn');

// Templates
const templatesBtn = $('#templatesBtn');
const templatesOverlay = $('#templatesOverlay');
const templatesGrid = $('#templatesGrid');
const templatesClose = $('#templatesClose');

// Diff checker
const diffBtn = $('#diffBtn');
const diffOverlay = $('#diffOverlay');
const diffClose = $('#diffClose');
const diffInput1 = $('#diffInput1');
const diffInput2 = $('#diffInput2');
const diffCompare = $('#diffCompareBtn');
const diffResult = $('#diffResult');
const diffQrRow = $('#diffQrRow');

// Branded frame
const brandedFrameBtn = $('#brandedFrameBtn');
const frameOverlay = $('#frameOverlay');
const frameClose = $('#frameClose');
const frameLabel = $('#frameLabel');
const frameSublabel = $('#frameSublabel');
const frameDownload = $('#frameDownloadBtn');

// Bulk export
const bulkExportBtn = $('#bulkExportBtn');

// Language
const langSwitcher = $('#langSwitcher');
const langTrigger = $('#langTrigger');
const langLabel = $('#langLabel');
const langDropdown = $('#langDropdown');

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
    const s = loadStats(); s.total++;
    try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch { }
    if (statTotal) statTotal.textContent = s.total;
}
function renderStats() {
    if (statTotal) statTotal.textContent = loadStats().total;
}

/* ── Character Counter ─────────────────────────── */
const MAX_QR = 4296;
function updateChar(len) {
    if (!charCountText || !charFill) return;
    const p = Math.min((len / MAX_QR) * 100, 100);
    charFill.style.width = p + '%';
    charCountText.textContent = `${len} / ${MAX_QR}`;
    charCountText.className = 'char-counter__text';
    charFill.className = 'char-counter__fill';
    if (p > 90) { charCountText.classList.add('is-danger'); charFill.classList.add('is-danger'); }
    else if (p > 70) { charCountText.classList.add('is-warning'); charFill.classList.add('is-warning'); }
}

/* ── Quality Badge ─────────────────────────────── */
function updateQuality(len, ec, sz) {
    if (!qualityBadge) return;
    const u = len / MAX_QR;
    const ecS = { H: 4, Q: 3, M: 2, L: 1 }[ec] || 2;
    const szS = sz >= 300 ? 3 : sz >= 220 ? 2 : 1;
    let s = 0;
    s += u < 0.3 ? 3 : u < 0.6 ? 2 : u < 0.85 ? 1 : 0;
    s += ecS >= 3 ? 3 : ecS >= 2 ? 2 : 1;
    s += szS;
    let lvl, lbl;
    if (s >= 8) { lvl = 'excellent'; lbl = 'Excellent scan quality'; }
    else if (s >= 6) { lvl = 'good'; lbl = 'Good scan quality'; }
    else if (s >= 4) { lvl = 'fair'; lbl = 'Fair — increase size or EC'; }
    else { lvl = 'poor'; lbl = 'Poor — reduce data'; }
    qualityBadge.innerHTML = `<span class="quality-badge quality-badge--${lvl}"><span class="quality-badge__dot"></span>${lbl}</span>`;
}

/* ── Type Switching ────────────────────────────── */
function switchType(type) {
    currentType = type;
    typeTabs.forEach(tab => {
        const a = tab.dataset.type === type;
        tab.classList.toggle('is-active', a);
        tab.setAttribute('aria-selected', String(a));
    });

    const ig = $('.input-group');
    const specials = ['wifi', 'email', 'sms', 'vcard'];
    if (ig) ig.style.display = specials.includes(type) ? 'none' : 'flex';

    wifiFields?.classList.toggle('is-visible', type === 'wifi');
    emailFields?.classList.toggle('is-visible', type === 'email');
    smsFields?.classList.toggle('is-visible', type === 'sms');
    vcardFields?.classList.toggle('is-visible', type === 'vcard');

    const ti = QR_TYPES.find(t => t.id === type);
    if (ti && urlInput) {
        urlInput.placeholder = ti.placeholder;
        urlInput.type = type === 'text' ? 'text' : type === 'phone' ? 'tel' : 'url';
    }
    if (type !== 'url' && urlInput) urlInput.value = '';
    updateChar(0);
}

/* ── Options ───────────────────────────────────── */
function getOptions() {
    return {
        size: parseInt(sizeSelect?.value || CONFIG.qr.defaultSize, 10),
        colorDark: colorDarkInput?.value || CONFIG.qr.defaultColorDark,
        colorLight: colorLightInput?.value || CONFIG.qr.defaultColorLight,
        correctLevel: errorLevelSelect?.value || CONFIG.qr.defaultCorrectLevel,
    };
}

/* ── Data Collection ───────────────────────────── */
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
        case 'vcard':
            return {
                firstName: vcardFirst?.value || '', lastName: vcardLast?.value || '',
                phone: vcardPhone?.value || '', email: vcardEmail?.value || '',
                company: vcardCompany?.value || '', title: vcardTitle?.value || '',
                website: vcardWebsite?.value || '',
            };
        default: return { value: urlInput?.value || '' };
    }
}

/* ── Generate ──────────────────────────────────── */
function handleGenerate(overrideUrl) {
    let encoded;
    if (overrideUrl) {
        encoded = overrideUrl;
    } else {
        const r = encodeData(currentType, collectData());
        if (!r.valid) { showToast(r.error, 'error'); urlInput?.classList.add('input--error'); urlInput?.focus(); return; }
        encoded = r.encoded;
    }

    urlInput?.classList.remove('input--error');
    if (['url', 'text', 'phone'].includes(currentType) && !overrideUrl) urlInput.value = encoded;

    const opts = getOptions();
    qrSection.classList.remove('is-hidden');
    const w = qrSection.querySelector('.qr-wrapper');
    w.classList.remove('is-animating'); void w.offsetWidth; w.classList.add('is-animating');

    QREngine.generate(qrContainer, encoded, opts);

    // Apply logo if loaded
    if (hasLogo()) {
        setTimeout(() => {
            const canvas = qrContainer.querySelector('canvas');
            if (canvas) applyLogo(canvas);
        }, 50);
    }

    qrLabel.textContent = encoded;
    updateChar(encoded.length);
    updateQuality(encoded.length, opts.correctLevel, opts.size);
    addToHistory(encoded);
    renderHistory();
    incrementStats();
    isGenerated = true;
    showToast(t('qrGenerated'), 'success');
}

/* ══════════════════════════════════════════════════
   Core Events
   ══════════════════════════════════════════════════ */
typeTabs.forEach(tab => tab.addEventListener('click', () => switchType(tab.dataset.type)));
generateBtn.addEventListener('click', () => handleGenerate());

function onEnter(e) { if (e.key === 'Enter') { e.preventDefault(); handleGenerate(); } }
[urlInput, wifiSsid, wifiPass, emailAddress, smsPhone, vcardFirst, vcardLast, vcardPhone, vcardEmail].forEach(el => el?.addEventListener('keydown', onEnter));

urlInput?.addEventListener('input', () => { urlInput.classList.remove('input--error'); updateChar((urlInput.value || '').length); });

downloadPngBtn?.addEventListener('click', () => {
    if (!isGenerated) { showToast(t('generateFirst'), 'error'); return; }
    showToast(QREngine.downloadPNG(qrContainer) ? t('pngDownloaded') : 'Failed', QREngine.downloadPNG ? 'success' : 'error');
});
downloadSvgBtn?.addEventListener('click', () => {
    if (!isGenerated) { showToast(t('generateFirst'), 'error'); return; }
    showToast(QREngine.downloadSVG(qrContainer) ? t('svgDownloaded') : 'Failed', QREngine.downloadSVG ? 'success' : 'error');
});
shareBtn?.addEventListener('click', async () => {
    if (!isGenerated) { showToast(t('generateFirst'), 'error'); return; }
    const r = await QREngine.shareUrl();
    if (r === 'copied') showToast(t('linkCopied'), 'info');
    else if (r === 'failed') showToast('Share not available', 'error');
});
copyImgBtn?.addEventListener('click', async () => {
    if (!isGenerated) { showToast(t('generateFirst'), 'error'); return; }
    showToast((await QREngine.copyImageToClipboard(qrContainer)) ? t('imageCopied') : 'Copy not supported', 'success');
});

/* ── Options toggle ────────────────────────────── */
optionsToggle?.addEventListener('click', () => {
    const ex = optionsToggle.getAttribute('aria-expanded') === 'true';
    optionsToggle.setAttribute('aria-expanded', String(!ex));
    if (optionsPanel) optionsPanel.style.display = ex ? 'none' : 'grid';
});

colorDarkInput?.addEventListener('input', () => { if (colorDarkValue) colorDarkValue.textContent = colorDarkInput.value; colorPresets.forEach(p => p.classList.remove('is-active')); });
colorLightInput?.addEventListener('input', () => { if (colorLightValue) colorLightValue.textContent = colorLightInput.value; colorPresets.forEach(p => p.classList.remove('is-active')); });

[sizeSelect, errorLevelSelect, colorDarkInput, colorLightInput].forEach(el => {
    el?.addEventListener('change', () => { if (isGenerated && QREngine.getCurrentURL()) handleGenerate(QREngine.getCurrentURL()); });
});

/* ── Color Presets ─────────────────────────────── */
colorPresets.forEach(p => {
    p.addEventListener('click', () => {
        if (colorDarkInput) { colorDarkInput.value = p.dataset.fg; colorDarkValue.textContent = p.dataset.fg; }
        if (colorLightInput) { colorLightInput.value = p.dataset.bg; colorLightValue.textContent = p.dataset.bg; }
        colorPresets.forEach(x => x.classList.remove('is-active'));
        p.classList.add('is-active');
        if (isGenerated && QREngine.getCurrentURL()) handleGenerate(QREngine.getCurrentURL());
    });
});

/* ══════════════════════════════════════════════════
   Logo Embed
   ══════════════════════════════════════════════════ */
logoFileInput?.addEventListener('change', async () => {
    const file = logoFileInput.files[0];
    if (!file) return;
    const img = await loadLogo(file);
    if (img) {
        logoPreview.src = img.src;
        logoPreview.classList.add('is-visible');
        logoRemoveBtn.classList.add('is-visible');
        logoUploadBtn.classList.add('has-logo');
        showToast('Logo added! Re-generate to apply.', 'success');
        if (isGenerated && QREngine.getCurrentURL()) handleGenerate(QREngine.getCurrentURL());
    }
});

logoRemoveBtn?.addEventListener('click', () => {
    removeLogo();
    logoPreview.classList.remove('is-visible');
    logoRemoveBtn.classList.remove('is-visible');
    logoUploadBtn.classList.remove('has-logo');
    logoFileInput.value = '';
    if (isGenerated && QREngine.getCurrentURL()) handleGenerate(QREngine.getCurrentURL());
    showToast('Logo removed', 'info');
});

/* ══════════════════════════════════════════════════
   Smart Paste Detection
   ══════════════════════════════════════════════════ */
urlInput?.addEventListener('paste', () => {
    setTimeout(() => {
        const txt = urlInput.value;
        if (!txt) return;
        const det = detectContentType(txt);
        if (det.type !== currentType && det.type !== 'text') {
            switchType(det.type);
            if (det.type === 'email' && emailAddress) emailAddress.value = det.data.address || '';
            else if (det.type === 'phone') urlInput.value = det.data.value || '';
            else if (det.type === 'wifi') {
                if (wifiSsid) wifiSsid.value = det.data.ssid || '';
                if (wifiPass) wifiPass.value = det.data.password || '';
            }
            if (smartPasteHint) {
                smartPasteHint.textContent = `✨ Detected ${det.type.toUpperCase()}!`;
                smartPasteHint.classList.add('is-visible');
                setTimeout(() => smartPasteHint.classList.remove('is-visible'), 2500);
            }
            showToast(`Smart paste: ${det.type.toUpperCase()}`, 'info');
        }
    }, 50);
});

/* ══════════════════════════════════════════════════
   Drag & Drop
   ══════════════════════════════════════════════════ */
let dragC = 0;
mainCard?.addEventListener('dragenter', (e) => { e.preventDefault(); dragC++; mainCard.classList.add('is-drag-over'); });
mainCard?.addEventListener('dragleave', (e) => { e.preventDefault(); dragC--; if (dragC <= 0) { dragC = 0; mainCard.classList.remove('is-drag-over'); } });
mainCard?.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
mainCard?.addEventListener('drop', (e) => {
    e.preventDefault(); dragC = 0; mainCard.classList.remove('is-drag-over');
    const txt = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
    if (txt) {
        const det = detectContentType(txt.trim());
        switchType(det.type);
        if (['url', 'text', 'phone'].includes(det.type)) urlInput.value = det.data.value || txt;
        else if (det.type === 'email' && emailAddress) emailAddress.value = det.data.address || '';
        handleGenerate();
        showToast('Dropped & generated!', 'success');
    }
});

/* ══════════════════════════════════════════════════
   QR Scanner (Camera)
   ══════════════════════════════════════════════════ */
scanBtn?.addEventListener('click', async () => {
    if (!isCameraAvailable()) { showToast('Camera not available', 'error'); return; }
    scannerOverlay.classList.add('is-visible'); document.body.style.overflow = 'hidden';
    const ok = await startScanner(scannerVideo, scannerCanvas, (data) => {
        scannerOverlay.classList.remove('is-visible'); document.body.style.overflow = '';
        const det = detectContentType(data);
        switchType(det.type);
        if (['url', 'text', 'phone'].includes(det.type)) urlInput.value = data;
        else if (det.type === 'email' && emailAddress) emailAddress.value = det.data.address || '';
        else if (det.type === 'wifi') {
            if (wifiSsid) wifiSsid.value = det.data.ssid || '';
            if (wifiPass) wifiPass.value = det.data.password || '';
        }
        showToast(`Scanned: ${det.type.toUpperCase()}!`, 'success');
        setTimeout(() => handleGenerate(), 200);
    });
    if (!ok) { scannerOverlay.classList.remove('is-visible'); document.body.style.overflow = ''; showToast('Camera denied', 'error'); }
});
scannerClose?.addEventListener('click', () => { stopScanner(scannerVideo); scannerOverlay.classList.remove('is-visible'); document.body.style.overflow = ''; });

/* ══════════════════════════════════════════════════
   Fullscreen Preview
   ══════════════════════════════════════════════════ */
qrSection?.addEventListener('click', (e) => {
    if (!e.target.closest('.qr-wrapper') || !isGenerated) return;
    const d = QREngine.getDataURL(qrContainer);
    if (d && fullscreenOverlay) { fullscreenImg.src = d; fullscreenUrl.textContent = QREngine.getCurrentURL(); fullscreenOverlay.classList.add('is-visible'); document.body.style.overflow = 'hidden'; }
});
fullscreenOverlay?.addEventListener('click', () => { fullscreenOverlay.classList.remove('is-visible'); document.body.style.overflow = ''; });

/* ══════════════════════════════════════════════════
   Templates Modal
   ══════════════════════════════════════════════════ */
function buildTemplatesGrid() {
    if (!templatesGrid) return;
    templatesGrid.innerHTML = TEMPLATES.map(t => `
        <div class="template-card" data-template="${t.id}">
            <span class="template-card__name">${t.name}</span>
            <span class="template-card__desc">${t.description}</span>
        </div>
    `).join('');
}

templatesBtn?.addEventListener('click', () => {
    buildTemplatesGrid();
    templatesOverlay.classList.add('is-visible');
});
templatesClose?.addEventListener('click', () => templatesOverlay.classList.remove('is-visible'));
templatesOverlay?.addEventListener('click', (e) => { if (e.target === templatesOverlay) templatesOverlay.classList.remove('is-visible'); });

templatesGrid?.addEventListener('click', (e) => {
    const card = e.target.closest('.template-card');
    if (!card) return;
    const tpl = TEMPLATES.find(t => t.id === card.dataset.template);
    if (!tpl) return;

    switchType(tpl.type);

    // Apply preset colors
    if (tpl.preset) {
        const presetEl = document.querySelector(`.color-preset[data-preset="${tpl.preset}"]`);
        if (presetEl) presetEl.click();
    }

    // Fill data
    switch (tpl.type) {
        case 'url': case 'text': case 'phone':
            urlInput.value = tpl.data.value || ''; break;
        case 'wifi':
            if (wifiSsid) wifiSsid.value = tpl.data.ssid || '';
            if (wifiPass) wifiPass.value = tpl.data.password || '';
            if (wifiEnc) wifiEnc.value = tpl.data.encryption || 'WPA';
            break;
        case 'email':
            if (emailAddress) emailAddress.value = tpl.data.address || ''; break;
        case 'vcard':
            if (vcardFirst) vcardFirst.value = tpl.data.firstName || '';
            if (vcardLast) vcardLast.value = tpl.data.lastName || '';
            if (vcardPhone) vcardPhone.value = tpl.data.phone || '';
            if (vcardEmail) vcardEmail.value = tpl.data.email || '';
            if (vcardCompany) vcardCompany.value = tpl.data.company || '';
            if (vcardTitle) vcardTitle.value = tpl.data.title || '';
            if (vcardWebsite) vcardWebsite.value = tpl.data.website || '';
            break;
    }

    templatesOverlay.classList.remove('is-visible');
    showToast(`Template: ${tpl.name}`, 'info');

    // Open options panel if not already open
    if (optionsPanel?.style.display === 'none') optionsToggle?.click();
});

/* ══════════════════════════════════════════════════
   Diff Checker
   ══════════════════════════════════════════════════ */
diffBtn?.addEventListener('click', () => {
    diffOverlay.classList.add('is-visible');
    if (isGenerated) diffInput1.value = QREngine.getCurrentURL();
});
diffClose?.addEventListener('click', () => diffOverlay.classList.remove('is-visible'));
diffOverlay?.addEventListener('click', (e) => { if (e.target === diffOverlay) diffOverlay.classList.remove('is-visible'); });

diffCompare?.addEventListener('click', () => {
    const d1 = diffInput1.value.trim();
    const d2 = diffInput2.value.trim();
    if (!d1 || !d2) { showToast('Enter data in both fields', 'error'); return; }

    const match = d1 === d2;
    diffResult.className = `diff-result is-visible diff-result--${match ? 'match' : 'mismatch'}`;
    diffResult.textContent = match ? '✅ Both encode the same data!' : '❌ Different data — QR codes will differ';

    // Render mini QR codes using standalone instances (don't touch main QR state)
    diffQrRow.innerHTML = '<div class="diff-qr-box" id="diffQr1"></div><div class="diff-qr-box" id="diffQr2"></div>';
    new QRCode($('#diffQr1'), { text: d1, width: 140, height: 140, colorDark: '#0a0a1a', colorLight: '#ffffff', correctLevel: getCorrectLevel('M') });
    new QRCode($('#diffQr2'), { text: d2, width: 140, height: 140, colorDark: '#0a0a1a', colorLight: '#ffffff', correctLevel: getCorrectLevel('M') });
});

/* ══════════════════════════════════════════════════
   Branded Frame Download
   ══════════════════════════════════════════════════ */
brandedFrameBtn?.addEventListener('click', () => {
    if (!isGenerated) { showToast(t('generateFirst'), 'error'); return; }
    frameOverlay.classList.add('is-visible');
});
frameClose?.addEventListener('click', () => frameOverlay.classList.remove('is-visible'));
frameOverlay?.addEventListener('click', (e) => { if (e.target === frameOverlay) frameOverlay.classList.remove('is-visible'); });

frameDownload?.addEventListener('click', () => {
    const canvas = qrContainer.querySelector('canvas');
    if (!canvas) return;
    downloadBrandedFrame(canvas, {
        label: frameLabel?.value || 'Scan Me!',
        sublabel: frameSublabel?.value || '',
    });
    frameOverlay.classList.remove('is-visible');
    showToast('Framed PNG downloaded!', 'success');
});

/* ══════════════════════════════════════════════════
   Bulk Export (ZIP)
   ══════════════════════════════════════════════════ */
bulkExportBtn?.addEventListener('click', async () => {
    const history = getHistory();
    if (!history.length) { showToast('No history to export', 'error'); return; }

    if (typeof JSZip === 'undefined') { showToast('JSZip not loaded', 'error'); return; }

    showToast('Creating ZIP...', 'info');

    const zip = new JSZip();
    const folder = zip.folder('qr-codes');
    let csv = 'Index,URL,Timestamp\n';

    for (let i = 0; i < history.length; i++) {
        const item = history[i];
        const url = item.url || item;
        csv += `${i + 1},"${url}","${item.timestamp || ''}"\n`;

        // Generate QR as canvas (standalone, don't touch main QR state)
        const tmpDiv = document.createElement('div');
        tmpDiv.style.cssText = 'position:absolute;left:-9999px';
        document.body.appendChild(tmpDiv);

        new QRCode(tmpDiv, { text: url, width: 300, height: 300, colorDark: '#000000', colorLight: '#ffffff', correctLevel: getCorrectLevel('H') });

        await new Promise(r => setTimeout(r, 150));
        const c = tmpDiv.querySelector('canvas');
        if (c) {
            const base64 = c.toDataURL('image/png').split(',')[1];
            folder.file(`qr-${i + 1}.png`, base64, { base64: true });
        }
        document.body.removeChild(tmpDiv);
    }

    folder.file('manifest.csv', csv);

    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.download = 'qr-codes-export.zip';
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);

    // Restore the current QR by regenerating
    if (isGenerated && QREngine.getCurrentURL()) {
        handleGenerate(QREngine.getCurrentURL());
    }

    showToast(`Exported ${history.length} QR codes!`, 'success');
});

/* ══════════════════════════════════════════════════
   Language Switcher
   ══════════════════════════════════════════════════ */
function buildLangDropdown() {
    if (!langDropdown) return;
    const cur = getLang();
    langDropdown.innerHTML = LANGUAGES.map(l => `
        <button class="lang-option ${l.code === cur ? 'is-active' : ''}" data-lang="${l.code}">
            ${l.label}
        </button>
    `).join('');
}

langTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    langSwitcher.classList.toggle('is-open');
});

langDropdown?.addEventListener('click', (e) => {
    const opt = e.target.closest('.lang-option');
    if (!opt) return;
    setLang(opt.dataset.lang);
    applyTranslations();
    langLabel.textContent = opt.dataset.lang.toUpperCase();
    langSwitcher.classList.remove('is-open');
    buildLangDropdown();
    showToast(`Language: ${opt.textContent.trim()}`, 'success');
});

document.addEventListener('click', () => langSwitcher?.classList.remove('is-open'));

/* ══════════════════════════════════════════════════
   Keyboard Shortcuts
   ══════════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.key === 'g' || e.key === 'G') { e.preventDefault(); urlInput?.focus(); }
    else if (e.key === 'd' || e.key === 'D') { e.preventDefault(); downloadPngBtn?.click(); }
    else if (e.key === 's' || e.key === 'S') { e.preventDefault(); downloadSvgBtn?.click(); }
    else if (e.key === 'f' || e.key === 'F') {
        if (isGenerated) { e.preventDefault(); const d = QREngine.getDataURL(qrContainer); if (d) { fullscreenImg.src = d; fullscreenUrl.textContent = QREngine.getCurrentURL(); fullscreenOverlay.classList.add('is-visible'); document.body.style.overflow = 'hidden'; } }
    }
    else if (e.key === 'Escape') {
        [fullscreenOverlay, scannerOverlay, templatesOverlay, diffOverlay, frameOverlay].forEach(o => {
            if (o?.classList.contains('is-visible')) { o.classList.remove('is-visible'); document.body.style.overflow = ''; }
        });
        if (scannerOverlay?.classList.contains('is-visible')) stopScanner(scannerVideo);
    }
});

/* ══════════════════════════════════════════════════
   History
   ══════════════════════════════════════════════════ */
initHistoryUI((url) => { switchType('url'); urlInput.value = url; handleGenerate(url); });

/* ══════════════════════════════════════════════════
   Init
   ══════════════════════════════════════════════════ */
initLang();
applyTranslations();
langLabel.textContent = getLang().toUpperCase();
buildLangDropdown();
renderStats();

if (!isCameraAvailable() && scanBtn) scanBtn.style.display = 'none';

// Register PWA service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => { });
}

// Auto-generate on load
if (urlInput?.value.trim()) handleGenerate(urlInput.value);
