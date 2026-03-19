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

<<<<<<< HEAD
/* Start Menu Elements */
const startMenu = document.getElementById('start-menu');
const menuStartBtn = document.getElementById('menu-start-btn');
const modeNormalBtn = document.getElementById('mode-normal-btn');
const modeEndlessBtn = document.getElementById('mode-endless-btn');
const modeDescEl = document.getElementById('mode-desc');
const timerStat = document.getElementById('timer-stat');
const livesStat = document.getElementById('lives-stat');
const livesDisplay = document.getElementById('lives-display');

=======
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
/* --- Game State --- */
let isPlaying = false;
let score = 0;
let timeLeft = 60;
let gameTimer = null;
let spawnTimer = null;
let fruits = [];
let mouthBoundingBox = null;
let smokeEffectEndTime = 0;
<<<<<<< HEAD
let smokeParticles = [];
let boomEffectEndTime = 0;
let burntFaceEndTime = 0;

/* Game Mode State */
let gameMode = 'normal'; // 'normal' or 'endless'
let lives = 3;

// Image mapping for falling objects
const fruitImageUrls = [
    'images/apple.png',
=======
let smokeParticles = []; // For the windy smoke effect
let boomEffectEndTime = 0;
let burntFaceEndTime = 0;

// Image mapping for falling objects
const fruitImageUrls = [
    'images/apple.png',      // 🍓 Replace these with your actual PNG image paths/URLs
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
    'images/orange.png',
    'images/grapes.png',
    'images/watermelon.png',
    'images/strawberry.png',
    'images/mango.png',
    'images/pineapple.png',
    'images/banana.png'
];
<<<<<<< HEAD
const bombImageUrl = 'images/bomb.png';
=======
const bombImageUrl = 'images/bomb.png'; // 💣 Replace with your actual bomb PNG path
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f

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
<<<<<<< HEAD
const eatAudio = new Audio('sounds/eat.mp3');
const bombAudio = new Audio('sounds/bomb.mp3');
const endgameAudio = new Audio('sounds/endgame.mp3');

function playEatSound() {
=======
const eatAudio = new Audio('sounds/eat.mp3'); // Ensure this matches your actual file name
const bombAudio = new Audio('sounds/bomb.mp3'); // Ensure this matches your actual file name
const endgameAudio = new Audio('sounds/endgame.mp3'); // Played at game over

function playEatSound() {
    // Clone node allows the sound to overlap if played rapidly
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
    eatAudio.cloneNode(true).play().catch(e => console.warn("Audio play blocked:", e));
}

function playBombSound() {
    bombAudio.cloneNode(true).play().catch(e => console.warn("Audio play blocked:", e));
}

/* --- MediaPipe Setup --- */
let faceMeshReady = false;

<<<<<<< HEAD
=======
// Initialize Google Face Mesh
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
const faceMesh = new FaceMesh({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
});

faceMesh.setOptions({
    maxNumFaces: 1,
<<<<<<< HEAD
    refineLandmarks: true,
=======
    refineLandmarks: true,           // Needs true for better mouth resolution
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

faceMesh.onResults(onResults);

<<<<<<< HEAD
// ============================================================
// CAMERA PRELOADING — starts immediately while start menu is open
// ============================================================
=======
// Start webcam processing via Camera utility
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await faceMesh.send({ image: videoElement });
    },
<<<<<<< HEAD
=======
    // We request standard portrait sizes, will be cropped via CSS mapping
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
    width: 640,
    height: 480
});

<<<<<<< HEAD
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
            modalTitle.innerText = 'AR Fruit Eater';
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

=======
// Prompt camera permissions
camera.start().catch((err) => {
    modalDesc.innerHTML = "Camera permission denied.<br>Please allow camera access to play!";
    loadingSpinner.classList.add('hidden');
    console.error(err);
});

>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
/* --- Landmark Processing & Drawing --- */
function onResults(results) {
    if (!faceMeshReady) {
        faceMeshReady = true;
<<<<<<< HEAD
        // FaceMesh is ready — if we're on the loading overlay, show the play button
=======
        // Face Mesh fully loaded & running! Provide launch button.
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
        loadingSpinner.classList.add('hidden');
        startBtn.classList.remove('hidden');
        const instructions = document.getElementById('instructions');
        if (instructions) instructions.classList.remove('hidden');
        modalDesc.innerHTML = "Tracking Ready! Ready to play.";
<<<<<<< HEAD

        // Update instruction text for the current mode
        updateInstructionForMode();
    }

    // Canvas coordinate space should match true video dimensions
=======
    }

    // Canvas coordinate space should match true video dimensions 
    // to align with returned normalized [0-1] coordinates.
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
    if (videoElement.videoWidth && canvasElement.width !== videoElement.videoWidth) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
    }

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

