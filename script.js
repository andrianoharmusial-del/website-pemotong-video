const { createFFmpeg, fetchFile } = FFmpeg;

// Global variables
let currentVideo = null;
let videoDuration = 0;
let videoSegments = [];
let ffmpegInstance = null;
let ffmpegLoaded = false;

// Initialize application ketika halaman selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplikasi Pemotong Video TVRI Jayapura sedang dimuat...');
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize file name preview
    updateFileNamePreview();
    
    // Load FFmpeg
    loadFFmpeg();
    
    console.log('Aplikasi siap digunakan');
});

// Load FFmpeg
async function loadFFmpeg() {
  try {
    // Wait for FFmpeg to be available
    while (typeof FFmpeg === 'undefined') {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const ffmpeg = createFFmpeg({
      log: true,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
    });
    
    await ffmpeg.load();
    
    ffmpegLoaded = true;
    ffmpegInstance = ffmpeg;
    console.log('FFmpeg berhasil dimuat!');
  } catch (err) {
    console.error('Error loading FFmpeg:', err);
    alert('Gagal memuat FFmpeg. Silakan refresh halaman dan coba lagi.');
  }
}

// Setup all event listeners
function setupEventListeners() {
    // Video input handling
    const videoInput = document.getElementById('videoInput');
    if (videoInput) {
        videoInput.addEventListener('change', handleVideoInputChange);
    }

    // Select video button
    const selectVideoBtn = document.getElementById('selectVideoBtn');
    if (selectVideoBtn) {
        selectVideoBtn.addEventListener('click', () => {
            if (videoInput) videoInput.click();
        });
    }

    // Process button
    const processBtn = document.getElementById('processBtn');
    if (processBtn) {
        processBtn.addEventListener('click', handleProcessVideo);
    }

    // Download all button
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', handleDownloadAll);
    }

    // Naming format radio buttons
    const radioButtons = document.querySelectorAll('input[name="namingFormat"]');
    if (radioButtons.length > 0) {
        radioButtons.forEach(radio => {
            radio.addEventListener('change', handleNamingFormatChange);
        });
    }

    // Custom format inputs
    const customInputs = ['customDate', 'customMinute', 'customNumber'];
    customInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', updateFileNamePreview);
        }
    });

    // Drag and drop functionality
    setupDragAndDrop();

    // Modal buttons
    const cancelCustomNameBtn = document.getElementById('cancelCustomNameBtn');
    if (cancelCustomNameBtn) {
        cancelCustomNameBtn.addEventListener('click', hideCustomNameModal);
    }

    const saveCustomNameBtn = document.getElementById('saveCustomNameBtn');
    if (saveCustomNameBtn) {
        saveCustomNameBtn.addEventListener('click', applyCustomName);
    }
}

// Video input change handler
function handleVideoInputChange(e) {
    console.log('File dipilih');
    handleFiles(e.target.files);
}

// Process video handler
async function handleProcessVideo() {
    console.log('Memproses video...');
    if (!currentVideo) {
        alert('Silakan pilih video terlebih dahulu.');
        return;
    }

    if (!ffmpegLoaded) {
        alert('FFmpeg masih dalam proses loading. Silakan tunggu sebentar dan coba lagi.');
        return;
    }

    const videoPreviewSection = document.getElementById('videoPreviewSection');
    const processingSection = document.getElementById('processingSection');
    
    if (videoPreviewSection) {
        videoPreviewSection.style.opacity = '0.5';
        videoPreviewSection.style.pointerEvents = 'none';
    }
    if (processingSection) {
        processingSection.classList.remove('hidden');
        processingSection.style.animation = 'fadeIn 0.3s ease-in';
    }

    try {
        await processVideoSegments();
        if (processingSection) {
            processingSection.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => processingSection.classList.add('hidden'), 300);
        }
        
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.style.animation = 'fadeIn 0.5s ease-in';
        }
        
        generateSegmentCards();
    } catch (error) {
        console.error('Error processing video:', error);
        alert('Terjadi kesalahan saat memproses video: ' + error.message);
        if (processingSection) processingSection.classList.add('hidden');
        if (videoPreviewSection) {
            videoPreviewSection.style.opacity = '1';
            videoPreviewSection.style.pointerEvents = 'auto';
        }
    }
}

