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

// Update Filter Live
filterSelect.addEventListener('change', () => {
    video.className = filterSelect.value === 'none' ? '' : filterSelect.value;
});

// Init Camera
navigator.mediaDevices.getUserMedia({ video: true }).then(s => video.srcObject = s);

// Tanggal Otomatis
document.getElementById('date-label').innerText = new Date().toLocaleDateString('en-US', {month: 'short', year: 'numeric'}).toUpperCase();

function toggleMusic() {
    if (bgm.paused) {
        bgm.play(); bgm.volume = 0.2;
        document.getElementById('music-btn').innerText = "⏸ Pause Magic";
    } else {
        bgm.pause();
        document.getElementById('music-btn').innerText = "🎵 Play Magic";
    }
}

async function runCountdown(sec) {
    if (!bgm.paused) bgm.volume = 0.05; // Fade out BGM
    return new Promise(resolve => {
        let count = sec;
        countdownEl.innerText = count;
        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                beepSound.currentTime = 0; beepSound.play();
                countdownEl.innerText = count;
            } else {
                clearInterval(timer);
                countdownEl.innerText = "";
                resolve();
            }
        }, 1000);
    });
}

startBtn.addEventListener('click', async () => {
    container.innerHTML = "";
    startBtn.disabled = true;
    startBtn.innerText = "CHEEEESE! ✨";

    for (let i = 0; i < 3; i++) {
        await runCountdown(3);
        
        // Flash & Sound
        flash.style.opacity = '1';
        setTimeout(() => flash.style.opacity = '0', 100);
        shutterSound.currentTime = 0; shutterSound.play();

        // Capture Process
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        ctx.filter = getComputedStyle(video).filter; // Ambil filter aktif
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.className = 'photo-item';
        container.appendChild(img);
        
        await new Promise(r => setTimeout(r, 800)); // Jeda antar foto
    }

    if (!bgm.paused) bgm.volume = 0.2; // Fade in BGM
    startBtn.disabled = false;
    startBtn.innerText = "📸 SNAP MOMENTS";
    downloadBtn.disabled = false;
});

function setTheme(t) { document.getElementById('capture-area').className = t; }

downloadBtn.addEventListener('click', () => {
    html2canvas(document.getElementById('capture-area'), { scale: 3 }).then(canvas => {
        const a = document.createElement('a');
        a.download = `dreamy-strip-${Date.now()}.png`;
        a.href = canvas.toDataURL();
        a.click();
    });
});