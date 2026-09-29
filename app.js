// ===== Мок-данные (в реальном проекте придут из TMDB API) =====
const movies = [
  { id: 1, title: 'Дюна: Часть вторая', year: 2024, poster: '🏜️' },
  { id: 2, title: 'Оппенгеймер', year: 2023, poster: '💥' },
  { id: 3, title: 'Барби', year: 2023, poster: '💖' },
  { id: 4, title: 'Бедные-несчастные', year: 2023, poster: '🧪' },
  { id: 5, title: 'Прошлые жизни', year: 2023, poster: '🌙' },
  { id: 6, title: 'Анатомия падения', year: 2023, poster: '⚖️' },
];

const showtimes = [
  { id: 101, movieId: 1, time: '12:00', hall: 'Зал 1', price: 400 },
  { id: 102, movieId: 1, time: '15:30', hall: 'Зал 2', price: 450 },
  { id: 103, movieId: 1, time: '19:00', hall: 'Зал 1', price: 500 },
  { id: 104, movieId: 1, time: '21:30', hall: 'Зал 3', price: 550 },
  { id: 201, movieId: 2, time: '14:00', hall: 'Зал 1', price: 450 },
  { id: 202, movieId: 2, time: '18:00', hall: 'Зал 2', price: 500 },
  { id: 203, movieId: 2, time: '22:00', hall: 'Зал 1', price: 550 },
  { id: 301, movieId: 3, time: '13:00', hall: 'Зал 3', price: 400 },
  { id: 302, movieId: 3, time: '17:00', hall: 'Зал 1', price: 450 },
  { id: 401, movieId: 4, time: '16:00', hall: 'Зал 2', price: 450 },
  { id: 402, movieId: 4, time: '20:00', hall: 'Зал 3', price: 500 },
  { id: 501, movieId: 5, time: '15:00', hall: 'Зал 1', price: 400 },
  { id: 502, movieId: 5, time: '19:30', hall: 'Зал 2', price: 450 },
  { id: 601, movieId: 6, time: '18:30', hall: 'Зал 3', price: 500 },
];

const ROWS = 8;
const COLS = 10;
const VIP_FROM_ROW = 7;

// ===== Состояние =====
let currentMovie = null;
let currentShowtime = null;
let selectedSeats = new Set();
let occupiedSeats = new Set();

// ===== Рендер каталога =====
function renderCatalog() {
  const el = document.getElementById('movies');
  el.innerHTML = movies.map(m => `
    <div class="movie" onclick="openMovie(${m.id})">
      <div class="poster">${m.poster}</div>
      <div class="info">
        <h3>${m.title}</h3>
        <span>${m.year}</span>
      </div>
    </div>
  `).join('');
}

// ===== Открыть фильм =====
function openMovie(movieId) {
  currentMovie = movies.find(m => m.id === movieId);
  document.getElementById('showtimes-title').textContent = currentMovie.title;
  document.getElementById('screen-catalog').classList.add('hidden');
  document.getElementById('screen-showtimes').classList.remove('hidden');
  document.getElementById('hall-block').classList.add('hidden');
  currentShowtime = null;
  selectedSeats.clear();

  const list = showtimes.filter(s => s.movieId === movieId);
  const el = document.getElementById('showtimes');
  el.innerHTML = list.map(s => `
    <div class="showtime" data-id="${s.id}" onclick="openShowtime(${s.id})">
      <div class="time">${s.time}</div>
      <div class="meta">${s.hall} · ${s.price} ₽</div>
    </div>
  `).join('');
}

// ===== Открыть сеанс =====
function openShowtime(showtimeId) {
  currentShowtime = showtimes.find(s => s.id === showtimeId);
  selectedSeats.clear();
  occupiedSeats = generateOccupied(showtimeId);

  document.querySelectorAll('.showtime').forEach(el => {
    el.classList.toggle('active', Number(el.dataset.id) === showtimeId);
  });

  document.getElementById('hall-block').classList.remove('hidden');
  renderHall();
  updateSummary();
}

// ===== Генератор занятых мест (детерминированный) =====
function generateOccupied(showtimeId) {
  const occupied = new Set();
  let seed = showtimeId * 9301 + 49297;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let r = 1; r <= ROWS; r++) {
    for (let c = 1; c <= COLS; c++) {
      if (rnd() < 0.25) occupied.add(`${r}-${c}`);
    }
  }
  return occupied;
}

// ===== Рендер зала =====
function renderHall() {
  const container = document.getElementById('hall-rows');
  let html = '';
  for (let r = 1; r <= ROWS; r++) {
    html += '<div class="row">';
    for (let c = 1; c <= COLS; c++) {
      const key = `${r}-${c}`;
      const isOccupied = occupiedSeats.has(key);
      const isVip = r >= VIP_FROM_ROW;
      const cls = ['seat'];
      if (isOccupied) cls.push('occupied');
      if (isVip) cls.push('vip');
      html += `<button class="${cls.join(' ')}" data-key="${key}"
                ${isOccupied ? 'disabled' : ''}
                onclick="toggleSeat('${key}', this)"></button>`;
    }
    html += '</div>';
  }
  container.innerHTML = html;
}

// ===== Выбор места =====
function toggleSeat(key, el) {
  if (selectedSeats.has(key)) {
    selectedSeats.delete(key);
    el.classList.remove('selected');
  } else {
    if (selectedSeats.size >= 6) {
      alert('Максимум 6 мест за раз');
      return;
    }
    selectedSeats.add(key);
    el.classList.add('selected');
  }
  updateSummary();
}

// ===== Итог =====
function updateSummary() {
  const count = selectedSeats.size;
  document.getElementById('seats-count').textContent = count;
  const price = currentShowtime ? currentShowtime.price : 0;
  document.getElementById('total-price').textContent = (count * price) + ' ₽';
  document.getElementById('pay-btn').disabled = count === 0;
}

// ===== Оплата (эмуляция) =====
async function pay() {
  const btn = document.getElementById('pay-btn');
  btn.disabled = true;
  btn.textContent = 'Обработка...';

  await new Promise(r => setTimeout(r, 1500));

  const success = Math.random() < 0.9;

  btn.textContent = 'Оплатить';
  btn.disabled = false;

  if (success) {
    document.getElementById('success-text').textContent =
      `Фильм: ${currentMovie.title}, ${currentShowtime.time}, мест: ${selectedSeats.size}`;
    document.getElementById('success-modal').classList.remove('hidden');
  } else {
    alert('Оплата не прошла. Попробуйте ещё раз.');
  }
}

function closeModal() {
  document.getElementById('success-modal').classList.add('hidden');
  selectedSeats.clear();
  backToCatalog();
}

function backToCatalog() {
  document.getElementById('screen-catalog').classList.remove('hidden');
  document.getElementById('screen-showtimes').classList.add('hidden');
}

// ===== Регистрация Service Worker (PWA) =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.warn('SW не зарегистрирован:', err);
    });
  });
}

// ===== Старт =====
renderCatalog();
