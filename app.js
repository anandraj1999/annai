/* Aegis Trade AI - Core Application Script */

// --- Global State ---
let currentPair = 'BTCUSD';
let currentPattern = 'double-bottom';
let activeSeries = null;
let chart = null;
let priceLines = [];

// Speech & UI state
let isSpeechMuted = false;
let isListening = false;
let isSpeaking = false;
let recognition = null;
let animationFrameId = null;
let speechUtterance = null;

// Technical indicators and trade configurations mapping
const configurations = {
    'BTCUSD': {
        'double-bottom': {
            title: 'BTCUSD / 4-Hour / Double Bottom',
            action: 'BUY / LONG',
            actionClass: 'buy',
            entry: 66350,
            stop: 64200,
            target: 70500,
            prob: '84% Confidence',
            rr: '2.0x',
            rrValue: 66, // progress bar percent
            rsi: '48.62',
            rsiStatus: 'Neutral Consolidation',
            rsiClass: 'neutral',
            macd: '+142.10',
            macdStatus: 'Bullish Crossover',
            macdClass: 'bullish',
            support: 64500,
            resistance: 68200,
            analysis: "I have detected a confirmed Double Bottom pattern on the BTC/USD 4-Hour chart. The asset has double-tested the strong demand zone at $64,500. This structural pattern indicates a trend reversal. The neckline breakout at $66,100 is valid, supported by rising volume and a bullish crossover on the MACD. I recommend a long position entry at $66,350, setting a stop loss below the double-test level at $64,200, targeting a key supply range of $70,500.",
            markers: [
                { time: '2026-05-10', position: 'belowBar', color: '#10b981', shape: 'arrowUp', text: 'Bottom 1' },
                { time: '2026-05-18', position: 'aboveBar', color: '#8b5cf6', shape: 'arrowDown', text: 'Neckline Peak' },
                { time: '2026-05-24', position: 'belowBar', color: '#10b981', shape: 'arrowUp', text: 'Bottom 2' },
                { time: '2026-05-26', position: 'aboveBar', color: '#06b6d4', shape: 'arrowUp', text: 'Breakout' }
            ]
        },
        'head-shoulders': {
            title: 'BTCUSD / 4-Hour / Head and Shoulders',
            action: 'SELL / SHORT',
            actionClass: 'sell',
            entry: 64800,
            stop: 66600,
            target: 61000,
            prob: '81% Confidence',
            rr: '2.1x',
            rrValue: 68,
            rsi: '36.50',
            rsiStatus: 'Bearish Momentum',
            rsiClass: 'bearish',
            macd: '-310.45',
            macdStatus: 'Bearish Expansion',
            macdClass: 'bearish',
            support: 64800,
            resistance: 66500,
            analysis: "The 4-Hour BTC/USD chart reveals a prominent Head and Shoulders distribution pattern. The left shoulder peaked at $66,000, the head peaked at $68,000, and the right shoulder formed at $66,000. We are currently observing a decisive breakdown below the neckline support at $64,800. RSI is sloping downwards near 36, and the MACD is expanding into negative territory. Enter a short position at $64,800, stop loss at $66,600, with a profit objective at $61,000.",
            markers: [
                { time: '2026-05-10', position: 'aboveBar', color: '#3b82f6', shape: 'arrowDown', text: 'L-Shoulder' },
                { time: '2026-05-16', position: 'aboveBar', color: '#ef4444', shape: 'arrowDown', text: 'Head' },
                { time: '2026-05-22', position: 'aboveBar', color: '#3b82f6', shape: 'arrowDown', text: 'R-Shoulder' },
                { time: '2026-05-26', position: 'belowBar', color: '#ef4444', shape: 'arrowDown', text: 'Neckline Breakdown' }
            ]
        },
        'bull-flag': {
            title: 'BTCUSD / 4-Hour / Bull Flag',
            action: 'BUY / LONG',
            actionClass: 'buy',
            entry: 67100,
            stop: 65800,
            target: 71000,
            prob: '87% Confidence',
            rr: '3.0x',
            rrValue: 80,
            rsi: '61.40',
            rsiStatus: 'Strong Expansion',
            rsiClass: 'bullish',
            macd: '+412.50',
            macdStatus: 'Bullish Momentum',
            macdClass: 'bullish',
            support: 65900,
            resistance: 68500,
            analysis: "A high-probability Bull Flag continuation pattern has materialized on BTC/USD. Following a parabolic upward pole movement from $60,000 to $68,000, price consolidated inside a neat descending parallel channel. We have just broken above the upper boundary of the flag at $67,000 on high volume. This indicates strong accumulation. Recommend buy entry on the retest at $67,100, with a stop loss below the flag base at $65,800, targeting $71,000 based on the measured flag pole length.",
            markers: [
                { time: '2026-05-10', position: 'belowBar', color: '#3b82f6', shape: 'arrowUp', text: 'Pole Start' },
                { time: '2026-05-18', position: 'aboveBar', color: '#8b5cf6', shape: 'arrowDown', text: 'Pole Peak' },
                { time: '2026-05-24', position: 'aboveBar', color: '#71717a', shape: 'arrowDown', text: 'Flag Test' },
                { time: '2026-05-26', position: 'belowBar', color: '#10b981', shape: 'arrowUp', text: 'Flag Breakout' }
            ]
        },
        'cup-handle': {
            title: 'BTCUSD / 4-Hour / Cup and Handle',
            action: 'BUY / LONG',
            actionClass: 'buy',
            entry: 67300,
            stop: 66100,
            target: 70800,
            prob: '85% Confidence',
            rr: '2.9x',
            rrValue: 78,
            rsi: '58.20',
            rsiStatus: 'Bullish Bias',
            rsiClass: 'bullish',
            macd: '+256.00',
            macdStatus: 'Bullish Acceleration',
            macdClass: 'bullish',
            support: 66200,
            resistance: 67200,
            analysis: "The BTC/USD 4-Hour chart displays a classic Cup and Handle rounding accumulation pattern. The asset underwent a deep rounding bottom cup structure from $68,000 down to $63,000 and back to $68,000, followed by a minor 3% handle consolidation down to $66,200. A bullish breakout has triggered above the cup lip at $67,200. MACD shows rising positive momentum and the RSI remains healthily below overbought zones. Enter long at $67,300, stop loss at $66,100, target objective at $70,800.",
            markers: [
                { time: '2026-05-08', position: 'aboveBar', color: '#71717a', shape: 'arrowDown', text: 'Cup Left Lip' },
                { time: '2026-05-16', position: 'belowBar', color: '#8b5cf6', shape: 'arrowUp', text: 'Cup Bottom' },
                { time: '2026-05-22', position: 'aboveBar', color: '#71717a', shape: 'arrowDown', text: 'Cup Right Lip' },
                { time: '2026-05-24', position: 'belowBar', color: '#3b82f6', shape: 'arrowUp', text: 'Handle Bottom' },
                { time: '2026-05-26', position: 'belowBar', color: '#10b981', shape: 'arrowUp', text: 'Lip Breakout' }
            ]
        }
    },
    'ETHUSD': {
        'double-bottom': {
            title: 'ETHUSD / 4-Hour / Double Bottom',
            action: 'BUY / LONG',
            actionClass: 'buy',
            entry: 3410,
            stop: 3290,
            target: 3680,
            prob: '83% Confidence',
            rr: '2.25x',
            rrValue: 70,
            rsi: '51.30',
            rsiStatus: 'Neutral Recovery',
            rsiClass: 'neutral',
            macd: '+15.20',
            macdStatus: 'Bullish Crossover',
            macdClass: 'bullish',
            support: 3300,
            resistance: 3480,
            analysis: "On the Ethereum 4-Hour chart, we see a reliable Double Bottom reversal structure. Support at $3,300 has been verified twice with strong buying tails. We have broken through the neckline barrier of $3,400 with relative volume support. Stochastic RSI shows a bullish cross. Buy long at $3,410, stop loss at $3,290, targeting $3,680.",
            markers: [
                { time: '2026-05-10', position: 'belowBar', color: '#10b981', shape: 'arrowUp', text: 'Bottom 1' },
                { time: '2026-05-18', position: 'aboveBar', color: '#8b5cf6', shape: 'arrowDown', text: 'Mid Peak' },
                { time: '2026-05-24', position: 'belowBar', color: '#10b981', shape: 'arrowUp', text: 'Bottom 2' },
                { time: '2026-05-26', position: 'aboveBar', color: '#06b6d4', shape: 'arrowUp', text: 'Breakout' }
            ]
        },
        'head-shoulders': {
            title: 'ETHUSD / 4-Hour / Head and Shoulders',
            action: 'SELL / SHORT',
            actionClass: 'sell',
            entry: 3350,
            stop: 3450,
            target: 3100,
            prob: '80% Confidence',
            rr: '2.5x',
            rrValue: 73,
            rsi: '34.80',
            rsiStatus: 'Bearish Momentum',
            rsiClass: 'bearish',
            macd: '-45.10',
            macdStatus: 'Bearish Continuation',
            macdClass: 'bearish',
            support: 3360,
            resistance: 3450,
            analysis: "A classic Head and Shoulders top pattern has triggered for ETH/USD. Left shoulder formed at $3,450, head at $3,550, and right shoulder at $3,440. Neckline support at $3,360 has officially collapsed on this 4-Hour candlestick closing. I project a drop matching the head depth. Set short entry at $3,350, stop loss at $3,450, and profit target at $3,100.",
            markers: [
                { time: '2026-05-10', position: 'aboveBar', color: '#3b82f6', shape: 'arrowDown', text: 'Left Shoulder' },
                { time: '2026-05-16', position: 'aboveBar', color: '#ef4444', shape: 'arrowDown', text: 'Head' },
                { time: '2026-05-22', position: 'aboveBar', color: '#3b82f6', shape: 'arrowDown', text: 'Right Shoulder' },
                { time: '2026-05-26', position: 'belowBar', color: '#ef4444', shape: 'arrowDown', text: 'Neckline Break' }
            ]
        },
        'bull-flag': {
            title: 'ETHUSD / 4-Hour / Bull Flag',
            action: 'BUY / LONG',
            actionClass: 'buy',
            entry: 3495,
            stop: 3420,
            target: 3720,
            prob: '86% Confidence',
            rr: '3.0x',
            rrValue: 80,
            rsi: '63.90',
            rsiStatus: 'Bullish Momentum',
            rsiClass: 'bullish',
            macd: '+32.80',
            macdStatus: 'Bullish Expansion',
            macdClass: 'bullish',
            support: 3430,
            resistance: 3520,
            analysis: "We have a highly constructive Bull Flag structure on ETH/USD. After a vertical flagpole rally from $3,150 to $3,540, the price consolidated into a falling channel ending around $3,430. A forceful breakout above $3,485 has completed the setup. Suggest long buy entry at $3,495, stop loss at $3,420, and take profit targeting $3,720.",
            markers: [
                { time: '2026-05-10', position: 'belowBar', color: '#3b82f6', shape: 'arrowUp', text: 'Flagpole Start' },
                { time: '2026-05-18', position: 'aboveBar', color: '#8b5cf6', shape: 'arrowDown', text: 'Flagpole Top' },
                { time: '2026-05-24', position: 'aboveBar', color: '#71717a', shape: 'arrowDown', text: 'Consolidation' },
                { time: '2026-05-26', position: 'belowBar', color: '#10b981', shape: 'arrowUp', text: 'Flag Breakout' }
            ]
        },
        'cup-handle': {
            title: 'ETHUSD / 4-Hour / Cup and Handle',
            action: 'BUY / LONG',
            actionClass: 'buy',
            entry: 3510,
            stop: 3450,
            target: 3690,
            prob: '84% Confidence',
            rr: '3.0x',
            rrValue: 80,
            rsi: '59.10',
            rsiStatus: 'Bullish Bias',
            rsiClass: 'bullish',
            macd: '+22.45',
            macdStatus: 'Bullish Trend',
            macdClass: 'bullish',
            support: 3450,
            resistance: 3500,
            analysis: "The Ethereum 4-Hour chart displays a clean Cup and Handle pattern. The circular cup shaped recovery was completed at $3,500, followed by a slight downward handle pull back to $3,450. Yesterday, we printed a high volume candle breaking the handle trigger line. Setup buy order at $3,510, stop loss protection at $3,450, and take profit at $3,690.",
            markers: [
                { time: '2026-05-08', position: 'aboveBar', color: '#71717a', shape: 'arrowDown', text: 'Cup Rim' },
                { time: '2026-05-16', position: 'belowBar', color: '#8b5cf6', shape: 'arrowUp', text: 'Cup Base' },
                { time: '2026-05-22', position: 'aboveBar', color: '#71717a', shape: 'arrowDown', text: 'Cup Rim' },
                { time: '2026-05-24', position: 'belowBar', color: '#3b82f6', shape: 'arrowUp', text: 'Handle bottom' },
                { time: '2026-05-26', position: 'belowBar', color: '#10b981', shape: 'arrowUp', text: 'Breakout' }
            ]
        }
    }
};

