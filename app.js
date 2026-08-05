document.addEventListener('DOMContentLoaded', () => {

  // --- ELEMENTOS DEL DOM ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const themeToggle = document.getElementById('themeToggle');
  const alertBox = document.getElementById('alertBox');
  const resultCard = document.getElementById('resultCard');
  const resultValue = document.getElementById('resultValue');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  let history = JSON.parse(localStorage.getItem('omni_history')) || [];

  // --- CAMBIO DE PESTAÑAS (MENÚ) ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
      hideAlert();
      resultCard.classList.add('hidden');
    });
  });

  // --- CAMBIO DE TEMA (CLARO/OSCURO) ---
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    themeToggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
  });

  // --- MANEJO DE ALERTAS ---
  function showAlert(msg) {
    alertBox.textContent = msg;
    alertBox.classList.remove('hidden');
  }

  function hideAlert() {
    alertBox.classList.add('hidden');
  }

  // --- LOGICA DE CONVERSIÓN: TEMPERATURA ---
  document.getElementById('convertTempBtn').addEventListener('click', () => {
    hideAlert();
    const val = parseFloat(document.getElementById('tempInput').value);
    const from = document.getElementById('tempFrom').value;
    const to = document.getElementById('tempTo').value;

    if (isNaN(val)) return showAlert('Por favor ingrese un valor numérico válido.');

    // Validar cero absoluto
    if ((from === 'C' && val < -273.15) || (from === 'K' && val < 0) || (from === 'F' && val < -459.67)) {
      return showAlert('El valor ingresado está por debajo del cero absoluto.');
    }

    let res;
    if (from === to) res = val;
    else if (from === 'C' && to === 'F') res = (val * 9/5) + 32;
    else if (from === 'C' && to === 'K') res = val + 273.15;
    else if (from === 'F' && to === 'C') res = (val - 32) * 5/9;
    else if (from === 'F' && to === 'K') res = (val - 32) * 5/9 + 273.15;
    else if (from === 'K' && to === 'C') res = val - 273.15;
    else if (from === 'K' && to === 'F') res = (val - 273.15) * 9/5 + 32;

    displayResult(`${val} °${from} = ${res.toFixed(2)} °${to}`);
  });

  // --- LOGICA DE CONVERSIÓN: LONGITUD ---
  document.getElementById('convertLengthBtn').addEventListener('click', () => {
    hideAlert();
    const val = parseFloat(document.getElementById('lengthInput').value);
    const from = document.getElementById('lengthFrom').value;
    const to = document.getElementById('lengthTo').value;

    if (isNaN(val) || val < 0) return showAlert('Ingrese un valor positivo para la longitud.');

    const meters = {
      m: 1, km: 1000, cm: 0.01, mm: 0.001,
      mi: 1609.34, ft: 0.3048, in: 0.0254
    };

    const inMeters = val * meters[from];
    const res = inMeters / meters[to];

    displayResult(`${val} ${from} = ${res.toFixed(4)} ${to}`);
  });

  // --- LOGICA DE CONVERSIÓN: MONEDA (TASAS ESTÁTICAS DE REFERENCIA) ---
  document.getElementById('convertCurrencyBtn').addEventListener('click', () => {
    hideAlert();
    const val = parseFloat(document.getElementById('currencyInput').value);
    const from = document.getElementById('currencyFrom').value;
    const to = document.getElementById('currencyTo').value;

    if (isNaN(val) || val <= 0) return showAlert('Ingrese un monto válido mayor a 0.');

    const ratesInUSD = {
      USD: 1, EUR: 0.92, MXN: 17.10, COP: 3900, GBP: 0.79
    };

    const inUSD = val / ratesInUSD[from];
    const res = inUSD * ratesInUSD[to];

    displayResult(`${val} ${from} = ${res.toFixed(2)} ${to}`);
  });

  // --- DEPLOY Y MOSTRAR RESULTADOS ---
  function displayResult(text) {
    resultValue.textContent = text;
    resultCard.classList.remove('hidden');
    saveToHistory(text);
  }

  // --- MANEJO DEL HISTORIAL ---
  function saveToHistory(entry) {
    history.unshift({ text: entry, time: new Date().toLocaleTimeString() });
    if (history.length > 10) history.pop();
    localStorage.setItem('omni_history', JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) {
      historyList.innerHTML = '<li class="history-item">No hay conversiones recientes.</li>';
      return;
    }
    history.forEach(item => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.innerHTML = `<span>${item.text}</span> <small style="color:var(--text-muted);">${item.time}</small>`;
      historyList.appendChild(li);
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    localStorage.removeItem('omni_history');
    renderHistory();
  });

  renderHistory();
});