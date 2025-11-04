/* ====================== 基础工具函数 ====================== */
function toggleHelp() {
    const c = document.getElementById('helpContent');
    c.style.display = c.style.display === 'none' ? 'block' : 'none';
}

/* ---------- 颜色 & 日期 ---------- */
function hexToRgb(hex) {
    hex = hex.replace('#', '').toUpperCase();
    if (hex.length === 3) hex = hex.split('').map(h => h + h).join('');
    if (hex.length !== 6) return null;
    return [parseInt(hex.substr(0,2),16), parseInt(hex.substr(2,2),16), parseInt(hex.substr(4,2),16)];
}
function colorToRGB(str){ 
    let r = hexToRgb(str); 
    if (r) return r;
    const map = {red:[255,0,0],white:[255,255,255],black:[0,0,0],blue:[0,0,255],green:[0,255,0],yellow:[255,255,0]};
    return map[str.toLowerCase()] || [255,0,0];
}
function dec2Hex(v){ 
    const n = v % 100; 
    return (n % 10) + 16 * Math.floor(n / 10); 
}
function writeDateToArray(arr, off, when){
    const d = new Date(when);
    const p = [d.getFullYear() % 100, d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()];
    for (let i = 0; i < 6; i++) arr[off + i] = dec2Hex(p[i]);
}
function getDateTaken(exif){
    try {
        if (exif && exif[36867]) {
            const s = exif[36867].description || exif[36867];
            return new Date(s.replace(/:/g, '-'));
        }
    } catch (e) { console.warn('EXIF date error', e); }
    return new Date();
}
function getGeotagging(exif){
    if (!exif || !exif[34853]) return null;
    const g = exif[34853];
    const o = {};
    try {
        o.GPSLatitudeRef = g.GPSLatitudeRef ? g.GPSLatitudeRef.description.charAt(0) : 'N';
        o.GPSLatitude = g.GPSLatitude ? g.GPSLatitude.map(r => typeof r === 'object' ? r.numerator / r.denominator : parseFloat(r)) : [0,0,0];
        o.GPSLongitudeRef = g.GPSLongitudeRef ? g.GPSLongitudeRef.description.charAt(0) : 'E';
        o.GPSLongitude = g.GPSLongitude ? g.GPSLongitude.map(r => typeof r === 'object' ? r.numerator / r.denominator : parseFloat(r)) : [0,0,0];
    } catch (e) { console.warn('GPS parse error', e); return null; }
    return o;
}
function encodeGPS(exif){
    const g = getGeotagging(exif); 
    if (!g) return ' ';
    try {
        const latRef = g.GPSLatitudeRef,
              latDeg = Math.floor(g.GPSLatitude[0]).toString().padStart(3, '0'),
              latMin = Math.floor(g.GPSLatitude[1]).toString().padStart(2, '0'),
              latSec = Math.floor(g.GPSLatitude[2] * 100).toString().padStart(4, '0'),
              lonRef = g.GPSLongitudeRef,
              lonDeg = Math.floor(g.GPSLongitude[0]).toString().padStart(3, '0'),
              lonMin = Math.floor(g.GPSLongitude[1]).toString().padStart(2, '0'),
              lonSec = Math.floor(g.GPSLongitude[2] * 100).toString().padStart(4, '0');
        return latRef + latDeg + latMin + latSec + lonRef + lonDeg + lonMin + lonSec;
    } catch (e) { console.warn('GPS encode error', e); return ' '; }
}
function uint24ToBytes(v){
    return [(v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
}

/* ====================== 预览 & 拖拽 ====================== */
let currentPreviewImage = null;
let isDragging = false, dragStartX = 0, dragStartY = 0, textOffsetX = 5, textOffsetY = 5;

function updatePreview(){
    const txt = document.getElementById('text').value || '';
    const col = document.getElementById('color').value;
    const size = parseInt(document.getElementById('fontSize').value);
    const res = document.getElementById('resolution').value;
    const [w, h] = res.split('x').map(Number);

    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = w; canvas.height = h;

    if (!currentPreviewImage) {
        document.getElementById('previewStatus').textContent = '上传图片以预览文本效果';
        return;
    }

    ctx.clearRect(0, 0, w, h);
    const scale = Math.min(w / currentPreviewImage.width, h / currentPreviewImage.height);
    const dw = currentPreviewImage.width * scale, dh = currentPreviewImage.height * scale;
    const ix = (w - dw) / 2, iy = (h - dh) / 2;
    ctx.drawImage(currentPreviewImage, ix, iy, dw, dh);

    if (txt) {
        const rgb = colorToRGB(col);
        ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        ctx.font = `${size}px Arial`;
        ctx.textBaseline = 'top';
        const lines = txt.replace(/\\n/g, '\n').split('\n');
        let y = textOffsetY;
        lines.forEach(l => { ctx.fillText(l, textOffsetX, y); y += size + 5; });
    }
    document.getElementById('previewStatus').textContent = '预览更新完成';
}

/* ---- 拖拽实现 ---- */
function startDrag(e){
    if (!document.getElementById('text').value) return;
    isDragging = true;
    const rect = e.target.getBoundingClientRect();
    dragStartX = e.clientX - rect.left;
    dragStartY = e.clientY - rect.top;
    e.preventDefault();
}
function doDrag(e){
    if (!isDragging) return;
    const rect = e.target.getBoundingClientRect();
    textOffsetX = e.clientX - rect.left - dragStartX;
    textOffsetY = e.clientY - rect.top - dragStartY;
    const [w, h] = document.getElementById('resolution').value.split('x').map(Number);
    textOffsetX = Math.max(0, Math.min(w - 10, textOffsetX));
    textOffsetY = Math.max(0, Math.min(h - 10, textOffsetY));
    document.getElementById('textX').value = Math.round(textOffsetX);
    document.getElementById('textY').value = Math.round(textOffsetY);
    document.getElementById('textXValue').textContent = Math.round(textOffsetX);
    document.getElementById('textYValue').textContent = Math.round(textOffsetY);
    updatePreview();
}
function endDrag(){ isDragging = false; }

/* ---- 滑块显示/隐藏 ---- */
function toggleSliders(){
    const el = document.getElementById('xySliders');
    el.style.display = el.style.display === 'none' ? 'grid' : 'none';
}

/* ---- 重置文本设置 ---- */
function resetTextOptions(){
    document.getElementById('text').value = ''; 
    document.getElementById('color').value = '#ff0000';
    document.getElementById('fontSize').value = 48;
    textOffsetX = 5; textOffsetY = 5;
    document.getElementById('textX').value = 5; 
    document.getElementById('textY').value = 5;
    document.getElementById('fontSizeValue').textContent = '48px';
    document.getElementById('textXValue').textContent = '5'; 
    document.getElementById('textYValue').textContent = '5';
    updatePreview();
}

/* ====================== 初始化 ====================== */
document.addEventListener('DOMContentLoaded', () => {
    const inputs = [
        document.getElementById('text'), document.getElementById('color'),
        document.getElementById('fontSize'), document.getElementById('textX'),
        document.getElementById('textY'), document.getElementById('resolution')
    ];
    inputs.forEach(i => { i.addEventListener('input', updatePreview); i.addEventListener('change', updatePreview); });

    document.getElementById('fontSize').addEventListener('input', e => {
        document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
    });
    document.getElementById('textX').addEventListener('input', e => {
        document.getElementById('textXValue').textContent = e.target.value;
        textOffsetX = parseInt(e.target.value); 
        updatePreview();
    });
    document.getElementById('textY').addEventListener('input', e => {
        document.getElementById('textYValue').textContent = e.target.value;
        textOffsetY = parseInt(e.target.value); 
        updatePreview();
    });

    // 上传第一张图用于实时预览
    document.getElementById('imageFiles').addEventListener('change', e => {
        if (e.target.files.length === 0) return;
        const reader = new FileReader();
        reader.onload = ev => {
            currentPreviewImage = new Image();
            currentPreviewImage.onload = updatePreview;
            currentPreviewImage.src = ev.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    });

    // 拖拽事件
    const canvas = document.getElementById('previewCanvas');
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('touchstart', e => { e.clientX = e.touches[0].clientX; e.clientY = e.touches[0].clientY; startDrag(e); }, { passive: false });
    canvas.addEventListener('mousemove', doDrag);
    canvas.addEventListener('touchmove', e => { e.clientX = e.touches[0].clientX; e.clientY = e.touches[0].clientY; doDrag(e); }, { passive: false });
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('mouseleave', endDrag);
    canvas.addEventListener('touchend', endDrag);

    // 分辨率切换时同步滑块 max
    document.getElementById('resolution').addEventListener('change', () => {
        const [w, h] = document.getElementById('resolution').value.split('x').map(Number);
        document.getElementById('textX').max = w; 
        document.getElementById('textY').max = h;
    });

    // Radio ID 实时转大写 + 限制 8 位
    const radioidInput = document.getElementById('radioid');
    radioidInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase().substring(0, 8);
    });
});

/* ====================== 批量处理 ====================== */
async function processImages(){
    const callsign = document.getElementById('callsign').value.padEnd(16, ' ').substring(0, 16);
    
    // 正确处理 Radio ID：支持字母+数字，8 位
    let radioidRaw = document.getElementById('radioid').value.toUpperCase().substring(0, 8);
    const radioidFull = radioidRaw.padStart(8, '0');     // 用于 DIR 条目
    const radioidPrefix = radioidRaw.padStart(5, '0').substring(0, 5);  // 用于文件名

    const [width, height] = document.getElementById('resolution').value.split('x').map(Number);
    const files = document.getElementById('imageFiles').files;
    const txt = document.getElementById('text').value || '';
    const col = document.getElementById('color').value || '#ff0000';
    const size = parseInt(document.getElementById('fontSize').value);
    const tx = textOffsetX, ty = textOffsetY;

    const statusEl = document.getElementById('status');
    const progBar = document.getElementById('progress-bar');
    const progDiv = document.getElementById('progressSection');
    const galleryDiv = document.getElementById('gallerySection');
    const gallery = document.getElementById('previewGallery');

    if (!files.length) { statusEl.textContent = '请上传至少一张图片！'; return; }
    if (files.length > 10) { statusEl.textContent = '最多支持10张图片！'; return; }

    progDiv.style.display = 'block';
    galleryDiv.style.display = 'block';
    gallery.innerHTML = ''; 
    progBar.style.width = '0%';
    statusEl.textContent = '处理中...';

    const zip = new JSZip();
    const photo = zip.folder('PHOTO');
    const qso = zip.folder('QSOLOG');
    let picCount = 0, dirBytes = new Uint8Array(1024 * 10), dirOff = 0;
    const now = new Date(), nowM1 = new Date(now.getTime() - 3600000);
    const promises = [];

    for (let i = 0; i < files.length; i++){
        const file = files[i], seq = i + 1;
        const name = `H${radioidPrefix}${seq.toString().padStart(6, '0')}.jpg`;

        promises.push(new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = e => {
                const img = new Image();
                img.onload = () => {
                    EXIF.getData(img, () => {
                        const exif = EXIF.getAllTags(img);
                        const taken = getDateTaken(exif);
                        const gps = encodeGPS(exif);

                        const cvs = document.createElement('canvas');
                        cvs.width = width; cvs.height = height;
                        const ctx = cvs.getContext('2d');

                        const sc = Math.min(width / img.width, height / img.height);
                        const dw = img.width * sc, dh = img.height * sc;
                        const ix = (width - dw) / 2, iy = (height - dh) / 2;
                        ctx.drawImage(img, ix, iy, dw, dh);

                        if (txt) {
                            const rgb = colorToRGB(col);
                            ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
                            ctx.font = `${size}px Arial`;
                            ctx.textBaseline = 'top';
                            const lines = txt.replace(/\\n/g, '\n').split('\n');
                            let y = ty;
                            lines.forEach(l => { ctx.fillText(l, tx, y); y += size + 5; });
                        }

                        cvs.toBlob(blob => {
                            try {
                                /* ---- DIR entry (80 bytes) ---- */
                                for (let j = 0; j < 4; j++) dirBytes[dirOff++] = 0;
                                for (let j = 0; j < 5; j++) dirBytes[dirOff++] = 32;
                                dirBytes[dirOff++] = 65; dirBytes[dirOff++] = 76; dirBytes[dirOff++] = 76; dirBytes[dirOff++] = 32;
                                dirBytes[dirOff++] = 32;
                                for (let j = 0; j < 8; j++) dirBytes[dirOff++] = radioidFull.charCodeAt(j) || 32;
                                for (let j = 0; j < 16; j++) dirBytes[dirOff++] = callsign.charCodeAt(j) || 32;
                                writeDateToArray(dirBytes, dirOff, nowM1); dirOff += 6;
                                writeDateToArray(dirBytes, dirOff, now);   dirOff += 6;
                                writeDateToArray(dirBytes, dirOff, taken); dirOff += 6;
                                let base = file.name.slice(0, 11).padEnd(11, ' ');
                                for (let j = 0; j < 11; j++) dirBytes[dirOff++] = base.charCodeAt(j);
                                for (let j = 0; j < 5; j++) dirBytes[dirOff++] = 32;
                                const szView = new DataView(new ArrayBuffer(4));
                                szView.setUint32(0, blob.size, false);
                                for (let j = 0; j < 4; j++) dirBytes[dirOff++] = szView.getUint8(j);
                                for (let j = 0; j < name.length; j++) dirBytes[dirOff++] = name.charCodeAt(j);
                                const gpsPad = gps.padEnd(20, ' ');
                                const gpsB = new TextEncoder().encode(gpsPad);
                                for (let j = 0; j < 20; j++) dirBytes[dirOff++] = gpsB[j];
                                for (let j = 0; j < 8; j++) dirBytes[dirOff++] = 32;

                                photo.file(name, blob);

                                const pv = document.createElement('canvas');
                                pv.width = width / 2; pv.height = height / 2;
                                pv.getContext('2d').drawImage(cvs, 0, 0, pv.width, pv.height);
                                gallery.appendChild(pv);

                                picCount++;
                                progBar.style.width = `${(picCount / files.length) * 100}%`;
                                statusEl.textContent = `处理第 ${picCount}/${files.length} 张...`;

                                if (picCount === files.length) {
                                    qso.file('QSOPCTDIR.dat', dirBytes.slice(0, dirOff));
                                    const fat = new Uint8Array(picCount * 4);
                                    for (let p = 0; p < picCount; p++) {
                                        fat[p * 4] = 0x40;
                                        const a = 0x80 * p;
                                        const ab = uint24ToBytes(a);
                                        fat[p * 4 + 1] = ab[0]; fat[p * 4 + 2] = ab[1]; fat[p * 4 + 3] = ab[2];
                                    }
                                    qso.file('QSOPCTFAT.dat', fat);
                                    const mng = new Uint8Array(32);
                                    const mv = new DataView(mng.buffer);
                                    mv.setUint16(0, 0, false);
                                    for (let j = 2; j < 16; j++) mng[j] = 0xFF;
                                    mv.setUint16(16, picCount, false);
                                    mv.setUint16(18, 0, false);
                                    for (let j = 20; j < 32; j++) mng[j] = 0xFF;
                                    qso.file('QSOMNG.dat', mng);

                                    zip.generateAsync({ type: 'blob' }).then(blob => {
                                        const a = document.createElement('a');
                                        a.href = URL.createObjectURL(blob);
                                        a.download = `YSF_Images_${picCount}pics.zip`;
                                        a.click();
                                        URL.revokeObjectURL(a.href);
                                        statusEl.textContent = `完成！已下载 ${picCount} 张图片的 ZIP 包。`;
                                        progDiv.style.display = 'none';
                                    }).catch(err => { statusEl.textContent = 'ZIP 生成错误: ' + err.message; });
                                }
                                res();
                            } catch (err) { console.error(err); statusEl.textContent = `${file.name} 处理失败`; rej(err); }
                        }, 'image/jpeg', 0.8);
                    });
                };
                img.onerror = () => { rej(new Error('图片加载失败')); };
                img.src = e.target.result;
            };
            r.onerror = () => { rej(new Error('文件读取失败')); };
            r.readAsDataURL(file);
        }));
    }

    try { 
        await Promise.all(promises); 
        if (picCount === 0) { statusEl.textContent = '无图片处理成功'; progDiv.style.display = 'none'; }
    } catch (e) { 
        statusEl.textContent = '批量处理错误: ' + e.message; 
        progDiv.style.display = 'none'; 
    }
}