// --- Candlestick Data Generators ---
function generateData(pair, pattern) {
    let data = [];
    let basePrice = pair === 'BTCUSD' ? 65000 : 3400;
    
    // Generate dates: 25 candles, ending at 2026-05-26
    let baseDate = new Date('2026-05-02');
    
    // Hardcoded patterns vectors to draw the charts nicely
    let priceMultiplier = [];
    if (pattern === 'double-bottom') {
        // Starts high, drops, bounces, drops again, surges
        priceMultiplier = [
            1.04, 1.03, 1.01, 0.99, 0.97, 0.96, 0.95, // bottoms out (Bottom 1)
            0.96, 0.97, 0.98, 0.99, 1.00, 1.01, 1.02, // bounces to midline peak
            1.00, 0.99, 0.97, 0.96, 0.95, 0.95, // drops again to Bottom 2
            0.97, 0.99, 1.01, 1.02, 1.03, 1.04  // breakouts
        ];
    } else if (pattern === 'head-shoulders') {
        // Up to shoulder, down, higher head, down, shoulder, breaks down
        priceMultiplier = [
            0.97, 0.98, 0.99, 1.00, 1.02, 1.01, 1.00, // Left Shoulder
            0.99, 0.98, 0.99, 1.01, 1.03, 1.05, 1.03, 1.01, 0.99, 0.98, // Head
            0.99, 1.00, 1.02, 1.01, 1.00, // Right Shoulder
            0.98, 0.97, 0.95, 0.94, 0.92  // breakdown neckline
        ];
    } else if (pattern === 'bull-flag') {
        // Flat, sudden surge (pole), consolidates downwards, breaks out
        priceMultiplier = [
            0.92, 0.92, 0.93, 0.92, 0.93, // accumulation base
            0.95, 0.98, 1.02, 1.05, 1.08, 1.10, // vertical pole surge
            1.09, 1.08, 1.07, 1.07, 1.06, 1.05, // flags channel down
            1.07, 1.09, 1.11, 1.12, 1.13 // breakout surge
        ];
    } else if (pattern === 'cup-handle') {
        // Rounds down, rounds up, minor decline (handle), breakout
        priceMultiplier = [
            1.03, 1.02, 1.00, 0.98, 0.96, 0.95, 0.94, 0.93, 0.94, 0.95, 0.97, 0.99, 1.01, 1.02, 1.03, // Rounded Cup
            1.02, 1.01, 1.00, 1.00, // Handle consolidation
            1.02, 1.03, 1.04, 1.05 // Breakout
        ];
    }
    
    // Build candle items
    for (let i = 0; i < priceMultiplier.length; i++) {
        let close = basePrice * priceMultiplier[i];
        // add random noise
        let open = basePrice * priceMultiplier[i === 0 ? 0 : i - 1];
        if (i === 0) open = close * 0.995;
        
        let high = Math.max(open, close) * (1 + Math.random() * 0.006);
        let low = Math.min(open, close) * (1 - Math.random() * 0.006);
        
        // Date incrementing
        let curDate = new Date(baseDate);
        curDate.setDate(baseDate.getDate() + i);
        let dateString = curDate.toISOString().slice(0, 10);
        
        data.push({
            time: dateString,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2))
        });
    }
    
    return data;
}

