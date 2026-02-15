import { GoogleGenAI } from "@google/genai";

// --- State Management ---
const appState = {
    view: 'LANDING',
    attendees: [],
    currentTicket: null,
    html5QrcodeScanner: null,
    chartInstance: null,
    currentPortal: null // 'participant' or 'admin' or null (landing)
};

// --- Config ---
let API_KEY = "";
try {
    if (typeof process !== "undefined" && process.env && process.env.API_KEY) {
        API_KEY = process.env.API_KEY;
    }
} catch (e) {}

// --- Gemini Service ---
const getClient = () => {
    if (!API_KEY) {
        console.warn("API Key missing.");
        return null;
    }
    return new GoogleGenAI({ apiKey: API_KEY });
};

async function generateBadgePersona(name, role, ticketType) {
    const client = getClient();
    if (!client) return "Tech Enthusiast";
    try {
        const prompt = `Create a short, cool, and slightly futuristic "Badge Persona" or "Callsign" (max 3-4 words) for an event attendee. Name: ${name}, Role: ${role}, Ticket: ${ticketType}. Return ONLY the string.`;
        const response = await client.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        return response.text?.trim() || "Future Walker";
    } catch (e) { return "Future Walker"; }
}

async function getWelcomeMessage(name, persona) {
    const client = getClient();
    if (!client) return `Welcome, ${name}!`;
    try {
        const prompt = `Write a 1 sentence high-energy cyberpunk welcome message for User: ${name}, Persona: ${persona}.`;
        const response = await client.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        return response.text?.trim() || `Welcome to the future, ${name}.`;
    } catch (e) { return `Welcome to the future, ${name}.`; }
}

// --- App Logic ---

window.app = {
    // Determine which "Portal" we are in based on URL params
    init: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const portal = urlParams.get('portal');
        
        if (portal === 'admin') {
            window.app.switchPortal('admin');
        } else if (portal === 'participant') {
            window.app.switchPortal('participant');
        } else {
            // Default to landing
            window.app.navigateTo('LANDING');
        }
    },

    switchPortal: (portal) => {
        appState.currentPortal = portal;
        // Update URL without reload to allow bookmarking
        const url = new URL(window.location);
        if (portal) {
            url.searchParams.set('portal', portal);
        } else {
            url.searchParams.delete('portal');
        }
        window.history.pushState({}, '', url);

        // Reset state slightly when switching portals if needed
        if (portal === 'admin') {
            window.app.navigateTo('ADMIN');
        } else if (portal === 'participant') {
            window.app.navigateTo('REGISTER');
        } else {
            window.app.navigateTo('LANDING');
        }
    },

    navigateTo: (viewName) => {
        appState.view = viewName;
        
        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden-view'));
        
        // Show target view
        const target = document.getElementById(`view-${viewName.toLowerCase()}`);
        if(target) target.classList.remove('hidden-view');

        // Update Navbar Badge
        const navBadge = document.getElementById('nav-badge');
        if (!appState.currentPortal) {
            navBadge.classList.add('hidden');
        } else {
            navBadge.classList.remove('hidden');
            navBadge.textContent = appState.currentPortal === 'admin' ? 'COMMITTEE PORTAL' : 'PARTICIPANT PORTAL';
        }

        // View Specific Logic
        if (viewName === 'ADMIN') {
            updateAdminDashboard();
        } else if (viewName === 'ADMIN_LIST') {
            updateAdminList();
        }
        
        // Cleanup Scanner
        if (viewName !== 'ADMIN' && appState.html5QrcodeScanner) {
            window.app.stopScanner();
        }
    },

    shareWhatsApp: () => {
        if (!appState.currentTicket) return;
        const a = appState.currentTicket;
        const text = `🎟️ *EVENT HORIZON TICKET*\n\n👤 *Name:* ${a.fullName}\n💼 *Role:* ${a.role}\n🎫 *Type:* ${a.ticketType}\n🆔 *ID:* ${a.id}\n\n🤖 *Persona:* ${a.aiPersona || 'N/A'}\n\n_Show this code at Gate 04-A to enter._`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    },

    startScanner: () => {
        document.getElementById('scanner-ui-placeholder').classList.add('hidden');
        document.getElementById('scanner-ui-active').classList.remove('hidden');
        
        const onScanSuccess = (decodedText) => {
            let id = decodedText;
            try {
                const data = JSON.parse(decodedText);
                if (data.id) id = data.id;
            } catch(e) {} 
            processCheckIn(id);
        };

        appState.html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
        appState.html5QrcodeScanner.render(onScanSuccess, (err) => {});
    },

    stopScanner: () => {
        if (appState.html5QrcodeScanner) {
            appState.html5QrcodeScanner.clear();
            appState.html5QrcodeScanner = null;
        }
        document.getElementById('scanner-ui-placeholder').classList.remove('hidden');
        document.getElementById('scanner-ui-active').classList.add('hidden');
    },

    handleManualCheckIn: () => {
        const input = document.getElementById('manual-checkin-id');
        const id = input.value.trim().toUpperCase();
        if(!id) return;
        processCheckIn(id);
        input.value = '';
    }
};

