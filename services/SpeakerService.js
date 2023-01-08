import Speaker from 'speaker';
import audioApi from 'web-audio-api';
import fs from 'fs';

export default class SpeakerService {
    constructor(){
        this.speaker = new Speaker({
            channels: 2,          // 2 channels
            bitDepth: 16,         // 16-bit samples
            sampleRate: 44100     // 44,100 Hz sample rate
        });
        this.context      = new audioApi.AudioContext();
        this.context.outStream = new Speaker({
            channels:   this.context.format.numberOfChannels,
            bitDepth:   this.context.format.bitDepth,
            sampleRate: this.context.format.sampleRate
        });
    }
    async playSound(filename){
        let self = this;
        let track = './audio/'+ filename;
        var audioData1 = fs.readFileSync(track);

        this.context.decodeAudioData(audioData1, function(audioBuffer) {
            self.play(audioBuffer)
        });
    }

    play(audioBuffer) {
        if (!audioBuffer) { return; }
        var bufferSource = this.context.createBufferSource();
        bufferSource.connect(this.context.destination);
        bufferSource.buffer = audioBuffer;
        bufferSource.loop   = false;
        bufferSource.start(0);
    }
}


