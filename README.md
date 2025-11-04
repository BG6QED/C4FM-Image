# Yaesu C4FM 图片批量转换工具（网页版）

**在线将图片转换为 Yaesu C4FM 设备（如 FT-2D/3D/5D、FTM-400）可用的格式**  
支持 **MMS 图片发送**，自动生成 `PHOTO/` 和 `QSOLOG/` 目录。
---

## 功能特点

| 功能 | 说明 |
|------|------|
| **支持 1–10 张图片批量处理** | 上传多张，一键生成 ZIP |
| **自动缩放 + 居中** | 适配 320×240 或 160×120 |
| **文本叠加（\\n 换行）** | 直接在图片上拖拽定位 |
| **EXIF 日期 & GPS 自动提取** | 保留拍摄时间与位置 |
| **文件名格式 100% 兼容** | `H{前5位ID}{6位序列}.jpg` |
| **DAT 文件字节级一致** | `QSOPCTDIR.dat` / `QSOPCTFAT.dat` / `QSOMNG.dat` |
| **无需安装** | 浏览器打开即用（Chrome/Firefox/Edge） |
| **响应式设计** | 手机、平板、电脑全适配 |

---

## 使用方法

### 1. 打开工具
将 `index.html` 用浏览器打开（**推荐 Chrome**）。

### 2. 填写信息

| 字段 | 说明 |
|------|------|
| **呼号 (CALLSIGN)** | 你的业余电台呼号，如 `BG1XXX`，最多 16 字符 |
| **无线电ID (RADIOID)** | **8 位字符**，如 `HE0S32AB`（**支持字母+数字**） |
| **分辨率** | 推荐 `320×240`（高清） |
| **图片文件** | 选择 1–10 张 JPG/PNG 图片 |
| **叠加文本** | 输入文字，用 `\\n` 换行（如 `Test\\nLine`） |
| **文本颜色** | 点击色块选择 |
| **文本大小** | 拖动滑块调整（默认 48px） |

> **文本位置**：直接用鼠标在预览图上 **拖动文字** 调整位置！

### 3. 生成 ZIP 包
点击 **“批量生成 ZIP 包”**，浏览器自动下载：

```
YSF_Images_3pics.zip
├── PHOTO/
│   ├── HE0S32000001.jpg
│   ├── HE0S32000002.jpg
│   └── HE0S32000003.jpg
└── QSOLOG/
    ├── QSOPCTDIR.dat
    ├── QSOPCTFAT.dat
    └── QSOMNG.dat
```

### 4. 复制到 SD 卡
1. 解压 ZIP 文件
2. 将 `PHOTO/` 和 `QSOLOG/` **整个复制到 SD 卡根目录**
3. 插入 SD 卡 → 开机
4. 进入 **MMS → PICTURE TX** 发送图片

---

## 常见问题

### Q：ZIP 解压 Windows 提示“潜在有害”？
> A：右键 ZIP → 属性 → 勾选 **“解除锁定”**，或使用 7-Zip 等第三方解压工具。

### Q：图片显示不全？
> A：上传图片建议 **宽高比 4:3**，程序会自动居中缩放。

### Q：GPS 没显示？
> A：原图需包含 GPS 信息（手机拍照开启定位即可）。

---

## 致谢

- 原项目：[ysf-image-copy.py](https://github.com/sjmelhuish/YSF-Image-Copy)
- EXIF 解析：[`exif-js`](https://github.com/exif-js/exif-js)
- ZIP 生成：[`JSZip`](https://github.com/Stuk/jszip)

---

**73！祝你玩得开心**
