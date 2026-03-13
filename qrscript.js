document.addEventListener('DOMContentLoaded', function() {
    // ========== ELEMEN DOM ==========
    const themeToggle = document.getElementById('themeToggle');
    const qrType = document.getElementById('qrType');
    const textPanel = document.getElementById('textPanel');
    const wifiPanel = document.getElementById('wifiPanel');
    const vcardPanel = document.getElementById('vcardPanel');
    
    // Type buttons
    const typeBtns = document.querySelectorAll('.type-btn');
    
    // Input elements
    const qrText = document.getElementById('qrText');
    const wifiSsid = document.getElementById('wifiSsid');
    const wifiPassword = document.getElementById('wifiPassword');
    const wifiEncryption = document.getElementById('wifiEncryption');
    const wifiHidden = document.getElementById('wifiHidden');
    const vcardName = document.getElementById('vcardName');
    const vcardPhone = document.getElementById('vcardPhone');
    const vcardEmail = document.getElementById('vcardEmail');
    const vcardOrg = document.getElementById('vcardOrg');
    const vcardTitle = document.getElementById('vcardTitle');
    
    // Customization elements
    const qrSize = document.getElementById('qrSize');
    const sizeValue = document.getElementById('sizeValue');
    const qrColor = document.getElementById('qrColor');
    const bgColor = document.getElementById('bgColor');
    const errorLevel = document.getElementById('errorLevel');
    const addMargin = document.getElementById('addMargin');
    
    // Buttons
    const generateBtn = document.getElementById('generateBtn');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const downloadSvgBtn = document.getElementById('downloadSvgBtn');
    const copyBtn = document.getElementById('copyBtn');
    const apiOrcaBtn = document.getElementById('apiOrcaBtn');
    
    // Containers
    const qrcodeDiv = document.getElementById('qrcode');
    const apiResult = document.getElementById('apiResult');
    const apiText = document.getElementById('apiText');

    // Color value display
    const qrColorValue = document.querySelector('.color-input-wrapper:first-child .color-value');
    const bgColorValue = document.querySelector('.color-input-wrapper:last-child .color-value');

    // ========== STATE ==========
    let currentQR = null;

    // ========== THEME MANAGEMENT ==========
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });

    // ========== TYPE BUTTON HANDLERS ==========
    typeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active class on buttons
            typeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Dapatkan tipe dari data attribute
            const type = this.dataset.type;
            
            // Update hidden select (untuk kompatibilitas)
            if (qrType) qrType.value = type;
            
            // Sembunyikan semua panel
            textPanel.classList.remove('active');
            wifiPanel.classList.remove('active');
            vcardPanel.classList.remove('active');
            
            // Tampilkan panel yang sesuai
            if (type === 'text') {
                textPanel.classList.add('active');
            } else if (type === 'wifi') {
                wifiPanel.classList.add('active');
            } else if (type === 'vcard') {
                vcardPanel.classList.add('active');
            }
            
            // HAPUS baris ini: setTimeout(generateQRCode, 100);
            // QR tidak auto-generate saat ganti tipe
        });
    });

    // ========== PANEL SWITCHING (dari select dropdown) ==========
    if (qrType) {
        qrType.addEventListener('change', function() {
            const type = this.value;
            
            // Update active class on buttons
            typeBtns.forEach(btn => {
                if (btn.dataset.type === type) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Sembunyikan semua panel
            textPanel.classList.remove('active');
            wifiPanel.classList.remove('active');
            vcardPanel.classList.remove('active');
            
            // Tampilkan panel yang sesuai
            if (type === 'text') {
                textPanel.classList.add('active');
            } else if (type === 'wifi') {
                wifiPanel.classList.add('active');
            } else if (type === 'vcard') {
                vcardPanel.classList.add('active');
            }
            
            // HAPUS baris ini: generateQRCode();
            // QR tidak auto-generate saat ganti tipe
        });
    }

    // ========== SIZE DISPLAY ==========
    qrSize.addEventListener('input', function() {
        sizeValue.textContent = this.value;
    });

    // ========== COLOR DISPLAY ==========
    if (qrColorValue) {
        qrColor.addEventListener('input', function() {
            qrColorValue.textContent = this.value;
        });
    }

    if (bgColorValue) {
        bgColor.addEventListener('input', function() {
            bgColorValue.textContent = this.value;
        });
    }

    // ========== FORMAT QR CODE CONTENT ==========
    function formatQRContent() {
        const type = document.querySelector('.type-btn.active')?.dataset.type || 'text';
        
        switch(type) {
            case 'text':
                let text = qrText.value.trim();
                if (!text) {
                    showToast('📝 Masukkan teks atau URL dulu ya!');
                    return null;
                }
                // Auto-add https:// jika terlihat seperti domain
                if (text.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/) && !text.includes('://') && !text.includes('@')) {
                    text = 'https://' + text;
                }
                return text;

            case 'wifi':
                const ssid = wifiSsid.value.trim();
                if (!ssid) {
                    showToast('📶 Masukkan nama WiFi dulu ya!');
                    return null;
                }
                
                // Format WiFi QR Code sesuai standar internasional
                // Format: WIFI:S:<SSID>;T:<WPA|WEP|>;P:<password>;H:<true|false>;;
                
                let wifiString = `WIFI:S:${ssid};`;
                
                // Tipe enkripsi
                const encType = wifiEncryption.value;
                wifiString += `T:${encType};`;
                
                // Password (kecuali no password)
                const pass = wifiPassword.value.trim();
                if (encType !== 'nopass' && pass) {
                    wifiString += `P:${pass};`;
                } else if (encType !== 'nopass' && !pass) {
                    showToast('🔑 Masukkan password WiFi');
                    return null;
                }
                
                // Hidden network
                if (wifiHidden.checked) {
                    wifiString += 'H:true;';
                }
                
                wifiString += ';'; // Penutup
                
                return wifiString;

            case 'vcard':
                if (!vcardName.value.trim()) {
                    showToast('👤 Masukkan nama kontak dulu ya!');
                    return null;
                }
                
                // Format vCard 3.0 yang kompatibel dengan semua HP
                let vcardString = 'BEGIN:VCARD\n';
                vcardString += 'VERSION:3.0\n';
                
                // Nama (FN = Full Name, wajib)
                const name = vcardName.value.trim();
                vcardString += `FN:${name}\n`;
                vcardString += `N:${name};;;\n`; // Format N:LastName;FirstName;Middle;Prefix;Suffix
                
                // Telepon
                const phone = vcardPhone.value.trim();
                if (phone) {
                    vcardString += `TEL;TYPE=CELL:${phone}\n`;
                }
                
                // Email
                const email = vcardEmail.value.trim();
                if (email) {
                    vcardString += `EMAIL:${email}\n`;
                }
                
                // Perusahaan
                const org = vcardOrg.value.trim();
                if (org) {
                    vcardString += `ORG:${org}\n`;
                }
                
                // Jabatan
                const title = vcardTitle.value.trim();
                if (title) {
                    vcardString += `TITLE:${title}\n`;
                }
                
                vcardString += 'END:VCARD';
                
                return vcardString;

            default:
                return null;
        }
    }

    // ========== GENERATE QR CODE ==========
    function generateQRCode() {
        // Clear previous QR
        qrcodeDiv.innerHTML = '';
        
        // Get formatted content
        const content = formatQRContent();
        if (!content) return;
        
        // QR Code options
        const size = parseInt(qrSize.value);
        const options = {
            text: content,
            width: size,
            height: size,
            colorDark: qrColor.value,
            colorLight: bgColor.value,
            correctLevel: getErrorCorrectionLevel(errorLevel.value)
        };
        
        // Generate new QR code
        try {
            currentQR = new QRCode(qrcodeDiv, options);
            
            // Add margin if checked
            if (addMargin.checked) {
                qrcodeDiv.style.padding = '10px';
            } else {
                qrcodeDiv.style.padding = '0';
            }
            
            // Show success feedback
            showToast('✅ QR Code berhasil dibuat!');
            
        } catch (e) {
            console.error('QR Generation Error:', e);
            showToast('❌ Gagal bikin QR code. Coba lagi!');
        }
    }

    function getErrorCorrectionLevel(level) {
        switch(level) {
            case 'L': return QRCode.CorrectLevel.L;
            case 'M': return QRCode.CorrectLevel.M;
            case 'Q': return QRCode.CorrectLevel.Q;
            case 'H': return QRCode.CorrectLevel.H;
            default: return QRCode.CorrectLevel.M;
        }
    }

    // ========== TOAST NOTIFICATION ==========
    function showToast(message) {
        // Buat element toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Hilangkan setelah 2 detik
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // ========== DOWNLOAD FUNCTIONS ==========
    function downloadAsPNG() {
        const canvas = qrcodeDiv.querySelector('canvas');
        if (!canvas) {
            showToast('Generate QR code dulu ya!');
            return;
        }
        
        const link = document.createElement('a');
        link.download = `qrcode-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('✅ QR Code terdownload!');
    }

    function downloadAsSVG() {
        const canvas = qrcodeDiv.querySelector('canvas');
        if (!canvas) {
            showToast('Generate QR code dulu ya!');
            return;
        }
        
        // Konversi canvas ke SVG sederhana
        const imgData = canvas.toDataURL('image/png');
        const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.width}" height="${canvas.height}">
    <image width="${canvas.width}" height="${canvas.height}" xlink:href="${imgData}"/>
</svg>`;
        
        const blob = new Blob([svgString], {type: 'image/svg+xml'});
        const link = document.createElement('a');
        link.download = `qrcode-${Date.now()}.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        showToast('✅ SVG siap!');
    }

    function copyToClipboard() {
        const canvas = qrcodeDiv.querySelector('canvas');
        if (!canvas) {
            showToast('Generate QR code dulu ya!');
            return;
        }
        
        canvas.toBlob(function(blob) {
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]).then(() => {
                showToast('📋 QR code tercopy!');
            }).catch(() => {
                showToast('Gagal copy. Coba download aja.');
            });
        });
    }

    // ========== ORCA SCAN API ==========
    async function generateWithOrca() {
        const text = apiText.value.trim();
        if (!text) {
            showToast('Masukkan teks untuk API!');
            return;
        }
        
        apiResult.innerHTML = '<div class="loading-spinner"></div><p>Loading...</p>';
        apiResult.classList.add('active');
        
        const apiUrl = `https://barcode.orcascan.com?data=${encodeURIComponent(text)}&type=qr&format=png&padding=10`;
        
        try {
            apiResult.innerHTML = `
                <img src="${apiUrl}" alt="QR Code dari OrcaScan" style="max-width: 100%; border-radius: 8px;">
                <p style="margin-top: 10px;">
                    <a href="${apiUrl}" download="orca-qrcode.png" style="color: var(--accent-primary);">
                        ⬇️ Download QR
                    </a>
                </p>
            `;
        } catch (error) {
            apiResult.innerHTML = `<p style="color: #ef4444;">Error: ${error.message}</p>`;
        }
    }

    // ========== REFRESH BUTTONS ==========
    const refreshNavBtn = document.getElementById('refreshNavBtn');
    const refreshBottomBtn = document.getElementById('refreshBottomBtn');

    function refreshPage() {
        location.reload();
    }

    if (refreshNavBtn) {
        refreshNavBtn.addEventListener('click', refreshPage);
    }

    if (refreshBottomBtn) {
        refreshBottomBtn.addEventListener('click', refreshPage);
    }

    // ========== EVENT LISTENERS ==========
    generateBtn.addEventListener('click', generateQRCode);
    downloadPngBtn.addEventListener('click', downloadAsPNG);
    downloadSvgBtn.addEventListener('click', downloadAsSVG);
    copyBtn.addEventListener('click', copyToClipboard);
    apiOrcaBtn.addEventListener('click', generateWithOrca);
    
    // HAPUS semua event listener auto-generate
    // Tidak ada input yang memicu generate otomatis
    
    // Initialize theme only (JANGAN panggil generateQRCode)
    initTheme();
    
    // Kosongkan QR code display (tampilkan tempat kosong atau pesan)
    qrcodeDiv.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">👆 Klik Generate untuk membuat QR code</div>';
});