# 📱 QR Code Generator

A beautifully crafted, ridiculously fast, and 100% free QR code generator. Generate, customize, and download QR codes for your URLs instantly. No ads, no tracking, and no expiring links.

![QR Code Generator](https://raw.githubusercontent.com/richujoseph/QR_Generator/main/assets/preview.png)

## 📖 The "Why I Built This" Story (A True Tragedy)

Picture this: It's 2026. I'm at a crowded tech meetup, trying to share the link to my newly deployed portfolio with a recruiter.  
*"Just scan my QR code,"* I confidently say, pulling up a generator on my phone.

I type in my URL. I click generate. 
Suddenly, I'm redirected to a 15-second unskippable ad for a mobile game about rescuing a king who is somehow always drowning in a small room. Then, I'm asked to create an account. Finally, I get the QR code. The recruiter scans it. 

It works! We part ways.

Two days later, the recruiter tries to scan the downloaded QR code to show my portfolio to their team. It redirects them to a "Your Free Trial Has Expired. Pay $9.99/mo to reactivate this QR code" page. 

I didn't get the job.

I decided right then and there: **Never again.** I spent the entire weekend building this tool. It's just HTML, CSS, and JS. It runs entirely in your browser. It doesn't track you, it doesn't show you ads, and most importantly, the QR codes **never expire** because they are static and hold your actual URL, not some sketchy tracking redirect.

So, please, use it. Share your Wi-Fi passwords, your portfolios, your menus, and your mixtapes. Stay safe out there.

---

## ✨ Features

- **⚡ Instant Generation:** Type a URL and watch the QR code appear instantly.
- **🎨 Customization:** Change foreground and background colors to match your brand.
- **📏 Size Options:** From tiny (150px) to massive (400px), we've got you covered.
- **🛡️ Error Correction:** Adjust the error correction level (L, M, Q, H) to ensure scannability even if part of the code is blocked.
- **💾 Multiple Formats:** Download your QR code as a crisp `PNG` or scalable `SVG`.
- **📋 Copy to Clipboard:** One-click copy the QR image directly to your clipboard.
- **🕰️ History Panel:** Automatically saves your recently generated QR codes in your local storage so you don't lose track of them.
- **📱 Fully Responsive:** Looks gorgeous on desktop, tablet, and mobile.
- **🌓 Dark Mode UI:** Because everything looks better with a sleek, glassmorphism dark theme.

## 🛠️ Built With

- **HTML5:** Semantic and accessible structure.
- **Vanilla CSS3:** Modern features, custom properties (variables), Flexbox, Grid, and Glassmorphism effects.
- **Vanilla JavaScript (ES6+):** Modular file structure, event delegation, and Web APIs (Clipboard API, Web Share API, localStorage).
- **[QRCode.js](https://github.com/davidshimjs/qrcodejs):** A lightweight, reliable library for generating the actual QR codes.

## 🚀 Getting Started

Since this is a client-side only application, getting started is incredibly simple!

### Option 1: Live Demo
*(Add your live hosting link here, e.g., Vercel, Netlify, or GitHub Pages)*
[Live Demo](https://your-live-link.com)

### Option 2: Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/richujoseph/QR_Generator.git
   ```
2. Navigate to the project directory:
   ```bash
   cd QR_Generator
   ```
3. Open `index.html` in your favorite web browser! Alternatively, use a local server like Live Server (VS Code) or Python's `http.server`:
   ```bash
   python3 -m http.server 8080
   ```
   Then visit `http://localhost:8080` in your browser.

## 📁 File Structure

The project has been refactored into a highly modular and maintainable structure:

```
QR_Generator/
├── index.html                      # The main HTML structure
├── css/                            # Styling files
│   ├── variables.css               # Design tokens (colors, spacing, etc.)
│   ├── reset.css                   # Browser normalization
│   ├── layout.css                  # Base layout and background
│   ├── responsive.css              # Media queries
│   └── components/                 # Component-specific styles (buttons, card, etc.)
└── js/                             # JavaScript modules
    ├── app.js                      # Main orchestrator
    ├── config.js                   # Application configuration & defaults
    ├── validators.js               # URL validation logic
    ├── qr-engine.js                # Wrapper for QRCode.js generation & downloads
    ├── history.js                  # LocalStorage history management
    ├── history-ui.js               # History DOM rendering
    └── toast.js                    # Toast notification manager
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/richujoseph/QR_Generator/issues).

## 📝 License

This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.
