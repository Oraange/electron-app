const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static-electron').path;

ffmpeg.setFfmpegPath(ffmpegPath);

function fadeInOut(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
        .videoFilter('fade=t=in:st=0:d=10,fade=t=out:st=50:d=5')
        .audioCodec('copy')
        .output(outputFile)
        .on('end', resolve)
        .on('error', reject)
        .run()
    });
}

function convertToWav(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
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

function burnInSubtitle(inputVideoFile, inputSubtitleFile, outputFile) {
    return new Promise((resolve, reject) => {
        document.getElementById('pending').innerHTML = "📽자막을 입히는 중이에요!"
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

module.exports = { fadeInOut, convertToWav, burnInSubtitle };
