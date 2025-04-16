const codeData = {
  'DTU': {
    companyMetrics: {
      totalWasteTrend: 0,
      co2SavedTrend: 0,
      recognitionRate: 70.2,
      recognitionTrend: 0,
      potentialRate: 2.9,
      potentialTrend: 0,
      misclassificationTrend: 0
    },
    'DTU Outside Bins': {
      weeklyWaste: {
        '2025-04-07': 22.6,
        '2025-04-08': 9.4,
        '2025-04-09': 1.2,
        '2025-04-10': 0,
      },
      wasteComposition: [
        { label: 'Cardboard/Paper', value: Number((3.25+4.2).toFixed(2)), color: '#bea064' },
        { label: 'Plastic', value: Number((4.25+3.8).toFixed(2)), color: '#961e82' },
        { label: 'Metal', value: Number((.760+1.70).toFixed(2)), color: '#5a6e78' },
        { label: 'Glass', value: Number((2.540).toFixed(2)), color: '#21b685' },
        { label: 'Bottles/Cans', value: Number((1.72+2.1).toFixed(2)), color: '#93c24c' },
      ]
    },
    'B101 Canteen & Offices': {
      weeklyWaste: {
        '2025-04-08': 20.5,
      },
      wasteComposition: [
        { label: 'Cardboard/Paper', value: Number((2.1).toFixed(2)), color: '#bea064' },
        { label: 'Plastic', value: Number((2.4).toFixed(2)), color: '#961e82' },
        { label: 'Metal', value: Number((0.6).toFixed(2)), color: '#5a6e78' },
        { label: 'Glass', value: Number((0.82).toFixed(2)), color: '#21b685' },
        { label: 'Bottles/Cans', value: Number((0.8).toFixed(2)), color: '#93c24c' },
        { label: 'Styrofoam', value: Number((0.240).toFixed(2)), color: '#961e82' },
        { label: 'Other recyclables', value: Number((1.8).toFixed(2)), color: '#a01e41' }
      ]
    }
  }
};

// Default data if code not found
const defaultData = {
  weeklyWaste: {
    '2025-01-01': 800,
    '2025-01-15': 1200,
    '2025-02-01': 1700,
    '2025-02-15': 2100,
    '2025-03-01': 1900,
    '2025-03-15': 2500,
    '2025-04-01': 3000,
    '2025-04-15': 2700,
    '2025-05-01': 2900,
    '2025-05-15': 3200
  },
  wasteComposition: [
    { label: 'Paper', value: 1, color: '#00a651' },
    { label: 'Plastic', value: 1, color: '#2E96FF' },
    { label: 'Metal', value: 1, color: '#FF6B6B' },
    { label: 'Glass', value: 1, color: '#FFB946' }
  ],
  wasteSources: [
    { label: 'Office', value: 1, color: '#00a651' },
    { label: 'Production', value: 1, color: '#4ECDC4' },
    { label: 'Cafeteria', value: 1, color: '#45B7D1' }
  ],
  impact: {
    totalWaste: 23400,
    totalWasteTrend: 12,
    co2Saved: 16380,
    co2SavedTrend: 8,
    recognitionRate: 92,
    recognitionTrend: 15,
    potentialRate: 88,
    potentialTrend: 10,
    misclassificationRate: 5,
    misclassificationTrend: -2
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  
  // Setup listeners for both pages
  if (document.querySelector('.signin-button')) {
    setupSignInListeners();
  }
  
  if (document.querySelector('.dashboard')) {
    console.log('Dashboard page detected');
    setupDashboardListeners();
    initializeCharts();
    updateImpactStats();
  }
});

function setupSignInListeners() {
  const signInButton = document.querySelector('.signin-button');
  const codeInput = document.querySelector('.signin-input');
  
  if (codeInput) {
    codeInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const code = codeInput.value.trim().toUpperCase();
        localStorage.setItem('trackingCode', code);
        window.location.href = 'dashboard.html';
      }
    });
  }
  
  if (signInButton) {
    signInButton.addEventListener('click', function() {
      const code = codeInput?.value?.trim().toUpperCase() || '';
      localStorage.setItem('trackingCode', code);
      window.location.href = 'dashboard.html';
    });
  }
  
  const demoButton = document.querySelector('.signin-demo');
  if (demoButton) {
    demoButton.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.setItem('trackingCode', 'DEMO123');
      window.location.href = 'dashboard.html';
    });
  }
}

