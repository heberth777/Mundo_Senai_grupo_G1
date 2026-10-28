
window.tailwind = window.tailwind || {};
tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        orbitron: ['Orbitron', 'sans-serif'],
                        rajdhani: ['Rajdhani', 'sans-serif'],
                        mono: ['Share Tech Mono', 'monospace'],
                    },
                    colors: {
                        quantum: {
                            cyan: '#00f3ff',
                            purple: '#a855f7',
                            magenta: '#ff0055',
                            dark: '#030712',
                            panel: 'rgba(11, 19, 43, 0.75)',
                            border: 'rgba(0, 243, 255, 0.3)'
                        }
                    },
                    boxShadow: {
                        'neon-cyan': '0 0 20px rgba(0, 243, 255, 0.4), inset 0 0 10px rgba(0, 243, 255, 0.2)',
                        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 10px rgba(168, 85, 247, 0.2)',
                        'neon-red': '0 0 20px rgba(255, 0, 85, 0.4), inset 0 0 10px rgba(255, 0, 85, 0.2)',
                        'holo': '0 0 35px rgba(0, 243, 255, 0.25)',
                    },
                    animation: {
                        'pulse-glow': 'pulseGlow 2s infinite alternate',
                        'scanline': 'scanline 8s linear infinite',
                        'glitch': 'glitch 1s infinite alternate',
                        'holo-flicker': 'holoFlicker 3s infinite',
                    },
                    keyframes: {
                        pulseGlow: {
                            '0%': { boxShadow: '0 0 10px rgba(0,243,255,0.3)' },
                            '100%': { boxShadow: '0 0 25px rgba(0,243,255,0.7), 0 0 5px rgba(168,85,247,0.5)' }
                        },
                        scanline: {
                            '0%': { transform: 'translateY(-100%)' },
                            '100%': { transform: 'translateY(1000%)' }
                        },
                        holoFlicker: {
                            '0%, 100%': { opacity: 0.98 },
                            '50%': { opacity: 0.92 },
                            '52%': { opacity: 0.99 },
                            '54%': { opacity: 0.88 },
                            '80%': { opacity: 0.97 },
                        }
                    }
                }
            }
        }


