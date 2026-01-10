const video = document.getElementById('video');
const filterSelect = document.getElementById('filter-select');
const startBtn = document.getElementById('start-btn');
const downloadBtn = document.getElementById('download-btn');
const container = document.getElementById('photos-container');
const countdownEl = document.getElementById('countdown');
const bgm = document.getElementById('bgm');
const shutterSound = document.getElementById('shutter-sound');
const beepSound = document.getElementById('beep-sound');
const flash = document.getElementById('flash');

filterSelect.addEventListener('change', () => {
    video.style.filter = filterSelect.value === 'none' ? '' : filterSelect.value;
});

navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(s => { video.srcObject = s; })
    .catch(err => alert("Izin kamera diperlukan!"));

document.getElementById('date-label').innerText = new Date().toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}).toUpperCase();

function toggleMusic() {
    if (bgm.paused) { bgm.play(); bgm.volume = 0.2; document.getElementById('music-btn').innerText = "⏸ Pause"; }
    else { bgm.pause(); document.getElementById('music-btn').innerText = "🎵 Play"; }
}

async function runCountdown(sec) {
    if (!bgm.paused) bgm.volume = 0.05;
    return new Promise(resolve => {
        let count = sec;
        countdownEl.innerText = count;
        const timer = setInterval(() => {
            count--;
            if (count > 0) { beepSound.currentTime = 0; beepSound.play(); countdownEl.innerText = count; }
            else { clearInterval(timer); countdownEl.innerText = ""; resolve(); }
        }, 1000);
    });
}

startBtn.addEventListener('click', async () => {
    container.innerHTML = "";
    startBtn.disabled = true;
    startBtn.innerText = "SMILE! ✨";

    for (let i = 0; i < 3; i++) {
        await runCountdown(3);
        flash.style.opacity = '1'; setTimeout(() => flash.style.opacity = '0', 100);
        shutterSound.currentTime = 0; shutterSound.play();

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
    if (!bgm.paused) bgm.volume = 0.2;
    startBtn.disabled = false;
    startBtn.innerText = "📸 AMBIL 3x FOTO";
    downloadBtn.disabled = false;
});

function setTheme(t) { document.getElementById('capture-area').className = t; }

downloadBtn.addEventListener('click', () => {
    downloadBtn.innerText = "⌛ Generating...";
    const area = document.getElementById('capture-area');
    
    html2canvas(area, { scale: 3, useCORS: true, backgroundColor: null }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            const newWin = window.open('', '_blank');
            newWin.document.write(`
                <body style="margin:0; background:#1a1a1a; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; color:#fff; font-family:sans-serif;">
                    <img src="${imgData}" style="max-width:85%; border-radius:15px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                    <p style="margin-top:25px; font-weight:bold; letter-spacing:1px;">TEKAN LAMA FOTO DI ATAS</p>
                    <p style="opacity:0.7; font-size:14px;">Lalu pilih "Save to Photos"</p>
                    <button onclick="window.close()" style="margin-top:30px; padding:12px 30px; border-radius:30px; border:none; background:#ff4d6d; color:#fff; font-weight:bold;">TUTUP</button>
                </body>
            `);
        } else {
            const a = document.createElement('a');
            a.download = `photobox-${Date.now()}.png`;
            a.href = imgData;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        downloadBtn.innerText = "💾 SIMPAN HASIL";
    });
});
