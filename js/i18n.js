/**
 * ══════════════════════════════════════════════════
 *  Multi-Language (i18n) Support
 * ══════════════════════════════════════════════════
 */

export const LANGUAGES = [
    { code: 'en', label: 'English', flag: '' },
    { code: 'es', label: 'Español', flag: '' },
    { code: 'fr', label: 'Français', flag: '' },
    { code: 'hi', label: 'हिन्दी', flag: '' },
    { code: 'de', label: 'Deutsch', flag: '' },
    { code: 'zh', label: '中文', flag: '' },
];

const TRANSLATIONS = {
    en: {
        title: 'QR Code Generator',
        subtitle: 'Generate QR codes for URLs, WiFi, emails, and more — free & private',
        generate: 'Generate',
        scan: 'Scan',
        customize: 'Customize Options',
        size: 'Size',
        errorCorrection: 'Error Correction',
        languages: 'Languages:',
        foreground: 'Foreground',
        background: 'Background',
        quickPresets: 'Quick Presets',
        copy: 'Copy',
        share: 'Share',
        recent: 'Recent',
        clearAll: 'Clear all',
        footer: 'Free & Private — QR Code Generator',
        generateFirst: 'Generate a QR code first',
        pngDownloaded: 'PNG downloaded!',
        svgDownloaded: 'SVG downloaded!',
        qrGenerated: 'QR code generated!',
        linkCopied: 'Link copied to clipboard!',
        imageCopied: 'QR image copied!',
        templates: 'Templates',
        diffChecker: 'Compare',
        brandedDownload: 'Frame',
        bulkExport: 'Export All',
        logoUpload: 'Add Logo',
        removeLogo: 'Remove',
        vcardFirstName: 'First Name',
        vcardLastName: 'Last Name',
        vcardPhone: 'Phone',
        vcardEmail: 'Email',
        vcardCompany: 'Company',
        vcardTitle: 'Job Title',
        vcardWebsite: 'Website',
    },
    es: {
        title: 'Generador de Código QR',
        subtitle: 'Genera códigos QR para URLs, WiFi, correos y más — gratis y privado',
        generate: 'Generar',
        scan: 'Escanear',
        customize: 'Opciones',
        size: 'Tamaño',
        errorCorrection: 'Corrección',
        languages: 'Idiomas:',
        foreground: 'Color Frente',
        background: 'Color Fondo',
        quickPresets: 'Colores Rápidos',
        copy: 'Copiar',
        share: 'Compartir',
        recent: 'Recientes',
        clearAll: 'Borrar todo',
        footer: 'Gratis y Privado — Generador QR',
        generateFirst: 'Genera un código QR primero',
        pngDownloaded: '¡PNG descargado!',
        svgDownloaded: '¡SVG descargado!',
        qrGenerated: '¡Código QR generado!',
        linkCopied: '¡Enlace copiado!',
        imageCopied: '¡Imagen QR copiada!',
        templates: 'Plantillas',
        diffChecker: 'Comparar',
        brandedDownload: 'Marco',
        bulkExport: 'Exportar',
        logoUpload: 'Agregar Logo',
        removeLogo: 'Quitar',
        vcardFirstName: 'Nombre',
        vcardLastName: 'Apellido',
        vcardPhone: 'Teléfono',
        vcardEmail: 'Correo',
        vcardCompany: 'Empresa',
        vcardTitle: 'Cargo',
        vcardWebsite: 'Sitio Web',
    },
    fr: {
        title: 'Générateur de Code QR',
        subtitle: 'Générez des codes QR pour URLs, WiFi, emails et plus — gratuit et privé',
        generate: 'Générer',
        scan: 'Scanner',
        customize: 'Options',
        size: 'Taille',
        errorCorrection: 'Correction',
        languages: 'Langues:',
        foreground: 'Premier plan',
        background: 'Arrière-plan',
        quickPresets: 'Présélections',
        copy: 'Copier',
        share: 'Partager',
        recent: 'Récents',
        clearAll: 'Tout effacer',
        footer: 'Gratuit et Privé — Générateur QR',
        generateFirst: 'Générez un code QR d\'abord',
        pngDownloaded: 'PNG téléchargé !',
        svgDownloaded: 'SVG téléchargé !',
        qrGenerated: 'Code QR généré !',
        linkCopied: 'Lien copié !',
        imageCopied: 'Image QR copiée !',
        templates: 'Modèles',
        diffChecker: 'Comparer',
        brandedDownload: 'Cadre',
        bulkExport: 'Exporter',
        logoUpload: 'Ajouter Logo',
        removeLogo: 'Retirer',
        vcardFirstName: 'Prénom',
        vcardLastName: 'Nom',
        vcardPhone: 'Téléphone',
        vcardEmail: 'Email',
        vcardCompany: 'Entreprise',
        vcardTitle: 'Titre',
        vcardWebsite: 'Site Web',
    },
    hi: {
        title: 'QR कोड जनरेटर',
        subtitle: 'URLs, WiFi, ईमेल और अधिक के लिए QR कोड बनाएं — मुफ्त और निजी',
        generate: 'बनाएं',
        scan: 'स्कैन',
        customize: 'विकल्प',
        size: 'आकार',
        errorCorrection: 'त्रुटि सुधार',
        languages: 'भाषाएं:',
        foreground: 'अग्रभूमि',
        background: 'पृष्ठभूमि',
        quickPresets: 'त्वरित प्रीसेट',
        copy: 'कॉपी',
        share: 'शेयर',
        recent: 'हाल के',
        clearAll: 'सब हटाएं',
        footer: 'मुफ्त और निजी — QR कोड जनरेटर',
        generateFirst: 'पहले QR कोड बनाएं',
        pngDownloaded: 'PNG डाउनलोड हो गया!',
        svgDownloaded: 'SVG डाउनलोड हो गया!',
        qrGenerated: 'QR कोड बन गया!',
        linkCopied: 'लिंक कॉपी हो गया!',
        imageCopied: 'QR इमेज कॉपी हो गई!',
        templates: 'टेम्पलेट',
        diffChecker: 'तुलना',
        brandedDownload: 'फ्रेम',
        bulkExport: 'सब निर्यात',
        logoUpload: 'लोगो जोड़ें',
        removeLogo: 'हटाएं',
        vcardFirstName: 'पहला नाम',
        vcardLastName: 'उपनाम',
        vcardPhone: 'फ़ोन',
        vcardEmail: 'ईमेल',
        vcardCompany: 'कंपनी',
        vcardTitle: 'पद',
        vcardWebsite: 'वेबसाइट',
    },
    de: {
        title: 'QR-Code Generator',
        subtitle: 'QR-Codes für URLs, WiFi, E-Mails und mehr — kostenlos & privat',
        generate: 'Erstellen',
        scan: 'Scannen',
        customize: 'Optionen',
        size: 'Größe',
        errorCorrection: 'Fehlerkorrektur',
        languages: 'Sprachen:',
        foreground: 'Vordergrund',
        background: 'Hintergrund',
        quickPresets: 'Schnellfarben',
        copy: 'Kopieren',
        share: 'Teilen',
        recent: 'Zuletzt',
        clearAll: 'Alle löschen',
        footer: 'Kostenlos & Privat — QR-Code Generator',
        generateFirst: 'Erstelle zuerst einen QR-Code',
        pngDownloaded: 'PNG heruntergeladen!',
        svgDownloaded: 'SVG heruntergeladen!',
        qrGenerated: 'QR-Code erstellt!',
        linkCopied: 'Link kopiert!',
        imageCopied: 'QR-Bild kopiert!',
        templates: 'Vorlagen',
        diffChecker: 'Vergleichen',
        brandedDownload: 'Rahmen',
        bulkExport: 'Exportieren',
        logoUpload: 'Logo hinzufügen',
        removeLogo: 'Entfernen',
        vcardFirstName: 'Vorname',
        vcardLastName: 'Nachname',
        vcardPhone: 'Telefon',
        vcardEmail: 'E-Mail',
        vcardCompany: 'Firma',
        vcardTitle: 'Berufsbezeichnung',
        vcardWebsite: 'Webseite',
    },
    zh: {
        title: 'QR码生成器',
        subtitle: '为网址、WiFi、邮件等生成QR码 — 免费且私密',
        generate: '生成',
        scan: '扫描',
        customize: '自定义选项',
        size: '大小',
        errorCorrection: '纠错级别',
        languages: '语言:',
        foreground: '前景色',
        background: '背景色',
        quickPresets: '快速预设',
        copy: '复制',
        share: '分享',
        recent: '最近',
        clearAll: '全部清除',
        footer: '免费且私密 — QR码生成器',
        generateFirst: '请先生成QR码',
        pngDownloaded: 'PNG已下载！',
        svgDownloaded: 'SVG已下载！',
        qrGenerated: 'QR码已生成！',
        linkCopied: '链接已复制！',
        imageCopied: 'QR图片已复制！',
        templates: '模板',
        diffChecker: '对比',
        brandedDownload: '边框',
        bulkExport: '导出全部',
        logoUpload: '添加Logo',
        removeLogo: '移除',
        vcardFirstName: '名',
        vcardLastName: '姓',
        vcardPhone: '电话',
        vcardEmail: '邮箱',
        vcardCompany: '公司',
        vcardTitle: '职位',
        vcardWebsite: '网站',
    },
};

const LANG_KEY = 'qr_generator_lang';
let currentLang = 'en';

/**
 * Initialize language from localStorage or browser.
 */
export function initLang() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && TRANSLATIONS[saved]) {
        currentLang = saved;
    } else {
        const browserLang = navigator.language?.split('-')[0];
        if (TRANSLATIONS[browserLang]) currentLang = browserLang;
    }
    return currentLang;
}

/**
 * Set language and save preference.
 */
export function setLang(code) {
    if (TRANSLATIONS[code]) {
        currentLang = code;
        localStorage.setItem(LANG_KEY, code);
    }
}

/**
 * Get current language code.
 */
export function getLang() { return currentLang; }

/**
 * Get a translation string.
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
    return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || key;
}

/**
 * Apply translations to all elements with [data-i18n] attribute.
 */
export function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const translation = t(key);
        if (translation) {
            if (el.tagName === 'INPUT' && el.type !== 'hidden') {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        }
    });
}
