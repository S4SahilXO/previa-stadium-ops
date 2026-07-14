// Previa Stadium Operations System - App Logic
let currentStep = 0;
let signalsData = null;
let synthesisData = null;
let activeProjection = 'current';

// Tab Management
const tabs = {
  command: { btn: 'tab-command', view: 'view-command' },
  crowd: { btn: 'tab-crowd', view: 'view-crowd' },
  copilot: { btn: 'tab-copilot', view: 'view-copilot' }
};

Object.keys(tabs).forEach(key => {
  const tab = tabs[key];
  document.getElementById(tab.btn).addEventListener('click', () => {
    switchTab(key);
  });
});

function switchTab(activeKey) {
  Object.keys(tabs).forEach(key => {
    const tab = tabs[key];
    const btn = document.getElementById(tab.btn);
    const view = document.getElementById(tab.view);
    
    if (key === activeKey) {
      btn.className = "px-4 py-1.5 rounded-md font-medium text-brand dark:text-white bg-white dark:bg-zinc-800 shadow-sm transition-all";
      view.classList.remove('hidden');
    } else {
      btn.className = "px-4 py-1.5 rounded-md font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all";
      view.classList.add('hidden');
    }
  });

  if (activeKey === 'crowd') {
    renderCrowdPredictor();
  }
}

// Theme Management
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
});

// Scenario Controller Buttons
document.querySelectorAll('.scenario-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const step = parseInt(e.currentTarget.getAttribute('data-step'), 10);
    loadScenarioStep(step);
  });
});

function updateScenarioButtons() {
  document.querySelectorAll('.scenario-btn').forEach(btn => {
    const step = parseInt(btn.getAttribute('data-step'), 10);
    if (step === currentStep) {
      btn.className = "scenario-btn px-3 py-1.5 text-xs font-semibold rounded bg-brand text-white shadow-sm border border-brand/20";
    } else {
      btn.className = "scenario-btn px-3 py-1.5 text-xs font-semibold rounded bg-cardLight dark:bg-cardDark text-zinc-600 dark:text-zinc-300 border border-borderLight dark:border-borderDark hover:bg-zinc-50 dark:hover:bg-zinc-800";
    }
  });
}

// Load Scenario Step
async function loadScenarioStep(step) {
  currentStep = step;
  updateScenarioButtons();
  
  // Show Loading ping on AI state
  const aiStatus = document.getElementById('ai-status');
  aiStatus.className = "flex items-center space-x-2 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/50";
  aiStatus.querySelector('span span').nextElementSibling.className = "relative inline-flex rounded-full h-2 w-2 bg-amber-500";
  aiStatus.querySelector('.font-medium').textContent = "AI Analyzing...";

  try {
    const [signalsRes, synthesisRes] = await Promise.all([
      fetch(`/api/signals?step=${step}`),
      fetch(`/api/synthesis?step=${step}`)
    ]);

    signalsData = await signalsRes.json();
    synthesisData = await synthesisRes.json();

    // Render components
    renderSignals();
    renderSynthesis();
    renderCopilot();
    if (!document.getElementById('view-crowd').classList.contains('hidden')) {
      renderCrowdPredictor();
    }

    // Success Status update
    setTimeout(() => {
      aiStatus.className = "flex items-center space-x-2 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50";
      aiStatus.querySelector('span span').nextElementSibling.className = "relative inline-flex rounded-full h-2 w-2 bg-emerald-500";
      aiStatus.querySelector('.font-medium').textContent = "AI Live";
    }, 400);

  } catch (err) {
    console.error('Error fetching data:', err);
    aiStatus.className = "flex items-center space-x-2 text-xs bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-900/50";
    aiStatus.querySelector('.font-medium').textContent = "AI Degraded";
  }
}

