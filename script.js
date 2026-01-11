const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startBtn = document.getElementById('start-btn');
const downloadBtn = document.getElementById('download-btn');
const container = document.getElementById('photos-container');
const countdownEl = document.getElementById('countdown');
const captureArea = document.getElementById('capture-area');

const inputTitle = document.getElementById('input-title');
const inputSub = document.getElementById('input-sub');
const frameTitle = document.getElementById('frame-title');
const frameSub = document.getElementById('frame-sub');

let maxPhotos = 4;
let currentFilter = 'none';
let currentLayout = 'strip';

// Inisialisasi Kamera dengan pengecekan
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "user", 
                width: { ideal: 1280 }, 
                height: { ideal: 720 } 
            } 
        });
        video.srcObject = stream;
        // Tunggu video benar-benar siap
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve(true);
            };
        });
    } catch (err) {
        console.error("Error Kamera:", err);
        alert("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.");
        return false;
    }
}

function setFilter(filterStr) {
    currentFilter = filterStr;
    video.style.filter = filterStr;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(filterStr));
    });
}

function updateFrameText() {
    frameTitle.innerText = inputTitle.value || "Cheerful Studio";
    frameSub.innerText = inputSub.value || "MOMENTS • 2026";
}

function changeLayout(layoutName, count) {
    currentLayout = layoutName;
    maxPhotos = count;
    document.querySelectorAll('.control-btn').forEach(btn => btn.classList.toggle('active', btn.id === `btn-${layoutName}`));
    container.className = `layout-${layoutName}`;
    resetPlaceholders();
}

function changeTheme(themeName) {
    captureArea.className = `theme-${themeName}`;
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(themeName));
    });
}

function resetPlaceholders() {
    container.innerHTML = '';
    for (let i = 0; i < maxPhotos; i++) {
        const div = document.createElement('div');
        const ratioClass = (currentLayout === 'grid') ? "aspect-square" : "aspect-[4/3]";
        div.className = `${ratioClass} bg-slate-100 animate-pulse rounded-sm w-full`;
        container.appendChild(div);
    }
    downloadBtn.classList.add('hidden');
}

async function startSession() {
    // Pastikan video aktif sebelum mulai
    if (!video.srcObject) {
        const ready = await initCamera();
        if (!ready) return;
    }

    container.innerHTML = '';
    startBtn.disabled = true;
    startBtn.innerText = "PROSES...";
    downloadBtn.classList.add('hidden');
    
    for (let i = 0; i < maxPhotos; i++) {
        await runCountdown(3);
        takeSnap();
        await new Promise(r => setTimeout(r, 600)); // Jeda antar jepretan
    }
    
    startBtn.disabled = false;
    startBtn.innerText = "AMBIL FOTO LAGI";
    downloadBtn.classList.remove('hidden');
}

function runCountdown(sec) {
    return new Promise(resolve => {
        let t = sec;
        countdownEl.classList.remove('hidden');
        countdownEl.innerText = t;
        const timer = setInterval(() => {
            t--;
            if(t > 0) {
                countdownEl.innerText = t;
            } else {
                clearInterval(timer);
                countdownEl.classList.add('hidden');
                resolve();
            }
        }, 1000);
    });
}

function takeSnap() {
    const ctx = canvas.getContext('2d');
    const targetRatio = (currentLayout === 'grid') ? 1/1 : 4/3;
    
    canvas.width = 800;
    canvas.height = 800 / targetRatio;

    const vW = video.videoWidth;
    const vH = video.videoHeight;
    
    // Safety check jika video belum siap
    if (vW === 0 || vH === 0) return;

    const vRatio = vW / vH;
    let sX, sY, sW, sH;

    if (vRatio > targetRatio) {
        sH = vH;
        sW = vH * targetRatio;
        sX = (vW - sW) / 2;
        sY = 0;
    } else {
        sW = vW;
        sH = vW / targetRatio;
        sX = 0;
        sY = (vH - sH) / 2;
    }

    ctx.filter = currentFilter;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sX, sY, sW, sH, 0, 0, canvas.width, canvas.height);
    
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.className = "captured-photo rounded-sm";
    
    // Hapus satu placeholder dan ganti dengan foto asli
    container.appendChild(img);
}

downloadBtn.addEventListener('click', () => {
    html2canvas(captureArea, { 
        scale: 3, 
        useCORS: true,
        backgroundColor: null 
    }).then(cvs => {
        const link = document.createElement('a');
        link.download = `cheerful-photobox-${Date.now()}.png`;
        link.href = cvs.toDataURL('image/png');
        link.click();
    });
});

startBtn.addEventListener('click', startSession);

// Jalankan inisialisasi
initCamera().then(() => {
    resetPlaceholders();
});
