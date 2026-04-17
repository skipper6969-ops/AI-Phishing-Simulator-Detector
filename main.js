document.addEventListener('DOMContentLoaded', () => {
    
    // --- Initialize Particles.js ---
    if (window.particlesJS) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#00d2ff" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.3 },
                "size": { "value": 3 },
                "line_linked": { "enable": true, "distance": 150, "color": "#3a7bd5", "opacity": 0.2, "width": 1 },
                "move": { "enable": true, "speed": 1.5, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } } }
            },
            "retina_detect": true
        });
    }

    // --- Fluid Apple Glass Button Logic ---
    const fluidButtons = document.querySelectorAll('.glow-btn, .tab-btn, .action-btn');
    fluidButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            btn.style.setProperty('--mouse-x', `${x}px`);
            btn.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // --- Tab Switching Logic ---
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- Scanner Logic ---
    const scanBtn = document.getElementById('scan-btn');
    const scanInput = document.getElementById('scan-input');
    const resultsContainer = document.getElementById('scan-results');
    const terminalStream = document.getElementById('terminal-stream');
    const terminalOutput = document.getElementById('terminal-output');
    const btnText = scanBtn.querySelector('.btn-text');
    const spinner = scanBtn.querySelector('.loading-spinner');
    
    let radarChartInstance = null;

    scanBtn.addEventListener('click', () => {
        const text = scanInput.innerText.trim();
        if(!text) {
            alert("Please paste some text to scan.");
            return;
        }

        // Reset UI
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        terminalStream.classList.remove('hidden');
        terminalOutput.innerHTML = '';
        
        // Remove previous highlights by replacing HTML with plain text
        scanInput.innerHTML = scanInput.innerText;

        const aiPromise = fetch('http://localhost:5000/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        }).then(r => r.json()).catch(err => {
            console.error(err);
            return { score: 0, isPhishing: false, radar_vectors: [0,0,0,0,0], threats: ["⚠️ Backend connection failed."] };
        });

        runTerminalSequence(text, aiPromise);
    });

    function runTerminalSequence(text, aiPromise) {
        const logs = [
            `> INITIALIZING CORE SCAN PROTOCOL...`,
            `> EXTRACTING ENTITIES FROM [INPUT]...`,
            `> RUNNING NLP HEURISTICS...`,
            `> CHECKING THREAT INTEL DATABASES...`,
            `> MATCHING PATTERNS: URGENCY, SPOOFING...`,
            `> ANALYZING DOMAIN REPUTATION...`,
            `> COMPILING THREAT MATRICES...`,
            `> SCAN COMPLETE.`
        ];

        let i = 0;
        const interval = setInterval(async () => {
            if (i < logs.length) {
                const p = document.createElement('div');
                p.textContent = logs[i];
                terminalOutput.appendChild(p);
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                i++;
            } else {
                clearInterval(interval);
                const aiData = await aiPromise;
                finishScan(text, aiData);
            }
        }, 400); // 400ms per log = ~3 seconds total
    }

    function finishScan(inputText, aiData) {
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
        terminalStream.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        
        const isLikelyPhishing = aiData.isPhishing;
        const score = aiData.score;
        const color = score > 50 ? '#ff4b4b' : '#00e676';
        
        // Update Ring
        const circle = document.getElementById('score-circle');
        const percentageText = document.querySelector('.percentage');
        circle.style.stroke = color;
        circle.setAttribute('stroke-dasharray', `${score}, 100`);
        percentageText.textContent = `${score}%`;
        percentageText.style.fill = color;

        // In-Text Highlighting Logic
        if (isLikelyPhishing) {
            let highlightedText = scanInput.innerHTML;
            highlightedText = highlightedText.replace(/(urgent)/gi, '<span class="highlight-threat">$1</span>');
            highlightedText = highlightedText.replace(/(24 hours|immediately)/gi, '<span class="highlight-warning">$1</span>');
            highlightedText = highlightedText.replace(/(verify|account)/gi, '<span class="highlight-threat">$1</span>');
            scanInput.innerHTML = highlightedText;
        }

        // Radar Chart Logic
        const ctx = document.getElementById('radarChart').getContext('2d');
        if (radarChartInstance) radarChartInstance.destroy();
        
        radarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Urgency', 'Links', 'Sender', 'Formatting', 'Data Request'],
                datasets: [{
                    label: 'Threat Vector Score',
                    data: aiData.radar_vectors || [10, 5, 0, 0, 5],
                    backgroundColor: score > 50 ? 'rgba(255, 75, 75, 0.2)' : 'rgba(0, 230, 118, 0.2)',
                    borderColor: color,
                    borderWidth: 2,
                    pointBackgroundColor: color
                }]
            },
            options: {
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#94a3b8', font: { size: 10 } },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                },
                plugins: { legend: { display: false } },
                maintainAspectRatio: false
            }
        });

        // Update Threats List
        const threatList = document.getElementById('threat-list');
        threatList.innerHTML = '';
        
        if (aiData.threats && aiData.threats.length > 0) {
            aiData.threats.forEach(t => {
                const li = document.createElement('li');
                li.textContent = t;
                if (!isLikelyPhishing) {
                    li.style.borderLeftColor = '#00e676';
                    li.style.background = 'rgba(0, 230, 118, 0.1)';
                }
                threatList.appendChild(li);
            });
        }
    }

    // --- Simulator Logic (AI Powered) ---
    const generateSimBtn = document.getElementById('generate-sim-btn');
    const simSender = document.getElementById('sim-sender');
    const simSubject = document.getElementById('sim-subject');
    const simBody = document.getElementById('sim-body');
    const markPhishBtn = document.getElementById('mark-phish-btn');
    const markSafeBtn = document.getElementById('mark-safe-btn');
    const feedbackPanel = document.getElementById('sim-feedback');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackReason = document.getElementById('feedback-reason');

    let currentSimReasoning = "";

    generateSimBtn.addEventListener('click', async () => {
        generateSimBtn.textContent = 'Generating...';
        generateSimBtn.disabled = true;
        
        try {
            const res = await fetch('http://localhost:5000/simulate');
            const data = await res.json();
            
            simSender.textContent = data.sender;
            simSubject.textContent = data.subject;
            simBody.innerHTML = data.body;
            currentSimReasoning = data.reasoning;
            
            feedbackPanel.classList.add('hidden');
        } catch (err) {
            console.error(err);
            simSender.textContent = "Error";
            simSubject.textContent = "Backend not running";
            simBody.innerHTML = "<p>Ensure the python backend is running on port 5000.</p>";
        } finally {
            generateSimBtn.textContent = 'New Scenario';
            generateSimBtn.disabled = false;
        }
    });

    markPhishBtn.addEventListener('click', () => handleDecision(true));
    markSafeBtn.addEventListener('click', () => handleDecision(false));

    function handleDecision(userThinksPhishing) {
        feedbackPanel.classList.remove('hidden');
        // AI generated simulator emails are always phishing emails right now.
        if (userThinksPhishing) {
            feedbackPanel.style.borderLeftColor = '#00e676';
            feedbackTitle.textContent = "✅ Correct! Good eye.";
            feedbackTitle.style.color = '#00e676';
            feedbackReason.textContent = currentSimReasoning || "This was a phishing attempt.";
        } else {
            feedbackPanel.style.borderLeftColor = '#ff4b4b';
            feedbackTitle.textContent = "❌ Incorrect. You fell for the bait.";
            feedbackTitle.style.color = '#ff4b4b';
            feedbackReason.textContent = currentSimReasoning || "This was a phishing attempt.";
        }
    }
});
