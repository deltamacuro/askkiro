var current = 1;
var total = 9;
var visited = {};

function init() {
  try {
    buildDots();
    setupNav();
    setupCopy();
    setupScreens();
    setupHelp();
    loadState();
    updateUI();
  } catch (e) { console.error(e); }
}

function buildDots() {
  var container = document.getElementById('nav-dots');
  if (!container) return;
  for (var i = 1; i <= total; i++) {
    var dot = document.createElement('button');
    dot.className = 'nav-dot';
    dot.setAttribute('data-m', i);
    if (i === 1) dot.classList.add('active');
    dot.addEventListener('click', (function(n) {
      return function() { goTo(n); };
    })(i));
    container.appendChild(dot);
  }
}

function goTo(n) {
  if (n < 1 || n > total) return;
  visited[current] = true;
  current = n;
  updateUI();
  saveState();
}

function updateUI() {
  // Missions
  document.querySelectorAll('.mission').forEach(function(m) { m.classList.remove('active'); });
  var active = document.querySelector('.mission[data-mission="' + current + '"]');
  if (active) active.classList.add('active');

  // Dots
  document.querySelectorAll('.nav-dot').forEach(function(d) {
    var n = parseInt(d.getAttribute('data-m'));
    d.classList.remove('active', 'visited');
    if (n === current) d.classList.add('active');
    else if (visited[n]) d.classList.add('visited');
  });

  // Prev/Next
  var prev = document.getElementById('btn-prev');
  var next = document.getElementById('btn-next');
  if (prev) prev.disabled = (current <= 1);
  if (next) {
    if (current >= total) {
      next.textContent = 'Finalizar';
      next.classList.add('finish');
    } else {
      next.textContent = 'Siguiente';
      next.classList.remove('finish');
    }
  }

  // Phase tabs
  var phase = parseInt(active ? active.getAttribute('data-phase') : 1);
  document.querySelectorAll('.topbar-phase').forEach(function(t) {
    var p = parseInt(t.getAttribute('data-phase'));
    t.classList.remove('active', 'locked', 'unlocked', 'done');
    if (p === phase) t.classList.add('active');
    else if (p < phase) t.classList.add('done');
    else t.classList.add('unlocked');
  });

  // Counter
  var counter = document.getElementById('topbar-count');
  if (counter) counter.textContent = current + '/' + total;
}

function setupNav() {
  var prev = document.getElementById('btn-prev');
  var next = document.getElementById('btn-next');
  if (prev) prev.addEventListener('click', function() { goTo(current - 1); });
  if (next) next.addEventListener('click', function() {
    if (current >= total) {
      visited[current] = true;
      showScreen('screen-end');
      saveState();
    } else {
      goTo(current + 1);
    }
  });

  // Keyboard nav
  document.addEventListener('keydown', function(e) {
    var play = document.getElementById('screen-play');
    if (!play || !play.classList.contains('active')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo(current - 1); }
  });

  // Phase tab clicks
  document.querySelectorAll('.topbar-phase').forEach(function(tab) {
    tab.addEventListener('click', function() {
      if (tab.classList.contains('locked')) return;
      var p = parseInt(tab.getAttribute('data-phase'));
      var firstStep = { 1: 1, 2: 4, 3: 7 };
      goTo(firstStep[p] || 1);
    });
  });
}

function setupCopy() {
  document.querySelectorAll('.ask-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var code = btn.parentElement.querySelector('code');
      if (!code) return;
      navigator.clipboard.writeText(code.textContent.trim()).then(function() {
        var orig = btn.innerHTML;
        btn.classList.add('copied');
        btn.textContent = 'Copiado';
        setTimeout(function() { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
      });
    });
  });
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  var screen = document.getElementById(id);
  if (screen) screen.classList.add('active');
}

function setupScreens() {
  // Start -> Play
  var play = document.getElementById('btn-play');
  if (play) play.addEventListener('click', function() { showScreen('screen-play'); });

  // Home button
  var home = document.getElementById('btn-home');
  if (home) home.addEventListener('click', function() { showScreen('screen-start'); });

  // End -> Start
  var backStart = document.getElementById('btn-back-start');
  if (backStart) backStart.addEventListener('click', function() { showScreen('screen-start'); });

  // Restart
  var restart = document.getElementById('btn-restart');
  if (restart) restart.addEventListener('click', function() {
    localStorage.removeItem('kiroWS');
    current = 1; visited = {};
    updateUI();
    showScreen('screen-play');
  });

  // Modes
  document.querySelectorAll('.start-mode').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      document.body.className = 'mode-' + link.getAttribute('data-mode');
      showScreen('screen-play');
    });
  });
}

function setupHelp() {
  var overlay = document.getElementById('help-overlay');
  var btnHelp = document.getElementById('btn-help');
  var btnClose = document.getElementById('help-close');
  if (btnHelp && overlay) btnHelp.addEventListener('click', function(e) { e.preventDefault(); overlay.classList.add('open'); });
  if (btnClose && overlay) btnClose.addEventListener('click', function() { overlay.classList.remove('open'); });
  if (overlay) overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.classList.remove('open'); });
}

function saveState() {
  try { localStorage.setItem('kiroWS', JSON.stringify({ current: current, visited: visited })); } catch (e) {}
}

function loadState() {
  try {
    var data = localStorage.getItem('kiroWS');
    if (!data) return;
    var s = JSON.parse(data);
    if (s.current) current = s.current;
    if (s.visited) visited = s.visited;
  } catch (e) {}
}

init();