// --- Initialize Charting ---
function initChart() {
    const container = document.getElementById('tv-chart-container');
    container.innerHTML = ''; // Clear container

    chart = LightweightCharts.createChart(container, {
        layout: {
            background: { type: 'solid', color: '#131722' },
            textColor: '#d1d4dc',
            fontSize: 12,
            fontFamily: "'Inter', sans-serif",
        },
        grid: {
            vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
            horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
            vertLine: {
                labelBackgroundColor: '#8b5cf6',
            },
            horzLine: {
                labelBackgroundColor: '#8b5cf6',
            }
        },
        rightPriceScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)',
        },
        timeScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)',
            timeVisible: true,
            secondsVisible: false,
        },
    });

    activeSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#10b981',
        wickDownColor: '#ef4444',
        wickUpColor: '#10b981',
    });

    // Handle resizing responsiveness
    const resizeObserver = new ResizeObserver(entries => {
        if (entries.length === 0 || !chart) return;
        const { width, height } = entries[0].contentRect;
        chart.resize(width, height);
    });
    resizeObserver.observe(container);
    
    updateChartData();
}

function updateChartData() {
    if (!activeSeries || !chart) return;
    
    const config = configurations[currentPair][currentPattern];
    const data = generateData(currentPair, currentPattern);
    
    activeSeries.setData(data);
    
    // Add pattern indicators markers
    // Map dates to our generated dataset indices to overlay correctly
    let markers = [];
    config.markers.forEach((m, index) => {
        let dataIndex = Math.floor((data.length / config.markers.length) * index);
        if (index === config.markers.length - 1) dataIndex = data.length - 1; // force last marker to last candle
        markers.push({
            time: data[dataIndex].time,
            position: m.position,
            color: m.color,
            shape: m.shape,
            text: m.text
        });
    });
    activeSeries.setMarkers(markers);
    
    // Clear old limits
    priceLines.forEach(line => activeSeries.removePriceLine(line));
    priceLines = [];
    
    // Draw Support & Resistance Lines
    const supportLine = activeSeries.createPriceLine({
        price: config.support,
        color: '#10b981',
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Support Support',
    });
    
    const resistanceLine = activeSeries.createPriceLine({
        price: config.resistance,
        color: '#ef4444',
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Resistance Resistance',
    });

    // Draw Trade Setup Targets Lines
    const entryLine = activeSeries.createPriceLine({
        price: config.entry,
        color: '#3b82f6',
        lineWidth: 2,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: 'Entry Trigger',
    });

    const stopLine = activeSeries.createPriceLine({
        price: config.stop,
        color: '#f43f5e',
        lineWidth: 2,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: 'Stop Loss',
    });

    const targetLine = activeSeries.createPriceLine({
        price: config.target,
        color: '#10b981',
        lineWidth: 2,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: 'Take Profit',
    });
    
    priceLines.push(supportLine, resistanceLine, entryLine, stopLine, targetLine);
    
    chart.timeScale().fitContent();
}

