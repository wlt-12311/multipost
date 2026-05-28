# MultiPost — Write Once, Publish Everywhere

> AI-powered content repurposing tool for creators and indie makers.
> Write once, adapt for Twitter, LinkedIn, Xiaohongshu, WeChat, and more.

![screenshot](https://img.shields.io/badge/status-alpha-yellow)
![license](https://img.shields.io/badge/license-MIT-green)
[![GitHub stars](https://img.shields.io/github/stars/yuzhiran/multipost?style=social)](https://github.com/yuzhiran/multipost)
[![Try Cloud Version](https://img.shields.io/badge/☁️-Try_Cloud_Version-blue)](https://multiscene.yzrcloud.cn)

## ✨ Features

- **One input, multiple outputs** — Write source content once, AI adapts it for 6+ platforms
- **5 tone styles** — Professional, Casual, Storytelling, Educational, Promotional
- **Multi-language** — Generate in Chinese or English (more coming)
- **BYOK** — Use your own OpenAI / DeepSeek / compatible API key. Data stays in your browser.
- **Voiceover** — Text-to-speech for scene dubbing (requires API key with TTS support)
- **Standalone** — No backend, no database, no account needed

## 🚀 Quick Start

```bash
npm install
npm run dev      # http://localhost:1420
```

Or build for production:

```bash
npm run build
npm run preview  # Serve the built files locally
```

## 🛠️ Configuration

**BYOK mode (free):** Enter your own API key in the app UI. Supports OpenAI, DeepSeek, or any OpenAI-compatible API.

**Cloud mode (one-click):** [Try the hosted version →](https://multiscene.yzrcloud.cn) with pre-configured AI models. No API key needed.

## 📦 Supported Platforms

| Platform | Output Format | 
|----------|--------------|
| Twitter / X | Thread (numbered posts) |
| LinkedIn | Narrative article |
| Xiaohongshu | Casual post with emojis |
| WeChat (公众号) | Long-form article |
| ProductHunt | Launch title + description |
| README | Full markdown |

## 🏗️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 7 | Build tool |
| CSS Modules | Scoped styling |

## 🌐 Deployment

MultiPost is a static SPA — deploy anywhere:

```bash
npm run build
# Upload dist/ to any static host (GitHub Pages, Vercel, Netlify, Nginx, etc.)
```

## 📄 License

MIT © 2026 Yuzhiran Tech

---

*Built with ❤️ for indie makers and creators.*