// Download all handler
async function handleDownloadAll() {
    console.log('Download semua segment');
    if (videoSegments.length === 0) {
        alert('Tidak ada segment video yang tersedia untuk diunduh.');
        return;
    }

    try {
        if (typeof JSZip === 'undefined') {
            alert('Fitur download semua membutuhkan JSZip. Silakan refresh halaman.');
            return;
        }

        const zip = new JSZip();
        
        for (const segment of videoSegments) {
            zip.file(segment.fileName, segment.blob);
        }

        const content = await zip.generateAsync({type: 'blob'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `video_segments_TVRIJAYAPURA_${new Date().toISOString().slice(0,10)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`Downloaded ZIP with ${videoSegments.length} segments`);
    } catch (error) {
        console.error('Error creating zip:', error);
        alert('Terjadi kesalahan saat membuat file ZIP.');
    }
}

// Naming format change handler
function handleNamingFormatChange() {
    console.log('Format penamaan diubah');
    const customFormatInputs = document.getElementById('customFormatInputs');
    if (customFormatInputs) {
        const isCustom = document.getElementById('customFormat').checked;
        customFormatInputs.classList.toggle('hidden', !isCustom);
    }
    updateFileNamePreview();
}

// Drag and drop setup
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) {
        console.warn('Drop zone tidak ditemukan');
        return;
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlightDropZone);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlightDropZone);
    });

    dropZone.addEventListener('drop', handleDrop);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlightDropZone() {
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.classList.add('drag-over');
}

function unhighlightDropZone() {
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        handleFiles(files);
    }
}

// File handling
function handleFiles(files) {
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
        alert('Silakan pilih file video yang valid (MP4, AVI, MOV, WEBM).');
        return;
    }
    
    // Check file size (limit to 100MB)
    // if (file.size > 100 * 1024 * 1024) {
    //     alert('File terlalu besar! Maksimal 100MB.');
    //     return;
    // }
    
    console.log(`Loading video: ${file.name} (${formatFileSize(file.size)})`);

    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    if (fileInfo) fileInfo.classList.remove('hidden');
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = `Ukuran: ${formatFileSize(file.size)}`;

    const videoURL = URL.createObjectURL(file);
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (videoPlayer) {
        videoPlayer.src = videoURL;
        
        videoPlayer.onloadedmetadata = function() {
            videoDuration = videoPlayer.duration;
            
            const videoDurationEl = document.getElementById('videoDuration');
            const segmentCountEl = document.getElementById('segmentCount');
            const videoPreviewSection = document.getElementById('videoPreviewSection');
            
            if (videoDurationEl) videoDurationEl.textContent = formatTime(videoDuration);
            
            const segmentCount = Math.ceil(videoDuration / 5);
            if (segmentCountEl) segmentCountEl.textContent = `${segmentCount} potongan (@5 detik)`;
            
            if (videoPreviewSection) videoPreviewSection.classList.remove('hidden');
            
            console.log(`Video loaded: ${formatTime(videoDuration)} duration, ${segmentCount} segments`);
        };

        videoPlayer.onerror = function() {
            alert('Terjadi kesalahan saat memuat video. Silakan coba file lain.');
            if (fileInfo) fileInfo.classList.add('hidden');
        };
    }

    currentVideo = file;
}

// Process video into segments
async function processVideoSegments() {
    if (!ffmpegInstance || !currentVideo) {
        throw new Error('FFmpeg tidak tersedia atau video tidak dipilih');
    }

    try {
        // Write input file to FFmpeg filesystem
        ffmpegInstance.FS('writeFile', 'input.mp4', await fetchFile(currentVideo));
        
        const segmentDuration = 5; // 5 seconds per segment
        const totalSegments = Math.ceil(videoDuration / segmentDuration);
        
        videoSegments = [];
        
        for (let i = 0; i < totalSegments; i++) {
            const startTime = i * segmentDuration;
            
            // Skip if start time is beyond video duration
            if (startTime >= videoDuration) {
                console.log(`Skipping segment ${i + 1} - beyond video duration`);
                continue;
            }
            
            const outputFileName = `segment_${i + 1}.mp4`;
            
            // Update progress
            updateProgress(`Memproses segment ${i + 1} dari ${totalSegments}...`, (i / totalSegments) * 100);
            
            // Run FFmpeg command to extract segment
            const args = [
                '-i', 'input.mp4',
                '-ss', `${startTime}`,
                '-t', `${segmentDuration}`,
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-crf', '28',
                '-c:a', 'copy',
                `${outputFileName}`
            ];
            
            console.log('FFmpeg args:', args);
            
            try {
                await ffmpegInstance.run(...args);
                console.log(`Successfully created ${outputFileName}`);
            } catch (runError) {
                console.error('FFmpeg run error:', runError);
                throw new Error(`FFmpeg failed for segment ${i + 1}: ${runError.message}`);
            }
            
            // Read the output file
            const data = ffmpegInstance.FS('readFile', outputFileName);
            const blob = new Blob([data.buffer], { type: 'video/mp4' });
            
            // Generate filename based on selected format
            const fileName = generateFileName(i + 1);
            
            videoSegments.push({
                index: i + 1,
                fileName: fileName,
                blob: blob,
                startTime: startTime,
                duration: Math.min(segmentDuration, videoDuration - startTime)
            });
            
            // Clean up the output file from FFmpeg filesystem
            ffmpegInstance.FS('unlink', outputFileName);
        }
        
        // Clean up input file
        ffmpegInstance.FS('unlink', 'input.mp4');
        
        updateProgress(`Selesai! ${videoSegments.length} segment berhasil dibuat.`, 100);
        
        // Show success notification
        setTimeout(() => {
            alert(`Video berhasil dipotong menjadi ${videoSegments.length} segment!`);
        }, 500);
        
    } catch (error) {
        console.error('Error processing video:', error);
        throw error;
    }
}

// Generate filename based on selected format
function generateFileName(segmentNumber) {
    const formatRadio = document.querySelector('input[name="namingFormat"]:checked');
    if (!formatRadio) return `segment_${segmentNumber}.mp4`;
    
    const format = formatRadio.value;
    
    switch (format) {
        case 'sequential':
            return `TVRI_JAYAPURA_${segmentNumber.toString().padStart(3, '0')}.mp4`;
        case 'timestamp':
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
            return `TVRI_JAYAPURA_${timestamp}_${segmentNumber.toString().padStart(2, '0')}.mp4`;
        case 'custom':
            const customDate = document.getElementById('customDate')?.value || '';
            const customMinute = document.getElementById('customMinute')?.value || '';
            const customNumber = document.getElementById('customNumber')?.value || segmentNumber;
            return `TVRI_JAYAPURA_${customDate}_${customMinute}_${customNumber.toString().padStart(3, '0')}.mp4`;
        default:
            return `TVRI_JAYAPURA_${segmentNumber.toString().padStart(3, '0')}.mp4`;
    }
}

// Update progress display
function updateProgress(message, percentage) {
    const processingInfo = document.getElementById('processingInfo');
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');
    
    if (processingInfo) processingInfo.textContent = message;
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressPercentage) progressPercentage.textContent = `${Math.round(percentage)}%`;
}

// Generate segment cards for results
function generateSegmentCards() {
    const segmentsGrid = document.getElementById('segmentsGrid');
    if (!segmentsGrid) return;
    
    segmentsGrid.innerHTML = '';
    
    videoSegments.forEach((segment, index) => {
        const card = document.createElement('div');
        card.className = 'segment-card';
        const videoURL = URL.createObjectURL(segment.blob);
        
        card.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow duration-200">
                <div class="relative mb-3">
                    <video class="w-full h-32 object-cover rounded" controls preload="metadata">
                        <source src="${videoURL}" type="video/mp4">
                    </video>
                    <div class="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        ${formatTime(segment.duration)}
                    </div>
                </div>
                <div class="segment-info mb-3">
                    <h4 class="font-semibold text-gray-900 flex items-center">
                        <span class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                            ${segment.index}
                        </span>
                        Segment ${segment.index}
                    </h4>
                    <div class="flex justify-between text-sm text-gray-600 mt-1">
                        <span>Mulai: ${formatTime(segment.startTime)}</span>
                        <span>Durasi: ${formatTime(segment.duration)}</span>
                    </div>
                    <p class="text-sm text-gray-800 font-medium mt-2 bg-gray-50 p-2 rounded truncate" title="${segment.fileName}">
                        ${segment.fileName}
                    </p>
                </div>
            </div>
        `;
        segmentsGrid.appendChild(card);
    });
}

// Download individual segment
function downloadSegment(index) {
    if (index < 0 || index >= videoSegments.length) return;
    
    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    
    // Show loading state
    button.innerHTML = `
        <svg class="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Downloading...
    `;
    button.disabled = true;
    
    const segment = videoSegments[index];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(segment.blob);
    link.download = segment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reset button after delay
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 1000);
    
    console.log(`Downloaded: ${segment.fileName}`);
}

