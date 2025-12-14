<?php
session_start();

// Add headers for FFmpeg.wasm to work (SharedArrayBuffer requirement)
header("Cross-Origin-Embedder-Policy: credentialless");
header("Cross-Origin-Opener-Policy: same-origin");

if (!isset($_SESSION["username_user"])) {
    header("Location: login.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aplikasi Editing Video </title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" type="Desain tanpa judul (2).png" href="Desain tanpa judul (2).png">

</head>
<body class="bg-gray-50 min-h-screen">

    <!-- Main Application Section -->
    <div id="appSection" class="min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center"> 
                        <div>
                            <h1 class="text-xl font-bold text-gray-900">EDITING VIDEO</h1>
                            <p class="text-sm text-gray-600">Aplikasi Pemotong Video</p>
                        </div>
                        <div>
                        <audio autoplay loop muted>
                        <source src="x" type="audio/mp4">
                            </audio>
                            <!DOCTYPE html>
                            <html>
                            <body>

                            <button class="mt-4 bg-blue-60 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition duration-200" onclick="playMusic()">▶ Play Musik</button>

                            <audio id="musik">
                                <source src="musik/videoplayback (1) - Copy.mp4" type="audio/mp4">
                            </audio>

                            <script>
                            function playMusic() {
                                const audio = document.getElementById("musik");
                                audio.play().catch(err => console.log(err));
                        }
                        </script>
                    </div>
                    </div>
                    <button id="logoutBtn" class="text-red-600 hover:text-red-700 font-medium text-sm">
                        <a href="logout.php">Keluar</a>
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Upload Section -->
            <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Upload Video</h2>
                <div id="dropZone" class="drop-zone">
                    <input type="file" id="videoInput" accept="video/*" class="hidden">
                    <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                    </div>
                    <p class="text-gray-600 mb-2">Klik untuk memilih video atau tarik file ke sini</p>
                    <p class="text-sm text-gray-500">Format yang didukung: MP4, AVI, MOV, WEBM</p>
                    <button id="selectVideoBtn" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                        Pilih Video
                    </button>
                </div>
                <div id="fileInfo" class="hidden mt-4 p-4 bg-blue-50 rounded-lg">
                    <p class="text-blue-800 font-medium" id="fileName"></p>
                    <p class="text-blue-600 text-sm" id="fileSize"></p>
                </div>
            </div>

            <!-- Naming Format Section -->
            <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Format Penamaan File</h2>
                <div class="space-y-4">
                    
                    <div class="flex items-center space-x-3">
                        <input type="radio" id="customFormat" name="namingFormat" value="custom"
                               class="text-blue-600 focus:ring-blue-500">
                        <label for="customFormat" class="text-sm text-gray-700">
                            Format Custom
                        </label>
                    </div>
                    <div id="customFormatInputs" class="hidden space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                                <input type="text" id="customDate" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                       placeholder="DD,MM,YYYY">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Menit</label>
                                <input type="text" id="customMinute" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                       placeholder="Menit">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Preview Nama File</label>
                            <p id="fileNamePreview" class="text-sm text-gray-600 bg-white p-2 rounded border">
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Video Preview -->
            <div id="videoPreviewSection" class="hidden bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Preview Video</h2>
                <div class="video-container">
                    <video id="videoPlayer" controls class="w-full rounded-lg shadow-md"></video>
                </div>
                <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Durasi Video</label>
                        <p id="videoDuration" class="text-gray-600">-</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah Potongan</label>
                        <p id="segmentCount" class="text-gray-600">-</p>
                    </div>
                </div>
                <button id="processBtn" 
                        class="mt-6 w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition duration-200">
                    Proses Pemotongan
                </button>
            </div>

            <!-- Processing pemotongan -->
            <div id="processingSection" class="hidden bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Memproses Video</h2>
                <div class="bg-gray-100 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-gray-600">Progress</span>
                        <span id="progressPercentage" class="text-sm font-medium text-gray-700">0%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div id="progressBar" class="progress-bar bg-green-600 h-2 rounded-full" style="width: 0%"></div>
                    </div>
                </div>
                <div id="processingInfo" class="mt-4 text-center text-gray-600">
                    Memproses potongan video...
                </div>
            </div>

            <!-- Results Section -->
            <div id="resultsSection" class="hidden bg-white rounded-lg shadow-sm border p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Hasil Pemotongan</h2>
                <div id="segmentsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Segments will be populated here -->
                </div>
                <div class="mt-6 flex justify-center">
                    <button id="downloadAllBtn" 
                            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                        Download Semua
                    </button>
                </div>
            </div>
        </main>
        

</body>
</html>

    <script src="https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/umd/index.js"></script>
    <script src="https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script type="module" src="script.js"></script>
</body>
</html>