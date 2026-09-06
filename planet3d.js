// ─── 3D INTERACTIVE FLAME PLANET GLOBE (WITH AUTOMATIC FALLBACK) ───
(function() {
    function isWebGLSupported() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    function init3DPlanet() {
        const container = document.getElementById('planet-3d-container');
        if (!container) return;

        // Check WebGL and Three.js availability — if missing, keep classic CSS orb fallback
        if (typeof THREE === 'undefined' || !isWebGLSupported()) {
            console.warn('[CrimsonFlame] WebGL or Three.js unavailable. Using classic CSS orb fallback.');
            return;
        }

        let renderer;
        try {
            const width = container.clientWidth || 360;
            const height = container.clientHeight || 360;

            // 1. Scene, Camera, Renderer (Zoomed out camera position so the planet is cleanly framed)
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            camera.position.set(0, 0, 480);

            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.domElement.style.position = 'absolute';
            renderer.domElement.style.top = '0';
            renderer.domElement.style.left = '0';
            renderer.domElement.style.width = '100%';
            renderer.domElement.style.height = '100%';
            renderer.domElement.style.pointerEvents = 'auto';
            renderer.domElement.style.cursor = 'grab';

            // Hide static CSS orb & CSS rings only after successful 3D WebGL renderer creation
            const staticElements = container.querySelectorAll('.orb, .orb-ring');
            staticElements.forEach(function(el) { el.style.display = 'none'; });

            container.appendChild(renderer.domElement);

            // 2. Seamless 3D Spherical Lava & Obsidian Map Generator (100% Mathematically Seam-Free)
            function generateSeamlessLavaMaps() {
                const canvas = document.createElement('canvas');
                canvas.width = 1024;
                canvas.height = 512;
                const ctx = canvas.getContext('2d');

                const bumpCanvas = document.createElement('canvas');
                bumpCanvas.width = 1024;
                bumpCanvas.height = 512;
                const bumpCtx = bumpCanvas.getContext('2d');

                const imgData = ctx.createImageData(canvas.width, canvas.height);
                const data = imgData.data;

                const bumpData = bumpCtx.createImageData(canvas.width, canvas.height);
                const bdata = bumpData.data;

                // Fast, deterministic 3D hash & continuous value noise
                function hash(x, y, z) {
                    const p = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
                    return p - Math.floor(p);
                }

                function noise3D(x, y, z) {
                    const ix = Math.floor(x);
                    const iy = Math.floor(y);
                    const iz = Math.floor(z);
                    const fx = x - ix;
                    const fy = y - iy;
                    const fz = z - iz;

                    const wx = fx * fx * (3.0 - 2.0 * fx);
                    const wy = fy * fy * (3.0 - 2.0 * fy);
                    const wz = fz * fz * (3.0 - 2.0 * fz);

                    const c000 = hash(ix, iy, iz);
                    const c100 = hash(ix + 1, iy, iz);
                    const c010 = hash(ix, iy + 1, iz);
                    const c110 = hash(ix + 1, iy + 1, iz);
                    const c001 = hash(ix, iy, iz + 1);
                    const c101 = hash(ix + 1, iy, iz + 1);
                    const c011 = hash(ix, iy + 1, iz + 1);
                    const c111 = hash(ix + 1, iy + 1, iz + 1);

                    const x00 = c000 + wx * (c100 - c000);
                    const x10 = c010 + wx * (c110 - c010);
                    const x01 = c001 + wx * (c101 - c001);
                    const x11 = c011 + wx * (c111 - c011);

                    const y0 = x00 + wy * (x10 - x00);
                    const y1 = x01 + wy * (x11 - x01);

                    return y0 + wz * (y1 - y0);
                }

                // 4-octave fractal brownian motion
                function fbm(x, y, z) {
                    return noise3D(x, y, z) * 0.52 +
                           noise3D(x * 2.05, y * 2.05, z * 2.05) * 0.26 +
                           noise3D(x * 4.15, y * 4.15, z * 4.15) * 0.14 +
                           noise3D(x * 8.3, y * 8.3, z * 8.3) * 0.08;
                }

                const w = canvas.width;
                const h = canvas.height;

                for (let y = 0; y < h; y++) {
                    const v = y / h;
                    const phi = v * Math.PI; // 0 to PI
                    const sinPhi = Math.sin(phi);
                    const cosPhi = Math.cos(phi);

                    for (let x = 0; x < w; x++) {
                        const u = x / w;
                        const theta = u * Math.PI * 2.0; // 0 to 2*PI

                        // 3D Unit Sphere coordinates (Identical at x=0 and x=w, eliminating all seams)
                        const sx = sinPhi * Math.cos(theta);
                        const sy = cosPhi;
                        const sz = sinPhi * Math.sin(theta);

                        // Domain warp for swirling tectonic magma currents
                        const w1 = noise3D(sx * 2.2 + 1.2, sy * 2.2 + 0.4, sz * 2.2 + 2.1);
                        const w2 = noise3D(sx * 2.2 + 4.8, sy * 2.2 + 3.1, sz * 2.2 + 5.7);

                        const n = fbm(sx * 2.5 + w1 * 0.5, sy * 2.5 + w2 * 0.5, sz * 2.5);

                        const idx = (y * w + x) * 4;

                        // Threshold between fiery magma veins and cooled basalt/obsidian crust
                        if (n < 0.48) {
                            // Molten Lava Channels (bright incandescent core to deep crimson)
                            const t = n / 0.48; // 0 (brightest yellow-orange) to 1 (deep red)
                            let r, g, b;
                            if (t < 0.35) {
                                const k = t / 0.35;
                                r = 255;
                                g = Math.floor(220 - k * 105);
                                b = Math.floor(95 - k * 80);
                            } else if (t < 0.72) {
                                const k = (t - 0.35) / 0.37;
                                r = 255;
                                g = Math.floor(115 - k * 75);
                                b = Math.floor(15 - k * 10);
                            } else {
                                const k = (t - 0.72) / 0.28;
                                r = Math.floor(255 - k * 70);
                                g = Math.floor(40 - k * 28);
                                b = Math.floor(5 + k * 8);
                            }

                            data[idx]     = r;
                            data[idx + 1] = g;
                            data[idx + 2] = b;
                            data[idx + 3] = 255;

                            // Bump map: lava is lower in elevation
                            const hVal = Math.floor(t * 60);
                            bdata[idx]     = hVal;
                            bdata[idx + 1] = hVal;
                            bdata[idx + 2] = hVal;
                            bdata[idx + 3] = 255;
                        } else {
                            // Cooled Volcanic Obsidian Plates
                            const t = (n - 0.48) / 0.52;
                            const crustBase = Math.floor(16 + t * 22);
                            data[idx]     = crustBase + 10;
                            data[idx + 1] = Math.floor(crustBase * 0.35);
                            data[idx + 2] = Math.floor(crustBase * 0.45);
                            data[idx + 3] = 255;

                            // Bump map: tectonic crust stands above magma rifts
                            const hVal = Math.min(255, 95 + Math.floor(t * 160));
                            bdata[idx]     = hVal;
                            bdata[idx + 1] = hVal;
                            bdata[idx + 2] = hVal;
                            bdata[idx + 3] = 255;
                        }
                    }
                }

                ctx.putImageData(imgData, 0, 0);
                bumpCtx.putImageData(bumpData, 0, 0);

                const diffuseTexture = new THREE.CanvasTexture(canvas);
                diffuseTexture.wrapS = THREE.RepeatWrapping;
                diffuseTexture.wrapT = THREE.ClampToEdgeWrapping;

                const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
                bumpTexture.wrapS = THREE.RepeatWrapping;
                bumpTexture.wrapT = THREE.ClampToEdgeWrapping;

                return { diffuseTexture, bumpTexture };
            }

            const { diffuseTexture, bumpTexture } = generateSeamlessLavaMaps();

            // 3. Planet Mesh (Sphere with procedural 3D bump & glow)
            const planetRadius = 80;
            const planetGeo = new THREE.SphereGeometry(planetRadius, 64, 64);
            const planetMat = new THREE.MeshStandardMaterial({
                map: diffuseTexture,
                bumpMap: bumpTexture,
                bumpScale: 3.2,
                roughness: 0.55,
                metalness: 0.25,
                emissive: new THREE.Color(0xff2a00),
                emissiveIntensity: 0.65,
                emissiveMap: diffuseTexture
            });
            const planetMesh = new THREE.Mesh(planetGeo, planetMat);
            scene.add(planetMesh);

            // 4. Glowing Atmosphere Shell (Fresnel-like Rim Haze)
            const atmosGeo = new THREE.SphereGeometry(planetRadius * 1.05, 48, 48);
            const atmosMat = new THREE.MeshBasicMaterial({
                color: 0xff3b3b,
                transparent: true,
                opacity: 0.22,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending
            });
            const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
            scene.add(atmosMesh);

            // Subtle secondary inner aura
            const innerAuraGeo = new THREE.SphereGeometry(planetRadius * 1.018, 48, 48);
            const innerAuraMat = new THREE.MeshBasicMaterial({
                color: 0xff7722,
                transparent: true,
                opacity: 0.15,
                blending: THREE.AdditiveBlending
            });
            scene.add(new THREE.Mesh(innerAuraGeo, innerAuraMat));

            // 5. 3D Orbital Rings (Old Classic Flame Rings)
            const ringGroup = new THREE.Group();

            const ring1Geo = new THREE.TorusGeometry(125, 2.0, 16, 100);
            const ring1Mat = new THREE.MeshBasicMaterial({
                color: 0xff4d4d,
                transparent: true,
                opacity: 0.65,
                blending: THREE.AdditiveBlending
            });
            const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
            ring1.rotation.x = Math.PI / 2.4;
            ring1.rotation.y = Math.PI / 8;
            ringGroup.add(ring1);

            const ring2Geo = new THREE.TorusGeometry(155, 1.4, 16, 100);
            const ring2Mat = new THREE.MeshBasicMaterial({
                color: 0xff9933,
                transparent: true,
                opacity: 0.45,
                blending: THREE.AdditiveBlending
            });
            const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
            ring2.rotation.x = Math.PI / 1.8;
            ring2.rotation.y = -Math.PI / 6;
            ringGroup.add(ring2);

            scene.add(ringGroup);

            // 6. 3D Floating Embers Particle Swarm
            const particleCount = 140;
            const particleGeo = new THREE.BufferGeometry();
            const particlePositions = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount; i++) {
                const r = planetRadius + 18 + Math.random() * 65;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI - Math.PI / 2;

                particlePositions[i * 3]     = r * Math.cos(phi) * Math.cos(theta);
                particlePositions[i * 3 + 1] = r * Math.sin(phi);
                particlePositions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);
            }

            particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

            const particleMat = new THREE.PointsMaterial({
                color: 0xff6b35,
                size: 3,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

            const particleSystem = new THREE.Points(particleGeo, particleMat);
            scene.add(particleSystem);

            // 7. Lighting (Cinema-Grade Molten Core Illumination)
            const ambientLight = new THREE.AmbientLight(0x220508, 1.4);
            scene.add(ambientLight);

            // Warm Key Light highlighting volcanic relief
            const keyLight = new THREE.DirectionalLight(0xffeedd, 1.8);
            keyLight.position.set(160, 120, 180);
            scene.add(keyLight);

            // Fiery Lava Glow from Core
            const corePointLight = new THREE.PointLight(0xff3700, 3.2, 600);
            corePointLight.position.set(60, 40, 120);
            scene.add(corePointLight);

            // Rim / Backlight for atmospheric halo
            const rimLight = new THREE.PointLight(0xdc2626, 2.2, 500);
            rimLight.position.set(-180, -90, -140);
            scene.add(rimLight);

            // 8. Interactivity & Damping Controls
            let isDragging = false;
            let previousMousePosition = { x: 0, y: 0 };
            let targetRotationX = 0;
            let targetRotationY = 0;
            let currentRotationX = 0;
            let currentRotationY = 0;

            const domEl = renderer.domElement;

            domEl.addEventListener('mousedown', function(e) {
                isDragging = true;
                domEl.style.cursor = 'grabbing';
                previousMousePosition = { x: e.clientX, y: e.clientY };
            });

            window.addEventListener('mouseup', function() {
                isDragging = false;
                domEl.style.cursor = 'grab';
            });

            window.addEventListener('mousemove', function(e) {
                if (isDragging) {
                    const deltaX = e.clientX - previousMousePosition.x;
                    const deltaY = e.clientY - previousMousePosition.y;

                    targetRotationY += deltaX * 0.008;
                    targetRotationX += deltaY * 0.008;

                    previousMousePosition = { x: e.clientX, y: e.clientY };
                } else {
                    const normX = (e.clientX / window.innerWidth - 0.5) * 2;
                    const normY = (e.clientY / window.innerHeight - 0.5) * 2;
                    targetRotationY = normX * 0.4;
                    targetRotationX = normY * 0.4;
                }
            });

            // Touch Support
            domEl.addEventListener('touchstart', function(e) {
                if (e.touches.length === 1) {
                    isDragging = true;
                    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                }
            }, { passive: true });

            window.addEventListener('touchmove', function(e) {
                if (isDragging && e.touches.length === 1) {
                    const deltaX = e.touches[0].clientX - previousMousePosition.x;
                    const deltaY = e.touches[0].clientY - previousMousePosition.y;

                    targetRotationY += deltaX * 0.008;
                    targetRotationX += deltaY * 0.008;

                    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                }
            }, { passive: true });

            window.addEventListener('touchend', function() {
                isDragging = false;
            });

            // 9. Resize Listener
            function onWindowResize() {
                const newW = container.clientWidth || 360;
                const newH = container.clientHeight || 360;
                camera.aspect = newW / newH;
                camera.position.z = newW < 360 ? 520 : 480;
                camera.updateProjectionMatrix();
                renderer.setSize(newW, newH);
            }
            window.addEventListener('resize', onWindowResize);

            // 10. Animation Loop
            let clock = new THREE.Clock();

            function animate() {
                requestAnimationFrame(animate);

                const elapsedTime = clock.getElapsedTime();

                planetMesh.rotation.y += 0.004;

                ring1.rotation.z = elapsedTime * 0.15;
                ring2.rotation.z = -elapsedTime * 0.22;

                particleSystem.rotation.y = elapsedTime * 0.08;
                particleSystem.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;

                currentRotationX += (targetRotationX - currentRotationX) * 0.06;
                currentRotationY += (targetRotationY - currentRotationY) * 0.06;

                scene.rotation.x = currentRotationX;
                scene.rotation.y = currentRotationY;

                renderer.render(scene, camera);
            }

            animate();

        } catch (err) {
            console.warn('[CrimsonFlame] WebGL initialization failed. Falling back to classic CSS orb:', err);
            const staticElements = container.querySelectorAll('.orb, .orb-ring');
            staticElements.forEach(function(el) { el.style.display = 'block'; });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init3DPlanet);
    } else {
        init3DPlanet();
    }
})();