// Render Signals (Left Column)
function renderSignals() {
  const container = document.getElementById('signals-container');
  if (!signalsData) return;

  const gatesList = Object.entries(signalsData.gates).map(([name, info]) => {
    let badgeColor = "border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400";
    if (info.status === 'busy') badgeColor = "border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400";
    if (info.status === 'overloaded' || info.status === 'critical') badgeColor = "border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 animate-pulse";
    
    return `
      <div class="flex items-center justify-between border-b border-borderLight dark:border-borderDark py-2 text-xs">
        <span class="font-medium">${name}</span>
        <div class="flex items-center space-x-2">
          <span class="text-zinc-500">${info.wait_time}m wait</span>
          <span class="px-1.5 py-0.5 rounded font-semibold ${badgeColor}">${info.status}</span>
        </div>
      </div>
    `;
  }).join('');

  const weather = signalsData.weather;
  const transport = signalsData.transport;
  const incidents = signalsData.incidents;

  container.innerHTML = `
    <!-- Weather Card -->
    <div class="bg-cardLight dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-lg p-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="font-semibold text-xs text-zinc-500 uppercase">Weather Sensor</span>
        <i data-lucide="${weather.rain_rate > 0 ? 'cloud-rain' : 'sun'}" class="h-4 w-4 text-zinc-400"></i>
      </div>
      <div class="flex items-baseline space-x-2">
        <span class="text-2xl font-bold">${weather.temperature}°C</span>
        <span class="text-xs text-zinc-500">${weather.status}</span>
      </div>
      <div class="text-[11px] text-zinc-500 space-y-1">
        <div class="flex justify-between"><span>Rain Rate:</span><span>${weather.rain_rate} mm/hr</span></div>
        <div class="flex justify-between"><span>Wind:</span><span>${weather.wind_speed} km/h</span></div>
        <div class="flex justify-between"><span>Visibility:</span><span>${weather.visibility}</span></div>
      </div>
    </div>

    <!-- Gate Queue Card -->
    <div class="bg-cardLight dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-lg p-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="font-semibold text-xs text-zinc-500 uppercase">Gate Wait Times</span>
        <i data-lucide="users" class="h-4 w-4 text-zinc-400"></i>
      </div>
      <div class="divide-y divide-borderLight dark:divide-borderDark">
        ${gatesList}
      </div>
    </div>

    <!-- Transport & Incident Signals -->
    <div class="bg-cardLight dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-lg p-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="font-semibold text-xs text-zinc-500 uppercase">Infrastructure</span>
        <i data-lucide="activity" class="h-4 w-4 text-zinc-400"></i>
      </div>
      <div class="text-[11px] text-zinc-500 space-y-2">
        <div class="flex justify-between"><span>Metro Arrivals:</span><span>every ${transport.metro_interval_mins}m</span></div>
        <div class="flex justify-between"><span>Bus Delay:</span><span>${transport.bus_arrival_delay_mins}m</span></div>
        <div class="flex justify-between"><span>Parking Occupancy:</span><span>${transport.parking_occupancy_pct}%</span></div>
        <div class="flex justify-between pt-2 border-t border-borderLight dark:border-borderDark">
          <span>Active Incidents:</span>
          <span class="font-semibold ${incidents.active_count > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}">
            ${incidents.active_count} Alert(s)
          </span>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

// Risk levels badge styling
function getRiskStyle(level) {
  switch (level.toLowerCase()) {
    case 'critical':
      return 'border-red-500/20 text-red-600 dark:text-red-400 bg-red-500/5';
    case 'high':
      return 'border-orange-500/20 text-orange-600 dark:text-orange-400 bg-orange-500/5';
    case 'medium':
      return 'border-yellow-500/20 text-yellow-600 dark:text-yellow-400 bg-yellow-500/5';
    default:
      return 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5';
  }
}

// Render Synthesis Feed (Center)
function renderSynthesis() {
  if (!synthesisData) return;

  // Render Title and Confidence
  document.getElementById('synthesis-summary-title').textContent = synthesisData.situation_summary;
  document.getElementById('synthesis-confidence').textContent = `${Math.round(synthesisData.overall_confidence * 100)}%`;

  // Render Latency and AI Execution Mode
  const modeText = synthesisData.ai_mode === 'active' ? 'Active' : 'Fallback';
  const latencyText = synthesisData.latency_ms ? ` • Latency: ${(synthesisData.latency_ms / 1000).toFixed(2)}s (${modeText})` : '';
  document.getElementById('synthesis-header-subtitle').innerHTML = `Orchestrated AI Assessment${latencyText}`;

  // Render Perspectives Risk Grid
  const perspectivesContainer = document.getElementById('perspectives-container');
  perspectivesContainer.innerHTML = synthesisData.perspectives.map(p => {
    const style = getRiskStyle(p.risk_level);
    let indicatorColor = "bg-emerald-500";
    if (p.risk_level === 'critical') indicatorColor = "bg-red-500";
    if (p.risk_level === 'high') indicatorColor = "bg-orange-500";
    if (p.risk_level === 'medium') indicatorColor = "bg-yellow-500";
    
    return `
      <div class="border rounded-lg p-3 flex flex-col justify-between items-center transition-all ${style}">
        <span class="text-[10px] font-semibold uppercase tracking-wider block opacity-70">${p.role}</span>
        <div class="flex items-center space-x-1.5 mt-2">
          <span class="h-1.5 w-1.5 rounded-full ${indicatorColor}"></span>
          <span class="text-xs font-bold block uppercase tracking-tight">${p.risk_level}</span>
        </div>
      </div>
    `;
  }).join('');

  // Render Recommendations Cards
  const recommendationsContainer = document.getElementById('recommendations-container');
  recommendationsContainer.innerHTML = synthesisData.recommended_actions.map(rec => {
    return `
      <div onclick="selectRecommendation(${rec.rank})" class="border border-borderLight dark:border-borderDark hover:border-zinc-400 dark:hover:border-zinc-500 bg-cardLight dark:bg-cardDark rounded-xl p-5 shadow-sm cursor-pointer transition-all flex items-start justify-between group">
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <span class="h-5 w-5 bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand flex items-center justify-center text-xs font-bold rounded-full">
              ${rec.rank}
            </span>
            <h4 class="font-semibold text-zinc-950 dark:text-zinc-100 group-hover:text-brand transition-colors text-sm">
              ${rec.action}
            </h4>
          </div>
          <p class="text-zinc-500 dark:text-zinc-400 text-xs pl-7">
            Impact: <span class="text-zinc-900 dark:text-zinc-200 font-medium">${rec.expected_impact}</span>
          </p>
        </div>
        <div class="text-right flex flex-col justify-between items-end h-full">
          <span class="text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
            Conf: ${Math.round(rec.confidence * 100)}%
          </span>
          <i data-lucide="chevron-right" class="h-4 w-4 text-zinc-400 mt-4 group-hover:translate-x-1 transition-transform"></i>
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

// Select Recommendation to display detail panel
window.selectRecommendation = function(rank) {
  if (!synthesisData) return;
  const rec = synthesisData.recommended_actions.find(r => r.rank === rank);
  if (!rec) return;

  const detailPanel = document.getElementById('detail-panel');
  const detailContent = document.getElementById('detail-content');

  // Match the perspective that relates to the recommendation
  let matchedAgentAssessment = "No matching primary perspective alert.";
  const keywords = rec.action.toLowerCase() + " " + rec.reasoning.toLowerCase();
  
  synthesisData.perspectives.forEach(p => {
    if (keywords.includes(p.role) || (p.role === 'crowd' && keywords.includes('gate'))) {
      matchedAgentAssessment = `<strong>${p.role.toUpperCase()} AGENT Assessment:</strong> ${p.assessment}`;
    }
  });

  detailContent.innerHTML = `
    <div class="space-y-4">
      <span class="text-xs font-bold text-brand uppercase tracking-wider">RANK #${rec.rank} RECOMMENDED ACTION</span>
      <h5 class="text-lg font-bold leading-snug">${rec.action}</h5>
      
      <div class="bg-zinc-50 dark:bg-zinc-900/50 border border-borderLight dark:border-borderDark rounded-lg p-4 space-y-2 text-xs">
        <div class="flex justify-between">
          <span class="text-zinc-500">Confidence Score:</span>
          <span class="font-bold text-brand">${Math.round(rec.confidence * 100)}%</span>
        </div>
        <div class="flex justify-between">
          <span class="text-zinc-500">Expected Impact:</span>
          <span class="font-medium text-zinc-900 dark:text-zinc-100">${rec.expected_impact}</span>
        </div>
      </div>

      <div class="space-y-2 text-xs">
        <h6 class="font-bold text-zinc-400 uppercase tracking-wide">Explanation / Reasoning</h6>
        <p class="text-zinc-600 dark:text-zinc-300 leading-relaxed">${rec.reasoning}</p>
      </div>

      <div class="space-y-2 text-xs border-t border-borderLight dark:border-borderDark pt-4 mt-4">
        <h6 class="font-bold text-zinc-400 uppercase tracking-wide">Synthesized Agent Signal</h6>
        <p class="text-zinc-500 dark:text-zinc-400 italic">${matchedAgentAssessment}</p>
      </div>
    </div>
  `;

  detailPanel.classList.remove('hidden');
};

document.getElementById('close-detail').addEventListener('click', () => {
  document.getElementById('detail-panel').classList.add('hidden');
});

// Render Predictive Crowd Predictor View (Tab 2)
function renderCrowdPredictor() {
  if (!signalsData) return;

  const mapGrid = document.getElementById('crowd-map-grid');
  const metricsContainer = document.getElementById('crowd-metrics-container');

  // Determine active dataset based on projection timeline selection
  let activeGatesData = signalsData.gates;
  if (activeProjection === '15m' && signalsData.predictions) {
    activeGatesData = signalsData.predictions['15m'].gates;
  } else if (activeProjection === '30m' && signalsData.predictions) {
    activeGatesData = signalsData.predictions['30m'].gates;
  }

  const gates = Object.entries(activeGatesData);

  // Draw Heatmap Mock Grid
  mapGrid.innerHTML = gates.map(([name, info]) => {
    let colorClass = "border border-emerald-500/20 bg-emerald-500/5 text-emerald-500";
    if (info.status === 'busy') colorClass = "border border-amber-500/20 bg-amber-500/5 text-amber-500";
    if (info.status === 'overloaded' || info.status === 'critical') colorClass = "border border-red-500/20 bg-red-500/5 text-red-500 animate-pulse";
    
    return `
      <div class="rounded-lg flex flex-col justify-between p-3 font-semibold text-xs transition-colors duration-150 ${colorClass}">
        <span>${name}</span>
        <div class="text-right">
          <span class="text-[10px] block opacity-80">Wait time</span>
          <span class="text-lg font-bold">${info.wait_time}m</span>
        </div>
      </div>
    `;
  }).join('');

  // Draw list metrics
  metricsContainer.innerHTML = gates.map(([name, info]) => {
    const capWidth = Math.min(100, Math.round(info.density * 100));
    let barColor = "bg-emerald-500";
    if (info.status === 'busy') barColor = "bg-amber-500";
    if (info.status === 'overloaded' || info.status === 'critical') barColor = "bg-red-500";

    return `
      <div class="space-y-1 text-xs">
        <div class="flex justify-between text-zinc-500">
          <span>${name} density</span>
          <span>${Math.round(info.density * 100)}%</span>
        </div>
        <div class="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div class="h-full ${barColor} rounded-full" style="width: ${capWidth}%"></div>
        </div>
      </div>
    `;
  }).join('');

  // Render SVG Trend Chart
  renderPredictiveChart();
}

function renderPredictiveChart() {
  const chartContainer = document.getElementById('crowd-trend-chart-container');
  if (!signalsData) return;

  const stepsList = [
    Math.max(0, currentStep - 2),
    Math.max(0, currentStep - 1),
    currentStep,
    Math.min(4, currentStep + 1),
    Math.min(4, currentStep + 2)
  ];

  const labels = ['-30m', '-15m', 'Now', '+15m', '+30m'];
  const waitTimes = stepsList.map(s => {
    if (s === 0) return 10;
    if (s === 1) return 13;
    if (s === 2) return 22;
    if (s === 3) return 48;
    return 52;
  });

  const containerWidth = chartContainer.clientWidth || 600;
  const containerHeight = 160;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const graphWidth = containerWidth - paddingLeft - paddingRight;
  const graphHeight = containerHeight - paddingTop - paddingBottom;
  const maxValue = 60;

  const points = waitTimes.map((val, idx) => {
    const x = paddingLeft + (idx / 4) * graphWidth;
    const y = paddingTop + graphHeight - (val / maxValue) * graphHeight;
    return { x, y, value: val };
  });

  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const bottomY = paddingTop + graphHeight;
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${bottomY} L ${points[0].x.toFixed(1)} ${bottomY} Z`;

  const gridLines = [0, 20, 40, 60].map(val => {
    const y = paddingTop + graphHeight - (val / maxValue) * graphHeight;
    return `
      <line x1="${paddingLeft}" y1="${y}" x2="${containerWidth - paddingRight}" y2="${y}" stroke="currentColor" class="text-zinc-200 dark:text-zinc-800" stroke-width="1" stroke-dasharray="2,4" />
      <text x="${paddingLeft - 10}" y="${y + 4}" font-size="10" class="fill-zinc-400 font-medium" text-anchor="end">${val}m</text>
    `;
  }).join('');

  const xAxisLabels = labels.map((label, idx) => {
    const x = points[idx].x;
    const isCurrent = idx === 2;
    const textClass = isCurrent ? 'fill-brand font-bold' : 'fill-zinc-400 font-medium';
    return `<text x="${x}" y="${containerHeight - 8}" font-size="10" class="${textClass}" text-anchor="middle">${label}</text>`;
  }).join('');

  const verticalLine = `
    <line x1="${points[2].x}" y1="${paddingTop}" x2="${points[2].x}" y2="${bottomY}" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="3,3" />
  `;

  const markers = points.map((p, idx) => {
    const isFuture = idx > 2;
    const markerColor = isFuture ? '#f59e0b' : '#2563eb';
    return `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="${markerColor}" stroke="currentColor" class="text-white dark:text-zinc-900" stroke-width="1.5" />
      <text x="${p.x}" y="${p.y - 8}" font-size="9" font-weight="bold" class="fill-zinc-700 dark:fill-zinc-300" text-anchor="middle">${p.value}m</text>
    `;
  }).join('');

  chartContainer.innerHTML = `
    <svg class="w-full h-full overflow-visible" viewBox="0 0 ${containerWidth} ${containerHeight}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2563eb" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#2563eb" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaPath}" fill="url(#chart-grad)" />
      <path d="${linePath}" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" />
      ${verticalLine}
      ${xAxisLabels}
      ${markers}
    </svg>
  `;
}

// Phone clock logic
function updateCopilotClock() {
  const clockEl = document.getElementById('copilot-time');
  if (clockEl) {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hrs}:${mins}`;
  }
}
setInterval(updateCopilotClock, 1000);

