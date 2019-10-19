/// <reference path="Codec.ts"/>

class AVGCalculator {
    history_size: number = 100;
    history: number[] = [];

    push(entry: number) {
        while(this.history.length > this.history_size)
            this.history.pop();
        this.history.unshift(entry);
    }

    avg() : number {
        let count = 0;
        for(let entry of this.history)
            count += entry;
        return count / this.history.length;
    }
}

abstract class BasicCodec implements Codec {
    protected _audioContext: OfflineAudioContext;
    protected _decodeResampler: AudioResampler;
    protected _encodeResampler: AudioResampler;
    protected _codecSampleRate: number;
    protected _latenz: AVGCalculator = new AVGCalculator();

    on_encoded_data: (Uint8Array) => void = $ => {};
    channelCount: number = 1;
    samplesPerUnit: number = 960;

    protected constructor(codecSampleRate: number) {
        this.channelCount = 1;
        this.samplesPerUnit = 960;
        this._audioContext = new (window.webkitOfflineAudioContext || window.OfflineAudioContext)(audio.player.destination().channelCount, 1024, audio.player.context().sampleRate);
        this._codecSampleRate = codecSampleRate;
        this._decodeResampler = new AudioResampler(audio.player.context().sampleRate);
        this._encodeResampler = new AudioResampler(codecSampleRate);
    }

    abstract name() : string;
    abstract initialise() : Promise<Boolean>;
    abstract initialized() : boolean;
    abstract deinitialise();
    abstract reset() : boolean;

    protected abstract decode(data: Uint8Array) : Promise<AudioBuffer>;
    protected abstract encode(data: AudioBuffer) : Promise<Uint8Array | string>;


    encodeSamples(cache: CodecClientCache, pcm: AudioBuffer) {
        this._encodeResampler.resample(pcm).catch(error => log.error(LogCategory.VOICE, tr("Could not resample PCM data for codec. Error: %o"), error))
            .then(buffer => this.encodeSamples0(cache, buffer as any)).catch(error => console.error(tr("Could not encode PCM data for codec. Error: %o"), error))

    }

    private encodeSamples0(cache: CodecClientCache, buffer: AudioBuffer) {
        cache._chunks.push(new BufferChunk(buffer)); //TODO multi channel!

        while(cache.bufferedSamples(this.samplesPerUnit) >= this.samplesPerUnit) {
            let buffer = this._audioContext.createBuffer(this.channelCount, this.samplesPerUnit, this._codecSampleRate);
            let index = 0;
            while(index < this.samplesPerUnit) {
                let buf = cache._chunks[0];
                let cpyBytes = buf.copyRangeTo(buffer, this.samplesPerUnit - index, index);
                index += cpyBytes;
                buf.index += cpyBytes;
                if(buf.index == buf.buffer.length)
                    cache._chunks.pop_front();
            }

            let encodeBegin = Date.now();
            this.encode(buffer).then(result => {
                if(result instanceof Uint8Array) {
                    let time = Date.now() - encodeBegin;
                    if(time > 20)
                        log.warn(LogCategory.VOICE, tr("Voice buffer stalled in WorkerPipe longer then expected: %d"), time);
                    //if(time > 20)
                    //   chat.serverChat().appendMessage("Required decode time: " + time);
                    this.on_encoded_data(result);
                }
                else log.error(LogCategory.VOICE, "[Codec][" + this.name() + "] Could not encode buffer. Result: " + result); //TODO tr
            });
        }
        return true;
    }

    decodeSamples(cache: CodecClientCache, data: Uint8Array) : Promise<AudioBuffer> {
        return this.decode(data).then(buffer => this._decodeResampler.resample(buffer));
    }
}