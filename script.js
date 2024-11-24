const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');
const audioPlayback = document.getElementById('audioPlayback');
const recordingsList = document.getElementById('recordingsList');
const recordingIndicator = document.getElementById('recordingIndicator');
const recordingTimer = document.getElementById('recordingTimer');

let mediaRecorder;
let chunks = [];
let timerInterval;
let startTime;

startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        downloadBtn.classList.add('hidden');
        audioPlayback.classList.add('hidden');

        recordingIndicator.classList.remove('hidden');
        recordingTimer.classList.remove('hidden');
        startTime = Date.now();
        recordingTimer.textContent = '00:00';
        timerInterval = setInterval(updateTimer, 1000);

        mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            clearInterval(timerInterval);
            recordingIndicator.classList.add('hidden');
            recordingTimer.classList.add('hidden');

            const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
            chunks = [];
            const audioURL = window.URL.createObjectURL(blob);
            audioPlayback.src = audioURL;
            audioPlayback.classList.remove('hidden');

            downloadBtn.href = audioURL;
            downloadBtn.download = `recording_${new Date().toISOString()}.ogg`;
            downloadBtn.classList.remove('hidden');

            addRecordingToList(audioURL, downloadBtn.download);
        };
    } catch (err) {
        console.error('Ошибка доступа к микрофону:', err);
        alert('Не удалось получить доступ к микрофону.');
    }
});

stopBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
});

function addRecordingToList(url, filename) {
    const listItem = document.createElement('li');
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.src = url;

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    downloadLink.textContent = 'Скачать';

    listItem.appendChild(audioElement);
    listItem.appendChild(downloadLink);
    recordingsList.appendChild(listItem);
}

function updateTimer() {
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor((elapsed / 1000) % 60);
    const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
    recordingTimer.textContent = `${pad(minutes)}:${pad(seconds)}`;
}

function pad(number) {
    return number.toString().padStart(2, '0');
}