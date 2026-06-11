/* ===================================================
   JACKSON'S EUROPE TRAVELS — main.js
   =================================================== */

// ── Data loading ────────────────────────────────────
async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

// ── Map ─────────────────────────────────────────────
async function initMap() {
  const data = await loadJSON('./data/travels.json');

  const map = L.map('europe-map', {
    center: [50.5, 10],
    zoom: 4,
    minZoom: 3,
    maxZoom: 9,
    zoomControl: false,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '©OpenStreetMap ©CartoDB',
    subdomains: 'abcd',
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

  // Custom marker icons
  const visitedIcon = L.divIcon({
    className: '',
    html: `<svg width="22" height="28" viewBox="0 0 22 28" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 0C4.9 0 0 4.9 0 11c0 7.7 11 17 11 17s11-9.3 11-17c0-6.1-4.9-11-11-11z" fill="#c9963a"/>
      <circle cx="11" cy="11" r="4.5" fill="#1b2a3b"/>
    </svg>`,
    iconSize: [22, 28],
    iconAnchor: [11, 28],
    popupAnchor: [0, -30],
  });

  const plannedIcon = L.divIcon({
    className: '',
    html: `<svg width="22" height="28" viewBox="0 0 22 28" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 0C4.9 0 0 4.9 0 11c0 7.7 11 17 11 17s11-9.3 11-17c0-6.1-4.9-11-11-11z" fill="none" stroke="#4a6741" stroke-width="2" stroke-dasharray="4,2"/>
      <circle cx="11" cy="11" r="4.5" fill="#4a6741" fill-opacity="0.4"/>
    </svg>`,
    iconSize: [22, 28],
    iconAnchor: [11, 28],
    popupAnchor: [0, -30],
  });

  const formatDate = (d) => {
    const [y, m, day] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m,10)-1]} ${parseInt(day,10)}, ${y}`;
  };

  data.visited.forEach(place => {
    L.marker([place.lat, place.lng], { icon: visitedIcon })
      .addTo(map)
      .bindPopup(`
        <div class="map-popup">
          <div class="popup-date">${formatDate(place.date)}</div>
          <h3>${place.city}, ${place.country}</h3>
          <p>${place.note}</p>
        </div>
      `, { maxWidth: 220 });
  });

  data.planned.forEach(place => {
    L.marker([place.lat, place.lng], { icon: plannedIcon })
      .addTo(map)
      .bindPopup(`
        <div class="map-popup">
          <div class="popup-date">Planned · ${formatDate(place.date)}</div>
          <h3>${place.city}, ${place.country}</h3>
          <p>${place.note}</p>
        </div>
      `, { maxWidth: 220 });
  });

  // Update hero stats
  const visitedCount = document.getElementById('stat-countries');
  const citiesCount  = document.getElementById('stat-cities');
  if (visitedCount) visitedCount.textContent = [...new Set(data.visited.map(p => p.country))].length;
  if (citiesCount)  citiesCount.textContent  = data.visited.length;
}

// ── Calendar ─────────────────────────────────────────
let calendarState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),  // 0-indexed
  selectedDate: null,
  events: [],
};

async function initCalendar() {
  const data = await loadJSON('./data/events.json');
  calendarState.events = data.events;

  // Default selected = today
  const today = new Date();
  calendarState.selectedDate = toISO(today);

  renderCalendar();
  renderEvents(calendarState.selectedDate);
  renderUpcoming();

  document.getElementById('cal-prev').addEventListener('click', () => {
    calendarState.month--;
    if (calendarState.month < 0) { calendarState.month = 11; calendarState.year--; }
    renderCalendar();
  });

  document.getElementById('cal-next').addEventListener('click', () => {
    calendarState.month++;
    if (calendarState.month > 11) { calendarState.month = 0; calendarState.year++; }
    renderCalendar();
  });
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function renderCalendar() {
  const { year, month, events, selectedDate } = calendarState;
  const todayISO = toISO(new Date());

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();

  // Month/year label
  document.getElementById('cal-month-label').textContent = `${MONTH_NAMES[month]} ${year}`;

  // Build set of dates with events for quick lookup
  const eventDates = new Set(events.map(e => e.date));

  const grid = document.getElementById('cal-days-grid');
  grid.innerHTML = '';

  // Leading blanks from prev month
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrev - i;
    const cell = document.createElement('button');
    cell.className = 'cal-day other-month';
    cell.textContent = day;
    cell.disabled = true;
    grid.appendChild(cell);
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cell = document.createElement('button');
    cell.className = 'cal-day';
    cell.textContent = d;
    cell.dataset.date = iso;

    if (iso === todayISO) cell.classList.add('today');
    if (iso === selectedDate) cell.classList.add('selected');
    if (eventDates.has(iso)) cell.classList.add('has-event');

    cell.addEventListener('click', () => {
      calendarState.selectedDate = iso;
      document.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'));
      cell.classList.add('selected');
      renderEvents(iso);
    });

    grid.appendChild(cell);
  }

  // Trailing blanks
  const total = firstDay + daysInMonth;
  const trailing = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= trailing; d++) {
    const cell = document.createElement('button');
    cell.className = 'cal-day other-month';
    cell.textContent = d;
    cell.disabled = true;
    grid.appendChild(cell);
  }
}

function renderEvents(dateISO) {
  const events = calendarState.events.filter(e => e.date === dateISO);
  const panel  = document.getElementById('events-panel');

  // Format date nicely
  const [y, m, d] = dateISO.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const formatted = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const [weekday, ...rest] = formatted.split(', ');

  panel.querySelector('.events-date-heading').innerHTML =
    `<span>${weekday}</span>, ${rest.join(', ')}`;

  const list = panel.querySelector('.events-list');
  list.innerHTML = '';

  if (events.length === 0) {
    list.innerHTML = `<p class="events-empty">No plans for this day — yet.</p>`;
    return;
  }

  events.forEach(ev => {
    const card = document.createElement('event-card');
    card.dataset.type = ev.type;
    card.innerHTML = `
      <div class="event-type-tag">${ev.type}</div>
      <div class="event-title">${ev.title}</div>
      <div class="event-desc">${ev.description}</div>
    `;
    list.appendChild(card);
  });
}

function renderUpcoming() {
  const todayISO = toISO(new Date());
  const upcoming = calendarState.events
    .filter(e => e.date >= todayISO)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const list = document.getElementById('upcoming-list');
  list.innerHTML = '';

  upcoming.forEach(ev => {
    const [y, m, d] = ev.date.split('-').map(Number);
    const dateObj  = new Date(y, m - 1, d);
    const label    = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const row = document.createElement('div');
    row.className = 'upcoming-row';
    row.innerHTML = `
      <span class="upcoming-date-badge">${label}</span>
      <span class="upcoming-title">${ev.title}</span>
    `;
    row.addEventListener('click', () => {
      // Jump to that month
      calendarState.year  = y;
      calendarState.month = m - 1;
      calendarState.selectedDate = ev.date;
      renderCalendar();
      renderEvents(ev.date);
      document.getElementById('calendar-section').scrollIntoView({ behavior: 'smooth' });
    });
    list.appendChild(row);
  });
}

// ── Boot ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  try { await initMap(); } catch (e) { console.warn('Map init failed:', e); }
  try { await initCalendar(); } catch (e) { console.warn('Calendar init failed:', e); }
});