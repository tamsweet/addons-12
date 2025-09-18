const domainEl = document.getElementById('domain');
const errorEl = document.getElementById('error');
const detailsEl = document.getElementById('details');
const registeredEl = document.getElementById('registered');
const ageEl = document.getElementById('age');
const availabilityEl = document.getElementById('availability');

function formatDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function describeAge(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return 'Unavailable';
  }

  const now = new Date();

  let years = now.getUTCFullYear() - date.getUTCFullYear();
  let months = now.getUTCMonth() - date.getUTCMonth();
  let days = now.getUTCDate() - date.getUTCDate();

  if (days < 0) {
    const prevMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
    days += prevMonth.getUTCDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const parts = [];
  if (years > 0) {
    parts.push(`${years} year${years === 1 ? '' : 's'}`);
  }
  if (months > 0) {
    parts.push(`${months} month${months === 1 ? '' : 's'}`);
  }
  if (days > 0 || parts.length === 0) {
    parts.push(`${days} day${days === 1 ? '' : 's'}`);
  }

  return parts.join(', ');
}

function parseDate(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return convertTimestamp(value);
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return convertTimestamp(numeric);
    }

    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }
  }

  return null;
}

function convertTimestamp(value) {
  const isSeconds = Math.abs(value) < 1e12;
  return new Date(isSeconds ? value * 1000 : value);
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  detailsEl.classList.add('hidden');
}

async function getActiveDomain() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    return null;
  }

  try {
    const tabUrl = new URL(tab.url);
    if (!tabUrl.protocol.startsWith('http')) {
      return null;
    }
    return tabUrl.hostname;
  } catch (error) {
    console.error('Unable to parse tab URL', error);
    return null;
  }
}

async function lookupDomain(domain) {
  const endpoint = `https://api.whois.vu/?q=${encodeURIComponent(domain)}`;
  const response = await fetch(endpoint, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Lookup failed with status ${response.status}`);
  }

  return response.json();
}

function updateAvailability(info) {
  if (typeof info.available === 'string') {
    const normalized = info.available.toLowerCase();
    if (normalized === 'yes' || normalized === 'true') {
      availabilityEl.textContent = 'This domain appears to be available for registration.';
      return;
    }
    if (normalized === 'no' || normalized === 'false') {
      availabilityEl.textContent = 'This domain is registered.';
      return;
    }
  } else if (typeof info.available === 'boolean') {
    availabilityEl.textContent = info.available
      ? 'This domain appears to be available for registration.'
      : 'This domain is registered.';
    return;
  }

  availabilityEl.textContent = '';
}

async function init() {
  const domain = await getActiveDomain();
  if (!domain) {
    domainEl.textContent = 'No website detected';
    showError('Open the extension on a regular website to see its domain age.');
    return;
  }

  domainEl.textContent = domain;

  try {
    const info = await lookupDomain(domain);

    if (info.error) {
      throw new Error(info.error);
    }

    updateAvailability(info);

    const createdDate = parseDate(info.created || info.creation || info.registered);

    registeredEl.textContent = formatDate(createdDate);
    ageEl.textContent = describeAge(createdDate);

    detailsEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
  } catch (error) {
    console.error('Domain lookup failed', error);
    showError('Unable to determine the domain age. Please try again later.');
  }
}

document.addEventListener('DOMContentLoaded', init);
