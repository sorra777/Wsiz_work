const UPGRADES = [
  { id: 'click1', icon: '👆', name: 'Nano Fingers',    desc: '+1 pts per click',    type: 'click', base: 10,    factor: 3,   maxLevel: 5, perLevel: 1   },
  { id: 'click2', icon: '⚡', name: 'Voltage Pulse',   desc: '+5 pts per click',    type: 'click', base: 100,   factor: 3,   maxLevel: 5, perLevel: 5   },
  { id: 'click3', icon: '💎', name: 'Crystal Core',    desc: '+20 pts per click',   type: 'click', base: 800,   factor: 3,   maxLevel: 5, perLevel: 20  },
  { id: 'pass1',  icon: '🤖', name: 'Nano Bot',        desc: '+1 pt/sec passive',   type: 'pass',  base: 15,    factor: 2.5, maxLevel: 5, perLevel: 1   },
  { id: 'pass2',  icon: '🔮', name: 'Energy Sphere',   desc: '+5 pts/sec passive',  type: 'pass',  base: 150,   factor: 2.5, maxLevel: 5, perLevel: 5   },
  { id: 'pass3',  icon: '🌐', name: 'Quantum Grid',    desc: '+20 pts/sec passive', type: 'pass',  base: 1200,  factor: 2.5, maxLevel: 5, perLevel: 20  },
  { id: 'pass4',  icon: '🚀', name: 'Hyper Drive',     desc: '+100 pts/sec',        type: 'pass',  base: 10000, factor: 2.5, maxLevel: 5, perLevel: 100 },
];

const ACHIEVEMENTS = [
  { id: 'first', label: 'First Click',  check: s => s.totalClicks  >= 1      },
  { id: 'c100',  label: '100 Clicks',   check: s => s.totalClicks  >= 100    },
  { id: 'c1k',   label: '1K Clicks',    check: s => s.totalClicks  >= 1000   },
  { id: 'p100',  label: '100 Points',   check: s => s.totalEarned  >= 100    },
  { id: 'p1k',   label: '1K Points',    check: s => s.totalEarned  >= 1000   },
  { id: 'p10k',  label: '10K Points',   check: s => s.totalEarned  >= 10000  },
  { id: 'p100k', label: '100K Points',  check: s => s.totalEarned  >= 100000 },
  { id: 'upg1',  label: 'Upgraded',     check: s => s.totalUpgrades >= 1    },
  { id: 'upg5',  label: '5 Upgrades',   check: s => s.totalUpgrades >= 5    },
  { id: 'upg10', label: '10 Upgrades',  check: s => s.totalUpgrades >= 10   },
];

let state = {
  points: 0,
  totalEarned: 0,
  totalClicks: 0,
  totalUpgrades: 0,
  lastSave: Date.now(),
  upgradeLevels: {},
  unlockedAch: {},
};


function loadState() {
  try {
    const raw = localStorage.getItem('cyberclicker_v2');
    if (raw) {
      const saved = JSON.parse(raw);
      state = { ...state, ...saved };
    }
  } catch (e) {
    console.warn('Could not load save:', e);
  }
}

