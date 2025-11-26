/* -------------------------
   Data (Replace / expand)
   ------------------------- */
const SERVICES = [
  { id: 'plumbing', name: 'Plumbing', desc: 'Fix leaks, install taps, unclog drains.' },
  { id: 'cleaning', name: 'Cleaning', desc: 'Home cleaning, deep cleaning, sanitization.' },
  { id: 'electrician', name: 'Electrician', desc: 'Wiring, repairs, fixtures.' },
  { id: 'gardening', name: 'Gardening', desc: 'Lawn care, trimming, planting.' }
];

/* default demo workers (will be supplemented by partner signups) */
let WORKERS = [
  { id:'w1', name:'Alice Kumar', service:'plumbing', phone:'+91 98765 43210', bio:'5 yrs experience. Fast & reliable.' },
  { id:'w2', name:'Ravi Patel', service:'cleaning', phone:'+91 91234 56789', bio:'Deep cleaning specialist.' },
  { id:'w3', name:'Charan Rao', service:'electrician', phone:'+91 99887 77665', bio:'Certified electrician.' },
  { id:'w4', name:'Dina Sharma', service:'gardening', phone:'+91 98123 45678', bio:'Garden designer & care.' }
];

/* Add saved partners from localStorage */
const savedPartners = JSON.parse(localStorage.getItem('opeulaid_partners') || '[]');
if (savedPartners && savedPartners.length) {
  // map to worker objects and push
  savedPartners.forEach(p => {
    WORKERS.push({ id: 'p_' + (p.email || p.phone), name: p.name, service: p.service, phone: p.phone, bio: p.bio || 'Partner signup' });
  });
}

/* -------------------------
   Element refs
   ------------------------- */
const DOM = {
  hero: document.getElementById('hero'),
  services: document.getElementById('services'),
  servicesGrid: document.getElementById('services-grid'),
  workers: document.getElementById('workers'),
  workersGrid: document.getElementById('workers-grid'),
  workersTitle: document.getElementById('workers-title'),
  chat: document.getElementById('chat'),
  chatWindow: document.getElementById('chat-window'),
  chatInput: document.getElementById('chat-input'),
  chatWith: document.getElementById('chat-with'),
  modal: document.getElementById('modal'),
  modalContent: document.getElementById('modal-content'),
  modalClose: document.getElementById('modal-close'),
  modalOk: document.getElementById('modal-ok'),
  locationStatus: document.getElementById('location-status'),
  servicesNote: document.getElementById('services-note')
};

/* -------------------------
   Helpers: show/hide screens
   ------------------------- */
function showScreen(screenEl){
  [DOM.hero, DOM.services, DOM.workers, DOM.chat].forEach(s => s.classList.add('hidden'));
  screenEl.classList.remove('hidden');
  window.scrollTo({ top:0, behavior:'smooth' });
}

/* -------------------------
   Home buttons wiring
   ------------------------- */
document.getElementById('btn-hire').addEventListener('click', () => {
  requestLocationThenShowServices();
});
document.getElementById('btn-partner').addEventListener('click', ()=> openPartnerSignup());
document.getElementById('btn-login').addEventListener('click', ()=> openPartnerLogin());
document.getElementById('btn-signup').addEventListener('click', ()=> openUserSignupModal());
document.getElementById('btn-help').addEventListener('click', ()=> openModal(`<h3>Help</h3><p class="muted">Contact: <br/>Call: <b>+91 98855 88412</b><br/>Email: <a href="mailto:support.opeulaid@gmail.com">support.opeulaid@gmail.com</a></p>`));

document.getElementById('services-back').addEventListener('click', ()=> showScreen(DOM.hero));
document.getElementById('workers-back').addEventListener('click', ()=> { renderServices(); showScreen(DOM.services); });
document.getElementById('chat-back').addEventListener('click', ()=> { showScreen(DOM.workers); });

/* -------------------------
   Modal helpers
   ------------------------- */
DOM.modalClose.addEventListener('click', closeModal);
DOM.modalOk.addEventListener('click', closeModal);

function openModal(html){
  DOM.modalContent.innerHTML = html;
  DOM.modal.classList.remove('hidden');
}
function closeModal(){
  DOM.modal.classList.add('hidden');
  DOM.modalContent.innerHTML = '';
}

/* -------------------------
   Location: fetch and reverse geocode
   ------------------------- */
const SUPPORTED_CITIES = ['Hyderabad','Bengaluru','Mumbai','New Delhi','Delhi','Chennai','Kolkata','Pune']; // demo list

