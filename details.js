const params = new URLSearchParams(window.location.search);
const pairAddress = params.get('pair');

const dexApiUrl = `https://api.dexscreener.com/latest/dex/pairs/eth/${pairAddress}`;
const uniswapApiUrl = `https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2`;

async function fetchTokenDetails() {
  try {
    const res = await fetch(dexApiUrl);
    const json = await res.json();
    const data = json.pair;

    document.getElementById('token-name').innerText = `${data.baseToken.name} (${data.baseToken.symbol})`;

    document.getElementById('token-info').innerHTML = `
      <p>📊 السعر: <b>$${parseFloat(data.priceUsd).toFixed(6)}</b></p>
      <p>💧 السيولة: $${Number(data.liquidity.usd).toLocaleString()}</p>
      <p>📦 الحجم (24h): $${Number(data.volume.h24).toLocaleString()}</p>
      <p>🧠 العقد: <code>${data.pairAddress}</code></p>
      <p>🔗 <a href="${data.url}" target="_blank">مشاهدة على DexScreener</a></p>
    `;

    renderChart(data);
    fetchUniswapLiquidity(data.pairAddress);

  } catch (err) {
    console.error("فشل في تحميل التفاصيل:", err);
  }
}

function renderChart(data) {
  const prices = generateFakePrices(data.priceUsd);
  const ctx = document.getElementById('token-chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(10).fill(""),
      datasets: [{
        label: "Price Trend",
        data: prices,
        borderColor: "#00ffcc",
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 1,
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { display: true } }
    }
  });
}

function generateFakePrices(price) {
  const prices = [];
  let p = parseFloat(price);
  for (let i = 0; i < 10; i++) {
    const change = (Math.random() - 0.5) * p * 0.07;
    p += change;
    prices.push(p.toFixed(6));
  }
  return prices;
}

async function fetchUniswapLiquidity(pairAddress) {
  const query = `
  {
    pair(id: "${pairAddress.toLowerCase()}") {
      reserveUSD
      volumeUSD
      txCount
    }
  }
  `;

  const res = await fetch(uniswapApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  const json = await res.json();
  const pair = json.data?.pair;

  if (pair) {
    const container = document.getElementById('token-info');
    container.innerHTML += `
      <hr/>
      <p>🧪 من Uniswap V2</p>
      <p>💰 السيولة: $${Number(pair.reserveUSD).toFixed(2)}</p>
      <p>📊 الحجم اليومي: $${Number(pair.volumeUSD).toFixed(2)}</p>
      <p>🔄 عدد التداولات: ${pair.txCount}</p>
    `;
  }
}

fetchTokenDetails();