// --- Registration Logic ---
const form = document.getElementById('registration-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('reg-submit-btn');
        const originalText = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>Generating Identity...</span>`;
        btn.classList.add('bg-indigo-700', 'cursor-not-allowed');

        const name = document.getElementById('reg-name').value;
        const role = document.getElementById('reg-role').value;
        const type = document.getElementById('reg-ticket').value;

        const persona = await generateBadgePersona(name, role, type);

        const newAttendee = {
            id: Math.random().toString(36).substr(2, 9).toUpperCase(),
            fullName: name,
            email: document.getElementById('reg-email').value,
            role: role,
            ticketType: type,
            status: 'Registered',
            aiPersona: persona,
            checkInTime: null
        };

        appState.attendees.push(newAttendee);
        appState.currentTicket = newAttendee;

        renderTicket(newAttendee);

        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove('bg-indigo-700', 'cursor-not-allowed');
        form.reset();
        window.app.navigateTo('TICKET');
    });
}

async function renderTicket(attendee) {
    document.getElementById('ticket-attendee-name').textContent = attendee.fullName;
    document.getElementById('ticket-attendee-role').textContent = attendee.role;
    document.getElementById('ticket-badge-type').textContent = attendee.ticketType;
    document.getElementById('ticket-id-display').textContent = attendee.id;

    const header = document.getElementById('ticket-header-bg');
    header.className = `h-32 p-6 relative bg-gradient-to-r ${getGradient(attendee.ticketType)}`;

    const personaContainer = document.getElementById('ticket-persona-container');
    if (attendee.aiPersona) {
        personaContainer.classList.remove('hidden');
        document.getElementById('ticket-persona-text').textContent = attendee.aiPersona;
        const welcome = await getWelcomeMessage(attendee.fullName, attendee.aiPersona);
        document.getElementById('ticket-ai-msg').classList.remove('hidden');
        document.getElementById('ticket-welcome-text').textContent = welcome;
    }

    const qrContainer = document.getElementById('qrcode-container');
    qrContainer.innerHTML = '';
    const qrData = JSON.stringify({
        id: attendee.id,
        name: attendee.fullName,
        ticketType: attendee.ticketType,
        event: "Event Horizon 2024"
    });
    new QRCode(qrContainer, {
        text: qrData,
        width: 192,
        height: 192,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}

function getGradient(type) {
    switch (type) {
      case 'VIP All Access': return 'from-amber-500 to-red-600';
      case 'Speaker': return 'from-cyan-500 to-blue-600';
      case 'Press Pass': return 'from-emerald-500 to-teal-600';
      default: return 'from-indigo-500 to-purple-600';
    }
}

// --- Admin Logic ---

function processCheckIn(id) {
    const idx = appState.attendees.findIndex(a => a.id === id);
    const msgEl = document.getElementById('checkin-status-msg');
    msgEl.classList.remove('hidden', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20', 'bg-red-500/10', 'text-red-400', 'border-red-500/20');

    if (idx === -1) {
        msgEl.textContent = `ID ${id} NOT FOUND`;
        msgEl.classList.add('bg-red-500/10', 'text-red-400', 'border-red-500/20');
    } else {
        const attendee = appState.attendees[idx];
        if (attendee.status === 'Checked In') {
            msgEl.textContent = `${attendee.fullName} already checked in.`;
            msgEl.classList.add('bg-red-500/10', 'text-red-400', 'border-red-500/20');
        } else {
            attendee.status = 'Checked In';
            attendee.checkInTime = new Date().toISOString();
            msgEl.textContent = `Welcome, ${attendee.fullName}!`;
            msgEl.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20');
        }
    }
    updateAdminDashboard();
    setTimeout(() => msgEl.classList.add('hidden'), 3000);
}

function updateAdminDashboard() {
    const total = appState.attendees.length;
    const checkedIn = appState.attendees.filter(a => a.status === 'Checked In');
    
    document.getElementById('stats-capacity').textContent = `${checkedIn.length} / ${total}`;
    const pct = total > 0 ? (checkedIn.length / total) * 100 : 0;
    document.getElementById('stats-progress-bar').style.width = `${pct}%`;

    const listEl = document.getElementById('recent-activity-list');
    listEl.innerHTML = '';
    const recent = [...checkedIn].reverse().slice(0, 5);
    
    if (recent.length === 0) {
        listEl.innerHTML = '<div class="text-center text-slate-600 text-sm py-8">Waiting for first arrival...</div>';
    } else {
        recent.forEach(a => {
            const time = new Date(a.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            listEl.innerHTML += `
                <div class="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700/50 animate-slide-up">
                    <div>
                        <p class="text-white font-medium text-sm">${a.fullName}</p>
                        <p class="text-indigo-400 text-xs font-mono">${a.id}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-500">${time}</span>
                        <div class="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs">In</div>
                    </div>
                </div>
            `;
        });
    }
    updateChart();
}

function updateAdminList() {
    const tbody = document.getElementById('admin-attendee-list-body');
    const emptyMsg = document.getElementById('admin-list-empty');
    tbody.innerHTML = '';
    
    if (appState.attendees.length === 0) {
        emptyMsg.classList.remove('hidden');
        return;
    }
    emptyMsg.classList.add('hidden');

    appState.attendees.forEach(a => {
        const time = a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : '-';
        const statusClass = a.status === 'Checked In' 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : 'bg-indigo-500/20 text-indigo-400';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-700/30 transition-colors">
                <td class="p-4 font-mono text-xs text-slate-500">${a.id}</td>
                <td class="p-4 font-medium text-white">${a.fullName}</td>
                <td class="p-4 text-slate-400">${a.role}</td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded text-xs border border-white/10 bg-slate-800">
                        ${a.ticketType}
                    </span>
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded text-xs font-bold ${statusClass}">
                        ${a.status}
                    </span>
                </td>
                <td class="p-4 text-slate-400 font-mono text-xs">${time}</td>
            </tr>
        `;
    });
}

function updateChart() {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) return;
    const counts = {};
    appState.attendees.forEach(a => { counts[a.ticketType] = (counts[a.ticketType] || 0) + 1; });
    
    const labels = Object.keys(counts);
    const data = Object.values(counts);

    if (appState.chartInstance) appState.chartInstance.destroy();

    appState.chartInstance = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels.length ? labels : ['None'],
            datasets: [{
                data: data.length ? data : [1],
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8' } },
                tooltip: { backgroundColor: '#1e293b' }
            }
        }
    });
}

// Init Decoration and App
const ripDots = document.getElementById('rip-dots');
if (ripDots) {
    for(let i=0; i<20; i++) {
        const dot = document.createElement('div');
        dot.className = "w-3 h-3 bg-slate-900 rounded-full";
        ripDots.appendChild(dot);
    }
}

// Start Routing Logic on Load
window.addEventListener('load', window.app.init);