function requestLocationThenShowServices(){
  DOM.locationStatus.textContent = 'Requesting location permission...';
  if (!navigator.geolocation) {
    DOM.locationStatus.textContent = 'Geolocation not supported by your browser. Showing available services.';
    renderServices('unknown');
    showScreen(DOM.services);
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    DOM.locationStatus.textContent = `Got coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} — checking city...`;

    // reverse geocode using Nominatim (OpenStreetMap)
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
      const resp = await fetch(url, { headers: { 'Accept': 'application/json' }});
      const data = await resp.json();
      const city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state || 'Unknown';
      DOM.locationStatus.textContent = `Location detected: ${city}`;
      const available = SUPPORTED_CITIES.some(c => city.toLowerCase().includes(c.toLowerCase()));
      if (available) {
        DOM.servicesNote.textContent = `Services available in ${city}.`;
      } else {
        DOM.servicesNote.textContent = `We don't currently list services specifically for ${city}. Showing all services (demo).`;
      }
    } catch(err){
      console.warn('reverse geocode failed', err);
      DOM.locationStatus.textContent = 'Could not detect city; showing services.';
      DOM.servicesNote.textContent = 'Showing all services.';
    }

    renderServices();
    showScreen(DOM.services);
  }, (err) => {
    DOM.locationStatus.textContent = 'Location permission denied or unavailable. Showing services.';
    renderServices();
    showScreen(DOM.services);
  }, { enableHighAccuracy: false, timeout: 10000 });
}

/* -------------------------
   Render services
   ------------------------- */
function renderServices(){
  DOM.servicesGrid.innerHTML = '';
  SERVICES.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${s.name}</h3>
      <p class="muted">${s.desc}</p>
      <div class="row">
        <button class="btn call-btn" onclick="selectService('${s.id}')">Select</button>
      </div>
    `;
    DOM.servicesGrid.appendChild(card);
  });
}

/* -------------------------
   When user selects a service
   ------------------------- */
let currentService = null;
function selectService(serviceId){
  currentService = serviceId;
  const service = SERVICES.find(s => s.id === serviceId);
  DOM.workersTitle.textContent = `${service.name} Partners`;
  renderWorkers(serviceId);
  showScreen(DOM.workers);
}

/* -------------------------
   Render workers for service
   ------------------------- */
function renderWorkers(serviceId){
  DOM.workersGrid.innerHTML = '';
  const entries = WORKERS.filter(w=> w.service === serviceId);
  if(entries.length === 0){
    DOM.workersGrid.innerHTML = `<p class="muted">No partners available for this service right now.</p>`;
    return;
  }

  entries.forEach(w => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="worker-avatar">${w.name.split(' ').map(n=>n[0]).join('')}</div>
      <h3>${w.name}</h3>
      <p class="muted">${w.bio || ''}</p>
      <div class="row">
        <button class="btn call-btn" onclick="callWorker('${w.id}')">Call</button>
        <button class="btn text-btn" onclick="textWorker('${w.id}')">Text</button>
      </div>
    `;
    DOM.workersGrid.appendChild(card);
  });
}

/* -------------------------
   Call -> shows number & contact us option
   ------------------------- */
function callWorker(workerId){
  const w = WORKERS.find(x=>x.id === workerId);
  const html = `
    <h3>Call ${w.name}</h3>
    <p class="muted">Tap or copy this number to call:</p>
    <p style="font-weight:700; margin-top:12px;">${w.phone}</p>
    <p class="muted" style="margin-top:14px">Or contact support:</p>
    <p style="margin-top:8px;"><b>Phone:</b> +91 98855 88412<br/><b>Email:</b> <a href="mailto:support.opeulaid@gmail.com">support.opeulaid@gmail.com</a></p>
  `;
  openModal(html);
}

/* -------------------------
   Text -> open in-app chat
   ------------------------- */
let activeChatWorker = null;
let chatHistory = {}; // preserved per worker in-memory

function textWorker(workerId){
  activeChatWorker = WORKERS.find(x=>x.id === workerId);
  DOM.chatWith.textContent = `Chat with ${activeChatWorker.name}`;
  if(!chatHistory[workerId]) chatHistory[workerId] = [
    {from:'other', text:`Hi, I'm ${activeChatWorker.name}. How can I help?`}
  ];
  renderChat();
  showScreen(DOM.chat);
}

/* -------------------------
   Render chat messages
   ------------------------- */
