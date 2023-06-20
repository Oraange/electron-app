const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static-electron').path;

// ffmpeg binary 파일의 위치 설정
ffmpeg.setFfmpegPath(ffmpegPath);

// 영상 효과 추가
function fadeInOut(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
        document.getElementById('process').innerHTML = "🌘Fade In / Out 효과를 넣고있어요"
        ffmpeg(inputFile)
        .videoFilter('fade=t=in:st=0:d=10,fade=t=out:st=50:d=5')
        .audioCodec('copy')
        .output(outputFile)
        .on('end', resolve)
        .on('error', reject)
        .run()
    });
}

// wav 파일 추출
function convertToWav(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
        document.getElementById('process').innerHTML = "🔉음성을 추출 중이에요"
        ffmpeg(inputFile)
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioBitrate('16k')
        .format('wav')
        .output(outputFile)
        .on('end', resolve)
        .on('error', reject)
        .run()
    })
}

// 자막 burn in
function burnInSubtitle(inputVideoFile, inputSubtitleFile, outputFile) {
    return new Promise((resolve, reject) => {
        document.getElementById('process').innerHTML = "📽자막을 입히는 중이에요!"
        ffmpeg(inputVideoFile)
        .videoFilter(`subtitles=${inputSubtitleFile}:force_style='FontName=맑은 고딕, Fontsize=150px'`)
        .videoCodec('libx264')
        .audioCodec('aac')
        .output(outputFile)
        .on('end', resolve)
        .on('error', reject)
        .run()
    })
}

// 영상 분리
function separateVideo(inputVideoFile, sepTime, outputFile1, outputFile2) {
    const duration = "00:31:25"
    return new Promise((resolve, reject) => {
        document.getElementById('process').innerHTML = "🔪영상을 나누고 있습니다"
        ffmpeg()
        .input(inputVideoFile)
        .inputOptions(['-ss', '00:00:00', '-t', sepTime])
        .output(outputFile1)
        .outputOptions('-c:v', 'copy', '-c:a', 'copy')
        .on('end', () => {
            ffmpeg()
            .input(inputVideoFile)
            .inputOptions(['-ss', sepTime, '-t', duration])
            .output(outputFile2)
            .outputOptions('-c:v', 'copy', '-c:a', 'copy')
            .on('end', resolve)
            .on('error', reject)
            .run()
        })
        .on('error', reject)
        .run();
    })
}

// 이미지로 영상 생성
function imgToVideo(inputImageFile, outputFile) {
    return new Promise((resolve, reject) => {
        document.getElementById('process').innerHTML = "🌠이미지로 영상 생성 중";
        ffmpeg(inputImageFile)
        .loop(1)
        .videoFilter('scale=trunc(iw/2)*2:trunc(ih/2)*2')
        .videoCodec('libx264')
        .setDuration(5)
        .output(outputFile)
        .on('end', resolve)
        .on('error', reject)
        .run()
    });
}

// 영상 합치기
function concatVideos(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
        document.getElementById('process').innerHTML = "👫영상을 합치는 중";
        ffmpeg()
        .input(inputFile)
        .inputOptions('-f concat')
        .audioCodec('copy')
        .videoCodec('copy')
        .output(outputFile)
        .on('end', resolve)
        .on('error', reject)
        .run()
    });
}

module.exports = { 
    fadeInOut,
    convertToWav,
    burnInSubtitle,
    separateVideo,
    imgToVideo,
    concatVideos
};
