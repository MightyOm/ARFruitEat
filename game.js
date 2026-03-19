/* --- DOM Elements --- */
const videoElement = document.getElementById('webcam-video');
const canvasElement = document.getElementById('game-canvas');
const canvasCtx = canvasElement.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const timeDisplay = document.getElementById('time-display');
const overlayScreen = document.getElementById('overlay-screen');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const startBtn = document.getElementById('start-btn');
const loadingSpinner = document.getElementById('loading-spinner');

/* Start Menu Elements */
const startMenu = document.getElementById('start-menu');
const menuStartBtn = document.getElementById('menu-start-btn');
const modeNormalBtn = document.getElementById('mode-normal-btn');
const modeEndlessBtn = document.getElementById('mode-endless-btn');
const modeDescEl = document.getElementById('mode-desc');
const timerStat = document.getElementById('timer-stat');
const livesStat = document.getElementById('lives-stat');
const livesDisplay = document.getElementById('lives-display');

/* --- Game State --- */
let isPlaying = false;
let score = 0;
let timeLeft = 60;
let gameTimer = null;
let spawnTimer = null;
let fruits = [];
let mouthBoundingBox = null;
let smokeEffectEndTime = 0;
let smokeParticles = [];
let boomEffectEndTime = 0;
let burntFaceEndTime = 0;

/* Game Mode State */
let gameMode = 'normal'; // 'normal' or 'endless'
let lives = 3;

// Image mapping for falling objects
const fruitImageUrls = [
    'images/apple.png',
    'images/orange.png',
    'images/grapes.png',
    'images/watermelon.png',
    'images/strawberry.png',
    'images/mango.png',
    'images/pineapple.png',
    'images/banana.png'
];
const bombImageUrl = 'images/bomb.png';

const loadedImages = {};

function preloadImages() {
    fruitImageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
        loadedImages[url] = img;
    });

    const bombImg = new Image();
    bombImg.src = bombImageUrl;
    loadedImages['bomb'] = bombImg;
}

// Pre-load images
preloadImages();

/* --- Audio Assets --- */
const eatAudio = new Audio('sounds/eat.mp3');
const bombAudio = new Audio('sounds/bomb.mp3');
const endgameAudio = new Audio('sounds/endgame.mp3');

function playEatSound() {
    eatAudio.cloneNode(true).play().catch(e => console.warn("Audio play blocked:", e));
}

function playBombSound() {
    bombAudio.cloneNode(true).play().catch(e => console.warn("Audio play blocked:", e));
}

/* --- MediaPipe Setup --- */
let faceMeshReady = false;

const faceMesh = new FaceMesh({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

faceMesh.onResults(onResults);

// ============================================================
// CAMERA PRELOADING — starts immediately while start menu is open
// ============================================================
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480
});

// Start camera + FaceMesh loading NOW (while start menu is visible)
camera.start().catch((err) => {
    console.error('Camera start error:', err);
});

/* --- Start Menu Logic --- */
function initStartMenu() {
    // Mode selector toggle
    modeNormalBtn.addEventListener('click', () => {
        gameMode = 'normal';
        modeNormalBtn.classList.add('active');
        modeEndlessBtn.classList.remove('active');
        modeDescEl.textContent = '60 seconds — eat as many fruits as you can!';
    });

    modeEndlessBtn.addEventListener('click', () => {
        gameMode = 'endless';
        modeEndlessBtn.classList.add('active');
        modeNormalBtn.classList.remove('active');
        modeDescEl.textContent = '3 lives — survive as long as you can!';
    });

    // Start Game button
    menuStartBtn.addEventListener('click', () => {
        startMenu.classList.add('hidden');

        if (faceMeshReady) {
            // FaceMesh already loaded while user was on menu — start immediately
            startGame();
        } else {
            // Show loading overlay and wait for FaceMesh
            overlayScreen.classList.remove('hidden');
            modalTitle.innerText = 'MunchAR';
            modalDesc.innerHTML = 'Loading Face Tracking... Please ensure your face is well-lit.';
            loadingSpinner.classList.remove('hidden');
            startBtn.classList.add('hidden');
            // startBtn click will start game once FaceMesh is ready
        }
    });
}

