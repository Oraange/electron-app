const electron = require('electron')
const dirPath = require('path')
const fs = require('fs')
const {
    convertToWav,
    burnInSubtitle,
    fadeInOut,
    separateVideo,
    imgToVideo,
    concatVideos
} = require('./ffmpeg.js');

const dragZone = document.querySelectorAll('.drag')

let dragedFile1; let dragedFile2;

dragZone.forEach((element) => {
    element.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const holdFile = event.dataTransfer.files

        if (holdFile.length >= 2) {
            element.innerHTML = "한 번에 하나의 파일만 올려주세요!";
        } else {
            if (element.id === 'drag1') dragedFile1 = holdFile[0]
            else dragedFile2 = holdFile[0]
            element.innerHTML = holdFile[0].path
        }

        console.log("First section: ", dragedFile1, "\nSecond section: ", dragedFile2)
        element.style.backgroundColor = 'white'
    });

    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    element.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.style.backgroundColor = '#E2E2E2'
    });

    element.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('File has left the Drop Space');
        element.style.backgroundColor = 'white'
    });
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

const fixedDiv = document.getElementById('process');

document.querySelector('#getAudio').addEventListener('click', (event) => {
    event.preventDefault();

    if (file.files['length'] === 0) {
        fixedDiv.innerHTML = "아직 영상이 없어요";
        fixedDiv.style.zIndex = 2;
        setTimeout(() => {
            fixedDiv.innerHTML = "";
            fixedDiv.style.zIndex = 1;
        }, 3000);
        return;
    }
    console.time("음성 추출 작업 시간: ");
    const { path } = file.files[0];

    convertToWav(path, 'media/aplis_output.wav')
    .then(() => {
        fixedDiv.innerHTML = "🔊음성 추출이 완료되었어요"
        console.log('Get wav file completed');
        console.timeEnd("음성 추출 작업 시간: ");
    })
    .catch((error) => {
        fixedDiv.innerHTML = "❌작업에 실패했어요..."
        console.error('Get wav file error: ', error);
    });
});

document.querySelector('#burnIn').addEventListener('click', (event) => {
    event.preventDefault();
    if (file.files['length'] === 0) {
        fixedDiv.innerHTML = "아직 영상이 없어요";
        fixedDiv.style.zIndex = 2;
        setTimeout(() => {
            fixedDiv.innerHTML = "";
            fixedDiv.style.zIndex = 1;
        }, 3000);
        return;
    }
    console.time("번인 작업 시간: ");
    const { path } = file.files[0];
    const outputFile = 'media/aplis_output.mp4'

    burnInSubtitle(path, 'media/aplis.srt', outputFile)
    .then(() => {
        fixedDiv.innerHTML = "👍영상에 자막이 생겼어요!"
        console.log('Burn In completed');
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.src = outputFile;
        videoPlayer.load();
        videoPlayer.play();
        console.timeEnd("번인 작업 시간: ");
    })
    .catch((error) => {
        fixedDiv.innerHTML = "❌작업에 실패했어요..."
        console.error('Burn In error: ', error);
    });
});

document.querySelector('#inputFade').addEventListener('click', (event) => {
    event.preventDefault();
    if (file.files['length'] === 0) {
        fixedDiv.innerHTML = "아직 영상이 없어요";
        fixedDiv.style.zIndex = 2;
        setTimeout(() => {
            fixedDiv.innerHTML = "";
            fixedDiv.style.zIndex = 1;
        }, 3000);
        return;
    }
    console.time("영상 효과 작업 시간: ");
    const { path } = file.files[0];
    const outputFile = 'media/aplis_fade.mp4'

    fadeInOut(path, outputFile)
    .then(() => {
        fixedDiv.innerHTML = "🌕영상에 Fade 효과가 적용됐어요"
        console.log('Inser FadeIn or FadeOut effect success.')
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.src = outputFile;
        videoPlayer.load();
        videoPlayer.play();
        console.timeEnd("영상 효과 작업 시간: ");
    })
    .catch((error) => {
        fixedDiv.innerHTML = "❌작업에 실패했어요..."
        console.error('Insert FadeIn or FadeOut effect is in error: ', error);
    });
});

