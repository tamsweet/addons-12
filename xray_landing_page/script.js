const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');
const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('open');
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
    });
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Hero scenario switcher
const scenarioButtons = Array.from(document.querySelectorAll('.scenario-btn'));
const timelineContainer = document.querySelector('[data-timeline]');
const cardTitle = document.querySelector('[data-card-title]');
const aiCallout = document.querySelector('[data-ai-callout]');

const scenarios = {
  local: {
    cardTitle: 'Xray – Local request stream',
    ai: 'Sampling a Laravel webhook locally. AI watches for missing validation and suggests stronger defaults when payloads arrive empty.',
    events: [
      {
        time: '12:21:08',
        title: 'POST /api/orders',
        meta: 'Queued Job dispatched in 24ms',
        badge: { label: 'OK', tone: 'success' },
      },
      {
        time: '12:21:15',
        title: "Cache::remember('customers')",
        meta: 'Hit | payload 2.1KB',
        badge: { label: 'Cache', tone: 'neutral' },
      },
      {
        time: '12:21:21',
        title: 'Xray::inspect($order)',
        code: '{\n  "id": 7132,\n  "status": "awaiting_pickup",\n  "total": 249.99,\n  "customer": "Eunice Reed"\n}',
        badge: { label: 'Pinned', tone: 'focus' },
        focused: true,
      },
      {
        time: '12:21:31',
        title: 'Xray::measure(fn)',
        meta: '42ms | Memory +3MB',
        badge: { label: 'Perf', tone: 'warning' },
      },
    ],
  },
  cloud: {
    cardTitle: 'Xray – Shared cloud session',
    ai: 'Timeline, console, and payloads sync to the cloud. Teammates follow along in real time while AI highlights risky releases.',
    events: [
      {
        time: '09:02:11',
        title: 'Team session started',
        meta: 'Invited: Mahdi, Alana, Jamal',
        badge: { label: 'Live', tone: 'focus' },
      },
      {
        time: '09:02:45',
        title: 'Webhook replay – CheckoutComplete',
        meta: 'Replay #18 • mock services enabled',
        badge: { label: 'Replay', tone: 'neutral' },
      },
      {
        time: '09:03:12',
        title: 'Console annotation',
        meta: '“Null shipping_address after CRM sync” — Mahdi',
        badge: { label: 'Note', tone: 'warning' },
        focused: true,
      },
      {
        time: '09:03:20',
        title: 'Blueprint action: Reset sandbox',
        meta: 'Automation blueprint “Checkout recovery”',
        badge: { label: 'Action', tone: 'success' },
      },
    ],
  },
  production: {
    cardTitle: 'Xray – Production alert triage',
    ai: 'A Safari/iOS checkout spike triggered smart grouping. AI recommends adding a default shipping address or validating client payloads.',
    events: [
      {
        time: '16:44:02',
        title: 'Alert: CheckoutFailure grouped',
        meta: '24 occurrences • 18 impacted users',
        badge: { label: 'Alert', tone: 'warning' },
      },
      {
        time: '16:44:05',
        title: 'AI diff summary',
        code: '{\n  "root_cause": "shipping_address missing",\n  "scope": "Safari on iOS",\n  "recommendation": "Add null coalesce + validation"\n}',
        badge: { label: 'Insight', tone: 'focus' },
        focused: true,
      },
      {
        time: '16:44:08',
        title: 'Slow query detected',
        meta: 'orders_by_region (812ms) • suggested index',
        badge: { label: 'DB', tone: 'neutral' },
      },
      {
        time: '16:44:18',
        title: 'Ticket created in Jira',
        meta: 'AUTO-1325 • Assigned to Alana',
        badge: { label: 'Sync', tone: 'success' },
      },
    ],
  },
};

let activeScenario = 'local';
let scenarioRotation;

const badgeClassMap = {
  success: 'badge-success',
  neutral: 'badge-neutral',
  focus: 'badge-focus',
  warning: 'badge-warning',
};

const renderScenario = (key) => {
  if (!timelineContainer || !cardTitle || !aiCallout) {
    return;
  }
  const scenario = scenarios[key];
  if (!scenario) {
    return;
  }

  cardTitle.textContent = scenario.cardTitle;
  aiCallout.innerHTML = `<h4>AI insight</h4><p>${scenario.ai}</p>`;

  timelineContainer.innerHTML = '';

  scenario.events.forEach((event) => {
    const eventEl = document.createElement('div');
    eventEl.className = 'event';
    if (event.focused) {
      eventEl.classList.add('focused');
    }

    const badgeTone = event.badge?.tone;
    const badgeClass = badgeTone ? badgeClassMap[badgeTone] || 'badge-neutral' : '';
    eventEl.innerHTML = `
      <span class="event-time">${event.time}</span>
      <div>
        <p class="event-title">${event.title}</p>
        ${event.meta ? `<p class="event-meta">${event.meta}</p>` : ''}
        ${event.code ? `<pre><code>${event.code}</code></pre>` : ''}
      </div>
      ${event.badge ? `<span class="badge ${badgeClass}">${event.badge.label}</span>` : ''}
    `;

    timelineContainer.appendChild(eventEl);
  });
};