initStartMenu();

// Hide the overlay initially (start menu is shown instead)
overlayScreen.classList.add('hidden');

/* --- Landmark Processing & Drawing --- */
function onResults(results) {
    if (!faceMeshReady) {
        faceMeshReady = true;
        // FaceMesh is ready — if we're on the loading overlay, show the play button
        loadingSpinner.classList.add('hidden');
        startBtn.classList.remove('hidden');
        const instructions = document.getElementById('instructions');
        if (instructions) instructions.classList.remove('hidden');
        modalDesc.innerHTML = "Tracking Ready! Ready to play.";

        // Update instruction text for the current mode
        updateInstructionForMode();
    }

    // Canvas coordinate space should match true video dimensions
    if (videoElement.videoWidth && canvasElement.width !== videoElement.videoWidth) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
    }

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        const upperLip = landmarks[13];
        const lowerLip = landmarks[14];
        const leftMouth = landmarks[78];
        const rightMouth = landmarks[308];

        const mouthOpenRatio = getMouthOpenRatio(upperLip, lowerLip, leftMouth, rightMouth);
        const isMouthOpen = mouthOpenRatio > 0.2;

        const mouthCenter = {
            x: (upperLip.x + lowerLip.x) / 2 * canvasElement.width,
            y: (upperLip.y + lowerLip.y) / 2 * canvasElement.height
        };

        const mouthWidthPixels = getDistance(leftMouth, rightMouth) * canvasElement.width;
        let mouthHitRadius = isMouthOpen ? mouthWidthPixels * 0.6 : mouthWidthPixels * 0.2;

        mouthBoundingBox = {
            x: mouthCenter.x,
            y: mouthCenter.y,
            radius: mouthHitRadius,
            isOpen: isMouthOpen
        };

        if (isPlaying && performance.now() < burntFaceEndTime) {
            drawBurntFace(landmarks);
        }

    } else {
        mouthBoundingBox = null;
    }

    if (isPlaying) {
        if (performance.now() < smokeEffectEndTime || smokeParticles.length > 0) {
            updateAndDrawWindySmoke();
            canvasCtx.globalAlpha = 1.0;
        }
        updateAndDrawFruits();

        if (performance.now() < boomEffectEndTime) {
            drawBoomEffect();
        }
    }
}

function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getMouthOpenRatio(upper, lower, left, right) {
    const verticalD = getDistance(upper, lower);
    const horizontalD = getDistance(left, right);
    return horizontalD === 0 ? 0 : verticalD / horizontalD;
}

/* --- Game Engine Logic --- */
function spawnFruit() {
    if (!isPlaying) return;

    const padding = canvasElement.width * 0.1;
    const spawnX = padding + Math.random() * (canvasElement.width - padding * 2);

    const isBomb = Math.random() < 0.2;
    const type = isBomb ? 'bomb' : fruitImageUrls[Math.floor(Math.random() * fruitImageUrls.length)];

    let minSpeed = 3;
    let speedVar = 5;

    if (gameMode === 'normal') {
        // Speed up in last 20 seconds
        if (timeLeft <= 20) {
            minSpeed = 7;
            speedVar = 8;
        }
    } else {
        // Endless: speed up every 20 fruits
        const speedLevel = Math.floor(score / 20);
        minSpeed = 3 + speedLevel * 1.5;
        speedVar = 5 + speedLevel;
    }

    fruits.push({
        id: Math.random().toString(),
        type: type,
        isBomb: isBomb,
        x: spawnX,
        y: -50,
        speed: minSpeed + Math.random() * speedVar,
        size: 50 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        dead: false
    });
}

