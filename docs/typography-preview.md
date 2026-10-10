# Typography preview

The global Typography button opens an accessible native dialog with radio choices for Fraunces + Manrope, Poppins, Satoshi, and Instrument Serif + Instrument Sans. Selection changes the shared heading/body CSS tokens; it does not change saved designs, exported card fonts or publication data. The current pairing remains the default. Choices persist only in browser localStorage and can be reset. Telugu keeps Noto Sans Telugu.

Poppins 400/500/600/700 and Instrument Sans 400–700 plus Instrument Serif normal/italic 400 use seven local Latin WOFF2 assets (104,700 bytes total) from the official Google Fonts CSS API. Their SIL OFL licenses are included beside the files. Fonts load when used, without additional preloads.

Satoshi uses the official Fontshare CDN variable webfont; the proprietary font binary is not redistributed in this repository. Its official ITF FFL text is included for reference. This preview changes the site's interface only and does not offer Satoshi for generating user content. Source: https://www.fontshare.com/fonts/satoshi and https://api.fontshare.com/v2/css?f[]=satoshi@variable&display=swap . Satoshi requires a network connection to Fontshare; sans-serif fallback applies if unavailable.

The panel scrolls on short/mobile screens, supports radio keyboard navigation, Escape and native modal focus handling, and respects reduced motion. Shared CSS tokens allow route changes without remounting the controller.
