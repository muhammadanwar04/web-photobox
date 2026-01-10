const video = document.getElementById('video');
const filterSelect = document.getElementById('filter-select');
const startBtn = document.getElementById('start-btn');
const downloadBtn = document.getElementById('download-btn');
const container = document.getElementById('photos-container');
const countdownEl = document.getElementById('countdown');
const themeGrid = document.getElementById('theme-grid');
const brandText = document.getElementById('brand-text');
const decoIcon = document.getElementById('deco-icon');

const themes = [
    {id: 'frame-my-sheila', name: 'My Sheila 💖', bg: 'linear-gradient(135deg, #ffafbd, #ff8fa3)'},
    {id: 'frame-rainbow', name: 'Rainbow', bg: 'linear-gradient(180deg, #ff9999, #ffcc99, #ffff99, #99ff99, #99ccff)'},
    {id: 'frame-sakura', name: 'Sakura', bg: '#ffcad4'},
    {id: 'frame-ocean', name: 'Ocean', bg: '#a2d2ff'},
    {id: 'frame-cowboy', name: 'Cowboy', bg: '#d2b48c'},
    {id: 'frame-forest', name: 'Forest', bg: '#52796f'},
    {id: 'frame-checker', name: 'Checker', bg: '#333'},
    {id: 'frame-midnight', name: 'Midnight', bg: '#2b2d42'},
    {id: 'frame-lavender', name: 'Lavender', bg: '#e0b1cb'},
    {id: 'frame-sunflower', name: 'Sunshine', bg: '#ffba08'},
    {id: 'frame-matcha', name: 'Matcha', bg: '#ccd5ae'},
    {id: 'frame-bubblegum', name: 'B-Gum', bg: '#ff8fab'},
    {id: 'frame-mint', name: 'Mint', bg: '#b7e4c7'},
    {id: 'frame-vintage', name: 'Retro', bg: '#bc6c25'},
    {id: 'frame-galaxy', name: 'Galaxy', bg: 'linear-gradient(45deg, #3a0ca3, #f72585)'},
    {id: 'frame-cloud', name: 'Cloudy', bg: '#caf0f8'},
    {id: 'frame-fire', name: 'Hot Fire', bg: 'linear-gradient(to bottom, #d00000, #ffba08)'},
    {id: 'frame-zebra', name: 'Zebra', bg: '#000'},
    {id: 'frame-leopard', name: 'Leopard', bg: '#e9c46a'},
    {id: 'frame-gold', name: 'Luxury', bg: '#d4af37'},
    {id: 'frame-minimal', name: 'Basic', bg: '#f8f9fa'}
];

themes.forEach(t => {
    const div = document.createElement('div');
    div.className = 'theme-item';
    div.onclick = () => setTheme(t);
    div.innerHTML = `<div class="preview" style="background: ${t.bg}"></div><span>${t.name}</span>`;
    themeGrid.appendChild(div);
});

function setTheme(theme) { 
    const area = document.getElementById('capture-area');
    area.className = theme.id;
    // Reset manual background for non-checker/zebra/special
    if(theme.id !== 'frame-checker' && theme.id !== 'frame-zebra') {
        area.style.background = theme.bg;
    } else {
        area.style.background = ''; // Use CSS pattern
    }

    if(theme.id === 'frame-my-sheila') {
        brandText.innerText = "I LOVE YOU";
        decoIcon.innerText = "💖";
    } else {
        brandText.innerText = "SAY CHEESE!";
        decoIcon.innerText = "🐾";
    }
}

filterSelect.addEventListener('change', () => {
    video.style.filter = filterSelect.value === 'none' ? '' : filterSelect.value;
});

navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(s => { video.srcObject = s; })
    .catch(err => alert("Kamera Error. Pastikan Izin Diberikan."));

async function runCountdown(sec) {
    return new Promise(resolve => {
        let count = sec;
        countdownEl.innerText = count;
        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                document.getElementById('beep-sound').currentTime = 0;
                document.getElementById('beep-sound').play();
                countdownEl.innerText = count;
            } else {
                clearInterval(timer);
                countdownEl.innerText = "";
                resolve();
            }
        }, 1000);
    });
}

function toggleMusic() {
    const bgm = document.getElementById('bgm');
    if (bgm.paused) { bgm.play(); bgm.volume = 0.2; document.getElementById('music-btn').innerText = "⏸ Pause"; }
    else { bgm.pause(); document.getElementById('music-btn').innerText = "🎵 Play"; }
}

startBtn.addEventListener('click', async () => {
    container.innerHTML = "";
    startBtn.disabled = true;
    for (let i = 0; i < 3; i++) {
        await runCountdown(3);
        document.getElementById('flash').style.opacity = '1';
        setTimeout(() => document.getElementById('flash').style.opacity = '0', 100);
        document.getElementById('shutter-sound').play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = filterSelect.value !== 'none' ? filterSelect.value : 'none';
        ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.className = 'photo-item';
        container.appendChild(img);
        await new Promise(r => setTimeout(r, 600));
    }
    startBtn.disabled = false; downloadBtn.disabled = false;
});

downloadBtn.addEventListener('click', () => {
    downloadBtn.innerText = "⌛ Processing...";
    html2canvas(document.getElementById('capture-area'), { scale: 3, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            const newWin = window.open('', '_blank');
            newWin.document.write(`<body style="margin:0; background:#000; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; color:#fff; font-family:sans-serif;"><img src="${imgData}" style="max-width:85%; border:4px solid #fff; border-radius:15px;"><p style="margin-top:20px;">TEKAN LAMA FOTO UNTUK SIMPAN</p><button onclick="window.close()" style="margin-top:20px; padding:12px 25px; background:#ff4d6d; color:#fff; border:none; border-radius:20px; font-weight:bold;">KEMBALI</button></body>`);
        } else {
            const a = document.createElement('a'); a.download = `photobox-sheila.png`; a.href = imgData; a.click();
        }
        downloadBtn.innerText = "💾 SIMPAN HASIL";
    });
});