function updateAndDrawFruits() {
    for (let i = fruits.length - 1; i >= 0; i--) {
        let f = fruits[i];

        f.y += f.speed;
        f.rotation += f.rotationSpeed;

        let imgToDraw = loadedImages[f.type];
        if (imgToDraw && imgToDraw.complete) {
            canvasCtx.save();
            canvasCtx.translate(f.x, f.y);
            canvasCtx.rotate(f.rotation);

            const imgWidth = imgToDraw.width || 1;
            const imgHeight = imgToDraw.height || 1;
            const aspect = imgWidth / imgHeight;

            const maxDim = f.size * 2;

            let drawWidth = maxDim;
            let drawHeight = maxDim;

            if (aspect > 1) {
                drawHeight = drawWidth / aspect;
            } else {
                drawWidth = drawHeight * aspect;
            }

            canvasCtx.drawImage(imgToDraw, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

            canvasCtx.restore();
        } else {
            // Fallback while texture loads
            canvasCtx.fillStyle = f.isBomb ? '#333' : '#ff4757';
            canvasCtx.beginPath();
            canvasCtx.arc(f.x, f.y, f.size / 2, 0, Math.PI * 2);
            canvasCtx.fill();
        }

        // Check collisions against Mouth
        if (mouthBoundingBox && mouthBoundingBox.isOpen && !f.dead) {
            const dist = Math.sqrt(Math.pow(f.x - mouthBoundingBox.x, 2) + Math.pow(f.y - mouthBoundingBox.y, 2));

            if (dist < mouthBoundingBox.radius + (f.size / 2)) {
                f.dead = true;

                if (f.isBomb) {
                    if (gameMode === 'normal') {
                        // Normal mode: deduct 5 seconds
                        timeLeft = Math.max(0, timeLeft - 5);
                        timeDisplay.innerText = timeLeft;
                    } else {
                        // Endless mode: lose a life
                        lives--;
                        updateLivesDisplay();
                    }

                    playBombSound();
                    smokeEffectEndTime = performance.now() + 2000;
                    boomEffectEndTime = performance.now() + 1000;
                    burntFaceEndTime = performance.now() + 2000;
                    createWindySmoke();

                    if (gameMode === 'normal' && timeLeft <= 0) {
                        endGame();
                    } else if (gameMode === 'endless' && lives <= 0) {
                        endGame();
                    }
                } else {
                    score++;
                    scoreDisplay.innerText = score;
                    playEatSound();
                    drawPopEffect(f.x, f.y);
                }
            }
        }

        // Clean up
        if (f.y > canvasElement.height + 100 || f.dead) {
            fruits.splice(i, 1);
        }
    }
}

function drawPopEffect(x, y) {
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, 40, 0, 2 * Math.PI);
    canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    canvasCtx.fill();
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, 60, 0, 2 * Math.PI);
    canvasCtx.strokeStyle = 'rgba(46, 213, 115, 0.8)';
    canvasCtx.lineWidth = 4;
    canvasCtx.stroke();
    canvasCtx.globalAlpha = 1.0;
}

function createWindySmoke() {
    const particleCount = 60 + Math.random() * 40;
    for (let i = 0; i < particleCount; i++) {
        smokeParticles.push({
            x: canvasElement.width + Math.random() * 200,
            y: Math.random() * canvasElement.height,
            vx: -(10 + Math.random() * 25),
            vy: -2 + Math.random() * 4,
            radius: 40 + Math.random() * 100,
            life: 1.0,
            decay: 0.01 + Math.random() * 0.02
        });
    }
}

