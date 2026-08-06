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

// Agregar control de entrada en app.js para evitar letras en los campos numéricos
const numericInputs = document.querySelectorAll('input[type="number"]');

numericInputs.forEach(input => {
  input.addEventListener('keydown', (e) => {
    // Permitir teclas de control: backspace, delete, tab, escape, enter, flechas y punto/coma decimal
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', '.', ','];
    
    if (allowedKeys.includes(e.key) || (e.key >= '0' && e.key <= '9')) {
      return; // Permite el ingreso
    }
    
    // Bloquea cualquier otra tecla (incluidas letras como 'e')
    e.preventDefault();
  });
});

// --- MANEJO DEL FORMULARIO DE SUGERENCIAS ---
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackAlert = document.getElementById('feedbackAlert');

  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('feedbackName').value.trim();
    const email = document.getElementById('feedbackEmail').value.trim();
    const message = document.getElementById('feedbackMessage').value.trim();

    if (!name || !email || !message) {
      feedbackAlert.textContent = 'Por favor completa todos los campos.';
      feedbackAlert.classList.remove('hidden');
      return;
    }

    // Guardar sugerencia localmente para simular el almacenamiento
    const suggestions = JSON.parse(localStorage.getItem('ajs_suggestions')) || [];
    suggestions.push({
      name,
      email,
      message,
      date: new Date().toLocaleString()
    });
    localStorage.setItem('ajs_suggestions', JSON.stringify(suggestions));

    // Mostrar mensaje de éxito
    feedbackAlert.style.borderColor = '#10b981';
    feedbackAlert.style.color = '#6ee7b7';
    feedbackAlert.style.background = 'rgba(16, 185, 129, 0.2)';
    feedbackAlert.textContent = '¡Gracias por tu sugerencia! La hemos recibido correctamente.';
    feedbackAlert.classList.remove('hidden');

    // Resetear formulario
    feedbackForm.reset();

    // Ocultar mensaje después de 4 segundos
    setTimeout(() => {
      feedbackAlert.classList.add('hidden');
      feedbackAlert.style = ''; // Restablecer estilos de alerta
    }, 4000);
  });

  // --- DICCIONARIO CÓDIGO MORSE ---
const morseDictionary = {
  'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',   'E': '.',
  'F': '..-.',  'G': '--.',   'H': '....',  'I': '..',    'J': '.---',
  'K': '-.-',   'L': '.-..',  'M': '--',    'N': '-.',    'O': '---',
  'P': '.--.',  'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
  'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',  'Y': '-.--',
  'Z': '--..',  '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '0': '-----', ' ': '/'
};

// Reversión para Morse -> Texto
const textFromMorse = Object.fromEntries(
  Object.entries(morseDictionary).map(([k, v]) => [v, k])
);

// --- LÓGICA DE CONVERSIÓN MORSE ---
const convertMorseBtn = document.getElementById('convertMorseBtn');

if (convertMorseBtn) {
  convertMorseBtn.addEventListener('click', () => {
    const direction = document.getElementById('morseDirection').value;
    const input = document.getElementById('morseInput').value.trim();
    const resultCard = document.getElementById('resultCard');
    const resultValue = document.getElementById('resultValue');

    if (!input) {
      alert('Por favor ingresa un texto o código Morse válido.');
      return;
    }

    let result = '';

    if (direction === 'textToMorse') {
      result = input
        .toUpperCase()
        .split('')
        .map(char => morseDictionary[char] || char)
        .join(' ');
    } else {
      result = input
        .split(' ')
        .map(code => textFromMorse[code] || (code === '/' ? ' ' : code))
        .join('');
    }

    resultValue.textContent = result;
    resultCard.classList.remove('hidden');
    
    // Guardar en Historial si la función existe
    if (typeof saveToHistory === 'function') {
      saveToHistory(`Morse (${direction === 'textToMorse' ? 'Texto→Morse' : 'Morse→Texto'})`, input, result);
    }
  });
}

// --- NAVEGACIÓN DE SUB-PESTAÑAS (Otras Conversiones) ---
const subTabBtns = document.querySelectorAll('.sub-tab-btn');
const subTabContents = document.querySelectorAll('.sub-tab-content');

subTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetSubTab = btn.getAttribute('data-subtab');

    // Cambiar clase activa en los botones
    subTabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Cambiar visibilidad de los paneles secundarios
    subTabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === `subtab-${targetSubTab}`) {
        content.classList.add('active');
      }
    });

    // Ocultar la tarjeta de resultado al cambiar de sub-herramienta
    const resultCard = document.getElementById('resultCard');
    if (resultCard) resultCard.classList.add('hidden');
  });
});

// --- LÓGICA CONVERSIÓN DE PRESIÓN ---
const convertPressureBtn = document.getElementById('convertPressureBtn');

if (convertPressureBtn) {
  // Factores de conversión base hacia Pascales (Pa)
  const pressureRatesInPascal = {
    pascal: 1,
    bar: 100000,
    psi: 6894.76,
    atm: 101325
  };

  convertPressureBtn.addEventListener('click', () => {
    const val = parseFloat(document.getElementById('pressureInput').value);
    const from = document.getElementById('pressureFrom').value;
    const to = document.getElementById('pressureTo').value;
    const resultCard = document.getElementById('resultCard');
    const resultValue = document.getElementById('resultValue');

    if (isNaN(val)) {
      alert('Por favor ingresa un valor numérico válido.');
      return;
    }

    // Convertir de la unidad de origen a Pascales y luego a la unidad destino
    const valueInPascal = val * pressureRatesInPascal[from];
    const converted = valueInPascal / pressureRatesInPascal[to];

    resultValue.textContent = `${converted.toLocaleString('es-ES', { maximumFractionDigits: 4 })} ${to.toUpperCase()}`;
    resultCard.classList.remove('hidden');

    if (typeof saveToHistory === 'function') {
      saveToHistory('Presión', `${val} ${from.toUpperCase()}`, `${converted.toFixed(4)} ${to.toUpperCase()}`);
    }
  });
}

// --- LÓGICA CONVERSIÓN DE LÍQUIDOS / VOLUMEN ---
const convertLiquidBtn = document.getElementById('convertLiquidBtn');

if (convertLiquidBtn) {
  // Factores de conversión base hacia Litros (L)
  const liquidRatesInLiters = {
    l: 1,
    ml: 0.001,
    gal: 3.78541,
    oz: 0.0295735,
    cup: 0.24
  };

  convertLiquidBtn.addEventListener('click', () => {
    const val = parseFloat(document.getElementById('liquidInput').value);
    const from = document.getElementById('liquidFrom').value;
    const to = document.getElementById('liquidTo').value;
    const resultCard = document.getElementById('resultCard');
    const resultValue = document.getElementById('resultValue');

    if (isNaN(val)) {
      alert('Por favor ingresa un valor numérico válido.');
      return;
    }

    // Convertir origen -> Litros -> Destino
    const valueInLiters = val * liquidRatesInLiters[from];
    const converted = valueInLiters / liquidRatesInLiters[to];

    resultValue.textContent = `${converted.toLocaleString('es-ES', { maximumFractionDigits: 4 })} ${to.toUpperCase()}`;
    resultCard.classList.remove('hidden');

    if (typeof saveToHistory === 'function') {
      saveToHistory('Líquidos', `${val} ${from.toUpperCase()}`, `${converted.toFixed(4)} ${to.toUpperCase()}`);
    }
  });
}