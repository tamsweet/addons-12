# Domain Age Lookup Chrome Extension

This folder contains a Manifest V3 Chrome extension that displays the registration age of the domain in the active browser tab. The extension fetches WHOIS information from [whois.vu](https://api.whois.vu/) and presents the creation date and a human-readable age in the popup UI.

## Features

- Works on regular HTTP/HTTPS pages.
- Shows the domain name, original registration date, and the calculated age.
- Indicates when a domain appears to be available for registration.
- Handles error scenarios gracefully with clear user messaging.

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click **Load unpacked** and select the `chrome_domain_age_extension` directory from this repository.
4. Pin the extension icon for quick access and click it while visiting any website to view its domain age.

## API Usage

The extension queries the public `https://api.whois.vu/?q=<domain>` endpoint. The response is cached by the browser for the session, but usage is still subject to the API provider's rate limits and availability. If the API does not return data or the site uses an unsupported protocol, the popup shows an informative error message instead of failing silently.