function drawBurntFace(landmarks) {
    // Comedic layout: wide blast around the mouth/nose, raccoon eyes
    const sootSpots = [
        { index: 2, size: 70 },    // Tip of Nose (larger spread)
        { index: 205, size: 55 },  // Left cheek inner
        { index: 425, size: 55 },  // Right cheek inner
        { index: 152, size: 60 },  // Chin
        { index: 33, size: 45 },   // Left eye surround
        { index: 263, size: 45 },  // Right eye surround
        { index: 10, size: 60 }    // Forehead spike
    ];

    canvasCtx.save();
    canvasCtx.globalCompositeOperation = 'multiply';

    sootSpots.forEach(spot => {
        const lm = landmarks[spot.index];
        if (!lm) return;

        const cx = lm.x * canvasElement.width;
        const cy = lm.y * canvasElement.height;

        const grad = canvasCtx.createRadialGradient(cx, cy, 0, cx, cy, spot.size);
        // Fade from dark charcoal black to transparent - lighter opacity for a more natural dusty look
        grad.addColorStop(0, 'rgba(10, 10, 15, 0.7)');
        grad.addColorStop(0.4, 'rgba(20, 20, 25, 0.5)');
        grad.addColorStop(0.7, 'rgba(30, 30, 30, 0.2)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        canvasCtx.beginPath();
        canvasCtx.arc(cx, cy, spot.size, 0, 2 * Math.PI);
        canvasCtx.fillStyle = grad;
        canvasCtx.fill();
    });

    // Switch to normal composite operation for drawing smoke
    canvasCtx.globalCompositeOperation = 'source-over';

    // Funny procedural smoke coming out of the mouth
    const upperLip = landmarks[13];
    const lowerLip = landmarks[14];
    if (upperLip && lowerLip) {
        const mx = ((upperLip.x + lowerLip.x) / 2) * canvasElement.width;
        const my = ((upperLip.y + lowerLip.y) / 2) * canvasElement.height;

        const t = performance.now();
        for (let i = 0; i < 8; i++) {
            let phase = ((t * 0.001) + (i * 0.125)) % 1.0;
            const sy = my - (phase * 200);
            const sx = mx + Math.sin(phase * Math.PI * 6 + i) * 30;
            const sSize = 10 + phase * 40;
            const opacity = Math.max(0, 0.6 - phase * 0.6);

            canvasCtx.beginPath();
            canvasCtx.arc(sx, sy, sSize, 0, 2 * Math.PI);
            canvasCtx.fillStyle = `rgba(160, 160, 160, ${opacity})`;
            canvasCtx.fill();
        }
    }

    canvasCtx.restore();
}

function drawBoomEffect() {
    let timeRemaining = boomEffectEndTime - performance.now();
    if (timeRemaining <= 0) return;

    let progress = 1 - (timeRemaining / 1000);
    let scale = 0.5 + Math.sin(progress * Math.PI) * 1.5;

    canvasCtx.save();
    canvasCtx.translate(canvasElement.width / 2, canvasElement.height / 2);
    // Reverse the horizontal scale to counteract the CSS transform scaleX(-1) so text renders forward
    canvasCtx.scale(-scale, scale);
    canvasCtx.rotate((Math.random() - 0.5) * 0.15);

    canvasCtx.font = "900 130px 'Arial Black', Impact, sans-serif";
    canvasCtx.textAlign = "center";
    canvasCtx.textBaseline = "middle";

    let grad = canvasCtx.createLinearGradient(0, -60, 0, 60);
    grad.addColorStop(0, "#ffeb3b");
    grad.addColorStop(0.5, "#ff9800");
    grad.addColorStop(1, "#f44336");

    canvasCtx.fillStyle = grad;
    canvasCtx.strokeStyle = "rgba(0,0,0,0.8)";
    canvasCtx.lineWidth = 10;

    canvasCtx.strokeText("BOOM!", 0, 0);
    canvasCtx.fillText("BOOM!", 0, 0);

    canvasCtx.restore();
}

function updateAndDrawWindySmoke() {
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
        let p = smokeParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life > 0) {
            canvasCtx.beginPath();
            canvasCtx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
            canvasCtx.fillStyle = `rgba(180, 180, 190, ${p.life * 0.6})`;
            canvasCtx.fill();
        } else {
            smokeParticles.splice(i, 1);
        }
    }

    canvasCtx.globalAlpha = 1.0;
}