// Show custom name modal
function showCustomNameModal(index) {
    const modal = document.getElementById('customNameModal');
    const input = document.getElementById('newFileName');
    
    if (modal && input) {
        modal.dataset.segmentIndex = index;
        input.value = videoSegments[index].fileName.replace('.mp4', '');
        modal.classList.remove('hidden');
        input.focus();
    }
}

// Hide custom name modal
function hideCustomNameModal() {
    const modal = document.getElementById('customNameModal');
    if (modal) modal.classList.add('hidden');
}

// Apply custom name
function applyCustomName() {
    const modal = document.getElementById('customNameModal');
    const input = document.getElementById('newFileName');
    
    if (modal && input) {
        const index = parseInt(modal.dataset.segmentIndex);
        const newName = input.value.trim();
        
        if (newName && index >= 0 && index < videoSegments.length) {
            videoSegments[index].fileName = newName + '.mp4';
            generateSegmentCards();
        }
        
        hideCustomNameModal();
    }
}

// Update file name preview
function updateFileNamePreview() {
    const preview = document.getElementById('fileNamePreview');
    if (!preview) return;
    
    const sampleFileName = generateFileName(1);
    preview.textContent = `Contoh: ${sampleFileName}`;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format time in seconds to MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Export functions for global access
window.downloadSegment = downloadSegment;
window.showCustomNameModal = showCustomNameModal;
window.hideCustomNameModal = hideCustomNameModal;
window.applyCustomName = applyCustomName;