const updateScenarioButtons = (key) => {
  scenarioButtons.forEach((button) => {
    const isActive = button.dataset.scenario === key;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
    button.setAttribute('tabindex', isActive ? '0' : '-1');
  });
};

const rotateScenario = () => {
  const order = scenarioButtons.map((btn) => btn.dataset.scenario);
  if (!order.length) {
    return;
  }
  const currentIndex = order.indexOf(activeScenario);
  const nextKey = order[(currentIndex + 1) % order.length];
  setScenario(nextKey);
};

const scheduleScenarioRotation = () => {
  clearInterval(scenarioRotation);
  if (prefersReducedMotion.matches || scenarioButtons.length <= 1) {
    return;
  }
  scenarioRotation = setInterval(rotateScenario, 8000);
};

function setScenario(key, options = {}) {
  if (!scenarios[key]) {
    return;
  }
  activeScenario = key;
  renderScenario(key);
  updateScenarioButtons(key);
  if (!options.skipRotation) {
    scheduleScenarioRotation();
  }
}

if (scenarioButtons.length && timelineContainer && cardTitle && aiCallout) {
  setScenario(activeScenario, { skipRotation: true });
  updateScenarioButtons(activeScenario);
  scheduleScenarioRotation();

  scenarioButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setScenario(button.dataset.scenario || 'local');
    });

    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        return;
      }
      event.preventDefault();
      const index = scenarioButtons.indexOf(button);
      if (index === -1) {
        return;
      }
      if (event.key === 'ArrowLeft') {
        const previous = scenarioButtons[(index - 1 + scenarioButtons.length) % scenarioButtons.length];
        previous.focus();
        setScenario(previous.dataset.scenario || 'local');
      } else if (event.key === 'ArrowRight') {
        const next = scenarioButtons[(index + 1) % scenarioButtons.length];
        next.focus();
        setScenario(next.dataset.scenario || 'local');
      } else if (event.key === 'Home') {
        scenarioButtons[0].focus();
        setScenario(scenarioButtons[0].dataset.scenario || 'local');
      } else if (event.key === 'End') {
        const last = scenarioButtons[scenarioButtons.length - 1];
        last.focus();
        setScenario(last.dataset.scenario || 'local');
      }
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(scenarioRotation);
    } else {
      scheduleScenarioRotation();
    }
  });
}

const heroCard = document.querySelector('.hero-card');
if (heroCard && !prefersReducedMotion.matches) {
  heroCard.addEventListener('pointermove', (event) => {
    const bounds = heroCard.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const rotateY = (x - 0.5) * 12;
    const rotateX = (0.5 - y) * 12;
    heroCard.style.setProperty('--tilt-x', rotateX.toFixed(2));
    heroCard.style.setProperty('--tilt-y', rotateY.toFixed(2));
  });

  heroCard.addEventListener('pointerleave', () => {
    heroCard.style.setProperty('--tilt-x', '0');
    heroCard.style.setProperty('--tilt-y', '0');
  });
}

if (typeof prefersReducedMotion.addEventListener === 'function') {
  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      clearInterval(scenarioRotation);
      if (heroCard) {
        heroCard.style.setProperty('--tilt-x', '0');
        heroCard.style.setProperty('--tilt-y', '0');
      }
    } else {
      scheduleScenarioRotation();
    }
  });
}

// Solution tabs
const solutionTabs = Array.from(document.querySelectorAll('.solution-tab'));
const solutionPanels = Array.from(document.querySelectorAll('.solution-panel'));

const setSolutionTab = (key) => {
  solutionTabs.forEach((tab) => {
    const isActive = tab.dataset.tab === key;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  solutionPanels.forEach((panel) => {
    const match = panel.dataset.panel === key;
    panel.classList.toggle('active', match);
    panel.hidden = !match;
  });
};

if (solutionTabs.length && solutionPanels.length) {
  setSolutionTab(solutionTabs[0].dataset.tab || 'local');

  solutionTabs.forEach((tab) => {
    tab.addEventListener('click', () => setSolutionTab(tab.dataset.tab || 'local'));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        return;
      }
      event.preventDefault();
      const index = solutionTabs.indexOf(tab);
      if (index === -1) {
        return;
      }
      if (event.key === 'ArrowLeft') {
        const previous = solutionTabs[(index - 1 + solutionTabs.length) % solutionTabs.length];
        previous.focus();
        setSolutionTab(previous.dataset.tab || 'local');
      } else if (event.key === 'ArrowRight') {
        const next = solutionTabs[(index + 1) % solutionTabs.length];
        next.focus();
        setSolutionTab(next.dataset.tab || 'local');
      } else if (event.key === 'Home') {
        solutionTabs[0].focus();
        setSolutionTab(solutionTabs[0].dataset.tab || 'local');
      } else if (event.key === 'End') {
        const last = solutionTabs[solutionTabs.length - 1];
        last.focus();
        setSolutionTab(last.dataset.tab || 'local');
      }
    });
  });
}

