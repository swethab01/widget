import { useRef, useState, useCallback, useEffect } from 'react'

export type SoundType = 'off' | 'binaural' | 'brown' | 'rain'

export function useAmbientSound() {
    const [soundType, setSoundType] = useState<SoundType>('off')
    const [volume, setVolume] = useState<number>(0.25)
    const audioCtxRef = useRef<AudioContext | null>(null)
    const gainNodeRef = useRef<GainNode | null>(null)
    const activeNodesRef = useRef<{ stop?: () => void; disconnect?: () => void }[]>([])

    const getAudioContext = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
            audioCtxRef.current = new AudioCtx()
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume()
        }
        return audioCtxRef.current
    }, [])

    const stopCurrentSound = useCallback(() => {
        activeNodesRef.current.forEach((n) => {
            try {
                n.stop?.()
                n.disconnect?.()
            } catch {
                // ignore
            }
        })
        activeNodesRef.current = []
    }, [])

    // Play Focus Completion Chime (Harmonic Bell)
    const playCompletionChime = useCallback(() => {
        try {
            const ctx = getAudioContext()
            const now = ctx.currentTime
            const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

            notes.forEach((freq, index) => {
                const osc = ctx.createOscillator()
                const noteGain = ctx.createGain()
                osc.type = 'sine'
                osc.frequency.setValueAtTime(freq, now + index * 0.12)

                noteGain.gain.setValueAtTime(0.001, now + index * 0.12)
                noteGain.gain.exponentialRampToValueAtTime(0.2, now + index * 0.12 + 0.04)
                noteGain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 1.2)

                osc.connect(noteGain)
                noteGain.connect(ctx.destination)

                osc.start(now + index * 0.12)
                osc.stop(now + index * 0.12 + 1.3)
            })
        } catch {
            // ignore audio play restrictions
        }
    }, [getAudioContext])

    const startSound = useCallback(
        (type: SoundType) => {
            stopCurrentSound()
            if (type === 'off') {
                setSoundType('off')
                return
            }

            try {
                const ctx = getAudioContext()
                const masterGain = ctx.createGain()
                masterGain.gain.value = volume
                masterGain.connect(ctx.destination)
                gainNodeRef.current = masterGain

                if (type === 'binaural') {
                    // 40Hz Gamma Flow State: Left 216Hz, Right 256Hz
                    const merger = ctx.createChannelMerger(2)

                    const oscLeft = ctx.createOscillator()
                    oscLeft.type = 'sine'
                    oscLeft.frequency.value = 216

                    const oscRight = ctx.createOscillator()
                    oscRight.type = 'sine'
                    oscRight.frequency.value = 256

                    const gainL = ctx.createGain()
                    const gainR = ctx.createGain()
                    gainL.gain.value = 0.5
                    gainR.gain.value = 0.5

                    oscLeft.connect(gainL)
                    gainL.connect(merger, 0, 0) // Left channel

                    oscRight.connect(gainR)
                    gainR.connect(merger, 0, 1) // Right channel

                    merger.connect(masterGain)

                    oscLeft.start()
                    oscRight.start()

                    activeNodesRef.current = [oscLeft, oscRight, masterGain]
                } else if (type === 'brown') {
                    // Brown / Red Noise (Deep Rumble for focus)
                    const bufferSize = ctx.sampleRate * 2
                    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
                    const output = noiseBuffer.getChannelData(0)
                    let lastOut = 0.0

                    for (let i = 0; i < bufferSize; i++) {
                        const white = Math.random() * 2 - 1
                        output[i] = (lastOut + 0.02 * white) / 1.02
                        lastOut = output[i]
                        output[i] *= 3.5 // Gain boost
                    }

                    const whiteNoise = ctx.createBufferSource()
                    whiteNoise.buffer = noiseBuffer
                    whiteNoise.loop = true

                    const lowpass = ctx.createBiquadFilter()
                    lowpass.type = 'lowpass'
                    lowpass.frequency.value = 400

                    whiteNoise.connect(lowpass)
                    lowpass.connect(masterGain)
                    whiteNoise.start()

                    activeNodesRef.current = [whiteNoise, masterGain]
                } else if (type === 'rain') {
                    // Rain ambience: Pink/White noise with bandpass modulation
                    const bufferSize = ctx.sampleRate * 2
                    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
                    const output = noiseBuffer.getChannelData(0)
                    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0

                    for (let i = 0; i < bufferSize; i++) {
                        const white = Math.random() * 2 - 1
                        b0 = 0.99886 * b0 + white * 0.0555179
                        b1 = 0.99332 * b1 + white * 0.0750759
                        b2 = 0.96900 * b2 + white * 0.1538520
                        b3 = 0.86650 * b3 + white * 0.3104856
                        b4 = 0.55000 * b4 + white * 0.5329522
                        b5 = -0.7616 * b5 - white * 0.0168980
                        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
                        output[i] *= 0.11
                        b6 = white * 0.115926
                    }

                    const rainSource = ctx.createBufferSource()
                    rainSource.buffer = noiseBuffer
                    rainSource.loop = true

                    const filter = ctx.createBiquadFilter()
                    filter.type = 'lowpass'
                    filter.frequency.value = 1200

                    rainSource.connect(filter)
                    filter.connect(masterGain)
                    rainSource.start()

                    activeNodesRef.current = [rainSource, masterGain]
                }

                setSoundType(type)
            } catch {
                setSoundType('off')
            }
        },
        [getAudioContext, stopCurrentSound, volume]
    )

    const updateVolume = useCallback((val: number) => {
        setVolume(val)
        if (gainNodeRef.current && audioCtxRef.current) {
            gainNodeRef.current.gain.setValueAtTime(val, audioCtxRef.current.currentTime)
        }
    }, [])

    useEffect(() => {
        return () => {
            stopCurrentSound()
            if (audioCtxRef.current) {
                audioCtxRef.current.close()
            }
        }
    }, [stopCurrentSound])

    return {
        soundType,
        volume,
        setSoundType: startSound,
        setVolume: updateVolume,
        playCompletionChime,
    }
}