function renderChat(){
  DOM.chatWindow.innerHTML = '';
  const list = chatHistory[activeChatWorker.id] || [];
  list.forEach(m=>{
    const div = document.createElement('div');
    div.className = 'msg ' + (m.from === 'you' ? 'you' : 'other');
    div.textContent = m.text;
    DOM.chatWindow.appendChild(div);
  });
  DOM.chatWindow.scrollTop = DOM.chatWindow.scrollHeight;
}

/* -------------------------
   Send message
   ------------------------- */
document.getElementById('chat-send').addEventListener('click', () => {
  const text = DOM.chatInput.value.trim();
  if(!text) return;
  chatHistory[activeChatWorker.id] = chatHistory[activeChatWorker.id] || [];
  chatHistory[activeChatWorker.id].push({ from:'you', text });
  DOM.chatInput.value = '';
  renderChat();

  // simulate worker reply
  setTimeout(() => {
    chatHistory[activeChatWorker.id].push({ from:'other', text: `Got your message: "${text}". I'll respond soon.` });
    renderChat();
  }, 900);
});

/* -------------------------
   Partner Signup/Login (localStorage demo)
   ------------------------- */
function openPartnerSignup(){
  const html = `
    <h3>Partner Sign Up</h3>
    <div class="form-row">
      <input id="p-name" placeholder="Full name" />
      <input id="p-email" placeholder="Email (used as login)" />
      <input id="p-phone" placeholder="Phone (e.g. +91 9...)" />
      <select id="p-service">
        <option value="">Select Service</option>
        ${SERVICES.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
      </select>
      <input id="p-pass" placeholder="Password" type="password" />
      <input id="p-bio" placeholder="Short bio (optional)" />
      <button class="cta" id="p-signup-btn">Create Partner Account</button>
      <div class="muted" style="font-size:13px">Or contact support: <br/>Phone: +91 98855 88412 | Email: <a href="mailto:support.opeulaid@gmail.com">support.opeulaid@gmail.com</a></div>
    </div>
  `;
  openModal(html);

  document.getElementById('p-signup-btn').addEventListener('click', ()=> {
    const name = document.getElementById('p-name').value.trim();
    const email = document.getElementById('p-email').value.trim();
    const phone = document.getElementById('p-phone').value.trim();
    const service = document.getElementById('p-service').value;
    const pass = document.getElementById('p-pass').value;
    const bio = document.getElementById('p-bio').value.trim();

    if(!name || !email || !phone || !service || !pass){
      alert('Please fill name, email, phone, service and password.');
      return;
    }

    // save partner in localStorage
    const partners = JSON.parse(localStorage.getItem('opeulaid_partners') || '[]');
    partners.push({ name, email, phone, service, pass, bio });
    localStorage.setItem('opeulaid_partners', JSON.stringify(partners));

    // add to current worker list (visible)
    WORKERS.push({ id:'p_' + email, name, service, phone, bio });
    alert('Partner account created. You will appear in the worker list for your service.');
    closeModal();
  });
}

function openPartnerLogin(){
  const html = `
    <h3>Partner Login</h3>
    <div class="form-row">
      <input id="l-email" placeholder="Email" />
      <input id="l-pass" placeholder="Password" type="password" />
      <button class="cta" id="l-login-btn">Login</button>
      <div class="muted" style="font-size:13px">Need help? Call +91 98855 88412 or <a href="mailto:support.opeulaid@gmail.com">support.opeulaid@gmail.com</a></div>
    </div>
  `;
  openModal(html);

  document.getElementById('l-login-btn').addEventListener('click', ()=> {
    const email = document.getElementById('l-email').value.trim();
    const pass = document.getElementById('l-pass').value;
    const partners = JSON.parse(localStorage.getItem('opeulaid_partners') || '[]');
    const match = partners.find(p => p.email === email && p.pass === pass);
    if(!match) {
      alert('Invalid credentials (demo). If you just signed up, ensure you used the same email & password.');
      return;
    }
    closeModal();
    openModal(`<h3>Welcome, ${match.name}</h3><p class="muted">You are logged in as a partner. For demo, create and manage your profile via the browser storage.</p><p style="margin-top:8px">Contact support: +91 98855 88412<br/><a href="mailto:support.opeulaid@gmail.com">support.opeulaid@gmail.com</a></p>`);
  });
}

/* user signup modal (just placeholder) */
function openUserSignupModal(){
  openModal(`<h3>Sign Up (demo)</h3><p class="muted">User signup will be available in the next update. For now, Hire to see services and contact partners.</p>`);
}

/* -------------------------
   Initialize (hero visible)
   ------------------------- */
showScreen(DOM.hero);
