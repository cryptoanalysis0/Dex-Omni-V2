const apiUrl = 'https://api.dexscreener.com/latest/dex/pairs/eth';
let currentPairs = [];

async function fetchPairs() {
  try {
    const res = await fetch(apiUrl);
    const json = await res.json();
    currentPairs = json.pairs.slice(0, 15); // نعرض أول 15 رمز
    applyFilter();
  } catch (err) {
    console.error("فشل في تحميل البيانات:", err);
  }
}

function applyFilter() {
  const filter = document.getElementById('filter-select').value;
  let filtered = [...currentPairs];

  if (filter === 'price-high') filtered.sort((a, b) => b.priceUsd - a.priceUsd);
  else if (filter === 'price-low') filtered.sort((a, b) => a.priceUsd - b.priceUsd);
  else if (filter === 'volume-high') filtered.sort((a, b) => b.volume.h24 - a.volume.h24);
  else if (filter === 'volume-low') filtered.sort((a, b) => a.volume.h24 - b.volume.h24);

  renderTable(filtered);
}

function renderTable(pairs) {
  const table = document.getElementById('pairs-table');
  table.innerHTML = '';

  pairs.forEach((pair, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${pair.baseToken.name} (${pair.baseToken.symbol})</td>
      <td>$${parseFloat(pair.priceUsd).toFixed(6)}</td>
      <td>$${Number(pair.volume.h24).toLocaleString()}</td>
      <td><canvas id="chart-${index}"></canvas></td>
      <td><a href="${pair.url}" target="_blank">🔗 DexLink</a></td>
    `;

    table.appendChild(row);

    // إنشاء الرسم البياني للسعر
    const ctx = document.getElementById(`chart-${index}`).getContext('2d');
    if (pair.priceNative) {
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array(10).fill(""),
          datasets: [{
            label: '',
            data: generateFakePrices(pair.priceUsd),
            borderColor: '#00ffcc',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 0,
          }]
        },
        options: {
          responsive: false,
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { display: false } }
        }
      });
    }
  });
}

// توليد بيانات سعر عشوائية للرسم (مؤقت حتى نربطه بـ price chart حقيقي)
function generateFakePrices(price) {
  const prices = [];
  let p = parseFloat(price);
  for (let i = 0; i < 10; i++) {
    const change = (Math.random() - 0.5) * p * 0.05;
    p += change;
    prices.push(p.toFixed(6));
  }
  return prices;
}

document.getElementById('filter-select').addEventListener('change', applyFilter);

fetchPairs();
setInterval(fetchPairs, 60000); // كل دقيقة