// --- Dynamic Panels Data Binding ---
function updateUIPanels() {
    const config = configurations[currentPair][currentPattern];
    
    // Titles
    document.getElementById('active-chart-title').innerText = config.title;
    
    // Indicators
    const rsiValEl = document.getElementById('rsi-val');
    const rsiStatusEl = document.getElementById('rsi-status');
    const macdValEl = document.getElementById('macd-val');
    const macdStatusEl = document.getElementById('macd-status');
    const supportValEl = document.getElementById('support-val');
    const resistanceValEl = document.getElementById('resistance-val');
    
    rsiValEl.innerText = config.rsi;
    rsiStatusEl.innerText = config.rsiStatus;
    rsiStatusEl.className = `indicator-status ${config.rsiClass}`;
    
    macdValEl.innerText = config.macd;
    macdStatusEl.innerText = config.macdStatus;
    macdStatusEl.className = `indicator-status ${config.macdClass}`;
    
    supportValEl.innerText = `$${config.support.toLocaleString()}`;
    resistanceValEl.innerText = `$${config.resistance.toLocaleString()}`;
    
    // Trade setup
    const actionBadge = document.getElementById('setup-action-badge');
    actionBadge.innerText = config.action;
    actionBadge.className = `setup-signal ${config.actionClass}`;
    
    document.getElementById('setup-entry').innerText = `$${config.entry.toLocaleString()}`;
    document.getElementById('setup-stop').innerText = `$${config.stop.toLocaleString()}`;
    document.getElementById('setup-target').innerText = `$${config.target.toLocaleString()}`;
    document.getElementById('setup-prob').innerText = config.prob;
    document.getElementById('setup-rr-ratio').innerText = `Risk-Reward: ${config.rr}`;
    
    // Update ratio bar fill width
    document.getElementById('setup-ratio-bar').style.width = `${config.rrValue}%`;
}