document.querySelector('#divide').addEventListener('click', (event) => {
    event.preventDefault();
    if (file.files['length'] === 0) {
        fixedDiv.innerHTML = "아직 영상이 없어요";
        fixedDiv.style.zIndex = 2;
        setTimeout(() => {
            fixedDiv.innerHTML = "";
            fixedDiv.style.zIndex = 1;
        }, 3000);
        return;
    }
    console.time("영상 분리 시간: ");
    const { path } = file.files[0];
    const outputFile1 = 'media/aplis_sep_1.mp4';
    const outputFile2 = 'media/aplis_sep_2.mp4';

    separateVideo(path, '00:1:15', outputFile1, outputFile2)
    .then(() => {
        fixedDiv.innerHTML = "✔️영상 분리에 성공했습니다"
        console.timeEnd("영상 분리 시간: ");
        const videoPlayer1 = document.getElementById('videoPlayer1');
        const videoPlayer2 = document.getElementById('videoPlayer2');
        videoPlayer1.src = outputFile1;
        videoPlayer2.src = outputFile2;
        videoPlayer1.load();
        videoPlayer1.play();
        videoPlayer1.addEventListener('ended', () => {
            videoPlayer2.load();
            videoPlayer2.play();
        });
    })
    .catch((error) => {
        fixedDiv.innerHTML = "영상 분리에 실패하였습니다";
        console.error('영상 분리에 실패하였습니다: ', error)
    })
});

document.querySelector('#imgToVideo').addEventListener('click', (event) => {
    event.preventDefault();
    const file = document.getElementById('imgFile')
    if (file.files['length'] === 0) {
        fixedDiv.innerHTML = "아직 영상이 없어요";
        fixedDiv.style.zIndex = 2;
        setTimeout(() => {
            fixedDiv.innerHTML = "";
            fixedDiv.style.zIndex = 1;
        }, 3000);
        return;
    }
    console.time("영상 생성 시간: ")
    const { path } = file.files[0];
    console.log(path)
    const outputFile = 'media/img_to_video.mp4'

    imgToVideo(path, outputFile)
    .then(() => {
        fixedDiv.innerHTML = "👏🏻영상 생성 성공"
        const videoPlayer3 = document.getElementById('videoPlayer3');
        videoPlayer3.src = outputFile;
        videoPlayer3.load();
        videoPlayer3.play();
        console.timeEnd("영상 생성 시간: ")
    })
    .catch((error) => {
        fixedDiv.innerHTML = "❌영상 생성 실패"
        console.error('영상 생성에 실패했습니다: ', error)
    })
})

document.querySelector('#concat').addEventListener('click', (event) => {
    console.log(dragedFile1.name)
    event.preventDefault();
    if (dragedFile1 === undefined || dragedFile2 === undefined) {
        fixedDiv.innerHTML = "아직 영상이 없어요";
        fixedDiv.style.zIndex = 2;
        setTimeout(() => {
            fixedDiv.innerHTML = "";
            fixedDiv.style.zIndex = 1;
        }, 3000);
        return;
    }
    console.time("영상 합치기 시간: ")

    try {
        fs.writeFileSync('media/concat.txt',
        `file ${dragedFile1.name}\nfile ${dragedFile2.name}`, 'utf-8');
    } catch(e) {
        alert('Failed to save the file!');
    }


    const outputFile = 'media/concated.mp4'
    concatVideos('media/concat.txt', outputFile)
    .then(() => {
        fixedDiv.innerHTML = "영상 합치기 성공"
        const concatedVideo = document.getElementById('concatedVideo');
        concatedVideo.src = outputFile;
        concatedVideo.load();
        concatedVideo.play();
        console.timeEnd("영상 합치기 시간: ")
    })
    .catch((error) => {
        fixedDiv.innerHTML = "영상 합치기 실패..."
        console.error('영상 합치기에 실패했습니다: ', error)
    });
})