<<<<<<< HEAD
=======
        // Key MediaPipe Mouth Landmarks
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
        const upperLip = landmarks[13];
        const lowerLip = landmarks[14];
        const leftMouth = landmarks[78];
        const rightMouth = landmarks[308];

        const mouthOpenRatio = getMouthOpenRatio(upperLip, lowerLip, leftMouth, rightMouth);
<<<<<<< HEAD
        const isMouthOpen = mouthOpenRatio > 0.2;

=======
        // Empirically, lip vertical to horizontal ratio > ~0.2 means mouth is quite open.
        const isMouthOpen = mouthOpenRatio > 0.2;

        // Center calculation
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
        const mouthCenter = {
            x: (upperLip.x + lowerLip.x) / 2 * canvasElement.width,
            y: (upperLip.y + lowerLip.y) / 2 * canvasElement.height
        };

<<<<<<< HEAD
=======
        // Approximate mouth hit radius in pixels
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
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
<<<<<<< HEAD
=======
            // Reset opacity back to 1 after drawing smoke so it doesn't bleed to fruits
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
            canvasCtx.globalAlpha = 1.0;
        }
        updateAndDrawFruits();

        if (performance.now() < boomEffectEndTime) {
            drawBoomEffect();
        }
    }
}

<<<<<<< HEAD
=======
// Distance utility 
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

<<<<<<< HEAD
=======
// Aspect ratio of the mouth bounds
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
function getMouthOpenRatio(upper, lower, left, right) {
    const verticalD = getDistance(upper, lower);
    const horizontalD = getDistance(left, right);
    return horizontalD === 0 ? 0 : verticalD / horizontalD;
}

/* --- Game Engine Logic --- */
function spawnFruit() {
    if (!isPlaying) return;

<<<<<<< HEAD
    const padding = canvasElement.width * 0.1;
    const spawnX = padding + Math.random() * (canvasElement.width - padding * 2);

    const isBomb = Math.random() < 0.2;
=======
    // Distribute randomly across top width, with 10% padding
    const padding = canvasElement.width * 0.1;
    const spawnX = padding + Math.random() * (canvasElement.width - padding * 2);

    const isBomb = Math.random() < 0.2; // 20% chance to be a bomb
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
    const type = isBomb ? 'bomb' : fruitImageUrls[Math.floor(Math.random() * fruitImageUrls.length)];

    let minSpeed = 3;
    let speedVar = 5;

<<<<<<< HEAD
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
=======
    // Increase speed after 40 seconds (when timeLeft is 20 or less)
    if (timeLeft <= 20) {
        minSpeed = 7;
        speedVar = 8;
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
    }

    fruits.push({
        id: Math.random().toString(),
        type: type,
        isBomb: isBomb,
        x: spawnX,
        y: -50,
<<<<<<< HEAD
        speed: minSpeed + Math.random() * speedVar,
        size: 50 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
=======
        speed: minSpeed + Math.random() * speedVar, // Random fall speed
        size: 50 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,      // Initial random rotation angle
        rotationSpeed: (Math.random() - 0.5) * 0.2, // Random rotation speed
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
        dead: false
    });
}