// --- Menu Navigation Actions ---
function switchPair(pair) {
    currentPair = pair;
    
    // update selectors UI
    document.querySelectorAll('.pair-pill').forEach(el => {
        el.classList.remove('active');
        if (el.innerText.includes(pair.slice(0, 3))) {
            el.classList.add('active');
        }
    });
    
    updateChartData();
    updateUIPanels();
    triggerAgentAlert(`Switched main asset view to ${pair}. Real-time indicators are syncing.`);
}

function selectPattern(patternId) {
    currentPattern = patternId;
    
    // update patterns UI
    document.querySelectorAll('.pattern-card').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById(`pattern-${patternId}`).classList.add('active');
    
    updateChartData();
    updateUIPanels();
    
    const config = configurations[currentPair][currentPattern];
    triggerAgentResponse(config.analysis);
}

function openHelpGuide() {
    document.getElementById('help-guide').classList.add('active');
}

function closeHelpGuide() {
    document.getElementById('help-guide').classList.remove('active');
}

function resetDemo() {
    currentPair = 'BTCUSD';
    currentPattern = 'double-bottom';
    
    document.querySelectorAll('.pair-pill').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.pair-pill')[0].classList.add('active');
    
    document.querySelectorAll('.pattern-card').forEach(c => c.classList.remove('active'));
    document.getElementById('pattern-double-bottom').classList.add('active');
    
    updateChartData();
    updateUIPanels();
    
    // Reset Chat Log
    const container = document.getElementById('chat-history-container');
    container.innerHTML = `
        <div class="chat-bubble agent">
            <div class="chat-bubble-meta">
                <span>Aegis Trading AI</span>
                <span>Just now</span>
            </div>
            Hello! I am Aegis, your AI Trading Pattern Specialist. 
            I've analyzed the <strong>BTC/USD</strong> 4-Hour chart and detected a completed <strong>Double Bottom</strong> pattern forming around the $64,500 support region.
            This is a strong bullish reversal signal.
            <br><br>
            You can ask me questions such as:
            <ul>
                <li><em>"Analyze this chart"</em></li>
                <li><em>"Give me a trade setup"</em></li>
                <li><em>"Explain Double Bottom"</em></li>
            </ul>
            <button class="voice-read-btn" onclick="speakText(this.parentElement.innerText)">
                <i data-lucide="volume-2"></i> Read out
            </button>
        </div>
    `;
    lucide.createIcons();
    triggerAgentAlert("Simulation reset complete. Audio models restarted.");
}

