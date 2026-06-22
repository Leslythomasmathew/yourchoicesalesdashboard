/* ==========================================================================
   YOUR CHOICE BOUTIQUE ANALYTICS - ENGINE & DATA JS
   Features: Indian retail data synthesis, INR format (en-IN), Segmented filtering
             (Gents/Ladies) & Category filtering (Formal/Casual/Festive/Active),
             Zonal territory filters, custom SVG spline charts (smooth curves),
             detailed Profit & Loss calculation model.
   ========================================================================= */

// Establish static system anchor date (matching mock environment timeline)
const CURRENT_DATE = new Date("2026-06-03T12:00:00");

// --- 1. MOCK DATA SYNTHESIS ENGINE (INR & BOUTIQUE CATEGORIES CUSTOMIZED) ---
const generateHistoricalData = () => {
  const sessions = [];
  const firstNames = ["Amit", "Priya", "Rajesh", "Deepika", "Rohan", "Sunita", "Arjun", "Ananya", "Vivek", "Kavita", "Vikram", "Divya", "Sanjay", "Neha", "Suresh", "Meera", "Manish", "Pooja", "Anil", "Swati"];
  const lastNames = ["Sharma", "Patel", "Verma", "Iyer", "Mehta", "Nair", "Reddy", "Sen", "Gupta", "Joshi", "Rao", "Singh", "Choudhury", "Bose", "Pillai", "Mishra", "Das", "Pandey", "Kulkarni", "Trivedi"];
  
  const regions = ["north", "south", "east", "west"];
  const segments = ["gents", "ladies"];
  const categories = ["formal", "casual", "festive", "active"];
  const channels = ["Instagram", "TikTok", "Pinterest", "Direct"];
  
  const startDate = new Date(CURRENT_DATE);
  startDate.setMonth(startDate.getMonth() - 17); // Go back 18 months
  
  let orderIncrement = 52940;
  
  for (let d = new Date(startDate); d <= CURRENT_DATE; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    
    // Festive season spikes (Diwali in Oct/Nov, Spring Eid/Weddings in Mar/Apr)
    let baseVisitors = 260 + Math.floor(Math.random() * 160);
    if (isWeekend) baseVisitors += 60;
    
    const month = d.getMonth();
    if (month === 9 || month === 10) baseVisitors = Math.floor(baseVisitors * 1.45);
    if (month === 2 || month === 3) baseVisitors = Math.floor(baseVisitors * 1.25);
    if (month === 6 || month === 7) baseVisitors = Math.floor(baseVisitors * 0.85);

    for (let s = 0; s < baseVisitors; s++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      const segment = segments[Math.floor(Math.random() * segments.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const channel = channels[Math.floor(Math.random() * channels.length)];
      
      // Conversion factors (Instagram and Direct convert highest)
      let conversionChance = 0.015; 
      if (channel === "Instagram") conversionChance += 0.018;
      if (channel === "Direct") conversionChance += 0.012;
      if (segment === "ladies" && isWeekend) conversionChance += 0.005;
      if (region === "west") conversionChance += 0.004; // Mumbai hub
      
      const isConverted = Math.random() < conversionChance;
      let orderDetails = null;
      
      if (isConverted) {
        orderIncrement++;
        const customerName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        
        // Price scales depending on Gents vs Ladies segment and specific Category
        let baseAmount = 1500;
        if (category === "formal") baseAmount = segment === "gents" ? 2600 : 3200;
        else if (category === "casual") baseAmount = segment === "gents" ? 1300 : 1600;
        else if (category === "festive") baseAmount = segment === "gents" ? 4000 : 6500; // Festive lehengas/sherwanis are higher value
        else if (category === "active") baseAmount = segment === "gents" ? 1100 : 1300;
        
        const amount = parseFloat((baseAmount + (Math.random() * baseAmount * 0.5)).toFixed(2));
        
        // Fit & Sizing returns simulation
        // Formal (strict fit) has higher returns. Casual is forgiving and returns less.
        let returnChance = 0.12; 
        if (category === "formal") returnChance = 0.18;
        else if (category === "casual") returnChance = 0.08;
        else if (category === "festive") returnChance = 0.14;
        else if (category === "active") returnChance = 0.11;
        
        // Ladies generally experience higher fit discrepancies
        if (segment === "ladies") returnChance += 0.05;
        // Zonal logistics returns factor
        if (region === "east") returnChance += 0.03;
        
        const isReturned = Math.random() < returnChance;
        
        let status = "shipped";
        if (isReturned) {
          status = "returned";
        } else if (Math.random() < 0.08) {
          status = "processing";
        }
        
        orderDetails = {
          orderId: `YC-${orderIncrement}`,
          customer: customerName,
          amount: amount,
          status: status
        };
      }
      
      sessions.push({
        date: new Date(d),
        converted: isConverted,
        region: region,
        segment: segment,
        category: category,
        channel: channel,
        orderDetails: orderDetails
      });
    }
  }
  return sessions;
};

// Global dashboard database
const dashboardData = generateHistoricalData();

// --- 2. STATE MANAGER ---
const state = {
  timeframe: "ytd",
  segment: "all",
  category: "all",
  region: "all",
  theme: "dark",
  searchQuery: "",
  sortColumn: "date",
  sortDirection: "desc",
  currentPage: 1,
  pageSize: 10
};

// --- 3. FILTERING & REDUCTION UTILITIES ---
const getDateRanges = (timeframe, anchorDate) => {
  const current = new Date(anchorDate);
  let start = new Date(anchorDate);
  let prevStart = new Date(anchorDate);
  let prevEnd = new Date(anchorDate);
  
  switch(timeframe) {
    case "today":
      start.setHours(0, 0, 0, 0);
      prevStart.setDate(prevStart.getDate() - 1);
      prevStart.setHours(0,0,0,0);
      prevEnd.setDate(prevEnd.getDate() - 1);
      prevEnd.setHours(23,59,59,999);
      break;
    case "7d":
      start.setDate(start.getDate() - 7);
      start.setHours(0,0,0,0);
      prevStart.setDate(prevStart.getDate() - 14);
      prevStart.setHours(0,0,0,0);
      prevEnd.setDate(prevEnd.getDate() - 8);
      prevEnd.setHours(23,59,59,999);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      start.setHours(0,0,0,0);
      prevStart.setDate(prevStart.getDate() - 60);
      prevStart.setHours(0,0,0,0);
      prevEnd.setDate(prevEnd.getDate() - 31);
      prevEnd.setHours(23,59,59,999);
      break;
    case "ytd":
    default:
      start = new Date(current.getFullYear(), 0, 1);
      prevStart = new Date(current.getFullYear() - 1, 0, 1);
      prevEnd = new Date(current.getFullYear() - 1, current.getMonth(), current.getDate());
      break;
  }
  return { start, end: current, prevStart, prevEnd };
};

const getFilteredData = (timeframe, segment, category, region) => {
  const ranges = getDateRanges(timeframe, CURRENT_DATE);
  
  const currentPeriodData = dashboardData.filter(s => {
    if (s.date < ranges.start || s.date > ranges.end) return false;
    if (segment !== "all" && s.segment !== segment) return false;
    if (category !== "all" && s.category !== category) return false;
    if (region !== "all" && s.region !== region) return false;
    return true;
  });
  
  const prevPeriodData = dashboardData.filter(s => {
    if (s.date < ranges.prevStart || s.date > ranges.prevEnd) return false;
    if (segment !== "all" && s.segment !== segment) return false;
    if (category !== "all" && s.category !== category) return false;
    if (region !== "all" && s.region !== region) return false;
    return true;
  });
  
  return {
    current: currentPeriodData,
    previous: prevPeriodData,
    ranges: ranges
  };
};

// Computes core business metrics, including Zonal Profit & Loss
const calculateKPIs = (dataList) => {
  const totalVisitors = dataList.length;
  const convertedSessions = dataList.filter(s => s.converted);
  const totalOrders = convertedSessions.length;
  
  const totalRevenue = convertedSessions.reduce((sum, s) => sum + s.orderDetails.amount, 0);
  const conversionRate = totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0;
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const returnedOrders = convertedSessions.filter(s => s.orderDetails.status === "returned").length;
  const returnRate = totalOrders > 0 ? (returnedOrders / totalOrders) * 100 : 0;
  
  // Profit & Loss calculation model:
  // - Shipped/Processing: profit margin is 40% (COGS is 45%, logistics/ops shipping is 15%)
  // - Returned orders: Customer is refunded (0 revenue), but we suffer a net loss:
  //   loss = return logistics fee (₹150) + original shipping overhead (15% of price) + restocking margin loss (5% of price)
  let totalProfit = 0;
  convertedSessions.forEach(s => {
    const amount = s.orderDetails.amount;
    if (s.orderDetails.status === "returned") {
      const returnOverhead = 150 + (amount * 0.15) + (amount * 0.05);
      totalProfit -= returnOverhead;
    } else {
      const orderProfit = amount * 0.40;
      totalProfit += orderProfit;
    }
  });
  
  return {
    revenue: totalRevenue,
    conversion: conversionRate,
    aov: aov,
    returns: returnRate,
    profit: totalProfit,
    orders: totalOrders,
    visitors: totalVisitors,
    returnedOrders: returnedOrders
  };
};

const getPercentChange = (currentVal, prevVal) => {
  if (prevVal === 0) return currentVal > 0 ? 100 : 0;
  return ((currentVal - prevVal) / prevVal) * 100;
};

// --- SPLINE PATH GENERATOR (CURVED SLIDING LINE ALGORITHM WITH DISTINCT BENDS) ---
const getSvgPath = (points) => {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  if (points.length === 2) {
    const p0 = points[0];
    const p1 = points[1];
    const cp1x = p0[0] + (p1[0] - p0[0]) * 0.25;
    const cp1y = p0[1];
    const cp2x = p1[0] - (p1[0] - p0[0]) * 0.25;
    const cp2y = p1[1];
    return `M ${p0[0].toFixed(1)},${p0[1].toFixed(1)} C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
  }
  
  let d = `M ${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  const tension = 0.22; // Smooth curve factor
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;
    
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
    
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension;
    
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  
  return d;
};


// --- 4. RENDER KPI TILES (INR COMMAS, SYMBOLS & NEGATIVE LOSS HANDLING) ---
const updateKPICards = (currentKPI, prevKPI) => {
  const cards = [
    {
      id: "revenue",
      curr: currentKPI.revenue,
      prev: prevKPI.revenue,
      format: (val) => '₹' + Math.round(val).toLocaleString('en-IN')
    },
    {
      id: "conversion",
      curr: currentKPI.conversion,
      prev: prevKPI.conversion,
      format: (val) => `${val.toFixed(2)}%`
    },
    {
      id: "profit",
      curr: currentKPI.profit,
      prev: prevKPI.profit,
      format: (val) => {
        const isLoss = val < 0;
        const prefix = isLoss ? '-₹' : '₹';
        return prefix + Math.round(Math.abs(val)).toLocaleString('en-IN');
      }
    },
    {
      id: "returns",
      curr: currentKPI.returns,
      prev: prevKPI.returns,
      format: (val) => `${val.toFixed(1)}%`
    }
  ];
  
  cards.forEach(card => {
    const valueEl = document.getElementById(`val-${card.id}`);
    valueEl.textContent = card.format(card.curr);
    
    // Dynamic styling if Net Profit turns into a Loss (negative)
    if (card.id === "profit") {
      const titleEl = document.getElementById("title-profit");
      if (card.curr < 0) {
        valueEl.classList.add("loss-text");
        titleEl.textContent = "Net Loss";
        titleEl.style.color = "var(--color-danger)";
      } else {
        valueEl.classList.remove("loss-text");
        titleEl.textContent = "Net Profit";
        titleEl.style.color = "var(--text-muted)";
      }
    }
    
    const diffPercent = getPercentChange(card.curr, card.prev);
    const trendElem = document.getElementById(`trend-${card.id}`);
    const indicator = trendElem.querySelector(".trend-indicator");
    
    const isInverse = (card.id === "returns");
    const isPositiveChange = diffPercent >= 0;
    
    let isGoodIndicator = isPositiveChange;
    if (isInverse) isGoodIndicator = !isPositiveChange;
    
    const displayClass = isGoodIndicator ? "trend-indicator plus" : "trend-indicator minus";
    const arrowIcon = isPositiveChange ? `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
    ` : `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
      </svg>
    `;
    
    indicator.className = displayClass;
    indicator.innerHTML = `
      ${arrowIcon}
      <span class="trend-percent">${Math.abs(diffPercent).toFixed(1)}%</span>
    `;
  });
};

const drawSparklines = (currentSessions, ranges) => {
  const kpis = ["revenue", "conversion", "profit", "returns"];
  
  const daysDiff = Math.ceil((ranges.end - ranges.start) / (1000 * 60 * 60 * 24));
  const stepsCount = Math.min(daysDiff + 1, 15);
  const stepDays = Math.max(1, Math.floor(daysDiff / stepsCount));
  
  kpis.forEach(kpi => {
    const sparkSvg = document.getElementById(`spark-${kpi}`);
    if (!sparkSvg) return;
    
    const values = [];
    
    for (let i = 0; i <= stepsCount; i++) {
      const stepStart = new Date(ranges.start);
      stepStart.setDate(stepStart.getDate() + (i * stepDays));
      const stepEnd = new Date(stepStart);
      stepEnd.setDate(stepEnd.getDate() + stepDays);
      
      const slice = currentSessions.filter(s => s.date >= stepStart && s.date < stepEnd);
      const metrics = calculateKPIs(slice);
      
      if (kpi === "revenue") values.push(metrics.revenue);
      else if (kpi === "conversion") values.push(metrics.conversion);
      else if (kpi === "profit") values.push(metrics.profit);
      else if (kpi === "returns") values.push(metrics.returns);
    }
    
    const w = 150;
    const h = 40;
    const padding = 2;
    
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;
    
    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * w;
      const y = h - padding - (((val - minVal) / range) * (h - padding * 2));
      return [x, y];
    });
    
    // Render curved spline sparkline paths
    const pathD = getSvgPath(points);
    
    sparkSvg.innerHTML = `
      <defs>
        <linearGradient id="sparkGrad-${kpi}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent-primary)" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="var(--accent-primary)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${pathD}" fill="none" />
      <path d="${pathD} L ${w},${h} L 0,${h} Z" fill="url(#sparkGrad-${kpi})" stroke="none" opacity="0.4" />
    `;
  });
};

// --- 5. RENDER DYNAMIC SVG CHARTS (CURVED spline) ---

// A. Area & Line Chart (Revenue & Profit Paths)
const drawRevenueChart = (sessions, ranges) => {
  const container = document.getElementById("revenue-trend-container");
  if (!container) return;
  
  const containerWidth = container.clientWidth || 700;
  const containerHeight = container.clientHeight || 280;
  
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  
  const chartW = containerWidth - paddingLeft - paddingRight;
  const chartH = containerHeight - paddingTop - paddingBottom;
  
  let periods = [];
  const start = new Date(ranges.start);
  const end = new Date(ranges.end);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) {
    for (let h = 0; h < 24; h += 2) {
      periods.push({
        label: `${h}:00`,
        start: new Date(new Date(start).setHours(h, 0, 0, 0)),
        end: new Date(new Date(start).setHours(h + 2, 0, 0, 0))
      });
    }
  } else if (diffDays <= 7) {
    for (let d = 0; d < 7; d++) {
      const stepStart = new Date(start);
      stepStart.setDate(stepStart.getDate() + d);
      const stepEnd = new Date(stepStart);
      stepEnd.setDate(stepEnd.getDate() + 1);
      periods.push({
        label: stepStart.toLocaleDateString('en-US', { weekday: 'short' }),
        start: stepStart,
        end: stepEnd
      });
    }
  } else if (diffDays <= 31) {
    const steps = 6;
    for (let s = 0; s < steps; s++) {
      const stepStart = new Date(start);
      stepStart.setDate(stepStart.getDate() + (s * 5));
      const stepEnd = new Date(stepStart);
      stepEnd.setDate(stepEnd.getDate() + 5);
      periods.push({
        label: `${stepStart.getMonth() + 1}/${stepStart.getDate()}`,
        start: stepStart,
        end: stepEnd
      });
    }
  } else {
    const currentYear = CURRENT_DATE.getFullYear();
    const monthsLimit = CURRENT_DATE.getMonth();
    
    for (let m = 0; m <= monthsLimit; m++) {
      const monthStart = new Date(currentYear, m, 1);
      const monthEnd = new Date(currentYear, m + 1, 0, 23, 59, 59, 999);
      periods.push({
        label: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        start: monthStart,
        end: monthEnd
      });
    }
  }
  
  let cumulativeRevenue = 0;
  let cumulativeProfit = 0;
  
  const chartData = periods.map((period) => {
    const periodSessions = sessions.filter(s => s.date >= period.start && s.date < period.end);
    const kpis = calculateKPIs(periodSessions);
    
    cumulativeRevenue += kpis.revenue;
    cumulativeProfit += kpis.profit;
    
    return {
      label: period.label,
      revenue: cumulativeRevenue,
      profit: cumulativeProfit,
      periodRevenue: kpis.revenue,
      periodProfit: kpis.profit,
      orders: kpis.orders
    };
  });
  
  // Calculate vertical coordinate anchors
  const maxVal = Math.max(...chartData.map(d => Math.max(d.revenue, d.profit))) * 1.05 || 10000;
  const minVal = Math.min(0, ...chartData.map(d => d.profit)) * 1.05; // support negative profits
  const valRange = maxVal - minVal;
  
  const getX = (idx) => paddingLeft + (idx / (chartData.length - 1 || 1)) * chartW;
  const getY = (val) => containerHeight - paddingBottom - ((val - minVal) / valRange) * chartH;
  
  const yZero = getY(0);
  const zeroPercent = Math.min(100, Math.max(0, ((yZero - paddingTop) / chartH) * 100));
  
  let gridLines = "";
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const yVal = minVal + (i / yTicks) * valRange;
    const yCoord = getY(yVal);
    
    let label = `₹${(yVal / 1000).toFixed(0)}k`;
    if (Math.abs(yVal) >= 100000) label = `₹${(yVal / 100000).toFixed(1)}L`;
    if (Math.abs(yVal) >= 10000000) label = `₹${(yVal / 10000000).toFixed(2)}Cr`;
    if (Math.abs(yVal) < 1000) label = `₹${yVal.toFixed(0)}`;
    if (yVal < 0) label = '-' + label.replace('-', '');
    
    gridLines += `
      <line x1="${paddingLeft}" y1="${yCoord}" x2="${containerWidth - paddingRight}" y2="${yCoord}" class="grid-line" />
      <text x="${paddingLeft - 8}" y="${yCoord + 4}" text-anchor="end" class="chart-axis">${label}</text>
    `;
  }
  
  let xAxisLabels = "";
  chartData.forEach((d, idx) => {
    const xCoord = getX(idx);
    xAxisLabels += `
      <text x="${xCoord}" y="${containerHeight - 15}" text-anchor="middle" class="chart-axis">${d.label}</text>
    `;
  });
  
  const revenuePoints = chartData.map((d, idx) => [getX(idx), getY(d.revenue)]);
  const profitPoints = chartData.map((d, idx) => [getX(idx), getY(d.profit)]);
  
  const revenueD = getSvgPath(revenuePoints);
  const profitD = getSvgPath(profitPoints);
  
  const areaD = `${revenueD} L ${getX(chartData.length - 1)},${yZero} L ${getX(0)},${yZero} Z`;
  const profitAreaD = `${profitD} L ${getX(chartData.length - 1)},${yZero} L ${getX(0)},${yZero} Z`;
  
  let zeroLine = "";
  if (minVal < 0) {
    zeroLine = `
      <line x1="${paddingLeft}" y1="${yZero}" x2="${containerWidth - paddingRight}" y2="${yZero}" stroke="var(--color-danger)" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.85" />
      <text x="${containerWidth - paddingRight - 8}" y="${yZero - 6}" text-anchor="end" fill="var(--color-danger)" font-size="9" font-weight="700" letter-spacing="0.05em">BREAK-EVEN LINE (₹0)</text>
    `;
  }
  
  let dotElements = "";
  chartData.forEach((d, idx) => {
    const x = getX(idx);
    const yRev = getY(d.revenue);
    const yProf = getY(d.profit);
    
    dotElements += `
      <circle cx="${x}" cy="${yRev}" r="4" fill="var(--accent-primary)" stroke="var(--bg-primary)" stroke-width="2" 
        data-index="${idx}" data-type="revenue" class="hover-dot" />
      <circle cx="${x}" cy="${yProf}" r="4" fill="${d.profit < 0 ? 'var(--color-danger)' : 'var(--color-success)'}" stroke="var(--bg-primary)" stroke-width="2" 
        data-index="${idx}" data-type="profit" class="hover-dot" />
    `;
  });
  
  let hoverSlices = "";
  let guideLine = `<line id="hover-guide" x1="0" y1="${paddingTop}" x2="0" y2="${containerHeight - paddingBottom}" class="hover-guide hidden" />`;
  
  const sliceW = chartW / (chartData.length - 1 || 1);
  chartData.forEach((d, idx) => {
    const x = getX(idx);
    const sliceX = idx === 0 ? paddingLeft : x - sliceW / 2;
    const sliceWidth = idx === 0 || idx === chartData.length - 1 ? sliceW / 2 : sliceW;
    
    hoverSlices += `
      <rect x="${sliceX}" y="${paddingTop}" width="${sliceWidth}" height="${chartH}" 
        fill="transparent" style="cursor: crosshair;" class="hover-slice" data-index="${idx}" />
    `;
  });
  
  container.innerHTML = `
    <svg class="chart-svg" width="100%" height="100%" viewBox="0 0 ${containerWidth} ${containerHeight}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent-primary)" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="var(--accent-primary)" stop-opacity="0.01"/>
        </linearGradient>
        
        <linearGradient id="profitLineGrad" x1="0" y1="${paddingTop}" x2="0" y2="${containerHeight - paddingBottom}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="var(--color-success)" />
          <stop offset="${zeroPercent}%" stop-color="var(--color-success)" />
          <stop offset="${zeroPercent}%" stop-color="var(--color-danger)" />
          <stop offset="100%" stop-color="var(--color-danger)" />
        </linearGradient>

        <linearGradient id="profitAreaGrad" x1="0" y1="${paddingTop}" x2="0" y2="${containerHeight - paddingBottom}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="var(--color-success)" stop-opacity="0.18" />
          <stop offset="${zeroPercent}%" stop-color="var(--color-success)" stop-opacity="0.02" />
          <stop offset="${zeroPercent}%" stop-color="var(--color-danger)" stop-opacity="0.02" />
          <stop offset="100%" stop-color="var(--color-danger)" stop-opacity="0.18" />
        </linearGradient>
      </defs>
      
      <g>${gridLines}</g>
      <g>${xAxisLabels}</g>
      
      <!-- Areas -->
      <path d="${areaD}" fill="url(#revenueAreaGrad)" />
      <path d="${profitAreaD}" fill="url(#profitAreaGrad)" />
      
      <!-- Reference & Guides -->
      ${zeroLine}
      ${guideLine}
      
      <!-- Paths -->
      <path d="${profitD}" class="target-trend-line" stroke="url(#profitLineGrad)" fill="none" />
      <path d="${revenueD}" class="main-trend-line" stroke="var(--accent-primary)" />
      
      <!-- Dots -->
      <g class="chart-dots">${dotElements}</g>
      
      <!-- Slices -->
      <g class="chart-slices">${hoverSlices}</g>
    </svg>
  `;
  
  const tooltip = document.getElementById("chart-tooltip");
  const slices = container.querySelectorAll(".hover-slice");
  const guide = container.querySelector("#hover-guide");
  
  slices.forEach(slice => {
    slice.addEventListener("mouseenter", (e) => {
      const idx = parseInt(slice.getAttribute("data-index"));
      const d = chartData[idx];
      const x = getX(idx);
      const yRev = getY(d.revenue);
      
      if (guide) {
        guide.setAttribute("x1", x);
        guide.setAttribute("x2", x);
        guide.classList.remove("hidden");
      }
      
      container.querySelectorAll(`.hover-dot[data-index="${idx}"]`).forEach(dot => {
        dot.setAttribute("r", "6");
        dot.setAttribute("stroke-width", "3");
      });
      
      const formattedRev = '₹' + Math.round(d.revenue).toLocaleString('en-IN');
      const profitVal = d.profit;
      const isLoss = profitVal < 0;
      const formattedProfit = (isLoss ? '-₹' : '₹') + Math.round(Math.abs(profitVal)).toLocaleString('en-IN');
      const profitColor = isLoss ? 'var(--color-danger)' : 'var(--color-success)';
      const profitLabelName = isLoss ? 'Net Loss' : 'Net Profit';
      
      tooltip.innerHTML = `
        <div class="tooltip-title">${d.label} Performance</div>
        <div class="tooltip-value" style="color: var(--accent-primary); margin-bottom: 2px;">
          GMV: ${formattedRev}
        </div>
        <div class="tooltip-value" style="color: ${profitColor}">
          ${profitLabelName}: ${formattedProfit}
        </div>
        <div style="font-size: 0.65rem; color: var(--text-secondary); border-top: 1px solid var(--border-color); margin-top: 4px; padding-top: 4px">
          Total orders: ${d.orders} orders
        </div>
      `;
      
      tooltip.classList.remove("hidden");
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${yRev}px`;
    });
    
    slice.addEventListener("mouseleave", () => {
      const idx = parseInt(slice.getAttribute("data-index"));
      
      if (guide) {
        guide.classList.add("hidden");
      }
      
      container.querySelectorAll(`.hover-dot[data-index="${idx}"]`).forEach(dot => {
        dot.setAttribute("r", "4");
        dot.setAttribute("stroke-width", "2");
      });
      
      tooltip.classList.add("hidden");
    });
  });
};

// B. Traffic Channels Donut Chart
const drawDonutChart = (sessions) => {
  const container = document.getElementById("acquisition-donut-container");
  if (!container) return;
  
  const w = 240;
  const h = 240;
  const cx = w / 2;
  const cy = h / 2;
  const r = 75;
  const strokeWidth = 16;
  
  const channels = ["Instagram", "TikTok", "Pinterest", "Direct"];
  const colors = ["var(--accent-primary)", "var(--chart-secondary)", "var(--color-warning)", "var(--chart-target)"];
  
  const channelData = channels.map((chan, idx) => {
    const count = sessions.filter(s => s.channel === chan).length;
    return { name: chan, value: count, color: colors[idx] };
  });
  
  const total = channelData.reduce((sum, d) => sum + d.value, 0);
  
  let currentAngle = 0;
  let paths = "";
  
  channelData.forEach((d) => {
    const percentage = total > 0 ? (d.value / total) : 0;
    const angle = percentage * 360;
    
    const strokeDash = 2 * Math.PI * r;
    const offset = strokeDash - (percentage * strokeDash);
    const rotation = currentAngle - 90;
    
    paths += `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${d.color}" 
        stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" 
        stroke-dashoffset="${offset}" transform="rotate(${rotation} ${cx} ${cy})"
        class="donut-slice" data-channel="${d.name}" data-val="${d.value}" 
        data-percent="${(percentage * 100).toFixed(1)}%" />
    `;
    currentAngle += angle;
  });
  
  container.innerHTML = `
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" class="chart-svg">
      <g>
        ${paths}
        <circle cx="${cx}" cy="${cy}" r="${r - strokeWidth}" fill="var(--bg-primary)" />
        <text x="${cx}" y="${cy - 4}" text-anchor="middle" id="donut-center-label" fill="var(--text-muted)" font-size="10" font-weight="700" letter-spacing="0.05em">TRAFFIC CHANNELS</text>
        <text x="${cx}" y="${cy + 14}" text-anchor="middle" id="donut-center-value" fill="var(--text-primary)" font-size="16" font-weight="800">Total Visits</text>
        <text x="${cx}" y="${cy + 30}" text-anchor="middle" id="donut-center-sub" fill="var(--text-secondary)" font-size="10" font-weight="600">${total.toLocaleString()}</text>
      </g>
    </svg>
  `;
  
  const slices = container.querySelectorAll(".donut-slice");
  const centerLabel = container.querySelector("#donut-center-label");
  const centerValue = container.querySelector("#donut-center-value");
  const centerSub = container.querySelector("#donut-center-sub");
  
  slices.forEach(slice => {
    slice.addEventListener("mouseenter", (e) => {
      const channel = e.target.getAttribute("data-channel");
      const val = parseInt(e.target.getAttribute("data-val"));
      const percent = e.target.getAttribute("data-percent");
      
      centerLabel.textContent = channel.toUpperCase();
      centerValue.textContent = percent;
      centerSub.textContent = `${val.toLocaleString()} hits`;
      centerLabel.setAttribute("fill", e.target.getAttribute("stroke"));
    });
    
    slice.addEventListener("mouseleave", () => {
      centerLabel.textContent = "TRAFFIC CHANNELS";
      centerValue.textContent = "Total Visits";
      centerSub.textContent = total.toLocaleString();
      centerLabel.setAttribute("fill", "var(--text-muted)");
    });
  });
};

// C. Product Category Bar Chart
const drawCategoryBarChart = (sessions) => {
  const container = document.getElementById("category-bar-container");
  if (!container) return;
  
  const w = container.clientWidth || 320;
  const h = container.clientHeight || 250;
  
  const padLeft = 100;
  const padRight = 30;
  const padTop = 15;
  const padBottom = 20;
  
  const barW = w - padLeft - padRight;
  const barH = h - padTop - padBottom;
  
  const categories = [
    { label: "Formal Wear", key: "formal", color: "var(--accent-primary)" },
    { label: "Casual Wear", key: "casual", color: "var(--chart-secondary)" },
    { label: "Festive Wear", key: "festive", color: "var(--color-warning)" },
    { label: "Activewear", key: "active", color: "var(--chart-target)" }
  ];
  
  const catSales = categories.map(cat => {
    const rev = sessions
      .filter(s => s.converted && s.category === cat.key)
      .reduce((sum, s) => sum + s.orderDetails.amount, 0);
    return { ...cat, revenue: rev };
  });
  
  const maxRevenue = Math.max(...catSales.map(c => c.revenue)) || 1;
  const rowHeight = barH / catSales.length;
  
  let barElements = "";
  
  catSales.forEach((cat, idx) => {
    const y = padTop + (idx * rowHeight) + (rowHeight - 16) / 2;
    const widthVal = (cat.revenue / maxRevenue) * barW;
    
    const displayLabel = cat.revenue >= 100000 ? `₹${(cat.revenue / 100000).toFixed(1)}L` : `₹${(cat.revenue / 1000).toFixed(0)}k`;
    
    barElements += `
      <text x="${padLeft - 10}" y="${y + 13}" text-anchor="end" class="chart-axis" font-size="10" font-weight="600">${cat.label}</text>
      <rect x="${padLeft}" y="${y}" width="${barW}" height="14" rx="7" fill="var(--bg-input)" />
      <rect x="${padLeft}" y="${y}" width="${widthVal}" height="14" rx="7" fill="${cat.color}" class="bar-rect">
        <title>₹${cat.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</title>
      </rect>
      <text x="${padLeft + widthVal + 8}" y="${y + 12}" class="chart-axis" font-weight="700" fill="var(--text-primary)">
        ${displayLabel}
      </text>
    `;
  });
  
  container.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" class="chart-svg">
      <g>${barElements}</g>
    </svg>
  `;
};

// --- 6. RETAIL INSIGHTS ENGINE (FASHION EXECUTIVE SUMMARIES) ---
const renderAnalystInsights = (currentSessions, prevSessions) => {
  const panel = document.getElementById("analyst-insights-panel");
  const countLabel = document.getElementById("insights-count");
  if (!panel) return;
  
  const currentKPI = calculateKPIs(currentSessions);
  const prevKPI = calculateKPIs(prevSessions);
  
  const insights = [];
  
  const getTopContributor = (sessions, keyField) => {
    const map = {};
    sessions.filter(s => s.converted).forEach(s => {
      const key = s[keyField];
      map[key] = (map[key] || 0) + s.orderDetails.amount;
    });
    
    let topKey = "N/A";
    let topVal = 0;
    
    Object.keys(map).forEach(k => {
      if (map[k] > topVal) {
        topVal = map[k];
        topKey = k;
      }
    });
    
    return { name: topKey, value: topVal };
  };
  
  const topCategory = getTopContributor(currentSessions, "category");
  const topSegment = getTopContributor(currentSessions, "segment");
  const topRegion = getTopContributor(currentSessions, "region");
  
  const prettyName = (key) => {
    const dict = {
      gents: "Gents Wear", ladies: "Ladies Wear",
      formal: "Formal Wear", casual: "Casual Wear", festive: "Festive Wear", active: "Activewear",
      north: "North Zone", south: "South Zone", east: "East Zone", west: "West Zone"
    };
    return dict[key] || key;
  };
  
  // Insight 1: GMV Growth Variance
  const revDiff = getPercentChange(currentKPI.revenue, prevKPI.revenue);
  if (Math.abs(revDiff) > 1) {
    const isUp = revDiff > 0;
    const formattedRev = '₹' + Math.round(currentKPI.revenue).toLocaleString('en-IN');
    
    insights.push({
      type: isUp ? "success" : "warning",
      title: `Gross Revenue (GMV) Trend`,
      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"></path><polyline points="17 6 23 6 23 12"></polyline></svg>`,
      text: `Total boutique GMV shows a <span class="insight-highlight">${Math.abs(revDiff).toFixed(1)}% ${isUp ? 'growth' : 'decrease'}</span> vs the previous benchmark, reaching <span class="insight-highlight">${formattedRev}</span>.`
    });
  }
  
  // Insight 2: Return Rate Variance
  const retDiff = getPercentChange(currentKPI.returns, prevKPI.returns);
  const isReturnUp = retDiff >= 0;
  insights.push({
    type: isReturnUp ? "warning" : "success",
    title: `Sizing & Return Rate Audit`,
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`,
    text: `Returns currently represent <span class="insight-highlight">${currentKPI.returns.toFixed(1)}%</span> of total order volume, marking a <span class="insight-highlight">${Math.abs(retDiff).toFixed(1)}% ${isReturnUp ? 'increase' : 'reduction'}</span> compared to the previous period.`
  });
  
  // Insight 3: Profitability Analysis
  const profitMargin = currentKPI.revenue > 0 ? (currentKPI.profit / currentKPI.revenue) * 100 : 0;
  const formattedProfit = (currentKPI.profit < 0 ? '-₹' : '₹') + Math.round(Math.abs(currentKPI.profit)).toLocaleString('en-IN');
  insights.push({
    type: currentKPI.profit >= 0 ? "success" : "warning",
    title: `Operating Margin & Profitability`,
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`,
    text: `Net profitability is registered at <span class="insight-highlight">${formattedProfit}</span> with an operating margin of <span class="insight-highlight">${profitMargin.toFixed(1)}%</span>. Return shipping courier overhead directly impacts this ratio.`
  });
  
  // Insight 4: Category analysis
  if (state.category === "all" && topCategory.value > 0) {
    const catPercent = (topCategory.value / currentKPI.revenue) * 100;
    const formattedCatVal = '₹' + Math.round(topCategory.value).toLocaleString('en-IN');
    
    insights.push({
      type: "info",
      title: `Top-Selling Category`,
      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path></svg>`,
      text: `<span class="insight-highlight">${prettyName(topCategory.name)}</span> leads category volume at <span class="insight-highlight">${formattedCatVal}</span>, driving <span class="insight-highlight">${catPercent.toFixed(1)}%</span> of overall sales.`
    });
  }
  
  // Insight 5: Zonal Advisory
  let advisoryText = "";
  let advisoryType = "info";
  
  const formalOrders = currentSessions.filter(s => s.converted && s.category === "formal");
  const formalReturns = formalOrders.filter(s => s.orderDetails.status === "returned").length;
  const formalReturnRate = formalOrders.length > 0 ? (formalReturns / formalOrders.length) * 100 : 0;
  
  if (formalReturnRate > 18) {
    advisoryType = "warning";
    advisoryText = `<span class="insight-highlight">Alert: Formal Wear</span> Return Rate is high at <span class="insight-highlight">${formalReturnRate.toFixed(1)}%</span>. Customer feedback indicates precise fit discrepancies. Recommend placing a sizing advisor on product pages.`;
  } else {
    advisoryText = `Regional penetration shows high conversion in the <span class="insight-highlight">${prettyName(topRegion.name)}</span>. Suggest scaling marketing spend on local fashion influencers in Mumbai/Delhi to maintain growth momentum.`;
  }
  
  insights.push({
    type: advisoryType,
    title: `Sizing & Regional Strategy`,
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    text: advisoryText
  });
  
  countLabel.textContent = `Generated ${insights.length} performance insights`;
  
  panel.innerHTML = insights.map((ins, index) => `
    <div class="insight-card ${ins.type}" style="animation-delay: ${index * 0.1}s">
      <div class="insight-card-header">
        <span class="insight-icon">${ins.icon}</span>
        ${ins.title}
      </div>
      <p class="insight-text">${ins.text}</p>
    </div>
  `).join("");
};

// --- 7. TRANSACTION TABLE COMPONENT (SORTING, FILTERING, PAGINATION) ---
const renderTransactionsTable = (sessions) => {
  const tableBody = document.getElementById("table-body");
  const pagInfo = document.getElementById("pagination-info");
  if (!tableBody) return;
  
  let orders = sessions
    .filter(s => s.converted)
    .map(s => ({
      id: s.orderDetails.orderId,
      customer: s.orderDetails.customer,
      date: s.date,
      segment: s.segment === "gents" ? "GENTS" : "LADIES",
      category: s.category.toUpperCase() + " WEAR",
      region: s.region.toUpperCase() + " ZONE",
      amount: s.orderDetails.amount,
      status: s.orderDetails.status
    }));
    
  if (state.searchQuery.trim() !== "") {
    const query = state.searchQuery.toLowerCase();
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(query) ||
      o.customer.toLowerCase().includes(query) ||
      o.segment.toLowerCase().includes(query) ||
      o.category.toLowerCase().includes(query) ||
      o.region.toLowerCase().includes(query) ||
      o.status.toLowerCase().includes(query)
    );
  }
  
  orders.sort((a, b) => {
    let valA = a[state.sortColumn];
    let valB = b[state.sortColumn];
    
    if (state.sortColumn === "date") {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    
    if (valA < valB) return state.sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return state.sortDirection === "asc" ? 1 : -1;
    return 0;
  });
  
  const totalEntries = orders.length;
  const totalPages = Math.ceil(totalEntries / state.pageSize) || 1;
  
  if (state.currentPage > totalPages) state.currentPage = totalPages;
  if (state.currentPage < 1) state.currentPage = 1;
  
  const startIdx = (state.currentPage - 1) * state.pageSize;
  const endIdx = Math.min(startIdx + state.pageSize, totalEntries);
  const pagedOrders = orders.slice(startIdx, endIdx);
  
  if (pagedOrders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 3rem 0; color: var(--text-muted)">
          No matching transactions found matching your criteria.
        </td>
      </tr>
    `;
    pagInfo.textContent = "Showing 0 of 0 entries";
    document.getElementById("btn-prev").disabled = true;
    document.getElementById("btn-next").disabled = true;
    document.getElementById("page-numbers").innerHTML = "";
    return;
  }
  
  tableBody.innerHTML = pagedOrders.map(o => `
    <tr>
      <td class="cell-id">${o.id}</td>
      <td class="cell-customer">${o.customer}</td>
      <td>${o.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
      <td>${o.segment}</td>
      <td>${o.category}</td>
      <td>${o.region}</td>
      <td class="cell-amount">₹${o.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
      <td><span class="status-badge ${o.status}">${o.status}</span></td>
    </tr>
  `).join("");
  
  pagInfo.textContent = `Showing ${startIdx + 1}-${endIdx} of ${totalEntries} entries`;
  
  document.getElementById("btn-prev").disabled = state.currentPage === 1;
  document.getElementById("btn-next").disabled = state.currentPage === totalPages;
  
  const numContainer = document.getElementById("page-numbers");
  let numButtons = "";
  
  const maxButtons = 5;
  let startBtn = Math.max(1, state.currentPage - Math.floor(maxButtons / 2));
  let endBtn = Math.min(totalPages, startBtn + maxButtons - 1);
  
  if (endBtn - startBtn + 1 < maxButtons) {
    startBtn = Math.max(1, endBtn - maxButtons + 1);
  }
  
  for (let p = startBtn; p <= endBtn; p++) {
    numButtons += `
      <button class="page-num ${p === state.currentPage ? 'active' : ''}" data-page="${p}">${p}</button>
    `;
  }
  numContainer.innerHTML = numButtons;
  
  numContainer.querySelectorAll(".page-num").forEach(btn => {
    btn.addEventListener("click", () => {
      state.currentPage = parseInt(btn.getAttribute("data-page"));
      renderTransactionsTable(sessions);
    });
  });
};

const setupTableSorting = (sessions) => {
  const headers = document.querySelectorAll("th.sortable");
  headers.forEach(header => {
    const col = header.getAttribute("data-sort");
    const indicator = header.querySelector(".sort-indicator");
    
    if (col === state.sortColumn) {
      indicator.textContent = state.sortDirection === "asc" ? " ▲" : " ▼";
    } else {
      indicator.textContent = " ↕";
    }
    
    header.addEventListener("click", () => {
      const clickedCol = header.getAttribute("data-sort");
      if (clickedCol === state.sortColumn) {
        state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
      } else {
        state.sortColumn = clickedCol;
        state.sortDirection = "desc";
      }
      
      headers.forEach(h => {
        const hCol = h.getAttribute("data-sort");
        const ind = h.querySelector(".sort-indicator");
        if (hCol === state.sortColumn) {
          ind.textContent = state.sortDirection === "asc" ? " ▲" : " ▼";
        } else {
          ind.textContent = " ↕";
        }
      });
      
      state.currentPage = 1;
      renderTransactionsTable(sessions);
    });
  });
};

// --- 8. CENTRAL DISPATCH / DYNAMIC UPDATER ---
const updateDashboard = () => {
  const slices = getFilteredData(state.timeframe, state.segment, state.category, state.region);
  const currentKPI = calculateKPIs(slices.current);
  const prevKPI = calculateKPIs(slices.previous);
  
  updateKPICards(currentKPI, prevKPI);
  drawSparklines(slices.current, slices.ranges);
  drawRevenueChart(slices.current, slices.ranges);
  drawDonutChart(slices.current);
  drawCategoryBarChart(slices.current);
  renderAnalystInsights(slices.current, slices.previous);
  renderTransactionsTable(slices.current);
};

// --- 9. EVENT BINDINGS & CONTROLLERS ---
document.addEventListener("DOMContentLoaded", () => {
  
  // A. Live Header Clock Widget
  const startLiveClock = () => {
    const clockEl = document.getElementById("live-time");
    const formatTime = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    };
    formatTime();
    setInterval(formatTime, 1000);
  };
  startLiveClock();
  
  // B. Theme Switcher
  const setupThemeToggle = () => {
    const toggleBtn = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("velvet-theme") || "dark";
    state.theme = savedTheme;
    document.documentElement.setAttribute("data-theme", savedTheme);
    
    toggleBtn.addEventListener("click", () => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      state.theme = nextTheme;
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("velvet-theme", nextTheme);
    });
  };
  setupThemeToggle();
  
  // C. Filter bindings
  const timeframeGroup = document.getElementById("timeframe-selector");
  timeframeGroup.querySelectorAll(".btn-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      timeframeGroup.querySelector(".btn-toggle.active").classList.remove("active");
      btn.classList.add("active");
      state.timeframe = btn.getAttribute("data-timeframe");
      state.currentPage = 1;
      updateDashboard();
    });
  });
  
  const segFilter = document.getElementById("segment-filter");
  segFilter.addEventListener("change", (e) => {
    state.segment = e.target.value;
    state.currentPage = 1;
    updateDashboard();
  });
  
  const catFilter = document.getElementById("category-filter");
  catFilter.addEventListener("change", (e) => {
    state.category = e.target.value;
    state.currentPage = 1;
    updateDashboard();
  });
  
  const regFilter = document.getElementById("region-filter");
  regFilter.addEventListener("change", (e) => {
    state.region = e.target.value;
    state.currentPage = 1;
    updateDashboard();
  });
  
  const btnReset = document.getElementById("reset-filters");
  btnReset.addEventListener("click", () => {
    state.timeframe = "ytd";
    state.segment = "all";
    state.category = "all";
    state.region = "all";
    state.searchQuery = "";
    state.currentPage = 1;
    
    timeframeGroup.querySelector(".btn-toggle.active").classList.remove("active");
    timeframeGroup.querySelector('[data-timeframe="ytd"]').classList.add("active");
    
    segFilter.value = "all";
    catFilter.value = "all";
    regFilter.value = "all";
    document.getElementById("table-search").value = "";
    
    updateDashboard();
  });
  
  // D. Search and Pagination
  const searchInput = document.getElementById("table-search");
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    state.currentPage = 1;
    const slices = getFilteredData(state.timeframe, state.segment, state.category, state.region);
    renderTransactionsTable(slices.current);
  });
  
  document.getElementById("btn-prev").addEventListener("click", () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      const slices = getFilteredData(state.timeframe, state.segment, state.category, state.region);
      renderTransactionsTable(slices.current);
    }
  });
  
  document.getElementById("btn-next").addEventListener("click", () => {
    state.currentPage++;
    const slices = getFilteredData(state.timeframe, state.segment, state.category, state.region);
    renderTransactionsTable(slices.current);
  });
  
  const initialSlices = getFilteredData(state.timeframe, state.segment, state.category, state.region);
  setupTableSorting(initialSlices.current);
  
  // E. CSV Detailed Exporter
  const setupExportControl = () => {
    const btnExport = document.getElementById("btn-export");
    const iconExport = btnExport.querySelector(".icon-export");
    const iconSpinner = btnExport.querySelector(".icon-spinner");
    const iconSuccess = btnExport.querySelector(".icon-success");
    const labelText = btnExport.querySelector("#export-text");
    
    btnExport.addEventListener("click", () => {
      if (!iconSpinner.classList.contains("hidden")) return;
      
      iconExport.classList.add("hidden");
      iconSuccess.classList.add("hidden");
      iconSpinner.classList.remove("hidden");
      labelText.textContent = "Extracting...";
      
      setTimeout(() => {
        const slices = getFilteredData(state.timeframe, state.segment, state.category, state.region);
        const csvOrders = slices.current
          .filter(s => s.converted)
          .map(s => {
            // Compute profit for that record
            const amount = s.orderDetails.amount;
            let profitVal = amount * 0.40;
            if (s.orderDetails.status === "returned") {
              profitVal = - (150 + (amount * 0.15) + (amount * 0.05));
            }
            return {
              OrderID: s.orderDetails.orderId,
              CustomerName: s.orderDetails.customer,
              PurchaseDate: s.date.toISOString().split("T")[0],
              Segment: s.segment.toUpperCase(),
              Category: s.category.toUpperCase() + " WEAR",
              ZonalMarket: s.region.toUpperCase() + " ZONE",
              AmountINR: amount.toFixed(2),
              NetProfitLossINR: profitVal.toFixed(2),
              OrderStatus: s.orderDetails.status.toUpperCase(),
              AcquisitionChannel: s.channel
            };
          });
          
        if (csvOrders.length === 0) {
          alert("No transaction entries available to generate CSV.");
          iconSpinner.classList.add("hidden");
          iconExport.classList.remove("hidden");
          labelText.textContent = "Export CSV";
          return;
        }
        
        const headers = Object.keys(csvOrders[0]).join(",");
        const rows = csvOrders.map(row => 
          Object.values(row).map(val => `"${val}"`).join(",")
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Your_Choice_KPI_Report_${state.timeframe.toUpperCase()}_${state.segment}_${state.category}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        iconSpinner.classList.add("hidden");
        iconSuccess.classList.remove("hidden");
        labelText.textContent = "CSV Downloaded!";
        
        setTimeout(() => {
          iconSuccess.classList.add("hidden");
          iconExport.classList.remove("hidden");
          labelText.textContent = "Export CSV";
        }, 3000);
        
      }, 1800);
    });
  };
  setupExportControl();
  
  // Initial load
  updateDashboard();
  
  window.addEventListener("resize", () => {
    const slices = getFilteredData(state.timeframe, state.segment, state.category, state.region);
    drawRevenueChart(slices.current, slices.ranges);
    drawDonutChart(slices.current);
    drawCategoryBarChart(slices.current);
  });
});
