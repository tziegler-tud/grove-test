import Speaker from 'speaker';
import audioApi from 'web-audio-api';
import fs from 'fs';
import rpio from "rpio";

export default class SpeakerService {
    constructor(){
        this.speaker = new Speaker({
            channels: 2,          // 2 channels
            bitDepth: 16,         // 16-bit samples
            sampleRate: 44100     // 44,100 Hz sample rate
        });
        this.context      = new audioApi.AudioContext();
        this.audio = new WritableStream();
        this.context.outStream = this.audio;
        // this.context.outStream = new Speaker({
        //     channels:   this.context.format.numberOfChannels,
        //     bitDepth:   this.context.format.bitDepth,
        //     sampleRate: this.context.format.sampleRate
        // });
    }
    async playSound(filename){
        console.log("playing sound "+ filename);
        let self = this;
        let track = './audio/'+ filename;
        var audioData1 = fs.readFileSync(track);

        this.context.outStream = new Speaker({
            channels:   this.context.format.numberOfChannels,
            bitDepth:   this.context.format.bitDepth,
            sampleRate: this.context.format.sampleRate
        });

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


    async playPwmTest(){

        console.log("playing pwm test");

        var pin = 32;           /* P12/GPIO18 */
        var range = 1024;       /* LEDs can quickly hit max brightness, so only use */
        var max = 128;          /*   the bottom 8th of a larger scale */
        var clockdiv = 8;       /* Clock divider (PWM refresh rate), 8 == 2.4MHz */
        var interval = 100;       /* setInterval timer, speed of pulses */
        var times = 5;          /* How many times to pulse before exiting */

        /*
         * Enable PWM on the chosen pin and set the clock and range.
         */
        rpio.open(pin, rpio.PWM);
        rpio.pwmSetClockDivider(clockdiv);
        rpio.pwmSetRange(pin, range);

        /*
         * Repeatedly pulse from low to high and back again until times runs out.
         */
        var direction = 1;
        var data = 0;
        var frequency = clockdiv;
        var mult = 2;
        var pulse = setInterval(function() {
            rpio.pwmSetData(pin, data);
            rpio.pwmSetClockDivider(frequency);
            if (data === 0) {
                direction = 1;
                if (times-- === 0) {
                    clearInterval(pulse);
                    rpio.open(pin, rpio.INPUT);
                    return;
                }
            } else if (data === max) {
                direction = -1;
            }
            if(frequency > 2048){
                mult = -2;
            }
            if(frequency < 16) {
                mult = 2;
            }
            frequency = frequency * mult;
            data += direction;
        }, interval, data, direction, times, frequency, mult);

    }

    async playPwmStream(filename){
        let self = this;

        let track = './audio/'+ filename;
        var audioData1 = fs.readFileSync(track);

        this.context.outStream = this.audio;

        this.context.decodeAudioData(audioData1, function(audioBuffer) {
            self.playPwm(audioBuffer)
        });
    }

    playPwm(audioBuffer){

        if (!audioBuffer) { return; }
        var bufferSource = this.context.createBufferSource();
        bufferSource.connect(this.context.destination);
        bufferSource.buffer = audioBuffer;
        bufferSource.loop   = false;
        bufferSource.start(0);

        var pin = 32;           /* P12/GPIO18 */
        var range = 1024;       /* LEDs can quickly hit max brightness, so only use */
        var clockdiv = 8;       /* Clock divider (PWM refresh rate), 8 == 2.4MHz */
        var interval = 5;       /* setInterval timer, speed of pulses */

        /*
         * Enable PWM on the chosen pin and set the clock and range.
         */
        rpio.open(pin, rpio.PWM);
        rpio.pwmSetClockDivider(clockdiv);
        rpio.pwmSetRange(pin, range);

        var pulse = setInterval(function() {
            rpio.pwmSetData(pin, self.audio);
            console.log(self.audio);
        }, interval);

    }
}


