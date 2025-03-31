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
  }
});

function setupSignInListeners() {
  const signInButton = document.querySelector('.signin-button');
  if (signInButton) {
    signInButton.addEventListener('click', function() {
      window.location.href = 'dashboard.html';
    });
  }
  
  const demoButton = document.querySelector('.signin-demo');
  if (demoButton) {
    demoButton.addEventListener('click', function(e) {
      e.preventDefault();
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

function renderWeeklyWasteChart() {
  const container = document.getElementById('weeklyWasteChart');
  const data = [0.8, 1.2, 1.7, 2.1, 1.9, 2.5, 3.0, 2.7, 2.9, 3.2];
  
  // Single green color with slight transparency
  const barColor = 'rgba(0, 166, 81, 0.85)';  // #00a651 with 0.85 opacity
  
  // Generate last 10 weeks of dates
  const getDateRange = (weeksAgo) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - (weeksAgo * 7));
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    
    const formatDate = (date) => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
    
    return `${formatDate(startDate)}-${formatDate(endDate)}`;
  };

  const dateRanges = Array.from({length: 10}, (_, i) => getDateRange(9 - i));
  const maxValue = Math.max(...data);
  
  let html = '';
  data.forEach((value, index) => {
    const heightPercentage = (value / maxValue) * 100;
    html += `
      <div class="bar-column">
        <div class="bar" 
             style="height: ${heightPercentage}%; background-color: ${barColor};"
             title="${value} tons">
        </div>
        <div class="bar-label" title="${dateRanges[index]}">${dateRanges[index]}</div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function renderWasteCompositionChart() {
  const container = document.getElementById('wasteCompositionChart');
  const data = [
    { label: 'Paper', value: 40, color: '#00a651' },     // Green
    { label: 'Plastic', value: 30, color: '#2E96FF' },   // Blue
    { label: 'Metal', value: 15, color: '#FF6B6B' },     // Red
    { label: 'Glass', value: 15, color: '#FFB946' }      // Orange
  ];
  
  renderDonutChart(container, data);
}

function renderWasteSourcesChart() {
  const container = document.getElementById('wasteSourcesChart');
  const data = [
    { label: 'Office', value: 45, color: '#00a651' },    // Green
    { label: 'Production', value: 35, color: '#4ECDC4' }, // Teal
    { label: 'Cafeteria', value: 20, color: '#45B7D1' }  // Light Blue
  ];
  
  renderDonutChart(container, data);
}

function renderDonutChart(container, data) {
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
    
    const tooltipText = `${item.label}: ${Math.round(percentage * 100)}% (${item.value} tons)`;
    
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