/* --- Lives Display --- */
function updateLivesDisplay() {
    const hearts = livesDisplay.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        if (index >= lives) {
            heart.classList.add('lost');
        } else {
            heart.classList.remove('lost');
        }
    });
}

function resetLivesDisplay() {
    const hearts = livesDisplay.querySelectorAll('.heart');
    hearts.forEach(heart => heart.classList.remove('lost'));
}

function updateInstructionForMode() {
    const detail = document.getElementById('instruction-mode-detail');
    if (!detail) return;
    if (gameMode === 'normal') {
        detail.querySelector('.icon').textContent = '⏱️';
        detail.querySelector('span:last-child').textContent = 'You have 1 minute. Eat as many fruits as possible!';
    } else {
        detail.querySelector('.icon').textContent = '❤️';
        detail.querySelector('span:last-child').textContent = '3 lives — bombs cost 1 life. Survive as long as you can!';
    }
}

/* --- App Flow Controls --- */
function startGame() {
    isPlaying = true;
    score = 0;
    fruits = [];
    smokeParticles = [];
    smokeEffectEndTime = 0;
    boomEffectEndTime = 0;
    burntFaceEndTime = 0;

    scoreDisplay.innerText = score;

    if (gameMode === 'normal') {
        timeLeft = 60;
        timeDisplay.innerText = timeLeft;
        timerStat.classList.remove('hidden');
        livesStat.classList.add('hidden');
    } else {
        lives = 3;
        resetLivesDisplay();
        timerStat.classList.add('hidden');
        livesStat.classList.remove('hidden');
    }

    overlayScreen.classList.add('hidden');
    startMenu.classList.add('hidden');

    // Silent play to fulfill Chrome's audio policy
    eatAudio.play().then(() => {
        eatAudio.pause();
        eatAudio.currentTime = 0;
    }).catch(() => {});
    bombAudio.play().then(() => {
        bombAudio.pause();
        bombAudio.currentTime = 0;
    }).catch(() => {});
    endgameAudio.play().then(() => {
        endgameAudio.pause();
        endgameAudio.currentTime = 0;
    }).catch(() => {});

    clearInterval(gameTimer);
    clearInterval(spawnTimer);

    if (gameMode === 'normal') {
        gameTimer = setInterval(() => {
            timeLeft--;
            timeDisplay.innerText = timeLeft;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }
    // Endless mode has no timer — game ends only when lives reach 0

    spawnTimer = setInterval(spawnFruit, 1000);
}

function endGame() {
    isPlaying = false;
    clearInterval(gameTimer);
    clearInterval(spawnTimer);

    modalTitle.innerText = "Game Over!";

    if (gameMode === 'normal') {
        modalDesc.innerHTML = `You consumed <br><strong style="font-size:2rem; color: #ff9f43;">${score}</strong> fruits!`;
    } else {
        modalDesc.innerHTML = `You survived and ate <br><strong style="font-size:2rem; color: #ff9f43;">${score}</strong> fruits!`;
    }

    const instructions = document.getElementById('instructions');
    if (instructions) instructions.classList.add('hidden');
    startBtn.innerText = "PLAY AGAIN!";
    overlayScreen.classList.remove('hidden');

    setTimeout(() => {
        endgameAudio.currentTime = 0;
        endgameAudio.play().catch(e => console.warn("Audio play blocked:", e));
    }, 1000);
}

// "PLAY NOW" / "PLAY AGAIN" button handler
startBtn.addEventListener('click', () => {
    if (startBtn.innerText === 'PLAY AGAIN!') {
        // Return to start menu so player can switch modes
        overlayScreen.classList.add('hidden');
        startMenu.classList.remove('hidden');
    } else {
        startGame();
    }
});
