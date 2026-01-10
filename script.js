const video = document.getElementById('video');
const filterSelect = document.getElementById('filter-select');
const startBtn = document.getElementById('start-btn');
const downloadBtn = document.getElementById('download-btn');
const container = document.getElementById('photos-container');
const countdownEl = document.getElementById('countdown');
const themeGrid = document.getElementById('theme-grid');

const themes = [
    {id: 'frame-rainbow', name: 'Rainbow', color: 'linear-gradient(to bottom, red, orange, blue)'},
    {id: 'frame-checker', name: 'Checker', color: '#333'},
    {id: 'frame-sakura', name: 'Sakura', color: '#ffcad4'},
    {id: 'frame-ocean', name: 'Ocean', color: '#a2d2ff'},
    {id: 'frame-cowboy', name: 'Cowboy', color: '#d2b48c'},
    {id: 'frame-forest', name: 'Forest', color: '#52796f'},
    {id: 'frame-midnight', name: 'Midnight', color: '#2b2d42'},
    {id: 'frame-lavender', name: 'Lavender', color: '#e0b1cb'},
    {id: 'frame-sunflower', name: 'Sunshine', color: '#ffba08'},
    {id: 'frame-matcha', name: 'Matcha', color: '#ccd5ae'},
    {id: 'frame-bubblegum', name: 'B-Gum', color: '#ff8fab'},
    {id: 'frame-mint', name: 'Mint', color: '#b7e4c7'},
    {id: 'frame-vintage', name: 'Retro', color: '#bc6c25'},
    {id: 'frame-galaxy', name: 'Galaxy', color: '#3a0ca3'},
    {id: 'frame-cloud', name: 'Cloudy', color: '#caf0f8'},
    {id: 'frame-fire', name: 'Hot Fire', color: '#d00000'},
    {id: 'frame-zebra', name: 'Zebra', color: '#000'},
    {id: 'frame-leopard', name: 'Leopard', color: '#e9c46a'},
    {id: 'frame-gold', name: 'Luxury', color: '#d4af37'},
    {id: 'frame-minimal', name: 'Basic', color: '#eee'}
];

themes.forEach(t => {
    const div = document.createElement('div');
    div.className = 'theme-item';
    div.onclick = () => setTheme(t.id);
    div.innerHTML = `<div class="preview" style="background: ${t.color}"></div><span>${t.name}</span>`;
    themeGrid.appendChild(div);
});

function setTheme(id) { document.getElementById('capture-area').className = id; }

filterSelect.addEventListener('change', () => {
    video.style.filter = filterSelect.value === 'none' ? '' : filterSelect.value;
});

navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(s => { video.srcObject = s; })
    .catch(err => alert("Kamera Error: " + err));

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
    if (bgm.paused) { bgm.play(); bgm.volume = 0.2; } else { bgm.pause(); }
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
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        ctx.filter = filterSelect.value !== 'none' ? filterSelect.value : 'none';
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.className = 'photo-item';
        container.appendChild(img);
        await new Promise(r => setTimeout(r, 600));
    }
    startBtn.disabled = false;
    downloadBtn.disabled = false;
});

downloadBtn.addEventListener('click', () => {
    downloadBtn.innerText = "Processing...";
    html2canvas(document.getElementById('capture-area'), { scale: 3, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            const newWin = window.open('', '_blank');
            newWin.document.write(`
                <body style="margin:0; background:#111; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; color:#fff; font-family:sans-serif;">
                    <img src="${imgData}" style="max-width:85%; border-radius:10px; border:4px solid #fff;">
                    <p style="margin-top:20px;">TEKAN LAMA FOTO UNTUK SIMPAN</p>
                    <button onclick="window.close()" style="margin-top:20px; padding:10px 20px; border-radius:20px; border:none; background:#ff4d6d; color:#fff;">TUTUP</button>
                </body>
            `);
        } else {
            const a = document.createElement('a');
            a.download = `photobox-${Date.now()}.png`;
            a.href = imgData;
            a.click();
        }
        downloadBtn.innerText = "💾 SIMPAN HASIL";
    });
});
