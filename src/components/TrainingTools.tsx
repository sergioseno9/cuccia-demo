import { MousePointerClick, Volume2 } from 'lucide-react'

const playTone = (frequency: number, durationMs: number, type: OscillatorType) => {
  const audio = new AudioContext()
  const oscillator = audio.createOscillator()
  const gain = audio.createGain()
  const now = audio.currentTime
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)
  oscillator.connect(gain)
  gain.connect(audio.destination)
  oscillator.start(now)
  oscillator.stop(now + durationMs / 1000)
  oscillator.addEventListener('ended', () => void audio.close())
}

export function TrainingTools() {
  return <div className="training-tools">
    <div><strong>Strumenti rapidi</strong><p>Due suoni semplici da usare solo se fanno parte del vostro metodo gentile.</p></div>
    <div><button onClick={() => playTone(920, 45, 'square')}><MousePointerClick size={21} /><span>Clicker</span></button><button onClick={() => playTone(2_600, 320, 'sine')}><Volume2 size={21} /><span>Fischietto</span></button></div>
  </div>
}
