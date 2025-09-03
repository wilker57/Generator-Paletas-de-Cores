document.addEventListener('DOMContentLoaded', () => {
        // --- ELEMENTOS DO DOM ---
        const colorPaletteContainer = document.getElementById('color-palette');
        const generateBtn = document.getElementById('generate-palette');
        const saveBtn = document.getElementById('save-palette');
        const baseColorInput = document.getElementById('base-color');
        const harmonyModeSelect = document.getElementById('harmony-mode');

        // --- ESTADO DA APLICAÇÃO ---
        let currentPalette = [];
        let lockedColors = new Array(5).fill(false);
        
        // --- FUNÇÕES DE CONVERSÃO E UTILITÁRIOS ---
        const hexToHsl = (hex) => {
            let r = 0, g = 0, b = 0;
            if (hex.length == 4) {
                r = "0x" + hex[1] + hex[1];
                g = "0x" + hex[2] + hex[2];
                b = "0x" + hex[3] + hex[3];
            } else if (hex.length == 7) {
                r = "0x" + hex[1] + hex[2];
                g = "0x" + hex[3] + hex[4];
                b = "0x" + hex[5] + hex[6];
            }
            r /= 255; g /= 255; b /= 255;
            let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin, h = 0, s = 0, l = 0;
            if (delta == 0) h = 0;
            else if (cmax == r) h = ((g - b) / delta) % 6;
            else if (cmax == g) h = (b - r) / delta + 2;
            else h = (r - g) / delta + 4;
            h = Math.round(h * 60);
            if (h < 0) h += 360;
            l = (cmax + cmin) / 2;
            s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
            s = +(s * 100).toFixed(1);
            l = +(l * 100).toFixed(1);
            return [h, s, l];
        };

        const hslToHex = (h, s, l) => {
            s /= 100; l /= 100;
            let c = (1 - Math.abs(2 * l - 1)) * s,
                x = c * (1 - Math.abs((h / 60) % 2 - 1)),
                m = l - c/2, r = 0, g = 0, b = 0;
            if (0 <= h && h < 60) { r = c; g = x; b = 0; }
            else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
            else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
            else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
            else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
            else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
            r = Math.round((r + m) * 255).toString(16);
            g = Math.round((g + m) * 255).toString(16);
            b = Math.round((b + m) * 255).toString(16);
            if (r.length == 1) r = "0" + r;
            if (g.length == 1) g = "0" + g;
            if (b.length == 1) b = "0" + b;
            return "#" + r + g + b;
        };

        // --- LÓGICA DE GERAÇÃO DE PALETA ---
        const generatePalette = () => {
            const baseColorHex = baseColorInput.value;
            const harmonyMode = harmonyModeSelect.value;
            const baseHSL = hexToHsl(baseColorHex);
            
            const newPalette = [];

            for (let i = 0; i < 5; i++) {
                if (lockedColors[i]) {
                    newPalette.push(currentPalette[i]);
                    continue;
                }

                let [h, s, l] = [...baseHSL];
                
                switch(harmonyMode) {
                    case 'analogous':
                        h = (h + (i - 2) * 20 + 360) % 360;
                        break;
                    case 'monochromatic':
                        l = Math.max(10, Math.min(90, l + (i - 2) * 15));
                        break;
                    case 'triad':
                        h = (h + i * 120 + 360) % 360;
                        break;
                    case 'complementary':
                        h = (h + (i % 2 === 0 ? 0 : 180) + 360) % 360;
                        l = Math.max(10, Math.min(90, l + (Math.floor(i/2) - 1) * 10));
                        break;
                    case 'split-complementary':
                        if (i > 2) h = (h + 180 + (i === 3 ? -30 : 30) + 360) % 360;
                        break;
                    case 'square':
                        h = (h + i * 90 + 360) % 360;
                        break;
                }
                newPalette.push(hslToHex(h, s, l));
            }
            
            currentPalette = newPalette;
            displayPalette();
        };

        // --- RENDERIZAÇÃO NA TELA ---
        const displayPalette = () => {
            colorPaletteContainer.innerHTML = '';
            currentPalette.forEach((colorHex, index) => {
                const colorCard = document.createElement('div');
                colorCard.className = 'color-card';

                const isLocked = lockedColors[index];
                
                colorCard.innerHTML = `
                    <div class="color-display" style="background-color: ${colorHex};">
                        <div class="lock-button" title="${isLocked ? 'Desbloquear cor' : 'Bloquear cor'}">
                            <svg width="16" height="16" fill="${isLocked ? '#333' : '#888'}" viewBox="0 0 16 16">
                                ${isLocked
                                    ? '<path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>'
                                    : '<path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 0-6 0v4a.5.5 0 0 1-1 0V3a4 4 0 0 1 8 0v4h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1V3a2 2 0 0 0-2-2z"/>'
                                }
                            </svg>
                        </div>
                    </div>
                    <div class="color-info">
                        <div class="color-code">${colorHex.toUpperCase()}</div>
                    </div>
                `;

                // Evento para copiar
                colorCard.querySelector('.color-code').addEventListener('click', (e) => {
                    navigator.clipboard.writeText(colorHex);
                    e.target.textContent = 'Copiado!';
                    setTimeout(() => { e.target.textContent = colorHex.toUpperCase(); }, 1500);
                });

                // Evento para bloquear/desbloquear
                colorCard.querySelector('.lock-button').addEventListener('click', () => {
                    lockedColors[index] = !lockedColors[index];
                    displayPalette(); // Re-renderiza para atualizar o ícone
                });

                colorPaletteContainer.appendChild(colorCard);
            });
        };

        // --- EVENT LISTENERS ---
        generateBtn.addEventListener('click', generatePalette);
        document.body.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
                e.preventDefault();
                generatePalette();
            }
        });
        
        // Evento Salvar
        saveBtn.addEventListener('click', () => {
            const paletteName = prompt('Nome da Paleta:');
            if (paletteName) {
                const paletteData = {
                    name: paletteName,
                    colors: currentPalette
                };
                localStorage.setItem(`palette-${paletteName}`, JSON.stringify(paletteData));
                alert('Paleta salva com sucesso!');
            }
        });

        //Evento Modo Escuro    
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        darkModeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', darkModeToggle.checked);
        });

        // --- INICIALIZAÇÃO ---
        generatePalette();
    });