// Pricing toggle
const billingButtons = Array.from(document.querySelectorAll('.billing-btn'));
const soloPrice = document.querySelector('[data-price-solo]');
const studioPrice = document.querySelector('[data-price-studio]');

const formatPrice = (value) => {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  });
  return formatter.format(Number(value));
};

const updatePriceElement = (element, mode) => {
  if (!element) {
    return;
  }
  const value = element.dataset[mode === 'annual' ? 'annual' : 'monthly'];
  const unit = element.dataset[mode === 'annual' ? 'unitAnnual' : 'unitMonth'];
  if (!value || !unit) {
    return;
  }
  element.innerHTML = `$${formatPrice(value)}<span>${unit}</span>`;
};

const setBillingMode = (mode) => {
  billingButtons.forEach((button) => {
    const isActive = button.dataset.billing === mode;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  updatePriceElement(soloPrice, mode);
  updatePriceElement(studioPrice, mode);
};

if (billingButtons.length) {
  setBillingMode('monthly');
  billingButtons.forEach((button) => {
    button.addEventListener('click', () => setBillingMode(button.dataset.billing || 'monthly'));
  });
}

// ROI calculator
const teamSizeInput = document.getElementById('team-size');
const incidentsInput = document.getElementById('incidents');
const hoursInput = document.getElementById('hours');
const teamSizeOutput = document.getElementById('team-size-output');
const incidentsOutput = document.getElementById('incidents-output');
const hoursOutput = document.getElementById('hours-output');
const hoursRecoveredEl = document.getElementById('hours-recovered');
const weeksRecoveredEl = document.getElementById('weeks-recovered');
const valueRecoveredEl = document.getElementById('value-recovered');

const formatNumber = (value, options = {}) => {
  return new Intl.NumberFormat('en-US', options).format(value);
};

const updateRoiOutputs = () => {
  if (!teamSizeInput || !incidentsInput || !hoursInput) {
    return;
  }
  const teamSize = Number(teamSizeInput.value);
  const incidents = Number(incidentsInput.value);
  const hours = Number(hoursInput.value);

  const annualHours = Math.round(teamSize * incidents * hours * 12);
  const weeks = Math.round((annualHours / 40) * 10) / 10;
  const value = annualHours * 60; // assume $60/hour blended rate

  if (teamSizeOutput) {
    teamSizeOutput.textContent = `${teamSize} ${teamSize === 1 ? 'developer' : 'developers'}`;
  }
  if (incidentsOutput) {
    incidentsOutput.textContent = `${incidents} ${incidents === 1 ? 'incident' : 'incidents'}`;
  }
  if (hoursOutput) {
    hoursOutput.textContent = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  if (hoursRecoveredEl) {
    hoursRecoveredEl.textContent = formatNumber(annualHours);
  }
  if (weeksRecoveredEl) {
    weeksRecoveredEl.textContent = formatNumber(weeks, { maximumFractionDigits: 1 });
  }
  if (valueRecoveredEl) {
    valueRecoveredEl.textContent = formatNumber(value, { maximumFractionDigits: 0 });
  }
};

if (teamSizeInput && incidentsInput && hoursInput) {
  ['input', 'change'].forEach((eventName) => {
    teamSizeInput.addEventListener(eventName, updateRoiOutputs);
    incidentsInput.addEventListener(eventName, updateRoiOutputs);
    hoursInput.addEventListener(eventName, updateRoiOutputs);
  });
  updateRoiOutputs();
}

// FAQ accordion
const faqItems = Array.from(document.querySelectorAll('.faq-item'));

if (faqItems.length) {
  faqItems.forEach((item, index) => {
    const trigger = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!trigger || !answer) {
      return;
    }

    if (index === 0) {
      trigger.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = `${answer.scrollHeight}px`;
      item.classList.add('open');
    } else {
      trigger.setAttribute('aria-expanded', 'false');
      answer.style.maxHeight = '0px';
    }

    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      item.classList.toggle('open', !expanded);
      answer.style.maxHeight = !expanded ? `${answer.scrollHeight}px` : '0px';
    });
  });
}