// --- Text/Voice Communication Logger ---
function appendChatBubble(sender, text, isHtml = false) {
    const container = document.getElementById('chat-history-container');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const name = sender === 'user' ? 'You' : 'Aegis Trading AI';
    
    bubble.innerHTML = `
        <div class="chat-bubble-meta">
            <span>${name}</span>
            <span>${time}</span>
        </div>
        <div>${isHtml ? text : escapeHTML(text)}</div>
        ${sender === 'agent' ? `<button class="voice-read-btn" onclick="speakText(this.previousElementSibling.innerText)"><i data-lucide="volume-2"></i> Read out</button>` : ''}
    `;
    
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    
    // re-render icons for newly added read buttons
    lucide.createIcons();
}

function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function triggerAgentResponse(replyText) {
    appendChatBubble('agent', replyText);
    speakText(replyText);
}

function triggerAgentAlert(alertText) {
    appendChatBubble('agent', `<em>System Notice: ${alertText}</em>`, true);
}

// --- Speech Synthesis Engine (Text-to-Speech) ---
function speakText(text) {
    if (isSpeechMuted) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Parse formatting elements if read from DOM innerText
    let cleanText = text.replace(/Read out/gi, '').trim();
    
    speechUtterance = new SpeechSynthesisUtterance(cleanText);
    
    // Find a good professional voice (preferably English male/female with natural tone)
    const voices = window.speechSynthesis.getVoices();
    // Default to first English voice found, if possible
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft')));
    if (preferredVoice) {
        speechUtterance.voice = preferredVoice;
    }
    
    speechUtterance.rate = 1.0;
    speechUtterance.pitch = 1.0;
    
    speechUtterance.onstart = () => {
        isSpeaking = true;
        setVoiceButtonState('speaking');
        startVisualizerAnimation();
    };
    
    speechUtterance.onend = () => {
        isSpeaking = false;
        setVoiceButtonState('idle');
        stopVisualizerAnimation();
    };
    
    speechUtterance.onerror = () => {
        isSpeaking = false;
        setVoiceButtonState('idle');
        stopVisualizerAnimation();
    };
    
    window.speechSynthesis.speak(speechUtterance);
}

// Ensure voices are loaded (some browsers load them asynchronously)
window.speechSynthesis.onvoiceschanged = () => {
    // Voices list populated
};

// --- Speech Recognition Engine (Speech-to-Text) ---
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        document.getElementById('voice-speech-feedback').innerText = "Speech recognition not supported in this browser. Please type commands below.";
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
        isListening = true;
        setVoiceButtonState('listening');
        document.getElementById('voice-speech-feedback').innerText = "Listening closely... speak now.";
        startVisualizerAnimation();
    };
    
    recognition.onspeechend = () => {
        recognition.stop();
    };
    
    recognition.onend = () => {
        isListening = false;
        if (!isSpeaking) {
            setVoiceButtonState('idle');
            stopVisualizerAnimation();
        }
    };
    
    recognition.onerror = (event) => {
        isListening = false;
        setVoiceButtonState('idle');
        stopVisualizerAnimation();
        
        let errorMsg = "Microphone error. Please try again.";
        if (event.error === 'not-allowed') {
            errorMsg = "Permission denied. Please enable mic access in your browser settings.";
        }
        document.getElementById('voice-speech-feedback').innerText = errorMsg;
        console.error("Speech Recognition Error: ", event.error);
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('voice-speech-feedback').innerText = `You said: "${transcript}"`;
        
        // Log in chat
        appendChatBubble('user', transcript);
        
        // Process
        processVoiceCommand(transcript);
    };
}