function saveState() {
  try {
    state.lastSave = Date.now();
    localStorage.setItem('cyberclicker_v2', JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}



function getCPC() {
  let cpc = 1;
  UPGRADES.filter(u => u.type === 'click').forEach(u => {
    const lvl = state.upgradeLevels[u.id] || 0;
    cpc += lvl * u.perLevel;
  });
  return cpc;
}

function getCPS() {
  let cps = 0;
  UPGRADES.filter(u => u.type === 'pass').forEach(u => {
    const lvl = state.upgradeLevels[u.id] || 0;
    cps += lvl * u.perLevel;
  });
  return cps;
}

function getUpgradeCost(upg) {
  const lvl = state.upgradeLevels[upg.id] || 0;
  return Math.floor(upg.base * Math.pow(upg.factor, lvl));
}



function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}


function spawnParticle(x, y, val) {
  const el = document.createElement('div');
  el.className = 'particle';
  el.textContent = '+' + fmt(val);
  el.style.left = (x - 20 + Math.random() * 40 - 20) + 'px';
  el.style.top  = (y - 10) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function showNotif(msg) {
  const existing = document.querySelector('.notif');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'notif';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}


function handleClick(evt) {
  const cpc = getCPC();
  state.points += cpc;
  state.totalEarned += cpc;
  state.totalClicks++;
  spawnParticle(evt.clientX, evt.clientY, cpc);
  updateUI();
  checkAchievements();

  const btn = document.getElementById('main-btn');
  btn.style.transform = 'scale(0.91)';
  setTimeout(() => (btn.style.transform = ''), 80);
}

function buyUpgrade(upgId) {
  const upg = UPGRADES.find(u => u.id === upgId);
  if (!upg) return;
  const lvl  = state.upgradeLevels[upg.id] || 0;
  if (lvl >= upg.maxLevel) return;
  const cost = getUpgradeCost(upg);
  if (state.points < cost) { showNotif('Not enough points!'); return; }
  state.points -= cost;
  state.upgradeLevels[upg.id] = lvl + 1;
  state.totalUpgrades++;
  showNotif(upg.name + ' upgraded to level ' + (lvl + 1) + '!');
  renderUpgrades();
  updateUI();
  checkAchievements();
  saveState();
}



function checkAchievements() {
  let newUnlock = false;
  ACHIEVEMENTS.forEach(ach => {
    if (!state.unlockedAch[ach.id] && ach.check(state)) {
      state.unlockedAch[ach.id] = true;
      newUnlock = true;
      setTimeout(() => showNotif('Achievement: ' + ach.label + ' unlocked!'), 200);
    }
  });
  if (newUnlock) renderAchievements();
}



function renderUpgrades() {
  const container = document.getElementById('upg-list');
  container.innerHTML = '';
  UPGRADES.forEach(upg => {
    const lvl      = state.upgradeLevels[upg.id] || 0;
    const cost     = getUpgradeCost(upg);
    const maxed    = lvl >= upg.maxLevel;
    const canAfford = state.points >= cost && !maxed;

    const card = document.createElement('div');
    card.className = 'upgrade-card' + (maxed ? ' maxed' : (!canAfford ? ' disabled' : ''));

    const pips = Array.from({ length: upg.maxLevel }, (_, i) =>
      `<div class="lvl-pip ${i < lvl ? 'active' : ''}"></div>`
    ).join('');

    card.innerHTML = `
      <div class="upg-row">
        <div class="upg-icon">${upg.icon}</div>
        <div class="upg-info">
          <div class="upg-name">${upg.name}</div>
          <div class="upg-desc">${upg.desc}</div>
        </div>
      </div>
      <div class="upg-meta">
        <div class="upg-cost">${maxed ? 'MAXED' : fmt(cost) + ' pts'}</div>
        <div class="upg-level">${pips}</div>
      </div>
    `;

    if (!maxed) card.onclick = () => buyUpgrade(upg.id);
    container.appendChild(card);
  });
}

function renderAchievements() {
  const container = document.getElementById('ach-list');
  container.innerHTML = '';
  ACHIEVEMENTS.forEach(ach => {
    const el = document.createElement('div');
    el.className = 'ach-badge' + (state.unlockedAch[ach.id] ? ' unlocked' : '');
    el.textContent = state.unlockedAch[ach.id] ? '⭐ ' + ach.label : '🔒 ???';
    container.appendChild(el);
  });
}

function updateUI() {
  document.getElementById('pts-display').textContent    = fmt(state.points);
  document.getElementById('cpc-display').textContent    = fmt(getCPC());
  document.getElementById('cps-display').textContent    = fmt(getCPS());
  document.getElementById('passive-label').textContent  = fmt(getCPS());
  document.getElementById('total-label').textContent    = 'Total ever: ' + fmt(state.totalEarned) + ' pts';
  updateUpgradeStates();
}


function updateUpgradeStates() {
  const cards = document.querySelectorAll('.upgrade-card');
  cards.forEach((card, i) => {
    const upg  = UPGRADES[i];
    if (!upg) return;
    const lvl   = state.upgradeLevels[upg.id] || 0;
    const cost  = getUpgradeCost(upg);
    const maxed = lvl >= upg.maxLevel;
    const canAfford = state.points >= cost && !maxed;

    card.classList.toggle('disabled', !canAfford && !maxed);
  });
}



function calcOffline() {
  if (!state.lastSave) return;
  const cps = getCPS();
  if (cps === 0) return;
  const elapsed    = (Date.now() - state.lastSave) / 1000;
  const offlineSec = Math.min(elapsed, 3600); // max 1 hour
  if (offlineSec > 5) {
    const earned = Math.floor(cps * offlineSec);
    state.points      += earned;
    state.totalEarned += earned;
    setTimeout(() => showNotif('Welcome back! +' + fmt(earned) + ' pts (offline)'), 500);
  }
}


setInterval(() => {
  const cps = getCPS();
  if (cps > 0) {
    const earned = cps / 20;
    state.points      += earned;
    state.totalEarned += earned;
    updateUI();
    checkAchievements();
  }
}, 50);

// Autosave every 3 seconds
setInterval(saveState, 3000);



function updateSidePanels() {
  const sc = document.getElementById('side-clicks');
  const ss = document.getElementById('side-cps');
  const st = document.getElementById('side-total');
  const su = document.getElementById('side-upg');
  if (sc) { sc.textContent = 'CLICKS: ' + fmt(state.totalClicks); sc.classList.toggle('live', state.totalClicks > 0); }
  if (ss) { ss.textContent = 'CPS: '    + fmt(getCPS());           ss.classList.toggle('live', getCPS() > 0); }
  if (st) { st.textContent = 'TOTAL: '  + fmt(state.totalEarned);  st.classList.toggle('live', state.totalEarned > 0); }
  if (su) { su.textContent = 'UPGS: '   + state.totalUpgrades;     su.classList.toggle('live', state.totalUpgrades > 0); }
}

setInterval(updateSidePanels, 500);



(function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01ハヒフヘホマミムメモヤユヨラリルレロワヲン∑∆Ω∞ψφ';
  let cols, drops;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / 18);
    drops = Array(cols).fill(1).map(() => Math.random() * -50);
  }

  function draw() {
    ctx.fillStyle = 'rgba(10,10,15,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < cols; i++) {
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x  = i * 18;
      const y  = drops[i] * 18;
      // head char bright
      ctx.fillStyle = i % 3 === 0 ? '#ff2d8a' : '#00d4ff';
      ctx.font = '13px monospace';
      ctx.fillText(ch, x, y);
      // trail
      ctx.fillStyle = '#7b2ff7';
      ctx.font = '11px monospace';
      if (drops[i] > 2) {
        const prev = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(prev, x, y - 18);
      }
      if (drops[i] * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.4;
    }
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 55);
})();