// Render Fan Copilot Thin View (Tab 3)
function renderCopilot() {
  const container = document.getElementById('copilot-container');
  if (!signalsData || !synthesisData) return;

  const currentStepNum = signalsData.step;

  // 1. Status Alert Banner
  let alertBg = "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400";
  let alertTitle = "Operations Normal";
  let alertDesc = "Lusail Stadium is running smoothly. All gates are clear and wait times are under 10 minutes.";
  
  if (currentStepNum >= 1 && currentStepNum < 3) {
    alertBg = "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400";
    alertTitle = "Weather Advisory: Wet Concourses";
    alertDesc = "Heavy rain is causing slick surfaces near entrances. Please use caution and watch your step.";
  } else if (currentStepNum >= 3) {
    alertBg = "border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-400";
    alertTitle = "Diversion: Gate 6 Recommended";
    alertDesc = "Gate 5 is currently overloaded with wait times exceeding 45 minutes. Divert to Gate 6 to save up to 40 minutes.";
  }

  // 2. SVG Route Map Visualizer
  let svgMap = "";
  if (currentStepNum < 3) {
    // Normal routing to Gate 5
    svgMap = `
      <svg viewBox="0 0 280 120" class="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-borderLight dark:border-borderDark rounded-xl select-none">
        <!-- Nodes -->
        <circle cx="40" cy="60" r="16" fill="#e4e4e7" class="dark:fill-zinc-800" />
        <text x="40" y="63" font-size="9" font-weight="bold" fill="currentColor" class="text-zinc-600 dark:text-zinc-400" text-anchor="middle">Plaza</text>

        <circle cx="160" cy="30" r="16" fill="#10b981" fill-opacity="0.1" stroke="#10b981" stroke-width="1.5" />
        <text x="160" y="33" font-size="9" font-weight="bold" fill="#10b981" text-anchor="middle">Gate 5</text>

        <circle cx="160" cy="90" r="16" fill="#e4e4e7" class="dark:fill-zinc-800" />
        <text x="160" y="93" font-size="9" font-weight="bold" fill="currentColor" class="text-zinc-500 dark:text-zinc-400" text-anchor="middle">Gate 6</text>

        <!-- Path to Gate 5 -->
        <path d="M 58 50 Q 100 20 140 28" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4,4" class="animate-dash-flow" />
        <polygon points="144,29 136,24 139,32" fill="#10b981" />

        <text x="100" y="22" font-size="8" font-weight="bold" fill="#10b981" text-anchor="middle">Direct Entry</text>
      </svg>
    `;
  } else {
    // Congested Gate 5, divert to Gate 6
    svgMap = `
      <svg viewBox="0 0 280 120" class="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-borderLight dark:border-borderDark rounded-xl select-none">
        <!-- Nodes -->
        <circle cx="40" cy="60" r="16" fill="#e4e4e7" class="dark:fill-zinc-800" />
        <text x="40" y="63" font-size="9" font-weight="bold" fill="currentColor" class="text-zinc-600 dark:text-zinc-400" text-anchor="middle">Plaza</text>

        <circle cx="160" cy="30" r="16" fill="#ef4444" fill-opacity="0.1" stroke="#ef4444" stroke-width="1.5" />
        <text x="160" y="33" font-size="9" font-weight="bold" fill="#ef4444" text-anchor="middle">Gate 5</text>
        <line x1="154" y1="24" x2="166" y2="36" stroke="#ef4444" stroke-width="2" />
        <line x1="166" y1="24" x2="154" y2="36" stroke="#ef4444" stroke-width="2" />

        <circle cx="160" cy="90" r="16" fill="#2563eb" fill-opacity="0.1" stroke="#2563eb" stroke-width="1.5" />
        <text x="160" y="93" font-size="9" font-weight="bold" fill="#2563eb" text-anchor="middle">Gate 6</text>

        <!-- Paths -->
        <path d="M 58 50 Q 100 20 140 28" fill="none" stroke="#ef4444" stroke-width="1.5" opacity="0.4" />
        <path d="M 58 70 Q 100 100 140 92" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="4,4" class="animate-dash-flow" />
        <polygon points="144,91 139,88 136,96" fill="#2563eb" />

        <text x="100" y="106" font-size="8" font-weight="bold" fill="#2563eb" text-anchor="middle">Divert to Gate 6</text>
        <text x="100" y="22" font-size="8" font-weight="bold" fill="#ef4444" text-anchor="middle" opacity="0.8">Overloaded</text>
      </svg>
    `;
  }

  // 3. Transit Summary Widget
  const weather = signalsData.weather;
  const transport = signalsData.transport;
  const weatherAlertText = weather.rain_rate > 0 ? `${weather.status} (${weather.rain_rate}mm/h)` : "Clear";
  const busAlertText = transport.bus_arrival_delay_mins > 0 ? `Delayed +${transport.bus_arrival_delay_mins}m` : "On Schedule";

  container.innerHTML = `
    <!-- Advisory Header -->
    <div class="border rounded-2xl p-4 space-y-2 transition-colors ${alertBg}">
      <h4 class="text-xs font-extrabold uppercase tracking-wide">${alertTitle}</h4>
      <p class="text-[10px] leading-relaxed opacity-90">${alertDesc}</p>
    </div>

    <!-- Dynamic Map Card -->
    <div class="space-y-2">
      <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Visual Walk Route</span>
      ${svgMap}
    </div>

    <!-- Live Transit Card -->
    <div class="bg-white dark:bg-zinc-900 border border-borderLight dark:border-borderDark rounded-2xl p-4 space-y-3 shadow-sm">
      <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Live Connections</span>
      <div class="text-[10px] space-y-2">
        <div class="flex justify-between border-b border-borderLight dark:border-borderDark pb-1.5">
          <span class="text-zinc-500">Metro Train:</span>
          <span class="font-bold text-zinc-900 dark:text-zinc-100">Every ${transport.metro_interval_mins} mins</span>
        </div>
        <div class="flex justify-between border-b border-borderLight dark:border-borderDark pb-1.5">
          <span class="text-zinc-500">Terminal Bus:</span>
          <span class="font-bold ${transport.bus_arrival_delay_mins > 0 ? 'text-amber-500' : 'text-zinc-900 dark:text-zinc-100'}">${busAlertText}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-zinc-500">Local Weather:</span>
          <span class="font-bold ${weather.rain_rate > 0 ? 'text-blue-500' : 'text-zinc-900 dark:text-zinc-100'}">${weatherAlertText}</span>
        </div>
      </div>
    </div>
  `;
}

// Setup timeline projection listeners
function updateProjectionButtons() {
  document.querySelectorAll('.proj-btn').forEach(btn => {
    const proj = btn.id.replace('proj-', '');
    if (proj === activeProjection) {
      btn.className = "proj-btn px-3 py-1.5 rounded font-medium bg-white dark:bg-zinc-800 dark:text-white shadow-sm transition-all text-brand";
    } else {
      btn.className = "proj-btn px-3 py-1.5 rounded font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all";
    }
  });
}

document.querySelectorAll('.proj-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    activeProjection = e.currentTarget.id.replace('proj-', '');
    updateProjectionButtons();
    renderCrowdPredictor();
  });
});

// Initialize Application loading baseline step 0
window.addEventListener('DOMContentLoaded', () => {
  loadScenarioStep(0);
  updateProjectionButtons();
  updateCopilotClock();
});