function setupDashboardListeners() {
  const logoutButton = document.querySelector('.dashboard-logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }
  
  setupSourcesExpandButton();
}

// Chart Functions
function initializeCharts() {
  console.log('Initializing charts...');
  
  // Weekly Waste Chart
  const weeklyChart = document.getElementById('weeklyWasteChart');
  if (weeklyChart) {
    console.log('Found weekly chart container');
    renderWeeklyWasteChart();
  } else {
    console.error('Weekly chart container not found');
  }
  
  // Waste Composition Chart
  const compositionChart = document.getElementById('wasteCompositionChart');
  if (compositionChart) {
    console.log('Found composition chart container');
    renderWasteCompositionChart();
  } else {
    console.error('Composition chart container not found');
  }
  
  // Waste Sources Chart
  const sourcesChart = document.getElementById('wasteSourcesChart');
  if (sourcesChart) {
    console.log('Found sources chart container');
    renderWasteSourcesChart();
  } else {
    console.error('Sources chart container not found');
  }
}

function getDataForCurrentCode() {
  const code = localStorage.getItem('trackingCode');
  console.log('Current code:', code);
  return aggregateCompanyData(code) || defaultData;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

function renderWeeklyWasteChart() {
  const container = document.getElementById('weeklyWasteChart');
  const rawData = getDataForCurrentCode().weeklyWaste;
  
  // Convert object to array of [date, value] pairs and sort by date
  const sortedData = Object.entries(rawData)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .slice(-10); // Get last 10 entries

  const barColor = 'rgba(0, 166, 81, 0.85)';
  const values = sortedData.map(([_, value]) => value);
  const maxValue = Math.max(...values);
  
  let html = '';
  sortedData.forEach(([date, value]) => {
    const heightPercentage = (value / maxValue) * 100;
    html += `
      <div class="bar-column">
        <div class="bar" 
             style="height: ${heightPercentage}%; background-color: ${barColor};"
             title="${value} kg">
        </div>
        <div class="bar-label" title="${date}">${formatDate(date)}</div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function renderWasteCompositionChart() {
  const container = document.getElementById('wasteCompositionChart');
  const data = getDataForCurrentCode().wasteComposition;
  renderDonutChart(container, data);
}

function renderWasteSourcesChart() {
  const container = document.getElementById('wasteSourcesChart');
  const data = getDataForCurrentCode().wasteSources;
  renderDonutChart(container, data);
}

function renderDonutChart(container, data) {
  // Sort data by value in descending order
  data.sort((a, b) => b.value - a.value);
  
  const size = 150;
  const radius = 55;
  const holeRadius = 35;
  const center = size / 2;
  
  let total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativeAngle = 0;
  
  let svgPaths = '';
  let legends = '';
  
  data.forEach((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 2 * Math.PI;
    
    const startX = center + radius * Math.sin(cumulativeAngle);
    const startY = center - radius * Math.cos(cumulativeAngle);
    
    const endX = center + radius * Math.sin(cumulativeAngle + angle);
    const endY = center - radius * Math.cos(cumulativeAngle + angle);
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    const startHoleX = center + holeRadius * Math.sin(cumulativeAngle + angle);
    const startHoleY = center - holeRadius * Math.cos(cumulativeAngle + angle);
    
    const endHoleX = center + holeRadius * Math.sin(cumulativeAngle);
    const endHoleY = center - holeRadius * Math.cos(cumulativeAngle);
    
    const path = `
      M ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
      L ${startHoleX} ${startHoleY}
      A ${holeRadius} ${holeRadius} 0 ${largeArcFlag} 0 ${endHoleX} ${endHoleY}
      Z
    `;
    
    const tooltipText = `${item.label}: ${Math.round(percentage * 100)}% (${item.value} kg)`;
    
    svgPaths += `
      <path d="${path}" 
            fill="${item.color}" 
            class="donut-segment"
            data-tooltip="${tooltipText}"
      />`;
    
    legends += `
      <div class="legend-item" data-segment="${index}">
        <div class="legend-color" style="background-color: ${item.color}"></div>
        <div>${item.label} (${Math.round(percentage * 100)}%)</div>
      </div>
    `;
    
    cumulativeAngle += angle;
  });
  
  container.innerHTML = `
    <div class="donut-tooltip"></div>
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${svgPaths}
    </svg>
    <div class="donut-legend">
      ${legends}
    </div>
  `;

  // Add event listeners for hover effects
  const segments = container.querySelectorAll('.donut-segment');
  const tooltip = container.querySelector('.donut-tooltip');
  const legendItems = container.querySelectorAll('.legend-item');

  segments.forEach((segment, index) => {
    segment.addEventListener('mouseenter', (e) => {
      const tooltipText = segment.getAttribute('data-tooltip');
      tooltip.textContent = tooltipText;
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
      
      // Highlight corresponding legend item
      legendItems[index].classList.add('active');
    });

    segment.addEventListener('mousemove', (e) => {
      tooltip.style.left = e.pageX + 'px';
      tooltip.style.top = (e.pageY - 28) + 'px';
    });

    segment.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
      legendItems[index].classList.remove('active');
    });
  });

  // Add hover effects for legend items
  legendItems.forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
      segments[index].classList.add('highlight');
    });
    item.addEventListener('mouseleave', () => {
      segments[index].classList.remove('highlight');
    });
  });
}

// Helper function to adjust color brightness
function adjustColor(color, amount) {
  return '#' + color.replace(/^#/, '').replace(/../g, color => 
    ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
  );
}

function updateImpactStats() {
  const data = getDataForCurrentCode().impact;
  
  // Update total waste
  document.querySelector('.impact-stat:nth-child(1) .metric-value').textContent = 
    `${data.totalWaste} kg`;
  const totalWasteTrend = document.querySelector('.impact-stat:nth-child(1) .trend-indicator');
  if (data.totalWasteTrend) {
    totalWasteTrend.textContent = `↑ ${data.totalWasteTrend}% vs last month`;
    totalWasteTrend.style.display = 'inline-block';
  } else {
    totalWasteTrend.style.display = 'none';
  }

  // Update CO2 saved
  document.querySelector('.impact-stat:nth-child(2) .metric-value').textContent = 
    `${data.co2Saved} kg`;
  const co2Trend = document.querySelector('.impact-stat:nth-child(2) .trend-indicator');
  if (data.co2SavedTrend) {
    co2Trend.textContent = `↑ ${data.co2SavedTrend}% vs last month`;
    co2Trend.style.display = 'inline-block';
  } else {
    co2Trend.style.display = 'none';
  }

  // Update recognition rate
  document.querySelector('.financial-card .impact-stat:nth-child(1) .metric-value').textContent = 
    `${data.recognitionRate}%`;
  const recognitionTrend = document.querySelector('.financial-card .impact-stat:nth-child(1) .trend-indicator');
  if (data.recognitionTrend) {
    recognitionTrend.textContent = `↑ ${data.recognitionTrend}% vs last month`;
    recognitionTrend.style.display = 'inline-block';
  } else {
    recognitionTrend.style.display = 'none';
  }

  // Update potential rate
  document.querySelector('.financial-card .impact-stat:nth-child(2) .metric-value').textContent = 
    `${data.potentialRate}%`;
  const potentialTrend = document.querySelector('.financial-card .impact-stat:nth-child(2) .trend-indicator');

  // Create or update info icon if potential rate is low
  const existingInfoIcon = document.querySelector('.financial-card .impact-stat:nth-child(2) .info-icon');
  if (data.potentialRate < 20) {
    const infoMessage = "Our robot are currently having mechanical issues picking up the waste. This is expected for our first test, and will be massively improved in the coming months.";
    
    if (!existingInfoIcon) {
      const infoIcon = document.createElement('span');
      infoIcon.className = 'info-icon';
      infoIcon.innerHTML = `i<span class="info-tooltip">${infoMessage}</span>`;
      document.querySelector('.financial-card .impact-stat:nth-child(2)').appendChild(infoIcon);
    }
  } else if (existingInfoIcon) {
    existingInfoIcon.remove();
  }

  if (data.potentialTrend) {
    potentialTrend.textContent = `${data.potentialTrend}% improvement possible`;
    potentialTrend.style.display = 'inline-block';
  } else {
    potentialTrend.style.display = 'none';
  }

  // Update misclassification rate
  document.querySelector('.financial-card .impact-stat:nth-child(3) .metric-value').textContent = 
    `${data.misclassificationRate}%`;
  const misclassificationTrend = document.querySelector('.financial-card .impact-stat:nth-child(3) .trend-indicator');
  if (data.misclassificationTrend) {
    misclassificationTrend.textContent = `↓ ${Math.abs(data.misclassificationTrend)}% vs last month`;
    misclassificationTrend.classList.add(data.misclassificationTrend < 0 ? 'positive' : 'negative');
    misclassificationTrend.style.display = 'inline-block';
  } else {
    misclassificationTrend.style.display = 'none';
  }
}

// Add this function at the top level
function generateUniqueColors(count) {
  // Predefined pleasant colors that work well together
  const baseColors = [
    '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#f032e6',
    '#9a6324', '#800000', '#808000', '#000075', '#808080'
  ];
  
  // Shuffle the colors array
  return [...baseColors]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

// Update the aggregateCompanyData function
function aggregateCompanyData(companyCode) {
  const company = codeData[companyCode];
  if (!company) return defaultData;

  const aggregatedData = {
    weeklyWaste: {},
    wasteComposition: {},
    wasteSources: [],
    impact: {
      totalWaste: 0,
      totalWasteTrend: company.companyMetrics?.totalWasteTrend || 0,
      co2Saved: 0,
      co2SavedTrend: company.companyMetrics?.co2SavedTrend || 0,
      recognitionRate: company.companyMetrics?.recognitionRate || 70.2,
      recognitionTrend: company.companyMetrics?.recognitionTrend || 0,
      potentialRate: company.companyMetrics?.potentialRate || 2.9,
      potentialTrend: company.companyMetrics?.potentialTrend || 0,
      misclassificationRate: 0,
      misclassificationTrend: company.companyMetrics?.misclassificationTrend || 0
    }
  };

  // Get locations and their totals (excluding companyMetrics)
  const locations = Object.entries(company)
    .filter(([key, _]) => key !== 'companyMetrics')
    .map(([location, data]) => {
      const locationTotal = Object.values(data.weeklyWaste)
        .reduce((sum, val) => sum + val, 0);
      return { location, total: locationTotal };
    });

  // Generate unique colors for all locations
  const colors = generateUniqueColors(locations.length);

  // Create waste sources with assigned colors
  locations.forEach(({ location, total }, index) => {
    aggregatedData.wasteSources.push({
      label: location,
      value: Number(total.toFixed(1)),
      color: colors[index]
    });
  });

  // Aggregate data from all locations
  Object.entries(company).forEach(([key, data]) => {
    if (key === 'companyMetrics') return; // Skip metrics object

    // Aggregate weekly waste
    Object.entries(data.weeklyWaste).forEach(([date, value]) => {
      aggregatedData.weeklyWaste[date] = (aggregatedData.weeklyWaste[date] || 0) + value;
    });

    // Aggregate waste composition
    data.wasteComposition.forEach(item => {
      if (!aggregatedData.wasteComposition[item.label]) {
        aggregatedData.wasteComposition[item.label] = {
          value: 0,
          color: item.color
        };
      }
      aggregatedData.wasteComposition[item.label].value += item.value;
    });
  });

  // Convert waste composition to array format
  aggregatedData.wasteComposition = Object.entries(aggregatedData.wasteComposition)
    .map(([label, data]) => ({
      label,
      value: Number(data.value.toFixed(2)),
      color: data.color
    }));

  // Calculate total waste
  aggregatedData.impact.totalWaste = aggregatedData.wasteSources
    .reduce((sum, source) => sum + source.value, 0);

  // Calculate misclassification rate
  const totalCompositionWaste = aggregatedData.wasteComposition
    .reduce((sum, item) => sum + item.value, 0);
  aggregatedData.impact.misclassificationRate = Number(
    ((totalCompositionWaste / aggregatedData.impact.totalWaste) * 100).toFixed(1)
  );

  // Calculate CO2 saved using new formula
  aggregatedData.impact.co2Saved = Number(
    (0.7 * (aggregatedData.impact.misclassificationRate / 100) * aggregatedData.impact.totalWaste).toFixed(1)
  );

  return aggregatedData;
}

// Add this after setupDashboardListeners function
function setupSourcesExpandButton() {
  const expandButton = document.querySelector('.expand-button');
  if (expandButton) {
    expandButton.addEventListener('click', () => {
      const code = localStorage.getItem('trackingCode');
      window.location.href = `location-details.html?code=${code}`;
    });
  }
}