(function spawnOrbs() {
  const configs = [
    { size: 6,  color: '#00d4ff', left: '3%',  top: '20%', dur: '6s',  delay: '0s'   },
    { size: 4,  color: '#ff2d8a', left: '5%',  top: '60%', dur: '8s',  delay: '1s'   },
    { size: 8,  color: '#7b2ff7', left: '1%',  top: '40%', dur: '5s',  delay: '2s'   },
    { size: 5,  color: '#ffd700', left: '4%',  top: '80%', dur: '7s',  delay: '0.5s' },
    { size: 6,  color: '#00d4ff', right: '3%', top: '30%', dur: '9s',  delay: '1.5s' },
    { size: 4,  color: '#ff2d8a', right: '5%', top: '65%', dur: '6s',  delay: '3s'   },
    { size: 9,  color: '#7b2ff7', right: '2%', top: '50%', dur: '7s',  delay: '0.8s' },
    { size: 5,  color: '#ffd700', right: '4%', top: '15%', dur: '5.5s',delay: '2.2s' },
  ];
  configs.forEach(c => {
    const el = document.createElement('div');
    el.className = 'orb';
    el.style.cssText = `
      width:${c.size}px; height:${c.size}px;
      background:${c.color};
      box-shadow: 0 0 ${c.size * 3}px ${c.color};
      ${c.left  ? 'left:'  + c.left  + ';' : ''}
      ${c.right ? 'right:' + c.right + ';' : ''}
      top:${c.top};
      animation-duration:${c.dur};
      animation-delay:${c.delay};
    `;
    document.body.appendChild(el);
  });
})();


let comboCount  = 0;
let comboTimer  = null;
const COMBO_WINDOW = 600; // ms between clicks to build combo

const COMBO_MSGS = [
  { at: 5,  text: '×5 COMBO!',   color: '#00d4ff' },
  { at: 10, text: '×10 NICE!',   color: '#7b2ff7' },
  { at: 20, text: '×20 BEAST!',  color: '#ff2d8a' },
  { at: 50, text: '×50 INSANE!', color: '#ffd700' },
  { at: 100,text: '×100 GOD!',   color: '#ff2d8a' },
];

function tickCombo() {
  comboCount++;
  clearTimeout(comboTimer);
  comboTimer = setTimeout(() => { comboCount = 0; }, COMBO_WINDOW);

  const hit = COMBO_MSGS.find(m => comboCount === m.at);
  if (hit) showComboFlash(hit.text, hit.color);
}

function showComboFlash(text, color) {
  const el = document.createElement('div');
  el.className = 'combo-flash';
  el.textContent = text;
  el.style.color = color;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 850);
}



loadState();
calcOffline();
renderUpgrades();   // ← створити картки апгрейдів при старті
updateUI();
renderAchievements();
updateSidePanels();

document.getElementById('main-btn').addEventListener('click', e => {
  handleClick(e);
  tickCombo();
});