// --- Voice Command Interpreter ---
function processVoiceCommand(command) {
    const norm = command.toLowerCase().trim();
    
    // Command mapping regex / lists
    if (norm.includes('double bottom') || norm.includes('bottom')) {
        selectPattern('double-bottom');
    } else if (norm.includes('head and shoulders') || norm.includes('shoulders') || norm.includes('head')) {
        selectPattern('head-shoulders');
    } else if (norm.includes('bull flag') || norm.includes('flag')) {
        selectPattern('bull-flag');
    } else if (norm.includes('cup and handle') || norm.includes('cup') || norm.includes('handle')) {
        selectPattern('cup-handle');
    } else if (norm.includes('bitcoin') || norm.includes('btc')) {
        switchPair('BTCUSD');
    } else if (norm.includes('ethereum') || norm.includes('eth')) {
        switchPair('ETHUSD');
    } else if (norm.includes('setup') || norm.includes('trade target') || norm.includes('entry') || norm.includes('stop')) {
        const config = configurations[currentPair][currentPattern];
        triggerAgentResponse(`For the current setup, our recommended entry is at $${config.entry.toLocaleString()} with a stop loss placed at $${config.stop.toLocaleString()} and take profit target at $${config.target.toLocaleString()}. The risk-to-reward ratio is ${config.rr} with a ${config.prob} probability score.`);
    } else if (norm.includes('analyze') || norm.includes('scan') || norm.includes('explain') || norm.includes('current signal')) {
        const config = configurations[currentPair][currentPattern];
        triggerAgentResponse(`Analyzing the current ${currentPair} chart. ${config.analysis}`);
    } else if (norm.includes('help') || norm.includes('guide') || norm.includes('dictionary') || norm.includes('patterns')) {
        openHelpGuide();
        triggerAgentResponse("I have opened the technical patterns guide. Take a look at the structures of Double Bottom, Head and Shoulders, Bull Flags, and Cup and Handles.");
    } else if (norm.includes('close') || norm.includes('hide guide') || norm.includes('exit')) {
        closeHelpGuide();
        triggerAgentResponse("Understood, closing the pattern guide.");
    } else if (norm.includes('stop speech') || norm.includes('stop speaking') || norm.includes('quiet') || norm.includes('shut up') || norm.includes('mute')) {
        window.speechSynthesis.cancel();
        triggerAgentAlert("Speech Synthesis suspended.");
    } else {
        // Fallback natural AI reply
        const fallbackReplies = [
            `I heard your command "${command}". I can switch pairs between Bitcoin and Ethereum, change patterns (Double Bottom, Head and Shoulders, Bull Flag, Cup & Handle), or explain the trade setups. Try asking: "Show me Head and Shoulders" or "Give me a trade setup".`,
            `Analyzing the term "${command}". If you want me to scan for chart patterns, say "Scan chart" or ask to analyze the specific pair. E.g. "Switch to Ethereum".`,
            `Interesting question. Technically speaking, looking at the current trend on ${currentPair}, we are in a strong phase. What specific setup details would you like me to run through?`
        ];
        const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
        triggerAgentResponse(randomReply);
    }
}

// --- Voice Active States visual buttons toggle ---
function setVoiceButtonState(state) {
    const btn = document.getElementById('voice-btn');
    const micIcon = document.getElementById('voice-mic-icon');
    const heading = document.getElementById('voice-heading');
    
    // Reset classes
    btn.classList.remove('listening', 'speaking');
    
    if (state === 'listening') {
        btn.classList.add('listening');
        heading.innerText = "Listening...";
        micIcon.setAttribute('data-lucide', 'mic');
    } else if (state === 'speaking') {
        btn.classList.add('speaking');
        heading.innerText = "Aegis Speaking...";
        micIcon.setAttribute('data-lucide', 'volume-2');
    } else {
        heading.innerText = "Aegis Voice Assistant";
        micIcon.setAttribute('data-lucide', 'mic');
    }
    
    // Force Lucide to update the icons
    lucide.createIcons();
}

