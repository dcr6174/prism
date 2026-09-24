# Third-party code and fonts

PRISM bundles these files so it never loads anything from a CDN. Full license texts are in `licenses/`.

| What | Version | File | License |
|---|---|---|---|
| [pdf-lib](https://github.com/Hopding/pdf-lib) | 1.17.1 | `lib/pdf-lib.min.js` | MIT |
| [PDF.js](https://github.com/mozilla/pdf.js) | 5.6.205 | `lib/pdfjs.min.mjs`, `lib/pdfjs.worker.min.mjs` | Apache 2.0 |
| [gifenc](https://github.com/mattdesl/gifenc) | 1.0.3 | `lib/gifenc.js` (wrapped to expose `self.gifenc`) | MIT |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | 2.0.4 | `lib/qrcode.js` | MIT |
| [Inter](https://rsms.me/inter/) via Fontsource | 5.3.0 | `assets/fonts/inter-*.woff2` | SIL OFL 1.1 |
| [OpenDyslexic](https://opendyslexic.org/) via Fontsource | 5.3.0 | `assets/fonts/opendyslexic-*.woff2` | SIL OFL 1.1 |

Free web services used only when you turn the feature on: [Open-Meteo](https://open-meteo.com/) (weather, no key) and [Free Dictionary API](https://dictionaryapi.dev/) (word meanings). No other network calls are made by PRISM itself.

