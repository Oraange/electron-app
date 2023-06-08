const electron = require('electron')
const { convertToWav, burnInSubtitle, fadeInOut } = require('./ffmpeg.js');

const ffmpegPath = require('ffmpeg-static-electron').path;

const func = async () => {
    const response = await window.versions.ping()
    console.log(response) // prints out 'pong'
}

// func()

const dragZone = document.getElementById('drag')

dragZone.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file1 = document.getElementById('file1')
    const file2 = document.getElementById('file2')

    for (const f of event.dataTransfer.files) {
        if (file1.innerHTML === "") {
            file1.innerHTML = f.path
        } else {
            file2.innerHTML = f.path
        }
    }
    dragZone.style.backgroundColor = 'white'
});

dragZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

dragZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragZone.style.backgroundColor = '#E2E2E2'
});

dragZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('File has left the Drop Space');
    dragZone.style.backgroundColor = 'white'
});

const updateOnlineStatus = () => {
    const data = document.getElementById('status')
    if (navigator.onLine) {
        data.innerHTML = 'online'
        data.style.color = 'green'
    } else {
        data.innerHTML = 'offline'
        data.style.color = 'red'
    }
}

window.addEventListener('online', updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)

updateOnlineStatus()

const file = document.querySelector('input[type="file"]');

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = file
    const videoPlayer = document.getElementById('videoPlayer');

    fileInput.addEventListener('change', () => {
        playVideo(fileInput.files[0], videoPlayer);
    });
});

const playVideo = (file, videoPlayer) => {
    videoPlayer.src = URL.createObjectURL(file);
    videoPlayer.play();
};

document.querySelector('#getAudio').addEventListener('submit', (event) => {
    event.preventDefault();
    const { path } = file.files[0];

    convertToWav(path, 'media/aplis_output.wav')
    .then(() => {
        console.log('Get wav file completed');
    })
    .catch((error) => {
        console.error('Get wav file error: ', error);
    });
});

document.querySelector('#burnIn').addEventListener('submit', (event) => {
    event.preventDefault();
    const { path } = file.files[0];
    const outputFile = 'media/aplis_output.mp4'

    burnInSubtitle(path, 'media/aplis.srt', outputFile)
    .then(() => {
        document.getElementById('pending').innerHTML = "👍영상에 자막이 생겼어요!"
        console.log('Burn In completed');
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.src = outputFile;
        videoPlayer.load();
        videoPlayer.play();
    })
    .catch((error) => {
        document.getElementById('pending').innerHTML = "😂작업에 실패했어요..."
        console.error('Burn In error: ', error);
    });
});

document.querySelector('#inputFade').addEventListener('submit', (event) => {
    event.preventDefault();
    const { path } = file.files[0];
    const outputFile = 'media/aplis_fade.mp4'

    fadeInOut(path, outputFile)
    .then(() => {
        console.log('Inser FadeIn or FadeOut effect success.')
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.src = outputFile;
        videoPlayer.load();
        videoPlayer.play();
    })
    .catch((error) => {
        console.error('Insert FadeIn or FadeOut effect is in error: ', error);
    });
});
