// متغیرهای جهانی
let botToken = '';
let uploadedFiles = [];

// هنگامی که DOM بارگذاری شد
document.addEventListener('DOMContentLoaded', function() {
    // بارگذاری توکن از localStorage
    loadBotToken();
    
    // بارگذاری لیست فایل‌ها از localStorage
    loadFilesList();
    
    // رویداد کلیک برای ذخیره توکن
    document.getElementById('saveTokenBtn').addEventListener('click', saveBotToken);
    
    // رویدادهای آپلود فایل
    setupFileUpload();
});

// بارگذاری توکن از localStorage
function loadBotToken() {
    const savedToken = localStorage.getItem('telegramBotToken');
    if (savedToken) {
        botToken = savedToken;
        document.getElementById('botToken').value = savedToken;
        updateTokenStatus(true);
    }
}

// ذخیره توکن ربات
function saveBotToken() {
    const tokenInput = document.getElementById('botToken');
    const token = tokenInput.value.trim();
    
    if (!token) {
        alert('لطفاً توکن ربات را وارد کنید');
        return;
    }
    
    // اعتبارسنجی ساده توکن (فرمت کلی توکن تلگرام)
    if (!token.match(/^\d+:[a-zA-Z0-9_-]+$/)) {
        alert('فرمت توکن نامعتبر است. لطفاً یک توکن معتبر تلگرام وارد کنید.');
        return;
    }
    
    botToken = token;
    localStorage.setItem('telegramBotToken', token);
    updateTokenStatus(true);
    
    alert('توکن با موفقیت ذخیره شد');
}

// به‌روزرسانی وضعیت توکن
function updateTokenStatus(isSaved) {
    const tokenStatus = document.getElementById('tokenStatus');
    if (isSaved) {
        tokenStatus.innerHTML = '<span style="color: #27ae60;">توکن ذخیره شده است</span>';
        tokenStatus.style.backgroundColor = '#d5f4e6';
    } else {
        tokenStatus.innerHTML = '<span>توکن ذخیره نشده است</span>';
        tokenStatus.style.backgroundColor = '#ffeaa7';
    }
}

// تنظیم آپلود فایل
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // رویداد کلیک روی ناحیه آپلود
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // رویداد تغییر فایل
    fileInput.addEventListener('change', handleFileSelect);
    
    // رویدادهای درگ و دراپ
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });
}

// مدیریت انتخاب فایل
function handleFileSelect(e) {
    if (e.target.files.length) {
        handleFiles(e.target.files);
    }
}

// پردازش فایل‌ها
function handleFiles(files) {
    // بررسی وجود توکن
    if (!botToken) {
        alert('لطفاً ابتدا توکن ربات را ذخیره کنید');
        return;
    }
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // بررسی حجم فایل (حداکثر 20 مگابایت)
        if (file.size > 20 * 1024 * 1024) {
            alert(`فایل "${file.name}" بسیار بزرگ است. حداکثر حجم مجاز 20 مگابایت است.`);
            continue;
        }
        
        // آپلود فایل
        uploadFile(file);
    }
    
    // ریست کردن input فایل
    document.getElementById('fileInput').value = '';
}

// آپلود فایل به تلگرام
function uploadFile(file) {
    // شبیه‌سازی آپلود (در محیط GitHub Pages امکان آپلود واقعی وجود ندارد)
    simulateFileUpload(file);
}

// شبیه‌سازی آپلود فایل
function simulateFileUpload(file) {
    const fileId = Date.now().toString();
    
    // نمایش فایل در لیست با وضعیت "در حال آپلود"
    addFileToList(file, fileId, 'uploading');
    
    // شبیه‌سازی تاخیر آپلود
    setTimeout(() => {
        // در اینجا کد واقعی آپلود به تلگرام قرار می‌گیرد
        // اما به دلیل محدودیت GitHub Pages، فقط شبیه‌سازی می‌شود
        
        // آپلود موفقیت‌آمیز
        updateFileStatus(fileId, 'uploaded');
        
        // ذخیره اطلاعات فایل
        const fileInfo = {
            id: fileId,
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
            uploadDate: new Date().toLocaleString('fa-IR')
        };
        
        uploadedFiles.push(fileInfo);
        saveFilesList();
        
        // نمایش پیام موفقیت
        showUploadSuccess(file.name);
        
    }, 2000);
}

// اضافه کردن فایل به لیست
function addFileToList(file, fileId, status) {
    const filesList = document.getElementById('filesList');
    
    // حذف پیام "فایلی وجود ندارد" اگر اولین فایل است
    const emptyMessage = filesList.querySelector('.empty-message');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.id = `file-${fileId}`;
    
    const statusText = status === 'uploading' ? 'در حال آپلود...' : 'آپلود شده';
    const statusClass = status === 'uploading' ? 'uploading' : 'uploaded';
    
    fileItem.innerHTML = `
        <div class="file-info">
            <span class="file-icon">📄</span>
            <div>
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)} - <span class="status ${statusClass}">${statusText}</span></div>
            </div>
        </div>
        <div class="file-actions">
            <button onclick="shareFile('${fileId}')">اشتراک‌گذاری</button>
        </div>
    `;
    
    filesList.insertBefore(fileItem, filesList.firstChild);
}

// به‌روزرسانی وضعیت فایل
function updateFileStatus(fileId, status) {
    const fileItem = document.getElementById(`file-${fileId}`);
    if (!fileItem) return;
    
    const statusElement = fileItem.querySelector('.status');
    if (statusElement) {
        if (status === 'uploaded') {
            statusElement.textContent = 'آپلود شده';
            statusElement.className = 'status uploaded';
        }
    }
}

// نمایش موفقیت آپلود
function showUploadSuccess(fileName) {
    // ایجاد یک نوتیفیکیشن موقت
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #27ae60;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 600;
    `;
    notification.textContent = `فایل "${fileName}" با موفقیت آپلود شد`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

// اشتراک‌گذاری فایل
function shareFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    // در اینجا کد واقعی اشتراک‌گذاری لینک فایل قرار می‌گیرد
    // اما به دلیل محدودیت GitHub Pages، فقط شبیه‌سازی می‌شود
    
    alert(`لینک اشتراک‌گذاری برای فایل "${file.name}" تولید شد\n\n(در نسخه واقعی، این لینک از تلگرام دریافت می‌شود)`);
}

// قالب‌بندی اندازه فایل
function formatFileSize(bytes) {
    if (bytes === 0) return '0 بایت';
    
    const k = 1024;
    const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// بارگذاری لیست فایل‌ها از localStorage
function loadFilesList() {
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
        uploadedFiles = JSON.parse(savedFiles);
        renderFilesList();
    }
}

// ذخیره لیست فایل‌ها در localStorage
function saveFilesList() {
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
}

// نمایش لیست فایل‌ها
function renderFilesList() {
    const filesList = document.getElementById('filesList');
    
    if (uploadedFiles.length === 0) {
        filesList.innerHTML = '<p class="empty-message">هنوز فایلی آپلود نکرده‌اید</p>';
        return;
    }
    
    filesList.innerHTML = '';
    
    uploadedFiles.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        fileItem.innerHTML = `
            <div class="file-info">
                <span class="file-icon">📄</span>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${file.size} - <span class="status uploaded">آپلود شده</span></div>
                    <div class="upload-date">${file.uploadDate}</div>
                </div>
            </div>
            <div class="file-actions">
                <button onclick="shareFile('${file.id}')">اشتراک‌گذاری</button>
            </div>
        `;
        
        filesList.appendChild(fileItem);
    });
      }