document.addEventListener('DOMContentLoaded', () => {
        /* ==========================================================================
           1. AUDIO SYNTHESIZER (Web Audio API - Pure Code, No External Files)
           ========================================================================== */
        class QuantumAudio {
            constructor() {
                this.ctx = null;
                this.enabled = true;
            }

            init() {
                if (!this.ctx) {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.ctx = new AudioContext();
                }
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            }

            playHover() {
                if (!this.enabled) return;
                this.init();
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);

                gain.gain.setValueAtTime(0.03, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 0.04);
            }

            playClick() {
                if (!this.enabled) return;
                this.init();
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 0.08);
            }

            playError() {
                if (!this.enabled) return;
                this.init();
                const now = this.ctx.currentTime;
                
                // Double sawtooth buzz
                [0, 0.1].forEach(offset => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();

                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(140, now + offset);
                    osc.frequency.linearRampToValueAtTime(90, now + offset + 0.08);

                    gain.gain.setValueAtTime(0.12, now + offset);
                    gain.gain.linearRampToValueAtTime(0.001, now + offset + 0.08);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);

                    osc.start(now + offset);
                    osc.stop(now + offset + 0.08);
                });
            }

            playWarpSuccess() {
                if (!this.enabled) return;
                this.init();
                const now = this.ctx.currentTime;
                const duration = 1.4;

                // Frequency sweep oscillator
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(1800, now + duration);

                gain.gain.setValueAtTime(0.01, now);
                gain.gain.linearRampToValueAtTime(0.2, now + duration * 0.7);
                gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

                // Filter
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(300, now);
                filter.frequency.exponentialRampToValueAtTime(4000, now + duration);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + duration);
            }
        }

        const audioSys = new QuantumAudio();

        /* ==========================================================================
           2. STARFIELD BACKGROUND & HYPERDRIVE CANVAS ANIMATION
           ========================================================================== */
        const canvas = document.getElementById('bgCanvas');
        const ctx = canvas.getContext('2d');

        let width, height;
        let stars = [];
        let isWarping = false;

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Star {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = (Math.random() - 0.5) * width * 2;
                this.y = (Math.random() - 0.5) * height * 2;
                this.z = Math.random() * width;
                this.pz = this.z;
                this.color = Math.random() > 0.3 ? '#00f3ff' : '#a855f7';
            }

            update(speed) {
                this.pz = this.z;
                this.z -= speed;
                if (this.z <= 0) {
                    this.reset();
                    this.z = width;
                    this.pz = this.z;
                }
            }

            draw() {
                const cx = width / 2;
                const cy = height / 2;

                const x = (this.x / this.z) * width + cx;
                const y = (this.y / this.z) * height + cy;

                if (x < 0 || x >= width || y < 0 || y >= height) return;

                const px = (this.x / this.pz) * width + cx;
                const py = (this.y / this.pz) * height + cy;

                const r = (1 - this.z / width) * 2;

                ctx.beginPath();
                if (isWarping) {
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = r * 1.5;
                    ctx.moveTo(px, py);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                } else {
                    ctx.fillStyle = this.color;
                    ctx.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        for (let i = 0; i < 350; i++) {
            stars.push(new Star());
        }

        function animateStars() {
            ctx.fillStyle = isWarping ? 'rgba(3, 7, 18, 0.25)' : '#030712';
            ctx.fillRect(0, 0, width, height);

            const speed = isWarping ? 45 : 1.2;

            stars.forEach(star => {
                star.update(speed);
                star.draw();
            });

            requestAnimationFrame(animateStars);
        }

        animateStars();

        /* ==========================================================================
           3. FORM MASKING & CPF ALGORITHM VALIDATION
           ========================================================================== */
        const cpfInput = document.getElementById('cpf');
        const cpfStatus = document.getElementById('cpfStatus');

        // Apply CPF Mask (XXX.XXX.XXX-XX)
        cpfInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 11) v = v.slice(0, 11);

            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

            e.target.value = v;

            // Visual feedback
            if (v.length === 14) {
                if (validateCPF(v)) {
                    cpfStatus.textContent = "VALIDADO";
                    cpfStatus.className = "absolute right-3 top-3 text-xs font-mono text-emerald-400 font-bold";
                } else {
                    cpfStatus.textContent = "INVÁLIDO";
                    cpfStatus.className = "absolute right-3 top-3 text-xs font-mono text-quantum-magenta font-bold";
                }
            } else {
                cpfStatus.textContent = "MÁSCARA";
                cpfStatus.className = "absolute right-3 top-3 text-xs font-mono text-slate-500";
            }
        });

        // Strict CPF Math Validation
        function validateCPF(cpf) {
            const cleanCPF = cpf.replace(/\D/g, '');
            if (cleanCPF.length !== 11) return false;
            if (/^(\d)\1{10}$/.test(cleanCPF)) return false; // Block same digits like 111.111.111-11

            let sum = 0;
            let remainder;

            for (let i = 1; i <= 9; i++) {
                sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
            }
            remainder = (sum * 10) % 11;
            if (remainder === 10 || remainder === 11) remainder = 0;
            if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

            sum = 0;
            for (let i = 1; i <= 10; i++) {
                sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
            }
            remainder = (sum * 10) % 11;
            if (remainder === 10 || remainder === 11) remainder = 0;
            if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

            return true;
        }

        /* ==========================================================================
           4. DYNAMIC MEDICAL CONDITION TOGGLE
           ========================================================================== */
        const healthRadios = document.querySelectorAll('input[name="healthCondition"]');
        const healthWrapper = document.getElementById('healthDetailsWrapper');
        const healthDetailsInput = document.getElementById('healthDetails');

        healthRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                audioSys.playClick();
                if (e.target.value === 'yes') {
                    healthWrapper.classList.remove('hidden');
                    healthDetailsInput.setAttribute('required', 'true');
                } else {
                    healthWrapper.classList.add('hidden');
                    healthDetailsInput.removeAttribute('required');
                    healthDetailsInput.value = '';
                }
            });
        });

        /* ==========================================================================
           5. HUD TOAST NOTIFICATION SYSTEM (Replaces alert())
           ========================================================================== */
        function showToast(title, message, type = 'error') {
            const toastContainer = document.getElementById('toastContainer');
            const toast = document.createElement('div');

            const isError = type === 'error';
            const borderColor = isError ? 'border-quantum-magenta' : 'border-quantum-cyan';
            const glowClass = isError ? 'shadow-neon-red' : 'shadow-neon-cyan';
            const textColor = isError ? 'text-quantum-magenta' : 'text-quantum-cyan';

            toast.className = `pointer-events-auto w-full bg-slate-950/95 backdrop-blur-xl border ${borderColor} rounded-xl p-4 ${glowClass} transition-all duration-300 transform translate-x-10 opacity-0 flex items-start space-x-3`;

            toast.innerHTML = `
                <div class="shrink-0 mt-0.5">
                    ${isError ? `
                        <svg class="w-5 h-5 text-quantum-magenta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    ` : `
                        <svg class="w-5 h-5 text-quantum-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    `}
                </div>
                <div class="flex-1">
                    <h4 class="font-orbitron font-bold text-xs uppercase tracking-wider ${textColor}">${title}</h4>
                    <p class="font-rajdhani text-sm text-slate-300 mt-0.5">${message}</p>
                </div>
            `;

            toastContainer.appendChild(toast);

            // Animate in
            setTimeout(() => {
                toast.classList.remove('translate-x-10', 'opacity-0');
            }, 10);

            // Audio queue
            if (isError) audioSys.playError();
            else audioSys.playClick();

            // Auto dismiss
            setTimeout(() => {
                toast.classList.add('translate-x-10', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 4500);
        }

        /* ==========================================================================
           6. PROCEDURAL QUANTUM CANVAS DRAWING (QR & BARCODE)
           ========================================================================== */
        function drawQuantumQR(canvasId, seedText) {
            const qrCanvas = document.getElementById(canvasId);
            const qctx = qrCanvas.getContext('2d');
            const size = qrCanvas.width;
            
            qctx.clearRect(0, 0, size, size);
            qctx.fillStyle = '#030712';
            qctx.fillRect(0, 0, size, size);

            const gridCount = 15;
            const cellSize = size / gridCount;

            // Simple pseudo-random generator based on seed string
            let hash = 0;
            for (let i = 0; i < seedText.length; i++) {
                hash = seedText.charCodeAt(i) + ((hash << 5) - hash);
            }

            // Draw matrix dots
            qctx.fillStyle = '#00f3ff';
            for (let r = 0; r < gridCount; r++) {
                for (let c = 0; c < gridCount; c++) {
                    // Skip corners for position markers
                    if ((r < 4 && c < 4) || (r < 4 && c > gridCount - 5) || (r > gridCount - 5 && c < 4)) continue;
                    
                    const val = Math.sin(hash * (r + 1) * (c + 1));
                    if (val > 0) {
                        qctx.fillRect(c * cellSize + 1, r * cellSize + 1, cellSize - 2, cellSize - 2);
                    }
                }
            }

            // Draw Position Detection Squares (Corners)
            const drawCornerSquare = (row, col) => {
                const x = col * cellSize;
                const y = row * cellSize;
                const w = 4 * cellSize;
                
                qctx.strokeStyle = '#00f3ff';
                qctx.lineWidth = 2;
                qctx.strokeRect(x + 2, y + 2, w - 4, w - 4);
                
                qctx.fillStyle = '#a855f7';
                qctx.fillRect(x + cellSize, y + cellSize, cellSize * 2, cellSize * 2);
            };

            drawCornerSquare(0, 0);
            drawCornerSquare(0, gridCount - 4);
            drawCornerSquare(gridCount - 4, 0);
        }

        function drawQuantumBarcode(canvasId, codeText) {
            const bcanvas = document.getElementById(canvasId);
            const bctx = bcanvas.getContext('2d');
            const w = bcanvas.width;
            const h = bcanvas.height;

            bctx.clearRect(0, 0, w, h);
            bctx.fillStyle = '#00f3ff';

            let x = 0;
            while (x < w) {
                const barWidth = Math.floor(Math.random() * 4) + 1;
                const gap = Math.floor(Math.random() * 3) + 1;
                bctx.fillRect(x, 0, barWidth, h);
                x += barWidth + gap;
            }
        }

        /* ==========================================================================
           7. FORM SUBMISSION & VALIDATION
           ========================================================================== */
        const quantumForm = document.getElementById('quantumForm');
        const submitBtn = document.getElementById('submitBtn');

        quantumForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Fetch inputs
            const fullName = document.getElementById('fullName').value.trim();
            const cpf = document.getElementById('cpf').value.trim();
            const birthDate = document.getElementById('birthDate').value;
            const address = document.getElementById('address').value.trim();
            const destination = document.getElementById('destination').value;
            const healthChoice = document.querySelector('input[name="healthCondition"]:checked').value;
            const healthDetails = document.getElementById('healthDetails').value.trim();
            const termsChecked = document.getElementById('termsCheckbox').checked;

            // 1. Mandatory Field Checks
            if (!fullName || !cpf || !birthDate || !address || !destination) {
                showToast("DADOS INCOMPLETOS", "Preencha todos os campos obrigatórios do formulário.");
                return;
            }

            // 2. CPF Validation
            if (!validateCPF(cpf)) {
                showToast("CPF INVÁLIDO", "O número de CPF informado é inválido perante os registros terrestres.");
                return;
            }

            // 3. Conditional Health Details Validation
            if (healthChoice === 'yes' && !healthDetails) {
                showToast("ALERTA MÉDICO", "Especifique os detalhes da sua condição física/biológica.");
                return;
            }

            // 4. Terms and Policy Checkbox
            if (!termsChecked) {
                showToast("TERMOS DE SEGURANÇA", "Você deve aceitar os Termos e Políticas Médicas de Salto Quântico.");
                return;
            }

            // Successful Submission Handling
            audioSys.playWarpSuccess();
            isWarping = true; // Trigger hyperdrive star animation

            // Disable button feedback
            submitBtn.disabled = true;
            document.getElementById('btnText').textContent = "PROCESSANDO EMBARQUE QUÂNTICO...";

            setTimeout(() => {
                isWarping = false;
                
                // Hide Form, Show Hologram Boarding Ticket
                document.getElementById('registrationCard').classList.add('hidden');
                const ticketContainer = document.getElementById('boardingTicketContainer');
                ticketContainer.classList.remove('hidden');

                // Populate Ticket Data
                document.getElementById('ticketPassengerName').textContent = fullName;
                document.getElementById('ticketCpf').textContent = cpf;
                
                // Format Birthdate
                const dateObj = new Date(birthDate);
                document.getElementById('ticketBirth').textContent = dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                
                document.getElementById('ticketAddress').textContent = address;
                document.getElementById('ticketDestination').textContent = destination;

                // Health status text
                const healthStatusElem = document.getElementById('ticketHealthStatus');
                if (healthChoice === 'yes') {
                    healthStatusElem.textContent = "CONDIÇÃO REGISTRADA: " + healthDetails.substring(0, 25) + "...";
                    healthStatusElem.className = "font-mono font-bold text-xs text-quantum-magenta";
                } else {
                    healthStatusElem.textContent = "NOMINAL (SEM RESTRICOES)";
                    healthStatusElem.className = "font-mono font-bold text-xs text-emerald-400";
                }

                // Booking ID & Hashes
                const randomId = Math.floor(1000 + Math.random() * 9000);
                const bookingCode = `#AQD-${randomId}`;
                document.getElementById('ticketBookingId').textContent = bookingCode;
                
                const hash = `AETH-${Math.random().toString(36).substring(2, 8).toUpperCase()}-X9`;
                document.getElementById('ticketHash').textContent = hash;

                // Render Canvas Elements
                drawQuantumQR('qrCanvas', `${fullName}|${cpf}|${bookingCode}|${destination}`);
                drawQuantumBarcode('barcodeCanvas', hash);

                // Scroll to top smoothly
                window.scrollTo({ top: 0, behavior: 'smooth' });

                showToast("AUTORIZAÇÃO CONCEDIDA", "Passagem interdimensional gerada com sucesso! Bom salto.", "success");
            }, 1500);
        });

        /* ==========================================================================
           8. UX EVENT LISTENERS (Audio & Interactions)
           ========================================================================== */
        // Audio Toggle Button
        const audioToggleBtn = document.getElementById('audioToggle');
        const audioIconOn = document.getElementById('audioIconOn');
        const audioIconOff = document.getElementById('audioIconOff');

        audioToggleBtn.addEventListener('click', () => {
            audioSys.enabled = !audioSys.enabled;
            if (audioSys.enabled) {
                audioIconOn.classList.remove('hidden');
                audioIconOff.classList.add('hidden');
                audioSys.playClick();
            } else {
                audioIconOn.classList.add('hidden');
                audioIconOff.classList.remove('hidden');
            }
        });

        // Add Hover sounds to all interactive elements
        document.querySelectorAll('input, select, button, label').forEach(el => {
            el.addEventListener('mouseenter', () => audioSys.playHover());
        });

        // Stardate Clock Generator
        function updateStardate() {
            const now = new Date();
            const startYear = now.getFullYear();
            const dayOfYear = Math.floor((now - new Date(startYear, 0, 0)) / 1000 / 60 / 60 / 24);
            const stardate = `ST-${startYear}.${dayOfYear}`;
            document.getElementById('stardateClock').textContent = stardate;
        }
        updateStardate();

        // Register Another Passenger Button
        document.getElementById('newRegistrationBtn').addEventListener('click', () => {
            audioSys.playClick();
            document.getElementById('boardingTicketContainer').classList.add('hidden');
            document.getElementById('registrationCard').classList.remove('hidden');
            quantumForm.reset();
            
            // Reset state
            submitBtn.disabled = false;
            document.getElementById('btnText').textContent = "EFETUAR CADASTRO E GERAR BILHETE";
            cpfStatus.textContent = "MÁSCARA";
            cpfStatus.className = "absolute right-3 top-3 text-xs font-mono text-slate-500";
            healthWrapper.classList.add('hidden');

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Print Ticket Action
        document.getElementById('printTicketBtn').addEventListener('click', () => {
            audioSys.playClick();
            window.print();
        });

        // Logo Click Easter Egg
        document.getElementById('logoBtn').addEventListener('click', () => {
            audioSys.playClick();
            showToast("AETHERIA SYSTEM", "Portal quântico conectado à fenda temporal Alpha-9.", "success");
        });

});
