const electron = require('electron')
const dirPath = require('path')
const fs = require('fs')
const {
    convertToWav,
    burnInSubtitle,
    fadeInOut,
    separateVideo,
    imgToVideo,
    concatVideos,
    encodingVideos
} = require('./ffmpeg.js');
const { v4: uuidv4 } = require('uuid');
const uuid = uuidv4();

const dragZone = document.querySelectorAll('.drag')

let dragedFile1; let dragedFile2;

window.scrollTo(0, document.body.scrollHeight);

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
    videoPlayer.currentTime = 0;
    videoPlayer.play();
    videoPlayer.addEventListener('timeupdate', () => {
        if (videoPlayer.currentTime >= 50) {
            videoPlayer.pause();
        }
    })
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

    //folderPath = 'resources/separated'
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('폴더를 읽을 수 없음:', err);
            return;
        }
    
        files.forEach(file => {
            const filePath = path.join(folderPath, file);

            fs.unlink(filePath, err => {
                if (err) {
                    console.error(`파일을 삭제할 수 없음: ${filePath}`, err);
                } else {
                    console.log(`파일 삭제됨: ${filePath}`);
                }
            });
        });
    });
    console.time("영상 분리 시간: ");
    const { path } = file.files[0];
    
    const startList = [0.00, 13.46, 17.44, 18.48, 46.81, 100.22, 163.52, 171.84]

    const inputFile = `media/${uuid}.mp4`;
    console.log(inputFile);
    startList.forEach((element, index, arr) => {
        const outputFile = `/Users/songchiheon/Downloads/fmpeg/separated_videos/${uuid}_${index}.mp4`;
        separateVideo(inputFile, outputFile, element, (arr[index+1] - element).toFixed(2))
        .then(() => {
            console.log('영상 분리에 성공했습니다.');
        })
        .catch((error) => {
            console.error('영상 분리에 실패했습니다: ', error)
        });
    });
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

document.getElementById('encodeVideo').addEventListener('click', (event) => {
    event.preventDefault();
    console.time("인코딩 시간: ")
    const inputFile = file.files[0].path;
    const outputFile = `media/${uuid}.mp4`;
    encodingVideos(
        inputFile,
        outputFile,
        'libx264',
        'aac',
        '44.1k',
        '128k',
        '30000/1001',
        '1920x1080'
    ).then(() => {
        console.timeEnd("인코딩 시간: ");
        const myAudio = document.getElementById('alert-audio')
        myAudio.play()
    })
    .catch((error) => {
        console.error('인코딩에 실패하였습니다.\n이유: ', error);
    });
})