// --- Canvas Soundwave Visualizer Animation ---
function initVisualizer() {
    const canvas = document.getElementById('voice-wave');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions relative to display size
    const resizeCanvas = () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight || 40;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    let phase = 0;
    
    function drawWave() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.lineWidth = 2;
        
        if (isListening) {
            // Draw green energetic soundwave bars
            ctx.strokeStyle = '#10b981';
            let barWidth = 4;
            let gap = 3;
            let barCount = Math.floor(canvas.width / (barWidth + gap));
            
            for (let i = 0; i < barCount; i++) {
                // simulate random frequencies around the center
                let distanceFromCenter = Math.abs(i - barCount/2) / (barCount/2);
                let multiplier = 1 - distanceFromCenter;
                let amplitude = (Math.sin(phase + i * 0.15) * 12 + 15) * multiplier * (0.4 + Math.random() * 0.6);
                
                let x = i * (barWidth + gap);
                let y = canvas.height / 2 - amplitude / 2;
                
                ctx.fillStyle = '#10b981';
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, amplitude, 2);
                ctx.fill();
            }
            phase += 0.25;
        } else if (isSpeaking) {
            // Draw violet/blue smooth rolling sine waves
            ctx.strokeStyle = '#8b5cf6';
            ctx.beginPath();
            
            for (let x = 0; x < canvas.width; x++) {
                let amplitude = 12 * Math.sin((x / canvas.width) * Math.PI) * Math.sin(x * 0.05 - phase);
                let y = canvas.height / 2 + amplitude;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            
            // Draw second overlapping blue wave
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
            ctx.beginPath();
            for (let x = 0; x < canvas.width; x++) {
                let amplitude = 8 * Math.sin((x / canvas.width) * Math.PI) * Math.sin(x * 0.04 - phase + 1.5);
                let y = canvas.height / 2 + amplitude;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            
            phase += 0.12;
        } else {
            // Idle state: draw a flat line with slight noise
            ctx.strokeStyle = 'rgba(113, 113, 122, 0.4)';
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        }
        
        animationFrameId = requestAnimationFrame(drawWave);
    }
    
    drawWave();
}

function startVisualizerAnimation() {
    // Already running via requestAnimationFrame
}

function stopVisualizerAnimation() {
    // Simply returns to flat idle line automatically
}

// --- Text Chat Message Handlers ---
function handleSendText() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    appendChatBubble('user', text);
    input.value = '';
    
    // Stop speaking currently reading line if user interacts
    window.speechSynthesis.cancel();
    
    // Process text as a voice command
    processVoiceCommand(text);
}

// --- Event Listener Registrations ---
document.addEventListener('DOMContentLoaded', () => {
    // Render Lucide Icons initially
    lucide.createIcons();
    
    // Init Components
    initChart();
    initSpeechRecognition();
    initVisualizer();
    updateUIPanels();
    
    // Mute/Unmute Speech synthesis
    const muteBtn = document.getElementById('mute-btn');
    const muteText = document.getElementById('mute-text');
    const muteIcon = document.getElementById('mute-icon');
    
    muteBtn.addEventListener('click', () => {
        isSpeechMuted = !isSpeechMuted;
        if (isSpeechMuted) {
            window.speechSynthesis.cancel();
            muteText.innerText = "Speech: OFF";
            muteIcon.setAttribute('data-lucide', 'volume-x');
            muteBtn.style.color = 'var(--accent-crimson)';
        } else {
            muteText.innerText = "Speech: ON";
            muteIcon.setAttribute('data-lucide', 'volume-2');
            muteBtn.style.color = 'var(--text-secondary)';
        }
        lucide.createIcons();
    });
    
    // Voice trigger button action
    document.getElementById('voice-btn').addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            // Cancel reading
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                isSpeaking = false;
                setVoiceButtonState('idle');
            }
            // Start listening
            if (recognition) {
                recognition.start();
            } else {
                document.getElementById('voice-speech-feedback').innerText = "Speech recognition is not available or blocked.";
            }
        }
    });
    
    // Chat text commands input listeners
    document.getElementById('chat-send-btn').addEventListener('click', handleSendText);
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSendText();
        }
    });

    // Simulating slight price changes on ticker header
    setInterval(() => {
        const btcEl = document.getElementById('header-btc-price');
        const ethEl = document.getElementById('header-eth-price');
        
        let currentBtc = parseFloat(btcEl.innerText.replace('$', '').replace(',', ''));
        let currentEth = parseFloat(ethEl.innerText.replace('$', '').replace(',', ''));
        
        // Random drift
        let btcDrift = (Math.random() - 0.5) * 15;
        let ethDrift = (Math.random() - 0.5) * 2;
        
        let nextBtc = (currentBtc + btcDrift).toFixed(2);
        let nextEth = (currentEth + ethDrift).toFixed(2);
        
        btcEl.innerText = `$${parseFloat(nextBtc).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        ethEl.innerText = `$${parseFloat(nextEth).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }, 4000);
});