function updateAndDrawFruits() {
    for (let i = fruits.length - 1; i >= 0; i--) {
        let f = fruits[i];

<<<<<<< HEAD
        f.y += f.speed;
        f.rotation += f.rotationSpeed;

=======
        // Physics Move
        f.y += f.speed;
        f.rotation += f.rotationSpeed; // Update rotation continuously

        // Render as PNG Image
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
        let imgToDraw = loadedImages[f.type];
        if (imgToDraw && imgToDraw.complete) {
            canvasCtx.save();
            canvasCtx.translate(f.x, f.y);
<<<<<<< HEAD
            canvasCtx.rotate(f.rotation);

=======
            canvasCtx.rotate(f.rotation); // Apply current rotation

            // Calculate dimensions to maintain aspect ratio
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
            const imgWidth = imgToDraw.width || 1;
            const imgHeight = imgToDraw.height || 1;
            const aspect = imgWidth / imgHeight;

<<<<<<< HEAD
=======
            // Base visual scale (1.5x larger since rectangular images occupy slightly less area)
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
            const maxDim = f.size * 2;

            let drawWidth = maxDim;
            let drawHeight = maxDim;

            if (aspect > 1) {
<<<<<<< HEAD
                drawHeight = drawWidth / aspect;
            } else {
                drawWidth = drawHeight * aspect;
            }

=======
                // Image is wider than tall
                drawHeight = drawWidth / aspect;
            } else {
                // Image is taller than wide
                drawWidth = drawHeight * aspect;
            }

            // Draw the image centered around the pivot
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
            canvasCtx.drawImage(imgToDraw, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

            canvasCtx.restore();
        } else {
<<<<<<< HEAD
=======
            // Fallback while texture loads
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
            canvasCtx.fillStyle = f.isBomb ? '#333' : '#ff4757';
            canvasCtx.beginPath();
            canvasCtx.arc(f.x, f.y, f.size / 2, 0, Math.PI * 2);
            canvasCtx.fill();
        }

<<<<<<< HEAD
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
=======
        // Check internal collisions against Mouth
        if (mouthBoundingBox && mouthBoundingBox.isOpen && !f.dead) {
            const dist = Math.sqrt(Math.pow(f.x - mouthBoundingBox.x, 2) + Math.pow(f.y - mouthBoundingBox.y, 2));

            // Distance Check
            if (dist < mouthBoundingBox.radius + (f.size / 2)) {
                // Eaten logic!
                f.dead = true;

                if (f.isBomb) {
                    timeLeft = Math.max(0, timeLeft - 5);
                    timeDisplay.innerText = timeLeft;
                    playBombSound();
                    smokeEffectEndTime = performance.now() + 2000;
                    boomEffectEndTime = performance.now() + 1000;
                    burntFaceEndTime = performance.now() + 2000; // Burnt face lasts 2 seconds
                    createWindySmoke(); // spawn new particles
                    if (timeLeft <= 0) {
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
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

<<<<<<< HEAD
        // Clean up
=======
        // Clean up memory
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
        if (f.y > canvasElement.height + 100 || f.dead) {
            fruits.splice(i, 1);
        }
    }
}

function drawPopEffect(x, y) {
<<<<<<< HEAD
=======
    // Quick burst visual right around the mouth since it's "eaten"
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
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
<<<<<<< HEAD
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
=======
    // Generate a burst of smoke particles
    const particleCount = 60 + Math.random() * 40; // 60 to 100 particles
    for (let i = 0; i < particleCount; i++) {
        smokeParticles.push({
            x: canvasElement.width + Math.random() * 200, // Start from off-screen right
            y: Math.random() * canvasElement.height,
            vx: -(10 + Math.random() * 25), // Fast horizontal speed to the left
            vy: -2 + Math.random() * 4, // Slight vertical drift
            radius: 40 + Math.random() * 100, // Large fluffy circles
            life: 1.0, // Start fully alive
            decay: 0.01 + Math.random() * 0.02 // How fast it fades
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
        });
    }
}

function drawBurntFace(landmarks) {
<<<<<<< HEAD
    const sootSpots = [
        { index: 2, size: 70 },
        { index: 205, size: 55 },
        { index: 425, size: 55 },
        { index: 152, size: 60 },
        { index: 33, size: 45 },
        { index: 263, size: 45 },
        { index: 10, size: 60 }
    ];

    canvasCtx.save();
=======
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
    // Multiply blend mode blends dark colors realistically with the face beneath!
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
    canvasCtx.globalCompositeOperation = 'multiply';

    sootSpots.forEach(spot => {
        const lm = landmarks[spot.index];
        if (!lm) return;

        const cx = lm.x * canvasElement.width;
        const cy = lm.y * canvasElement.height;

        const grad = canvasCtx.createRadialGradient(cx, cy, 0, cx, cy, spot.size);
<<<<<<< HEAD
=======
        // Fade from dark charcoal black to transparent - lighter opacity for a more natural dusty look
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
        grad.addColorStop(0, 'rgba(10, 10, 15, 0.7)');
        grad.addColorStop(0.4, 'rgba(20, 20, 25, 0.5)');
        grad.addColorStop(0.7, 'rgba(30, 30, 30, 0.2)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        canvasCtx.beginPath();
        canvasCtx.arc(cx, cy, spot.size, 0, 2 * Math.PI);
        canvasCtx.fillStyle = grad;
        canvasCtx.fill();
    });

<<<<<<< HEAD
    canvasCtx.globalCompositeOperation = 'source-over';

=======
    // Switch to normal composite operation for drawing smoke
    canvasCtx.globalCompositeOperation = 'source-over';

    // Funny procedural smoke coming out of the mouth
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
    const upperLip = landmarks[13];
    const lowerLip = landmarks[14];
    if (upperLip && lowerLip) {
        const mx = ((upperLip.x + lowerLip.x) / 2) * canvasElement.width;
        const my = ((upperLip.y + lowerLip.y) / 2) * canvasElement.height;

        const t = performance.now();
        for (let i = 0; i < 8; i++) {
<<<<<<< HEAD
            let phase = ((t * 0.001) + (i * 0.125)) % 1.0;
            const sy = my - (phase * 200);
            const sx = mx + Math.sin(phase * Math.PI * 6 + i) * 30;
            const sSize = 10 + phase * 40;
            const opacity = Math.max(0, 0.6 - phase * 0.6);
=======
            // Calculate a looping phase from 0.0 to 1.0 based on time + particle index offset
            let phase = ((t * 0.001) + (i * 0.125)) % 1.0;

            // Smoke moves up by up to 200 pixels over its lifespan
            const sy = my - (phase * 200);
            // Side-to-side wobble
            const sx = mx + Math.sin(phase * Math.PI * 6 + i) * 30;

            // Smoke gets larger and more transparent
            const sSize = 10 + phase * 40;
            const opacity = Math.max(0, 0.6 - phase * 0.6); // start at 0.6 and fade to 0
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f

            canvasCtx.beginPath();
            canvasCtx.arc(sx, sy, sSize, 0, 2 * Math.PI);
            canvasCtx.fillStyle = `rgba(160, 160, 160, ${opacity})`;
            canvasCtx.fill();
        }
    }

    canvasCtx.restore();
}

function drawBoomEffect() {
<<<<<<< HEAD
    let timeRemaining = boomEffectEndTime - performance.now();
    if (timeRemaining <= 0) return;

    let progress = 1 - (timeRemaining / 1000);
    let scale = 0.5 + Math.sin(progress * Math.PI) * 1.5;

    canvasCtx.save();
    canvasCtx.translate(canvasElement.width / 2, canvasElement.height / 2);
    canvasCtx.scale(-scale, scale);
    canvasCtx.rotate((Math.random() - 0.5) * 0.15);

=======
    let timeLeft = boomEffectEndTime - performance.now();
    if (timeLeft <= 0) return;

    // Scale and animation properties Based on timeLeft from 1000 -> 0
    let progress = 1 - (timeLeft / 1000); // normalized 0 to 1
    let scale = 0.5 + Math.sin(progress * Math.PI) * 1.5; // Bubble pops up then scales down

    canvasCtx.save();
    canvasCtx.translate(canvasElement.width / 2, canvasElement.height / 2);
    // Reverse the horizontal scale to counteract the CSS transform scaleX(-1) so text renders forward
    canvasCtx.scale(-scale, scale);

    // Random heavy shake
    canvasCtx.rotate((Math.random() - 0.5) * 0.15);

    // Comic boom font style
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
    canvasCtx.font = "900 130px 'Arial Black', Impact, sans-serif";
    canvasCtx.textAlign = "center";
    canvasCtx.textBaseline = "middle";

<<<<<<< HEAD
    let grad = canvasCtx.createLinearGradient(0, -60, 0, 60);
    grad.addColorStop(0, "#ffeb3b");
    grad.addColorStop(0.5, "#ff9800");
    grad.addColorStop(1, "#f44336");
=======
    // Fiery gradient
    let grad = canvasCtx.createLinearGradient(0, -60, 0, 60);
    grad.addColorStop(0, "#ffeb3b"); // yellow
    grad.addColorStop(0.5, "#ff9800"); // orange
    grad.addColorStop(1, "#f44336"); // red
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f

    canvasCtx.fillStyle = grad;
    canvasCtx.strokeStyle = "rgba(0,0,0,0.8)";
    canvasCtx.lineWidth = 10;

<<<<<<< HEAD
    canvasCtx.strokeText("BOOM!", 0, 0);
    canvasCtx.fillText("BOOM!", 0, 0);
=======
    canvasCtx.strokeText("BOOM!", 0, 0); // Outlined
    canvasCtx.fillText("BOOM!", 0, 0);   // Filled with fire gradient
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f

    canvasCtx.restore();
}

function updateAndDrawWindySmoke() {
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
        let p = smokeParticles[i];

<<<<<<< HEAD
=======
        // Move particle
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

<<<<<<< HEAD
        if (p.life > 0) {
            canvasCtx.beginPath();
            canvasCtx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
            canvasCtx.fillStyle = `rgba(180, 180, 190, ${p.life * 0.6})`;
            canvasCtx.fill();
        } else {
=======
        // Draw particle
        if (p.life > 0) {
            canvasCtx.beginPath();
            canvasCtx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
            // Gray-ish white smoke, alpha linked to life
            canvasCtx.fillStyle = `rgba(180, 180, 190, ${p.life * 0.6})`;
            canvasCtx.fill();
        } else {
            // Remove dead particle
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
            smokeParticles.splice(i, 1);
        }
    }

<<<<<<< HEAD
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

=======
    // reset global alpha
    canvasCtx.globalAlpha = 1.0;
}

>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
/* --- App Flow Controls --- */
function startGame() {
    isPlaying = true;
    score = 0;
<<<<<<< HEAD
=======
    timeLeft = 60;
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
    fruits = [];
    smokeParticles = [];
    smokeEffectEndTime = 0;
    boomEffectEndTime = 0;
    burntFaceEndTime = 0;

    scoreDisplay.innerText = score;
<<<<<<< HEAD

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
=======
    timeDisplay.innerText = timeLeft;
    overlayScreen.classList.add('hidden');

    // Silent play to fulfill Chrome's audio policy requiring manual interaction first
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
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

<<<<<<< HEAD
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

=======
    gameTimer = setInterval(() => {
        timeLeft--;
        timeDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    // Initial fruit interval (~3.3 per second)
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
    spawnTimer = setInterval(spawnFruit, 1000);
}

function endGame() {
    isPlaying = false;
    clearInterval(gameTimer);
    clearInterval(spawnTimer);

    modalTitle.innerText = "Game Over!";
<<<<<<< HEAD

    if (gameMode === 'normal') {
        modalDesc.innerHTML = `You consumed <br><strong style="font-size:2rem; color: #ff9f43;">${score}</strong> fruits!`;
    } else {
        modalDesc.innerHTML = `You survived and ate <br><strong style="font-size:2rem; color: #ff9f43;">${score}</strong> fruits!`;
    }

=======
    modalDesc.innerHTML = `You consumed <br><strong style="font-size:2rem; color: #ff4757;">${score}</strong> fruits!`;
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
    const instructions = document.getElementById('instructions');
    if (instructions) instructions.classList.add('hidden');
    startBtn.innerText = "PLAY AGAIN!";
    overlayScreen.classList.remove('hidden');

    setTimeout(() => {
        endgameAudio.currentTime = 0;
        endgameAudio.play().catch(e => console.warn("Audio play blocked:", e));
    }, 1000);
}

<<<<<<< HEAD
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
=======
startBtn.addEventListener('click', startGame);
>>>>>>> 7fb4702d05af30ef260d7a695a0fbd066be24e0f
