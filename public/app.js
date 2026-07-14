// Previa Stadium Operations System - App Logic
let currentStep = 0;
let signalsData = null;
let synthesisData = null;

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
    let badgeColor = "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
    if (info.status === 'busy') badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    if (info.status === 'overloaded' || info.status === 'critical') badgeColor = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse";
    
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
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50';
    case 'high':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50';
    case 'medium':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/50';
    default:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50';
  }
}

// Render Synthesis Feed (Center)
function renderSynthesis() {
  if (!synthesisData) return;

  // Render Title and Confidence
  document.getElementById('synthesis-summary-title').textContent = synthesisData.situation_summary;
  document.getElementById('synthesis-confidence').textContent = `${Math.round(synthesisData.overall_confidence * 100)}%`;

  // Render Perspectives Risk Grid
  const perspectivesContainer = document.getElementById('perspectives-container');
  perspectivesContainer.innerHTML = synthesisData.perspectives.map(p => {
    const style = getRiskStyle(p.risk_level);
    return `
      <div class="border rounded-lg p-3 text-center transition-all ${style}">
        <span class="text-[10px] font-semibold uppercase tracking-wider block opacity-70">${p.role}</span>
        <span class="text-xs font-bold block mt-1 uppercase tracking-tight">${p.risk_level}</span>
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

  // Draw Heatmap Mock Grid
  const gates = Object.entries(signalsData.gates);
  mapGrid.innerHTML = gates.map(([name, info]) => {
    let colorClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-500";
    if (info.status === 'busy') colorClass = "bg-amber-500/10 border-amber-500/30 text-amber-500";
    if (info.status === 'overloaded' || info.status === 'critical') colorClass = "bg-red-500/20 border-red-500/50 text-red-500 animate-pulse";
    
    return `
      <div class="border rounded-lg flex flex-col justify-between p-3 font-semibold text-xs ${colorClass}">
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
}

// Render Fan Copilot Thin View (Tab 3)
function renderCopilot() {
  const container = document.getElementById('copilot-container');
  if (!signalsData || !synthesisData) return;

  // Tailored recommendation message to fans
  let statusHeader = "🟢 Operations Normal";
  let statusMessage = "Lusail Stadium is running smoothly. All gates are clear and queue times are under 10 minutes.";
  let actionCard = `
    <div class="border border-emerald-100 dark:border-emerald-950 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-lg p-4 text-xs text-emerald-800 dark:text-emerald-400">
      <strong>Pro Tip:</strong> Arrive through your designated ticket gate. Gate wait times are currently minimal.
    </div>
  `;

  if (currentStep >= 1) {
    statusHeader = "🌧️ Weather Alert: Heavy Rain";
    statusMessage = "Rain has started at Lusail Stadium. concourses and plazas may be wet. Please walk carefully.";
  }
  
  if (currentStep >= 3) {
    statusHeader = "⚠️ Gate 5 Alert: High Congestion";
    statusMessage = "Gate 5 is currently experiencing extreme congestion and wait times exceed 45 minutes. Ticket scanning is slowed down by rain conditions.";
    actionCard = `
      <div class="border border-amber-100 dark:border-amber-950 bg-amber-50/30 dark:bg-amber-950/10 rounded-lg p-4 text-xs text-amber-800 dark:text-amber-400">
        <strong>Required Action:</strong> If you are headed to Gate 5, please follow stadium staff instructions and redirect to <strong>Gate 6</strong>, which has wait times under 5 minutes.
      </div>
    `;
  }

  container.innerHTML = `
    <div class="text-center py-4">
      <h4 class="text-md font-bold text-zinc-900 dark:text-zinc-100">${statusHeader}</h4>
      <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">${statusMessage}</p>
    </div>
    
    <div class="border-t border-borderLight dark:border-borderDark pt-4 space-y-4">
      <h5 class="text-xs font-semibold uppercase text-zinc-400">Personal Advisory</h5>
      ${actionCard}
    </div>
  `;
}

// Initialize Application loading baseline step 0
window.addEventListener('DOMContentLoaded', () => {
  loadScenarioStep(0);
});
