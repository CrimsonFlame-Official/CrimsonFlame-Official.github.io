// ─── CRIMSONFLAME INTERACTIVE SUITE & FLAPPY FLAME MINI-GAME ───
(function() {
    'use strict';

    // ─── 1. SYNTHESIZED WEB AUDIO API SOUND SYSTEM ───
    const SFX = {
        ctx: null,
        muted: localStorage.getItem('cf_sfx_mute') === 'true',

        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        },

        toggleMute() {
            this.muted = !this.muted;
            localStorage.setItem('cf_sfx_mute', this.muted);
            return this.muted;
        },

        playFlap() {
            if (this.muted) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(260, now);
            osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.09);
        },

        playScore() {
            if (this.muted) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.05);
            osc.frequency.setValueAtTime(783.99, now + 0.10);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.20);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
        },

        playCrash() {
            if (this.muted) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(190, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.32);
            gain.gain.setValueAtTime(0.38, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.34);
        },

        playSpin() {
            if (this.muted) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(380, now);
            osc.frequency.exponentialRampToValueAtTime(920, now + 0.16);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        },

        playShockwave() {
            if (this.muted) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.42);
        },

        playChargeBlip(step) {
            if (this.muted) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const freqs = [440, 523.25, 622.25, 739.99, 880, 1046.5];
            const f = freqs[step] || 880;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);
            osc.frequency.exponentialRampToValueAtTime(f * 1.1, now + 0.07);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.08);
        },

        playChargeFull() {
            if (this.muted) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(587.33, now);
            osc.frequency.setValueAtTime(880, now + 0.06);
            osc.frequency.setValueAtTime(1174.66, now + 0.12);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    };

    // ─── 2. CLICK-TO-SPIN LOGO GIMMICK & COMBO ───
    function initLogoSpin() {
        const logo = document.getElementById('brand-logo-spin');
        if (!logo) return;

        let totalRotation = 0;
        let spinCombo = 0;
        let comboResetTimer = null;

        logo.style.cursor = 'pointer';
        logo.title = 'Click me to spin!';

        logo.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            SFX.playSpin();

            spinCombo++;
            clearTimeout(comboResetTimer);
            comboResetTimer = setTimeout(() => { spinCombo = 0; }, 1400);

            // Accelerate rotation based on combo
            const spinStep = 360 * (spinCombo > 3 ? 2 : 1);
            totalRotation += spinStep;

            logo.style.transition = 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)';
            logo.style.transform = `rotate(${totalRotation}deg) scale(1.25)`;

            setTimeout(() => {
                logo.style.transform = `rotate(${totalRotation}deg) scale(1)`;
            }, 650);

            // Spawn radial sparks around the logo
            spawnLogoSparks(logo);

            // Easter egg notification on 5x combo
            if (spinCombo === 5) {
                showFloatingCombo('🔥 FLAME FRENZY! 5x COMBO!');
            }
        });
    }

    function spawnLogoSparks(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const count = 10;

        for (let i = 0; i < count; i++) {
            const spark = document.createElement('div');
            spark.className = 'logo-spin-spark';
            const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
            const dist = 32 + Math.random() * 28;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;

            spark.style.left = `${centerX}px`;
            spark.style.top = `${centerY}px`;
            spark.style.setProperty('--tx', `${tx}px`);
            spark.style.setProperty('--ty', `${ty}px`);
            spark.style.backgroundColor = i % 2 === 0 ? '#ff3b3b' : '#fb923c';

            document.body.appendChild(spark);
            setTimeout(() => spark.remove(), 700);
        }
    }

    function showFloatingCombo(text) {
        const toast = document.createElement('div');
        toast.className = 'combo-toast';
        toast.textContent = text;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2200);
    }

    // ─── 3. CLICK-TO-EMBER CURSOR EFFECT ───
    function initClickEmbers() {
        document.addEventListener('click', function(e) {
            // Avoid creating sparks when clicking inside form inputs
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

            const count = 7;
            for (let i = 0; i < count; i++) {
                const spark = document.createElement('div');
                spark.className = 'click-ember';
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 32 + 16;
                const tx = Math.cos(angle) * speed;
                const ty = Math.sin(angle) * speed - 15; // upward bias

                spark.style.left = `${e.clientX}px`;
                spark.style.top = `${e.clientY}px`;
                spark.style.setProperty('--tx', `${tx}px`);
                spark.style.setProperty('--ty', `${ty}px`);
                spark.style.background = i % 2 === 0 
                    ? 'radial-gradient(circle, #fff 0%, #fb923c 60%, transparent 100%)' 
                    : 'radial-gradient(circle, #ff5533 0%, #dc2626 70%, transparent 100%)';

                document.body.appendChild(spark);
                setTimeout(() => spark.remove(), 750);
            }
        });
    }

    // ─── 4. INTERACTIVE 3D PLANET SHOCKWAVE ───
    function initPlanetShockwave() {
        const orbContainer = document.getElementById('planet-3d-container');
        if (!orbContainer) return;

        orbContainer.addEventListener('click', function(e) {
            SFX.playShockwave();

            const shockwave = document.createElement('div');
            shockwave.className = 'planet-shockwave';
            orbContainer.appendChild(shockwave);

            setTimeout(() => shockwave.remove(), 900);
        });
    }

    // ─── 5. HERO GRADIENT WORD INFERNO SURGE ───
    function initInfernoSurge() {
        const flameWord = document.querySelector('.hero-title .gradient-word');
        if (!flameWord) return;

        flameWord.style.cursor = 'pointer';
        flameWord.title = 'Click for Inferno Surge!';

        flameWord.addEventListener('click', function() {
            SFX.playShockwave();
            document.body.classList.add('inferno-overdrive');
            showFloatingCombo('⚡ INFERNO OVERDRIVE ACTIVATED!');

            setTimeout(() => {
                document.body.classList.remove('inferno-overdrive');
            }, 3000);
        });
    }

    // ─── 6. FLAPPY FLAME RETRO MINI-GAME ───
    function initFlappyFlame() {
        const modal = document.getElementById('flappy-modal');
        const canvas = document.getElementById('flappy-canvas');
        if (!modal || !canvas) return;

        const ctx = canvas.getContext('2d');
        const openBtn = document.getElementById('btn-open-flappy');
        const fabBtn = document.getElementById('arcade-fab');
        const closeBtn = document.getElementById('flappy-close-btn');
        const soundBtn = document.getElementById('flappy-sound-btn');
        const bestScoreLabel = document.getElementById('flappy-best-score');
        const fabBestLabel = document.getElementById('arcade-fab-best');

        let isRunning = false;
        let animationFrameId = null;
        let gameState = 'START'; // 'START' | 'PLAYING' | 'GAMEOVER'
        let score = 0;
        let bestScore = parseInt(localStorage.getItem('cf_flappy_best') || '0', 10);
        let screenShake = 0;

        function updateBestDisplays() {
            if (bestScoreLabel) bestScoreLabel.textContent = bestScore;
            if (fabBestLabel) fabBestLabel.textContent = `BEST ${bestScore}`;
        }
        updateBestDisplays();

        // Sound button icon sync
        function updateSoundBtn() {
            if (soundBtn) soundBtn.textContent = SFX.muted ? '🔇' : '🔊';
        }
        updateSoundBtn();

        if (soundBtn) {
            soundBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                SFX.toggleMute();
                updateSoundBtn();
            });
        }

        // Game dimensions
        const WIDTH = 380;
        const HEIGHT = 480;
        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        // Player (Crimson Flame)
        const flame = {
            x: 80,
            y: 220,
            radius: 16,
            velocity: 0,
            gravity: 0.36,
            jump: -6.4,
            rotation: 0,
            flapTimer: 0,
            trail: []
        };

        // Pillars (Stalactites & Stalagmites)
        let pillars = [];
        const PILLAR_WIDTH = 54;
        const GAP_SIZE = 135;
        const PILLAR_SPEED = 2.4;
        let pillarSpawnCounter = 0;

        // Particle pool for game
        let gameParticles = [];

        function resetGame() {
            flame.x = 80;
            flame.y = 210;
            flame.velocity = 0;
            flame.rotation = 0;
            flame.trail = [];
            pillars = [];
            pillarSpawnCounter = 0;
            gameParticles = [];
            score = 0;
            screenShake = 0;
        }

        function flap() {
            if (gameState === 'START') {
                gameState = 'PLAYING';
                flame.velocity = flame.jump;
                SFX.playFlap();
                emitFlapSparks(flame.x, flame.y);
            } else if (gameState === 'PLAYING') {
                flame.velocity = flame.jump;
                SFX.playFlap();
                emitFlapSparks(flame.x, flame.y);
            } else if (gameState === 'GAMEOVER') {
                resetGame();
                gameState = 'PLAYING';
                flame.velocity = flame.jump;
                SFX.playFlap();
            }
        }

        function emitFlapSparks(x, y) {
            for (let i = 0; i < 6; i++) {
                gameParticles.push({
                    x: x - 8,
                    y: y + (Math.random() * 10 - 5),
                    vx: -(Math.random() * 3 + 2),
                    vy: Math.random() * 2 - 1,
                    radius: Math.random() * 3 + 1.5,
                    alpha: 1,
                    color: i % 2 === 0 ? '#ff4d4d' : '#fb923c'
                });
            }
        }

        function emitExplosion(x, y) {
            for (let i = 0; i < 35; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.random() * 6 + 1.5;
                gameParticles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    radius: Math.random() * 4 + 2,
                    alpha: 1,
                    color: Math.random() > 0.5 ? '#ff2a2a' : '#ffaa00'
                });
            }
        }

        function triggerGameOver() {
            gameState = 'GAMEOVER';
            screenShake = 14;
            SFX.playCrash();
            emitExplosion(flame.x, flame.y);

            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('cf_flappy_best', bestScore);
                updateBestDisplays();
            }
        }

        // Spawn pillars
        function spawnPillar() {
            const minHeight = 55;
            const maxHeight = HEIGHT - GAP_SIZE - minHeight - 40;
            const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

            pillars.push({
                x: WIDTH + 10,
                topHeight: topHeight,
                bottomY: topHeight + GAP_SIZE,
                passed: false
            });
        }

        // Main Loop
        let lastTime = performance.now();

        function gameLoop(now) {
            if (!isRunning) return;
            animationFrameId = requestAnimationFrame(gameLoop);

            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;

            update(dt);
            render();
        }

        function update(dt) {
            // Screen shake dampening
            if (screenShake > 0) screenShake *= 0.88;
            if (screenShake < 0.2) screenShake = 0;

            // Particles update
            for (let i = gameParticles.length - 1; i >= 0; i--) {
                const p = gameParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.035;
                if (p.alpha <= 0) gameParticles.splice(i, 1);
            }

            if (gameState === 'START') {
                flame.flapTimer += 0.08;
                flame.y = 210 + Math.sin(flame.flapTimer) * 10;
                flame.rotation = Math.sin(flame.flapTimer) * 0.12;
                return;
            }

            if (gameState === 'PLAYING') {
                // Physics
                flame.velocity += flame.gravity;
                flame.y += flame.velocity;

                // Rotation based on velocity
                flame.rotation = Math.min(Math.PI / 3.2, Math.max(-Math.PI / 4, flame.velocity * 0.08));

                // Floor collision (lava ground)
                const groundY = HEIGHT - 36;
                if (flame.y + flame.radius >= groundY) {
                    flame.y = groundY - flame.radius;
                    triggerGameOver();
                    return;
                }

                // Ceiling collision
                if (flame.y - flame.radius <= 0) {
                    flame.y = flame.radius;
                    flame.velocity = 0;
                }

                // Trail emission
                flame.trail.push({ x: flame.x - 6, y: flame.y, alpha: 0.7 });
                if (flame.trail.length > 12) flame.trail.shift();
                flame.trail.forEach(t => t.alpha *= 0.88);

                // Pillar spawning
                pillarSpawnCounter++;
                if (pillarSpawnCounter >= 85) {
                    spawnPillar();
                    pillarSpawnCounter = 0;
                }

                // Pillars update & collision
                for (let i = pillars.length - 1; i >= 0; i--) {
                    const p = pillars[i];
                    p.x -= PILLAR_SPEED;

                    // Score point
                    if (!p.passed && p.x + PILLAR_WIDTH < flame.x) {
                        p.passed = true;
                        score++;
                        SFX.playScore();

                        // Visual score burst
                        for (let k = 0; k < 8; k++) {
                            gameParticles.push({
                                x: flame.x,
                                y: flame.y,
                                vx: Math.cos(k) * 2,
                                vy: Math.sin(k) * 2,
                                radius: 2,
                                alpha: 1,
                                color: '#ffd700'
                            });
                        }
                    }

                    // Collision detection (Circle to Box)
                    const hitboxInset = 4;
                    const topBox = { x: p.x + hitboxInset, y: 0, w: PILLAR_WIDTH - hitboxInset * 2, h: p.topHeight };
                    const bottomBox = { x: p.x + hitboxInset, y: p.bottomY, w: PILLAR_WIDTH - hitboxInset * 2, h: HEIGHT - p.bottomY };

                    if (circleRectCollide(flame.x, flame.y, flame.radius - 2, topBox) ||
                        circleRectCollide(flame.x, flame.y, flame.radius - 2, bottomBox)) {
                        triggerGameOver();
                        return;
                    }

                    // Remove offscreen pillars
                    if (p.x + PILLAR_WIDTH < -20) {
                        pillars.splice(i, 1);
                    }
                }
            } else if (gameState === 'GAMEOVER') {
                // Drop dead flame to floor
                if (flame.y + flame.radius < HEIGHT - 36) {
                    flame.velocity += flame.gravity * 1.2;
                    flame.y += flame.velocity;
                }
            }
        }

        function circleRectCollide(cx, cy, radius, rx) {
            const nearestX = Math.max(rx.x, Math.min(cx, rx.x + rx.w));
            const nearestY = Math.max(rx.y, Math.min(cy, rx.y + rx.h));
            const distX = cx - nearestX;
            const distY = cy - nearestY;
            return (distX * distX + distY * distY) < (radius * radius);
        }

        function render() {
            ctx.save();

            // Screen shake
            if (screenShake > 0) {
                const sx = (Math.random() - 0.5) * screenShake * 1.5;
                const sy = (Math.random() - 0.5) * screenShake * 1.5;
                ctx.translate(sx, sy);
            }

            // 1. Retro Volcanic Night Sky Background
            const bgGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
            bgGrad.addColorStop(0, '#0f070a');
            bgGrad.addColorStop(0.65, '#1e0c12');
            bgGrad.addColorStop(1, '#3b1016');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            // Subtle background stars/sparks
            ctx.fillStyle = 'rgba(255, 140, 50, 0.4)';
            for (let i = 0; i < 20; i++) {
                const sx = ((i * 47) + (Date.now() * 0.02 * (i % 3 + 1))) % WIDTH;
                const sy = (i * 29) % (HEIGHT - 80);
                ctx.fillRect(sx, sy, 1.5, 1.5);
            }

            // 2. Pillars (Basalt Columns with Molten Veins)
            pillars.forEach(p => {
                // Top Pillar
                drawVolcanicPillar(p.x, 0, PILLAR_WIDTH, p.topHeight, true);
                // Bottom Pillar
                drawVolcanicPillar(p.x, p.bottomY, PILLAR_WIDTH, HEIGHT - p.bottomY - 36, false);
            });

            // 3. Ground (Lava Crust)
            const groundY = HEIGHT - 36;
            const groundGrad = ctx.createLinearGradient(0, groundY, 0, HEIGHT);
            groundGrad.addColorStop(0, '#ff3b00');
            groundGrad.addColorStop(0.18, '#701016');
            groundGrad.addColorStop(1, '#1a060a');
            ctx.fillStyle = groundGrad;
            ctx.fillRect(0, groundY, WIDTH, 36);

            // Magma line
            ctx.strokeStyle = '#ff7700';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(WIDTH, groundY);
            ctx.stroke();

            // 4. Trail
            flame.trail.forEach(t => {
                ctx.fillStyle = `rgba(255, 90, 20, ${t.alpha * 0.5})`;
                ctx.beginPath();
                ctx.arc(t.x, t.y, flame.radius * 0.7, 0, Math.PI * 2);
                ctx.fill();
            });

            // 5. Game Particles
            gameParticles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // 6. Draw Player (Crimson Flame Spirit)
            drawFlameCharacter(flame.x, flame.y, flame.rotation);

            // 7. HUD / UI Overlays
            if (gameState === 'START') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(0, 0, WIDTH, HEIGHT);

                ctx.fillStyle = '#ff4d4d';
                ctx.font = '900 24px "Outfit", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('FLAPPY FLAME', WIDTH / 2, 140);

                ctx.fillStyle = '#fff';
                ctx.font = '600 13px "Inter", sans-serif';
                ctx.fillText('TAP OR PRESS SPACE TO FLY', WIDTH / 2, 290);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.font = '500 11px "Inter", sans-serif';
                ctx.fillText('Dodge the volcanic basalt pillars!', WIDTH / 2, 315);
            } else if (gameState === 'PLAYING') {
                // Live Score Display
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 38px "Outfit", sans-serif';
                ctx.textAlign = 'center';
                ctx.shadowColor = 'rgba(220, 38, 38, 0.8)';
                ctx.shadowBlur = 12;
                ctx.fillText(score, WIDTH / 2, 58);
                ctx.shadowBlur = 0;
            } else if (gameState === 'GAMEOVER') {
                ctx.fillStyle = 'rgba(10, 4, 6, 0.75)';
                ctx.fillRect(0, 0, WIDTH, HEIGHT);

                ctx.fillStyle = '#ff3333';
                ctx.font = '900 26px "Outfit", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', WIDTH / 2, 160);

                // Score card
                ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.strokeStyle = 'rgba(220, 38, 38, 0.35)';
                ctx.lineWidth = 1;
                roundRect(ctx, WIDTH / 2 - 110, 190, 220, 110, 12, true, true);

                ctx.fillStyle = '#aaa';
                ctx.font = '600 12px "Inter", sans-serif';
                ctx.fillText('SCORE', WIDTH / 2, 218);

                ctx.fillStyle = '#fff';
                ctx.font = '800 24px "Outfit", sans-serif';
                ctx.fillText(score, WIDTH / 2, 246);

                ctx.fillStyle = '#ffaa33';
                ctx.font = '700 12px "Inter", sans-serif';
                ctx.fillText(`BEST: ${bestScore}`, WIDTH / 2, 276);

                ctx.fillStyle = '#fff';
                ctx.font = '600 12px "Inter", sans-serif';
                ctx.fillText('CLICK OR SPACE TO RETRY', WIDTH / 2, 340);
            }

            ctx.restore();
        }

        function drawVolcanicPillar(x, y, width, height, isTop) {
            ctx.save();

            // Pillar Body (Dark basalt column)
            const pGrad = ctx.createLinearGradient(x, 0, x + width, 0);
            pGrad.addColorStop(0, '#1c1216');
            pGrad.addColorStop(0.5, '#2e1c22');
            pGrad.addColorStop(1, '#160c10');
            ctx.fillStyle = pGrad;
            ctx.fillRect(x, y, width, height);

            // Pillar Border
            ctx.strokeStyle = 'rgba(255, 60, 40, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y, width, height);

            // Glowing Lava Fissure running vertically
            ctx.strokeStyle = 'rgba(255, 80, 20, 0.65)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const fissureX = x + width * 0.55;
            ctx.moveTo(fissureX, y);
            ctx.lineTo(fissureX + 3, y + height * 0.4);
            ctx.lineTo(fissureX - 2, y + height * 0.75);
            ctx.lineTo(fissureX + 2, y + height);
            ctx.stroke();

            // Cap / Lip at edge
            const capY = isTop ? y + height - 12 : y;
            ctx.fillStyle = '#40151c';
            ctx.fillRect(x - 3, capY, width + 6, 12);

            ctx.fillStyle = '#ff4400';
            ctx.fillRect(x - 3, isTop ? capY + 10 : capY, width + 6, 2);

            ctx.restore();
        }

        function drawFlameCharacter(x, y, rot) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);

            // Outer Aura Glow
            const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, flame.radius * 1.7);
            aura.addColorStop(0, 'rgba(255, 120, 30, 0.6)');
            aura.addColorStop(0.6, 'rgba(220, 38, 38, 0.3)');
            aura.addColorStop(1, 'rgba(220, 38, 38, 0)');
            ctx.fillStyle = aura;
            ctx.beginPath();
            ctx.arc(0, 0, flame.radius * 1.7, 0, Math.PI * 2);
            ctx.fill();

            // Core Fireball
            const coreGrad = ctx.createRadialGradient(2, -2, 2, 0, 0, flame.radius);
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(0.3, '#ffcc00');
            coreGrad.addColorStop(0.7, '#ff3b00');
            coreGrad.addColorStop(1, '#990000');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(0, 0, flame.radius, 0, Math.PI * 2);
            ctx.fill();

            // Flapping Fire Wings
            const wingFlap = Math.sin(Date.now() * 0.02) * 5;
            ctx.fillStyle = '#ff9900';
            ctx.beginPath();
            ctx.moveTo(-4, 0);
            ctx.quadraticCurveTo(-14, -10 + wingFlap, -8, -18 + wingFlap);
            ctx.quadraticCurveTo(0, -10, 4, 0);
            ctx.fill();

            // Flame Crest on Top
            ctx.fillStyle = '#ffdd44';
            ctx.beginPath();
            ctx.moveTo(-6, -6);
            ctx.quadraticCurveTo(-12, -22, 0, -20);
            ctx.quadraticCurveTo(6, -14, 6, -6);
            ctx.fill();

            // Cute Eye & Sparkle
            ctx.fillStyle = '#1a060a';
            ctx.beginPath();
            ctx.arc(5, -2, 3.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(6.2, -3.2, 1.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            if (fill) ctx.fill();
            if (stroke) ctx.stroke();
        }

        // Modal Controls
        function openGame() {
            modal.style.display = 'flex';
            modal.classList.add('active');
            isRunning = true;
            resetGame();
            gameState = 'START';
            lastTime = performance.now();
            animationFrameId = requestAnimationFrame(gameLoop);
            document.body.style.overflow = 'hidden';
            SFX.init();
        }

        function closeGame() {
            modal.style.display = 'none';
            modal.classList.remove('active');
            isRunning = false;
            cancelAnimationFrame(animationFrameId);
            document.body.style.overflow = '';
        }

        if (openBtn) openBtn.addEventListener('click', openGame);
        if (fabBtn) fabBtn.addEventListener('click', openGame);
        if (closeBtn) closeBtn.addEventListener('click', closeGame);

        // Click on backdrop to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeGame();
        });

        // Key controls
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && isRunning) {
                closeGame();
                return;
            }
            if (e.code === 'Space' && isRunning) {
                e.preventDefault();
                flap();
            }
        });

        // Click / Touch on Canvas
        canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            flap();
        });

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            flap();
        }, { passive: false });
    }

    // ─── 7. INTERACTIVE FEATURE STACK (GAMES, SOFTWARE, COMMUNITY) ───
    function initFeatureStack() {
        const cards = document.querySelectorAll('.feature-stack-card');
        if (!cards.length) return;

        cards.forEach(card => {
            const bars = card.querySelectorAll('.charge-bar');
            let timeouts = [];

            // 1. Randomly fill up bars on each visit (2 to 5 bars filled)
            const filledCount = Math.floor(Math.random() * 4) + 2;
            bars.forEach((bar, index) => {
                if (index < filledCount) {
                    bar.classList.add('filled');
                } else {
                    bar.classList.remove('filled');
                }
            });

            // 2. Clicking card shakes it and sequentially highlights each filled bar
            card.addEventListener('click', function(e) {
                // Clear any running timeouts
                timeouts.forEach(t => clearTimeout(t));
                timeouts = [];

                // Trigger haptic shake animation
                card.classList.remove('charging');
                void card.offsetWidth; // Force CSS reflow
                card.classList.add('charging');

                // Clear any existing highlights
                bars.forEach(b => b.classList.remove('highlight'));

                // Get all filled bars for this card
                const filledBars = Array.from(bars).filter(b => b.classList.contains('filled'));
                if (!filledBars.length) return;

                // Highlight each filled bar sequentially
                filledBars.forEach((bar, index) => {
                    const delay = index * 95;
                    const t = setTimeout(() => {
                        bar.classList.add('highlight');
                        SFX.playChargeBlip(index);

                        // If last filled bar is reached
                        if (index === filledBars.length - 1) {
                            card.classList.remove('charging');
                            SFX.playChargeFull();
                            spawnCardSparks(card);

                            // Keep highlighted briefly, then return to resting filled state
                            const resetTimer = setTimeout(() => {
                                filledBars.forEach(b => b.classList.remove('highlight'));
                            }, 1200);
                            timeouts.push(resetTimer);
                        }
                    }, delay);
                    timeouts.push(t);
                });
            });
        });
    }

    function spawnCardSparks(card) {
        const rect = card.getBoundingClientRect();
        const count = 10;
        for (let i = 0; i < count; i++) {
            const spark = document.createElement('div');
            spark.className = 'click-ember';
            const x = rect.left + rect.width * (0.15 + Math.random() * 0.7);
            const y = rect.bottom - 16;
            const angle = -Math.PI / 2 + (Math.random() * 0.9 - 0.45);
            const speed = Math.random() * 34 + 18;
            const tx = Math.cos(angle) * speed;
            const ty = Math.sin(angle) * speed;

            spark.style.left = `${x}px`;
            spark.style.top = `${y}px`;
            spark.style.setProperty('--tx', `${tx}px`);
            spark.style.setProperty('--ty', `${ty}px`);
            spark.style.background = i % 2 === 0
                ? 'radial-gradient(circle, #fff 0%, #ef4444 50%, #dc2626 100%)'
                : 'radial-gradient(circle, #fff 0%, #fb923c 50%, #f97316 100%)';

            document.body.appendChild(spark);
            setTimeout(() => spark.remove(), 750);
        }
    }

    // ─── INITIALIZE ALL INTERACTIVE FEATURES ON DOM READY ───
    function init() {
        initLogoSpin();
        initClickEmbers();
        initPlanetShockwave();
        initInfernoSurge();
        initFlappyFlame();
        initFeatureStack();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
