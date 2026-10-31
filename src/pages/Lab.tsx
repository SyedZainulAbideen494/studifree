import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, RotateCcw, Sliders } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Card } from '../components/UI/Card'
import { Tabs } from '../components/UI/Tabs'

// ---------- Projectile ----------
function ProjectileLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [angle, setAngle] = useState(45)
  const [speed, setSpeed] = useState(20)
  const [g, setG] = useState(9.8)
  const [running, setRunning] = useState(false)
  const [t, setT] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  const range = (speed * speed * Math.sin((2 * angle * Math.PI) / 180)) / g
  const maxHeight = (speed * speed * Math.sin((angle * Math.PI) / 180) ** 2) / (2 * g)
  const flightTime = (2 * speed * Math.sin((angle * Math.PI) / 180)) / g

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width, h = canvas.height
    const scale = Math.min(w / (range + 5), h / (maxHeight + 5)) * 0.8
    const ox = 40, oy = h - 40
    ctx.clearRect(0, 0, w, h)
    // ground
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(w, oy); ctx.stroke()
    // trajectory (full)
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.beginPath()
    for (let i = 0; i <= 100; i++) {
      const tt = (i / 100) * flightTime
      const x = speed * Math.cos((angle * Math.PI) / 180) * tt
      const y = speed * Math.sin((angle * Math.PI) / 180) * tt - 0.5 * g * tt * tt
      const px = ox + x * scale, py = oy - y * scale
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
    }
    ctx.stroke()
    // current point
    const x = speed * Math.cos((angle * Math.PI) / 180) * t
    const y = speed * Math.sin((angle * Math.PI) / 180) * t - 0.5 * g * t * t
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(ox + x * scale, oy - y * scale, 6, 0, Math.PI * 2); ctx.fill()
  }, [angle, speed, g, t, range, maxHeight, flightTime])

  useEffect(() => {
    if (!running) { if (rafRef.current) cancelAnimationFrame(rafRef.current); return }
    startRef.current = performance.now() - t * 1000
    const loop = (now: number) => {
      const elapsed = (now - startRef.current) / 1000
      if (elapsed >= flightTime) { setT(flightTime); setRunning(false); return }
      setT(elapsed)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running, flightTime])

  const reset = () => { setRunning(false); setT(0) }

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} width={600} height={320} className="w-full rounded-2xl bg-inset border border-line" />
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="text-muted">Range: <span className="text-ink">{range.toFixed(2)} m</span></div>
        <div className="text-muted">Max height: <span className="text-ink">{maxHeight.toFixed(2)} m</span></div>
        <div className="text-muted">Flight time: <span className="text-ink">{flightTime.toFixed(2)} s</span></div>
      </div>
      <div className="space-y-3">
        <label className="block text-sm text-muted">Angle: {angle}° <input type="range" min={0} max={90} value={angle} onChange={(e) => { reset(); setAngle(Number(e.target.value)) }} className="w-full" /></label>
        <label className="block text-sm text-muted">Speed: {speed} m/s <input type="range" min={1} max={50} value={speed} onChange={(e) => { reset(); setSpeed(Number(e.target.value)) }} className="w-full" /></label>
        <label className="block text-sm text-muted">Gravity: {g} m/s² <input type="range" min={1} max={20} step={0.1} value={g} onChange={(e) => { reset(); setG(Number(e.target.value)) }} className="w-full" /></label>
      </div>
      <div className="flex gap-2">
        {!running ? <Button onClick={() => setRunning(true)}><Play className="w-4 h-4" /> Play</Button> : <Button onClick={() => setRunning(false)}><Pause className="w-4 h-4" /> Pause</Button>}
        <Button variant="secondary" onClick={reset}><RotateCcw className="w-4 h-4" /> Reset</Button>
      </div>
      <p className="text-xs text-muted">Projectile motion with no air resistance. Position calculated from kinematic equations.</p>
    </div>
  )
}

// ---------- Spring / SHM ----------
function SpringLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [k, setK] = useState(10)
  const [mass, setMass] = useState(1)
  const [amp, setAmp] = useState(60)
  const [running, setRunning] = useState(false)
  const [t, setT] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  const omega = Math.sqrt(k / mass)
  const period = (2 * Math.PI) / omega

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width, h = canvas.height
    const cx = w / 2, cy = h / 2
    const x = amp * Math.cos(omega * t)
    ctx.clearRect(0, 0, w, h)
    // wall
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(40, cy - 60); ctx.lineTo(40, cy + 60); ctx.stroke()
    // spring (zigzag)
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5
    const springLen = 200 + x
    const segments = 12
    ctx.beginPath(); ctx.moveTo(40, cy)
    for (let i = 1; i <= segments; i++) {
      const px = 40 + (springLen / segments) * i
      const py = cy + (i % 2 === 0 ? -8 : 8)
      ctx.lineTo(px, py)
    }
    ctx.lineTo(40 + springLen, cy); ctx.stroke()
    // mass
    ctx.fillStyle = '#fff'
    ctx.fillRect(40 + springLen - 12, cy - 18, 24, 36)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.strokeRect(40 + springLen - 12, cy - 18, 24, 36)
  }, [k, mass, amp, t, omega])

  useEffect(() => {
    if (!running) { if (rafRef.current) cancelAnimationFrame(rafRef.current); return }
    startRef.current = performance.now() - t * 1000
    const loop = (now: number) => {
      const elapsed = (now - startRef.current) / 1000
      setT(elapsed)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running])

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} width={600} height={200} className="w-full rounded-2xl bg-inset border border-line" />
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="text-muted">Angular freq: <span className="text-ink">{omega.toFixed(2)} rad/s</span></div>
        <div className="text-muted">Period: <span className="text-ink">{period.toFixed(2)} s</span></div>
      </div>
      <label className="block text-sm text-muted">Spring constant k: {k} <input type="range" min={1} max={50} value={k} onChange={(e) => setK(Number(e.target.value))} className="w-full" /></label>
      <label className="block text-sm text-muted">Mass: {mass} kg <input type="range" min={0.5} max={5} step={0.1} value={mass} onChange={(e) => setMass(Number(e.target.value))} className="w-full" /></label>
      <label className="block text-sm text-muted">Amplitude: {amp} px <input type="range" min={10} max={120} value={amp} onChange={(e) => { setT(0); setAmp(Number(e.target.value)) }} className="w-full" /></label>
      <div className="flex gap-2">
        {!running ? <Button onClick={() => setRunning(true)}><Play className="w-4 h-4" /> Play</Button> : <Button onClick={() => setRunning(false)}><Pause className="w-4 h-4" /> Pause</Button>}
        <Button variant="secondary" onClick={() => { setRunning(false); setT(0) }}><RotateCcw className="w-4 h-4" /> Reset</Button>
      </div>
      <p className="text-xs text-muted">Simple harmonic motion: x = A cos(ωt), ω = √(k/m).</p>
    </div>
  )
}

// ---------- Sorting ----------
function SortingLab() {
  const [arr, setArr] = useState<number[]>(() => Array.from({ length: 20 }, () => Math.floor(Math.random() * 90) + 10))
  const [i, setI] = useState(0)
  const [j, setJ] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const rafRef = useRef<number>(0)

  const reset = () => {
    setArr(Array.from({ length: 20 }, () => Math.floor(Math.random() * 90) + 10))
    setI(0); setJ(0); setRunning(false); setDone(false)
  }

  useEffect(() => {
    if (!running || done) return
    const step = () => {
      setArr((prev) => {
        const a = [...prev]
        if (i >= a.length) { setDone(true); setRunning(false); return a }
        const jj = j
        if (jj < a.length - i - 1) {
          if (a[jj] > a[jj + 1]) { [a[jj], a[jj + 1]] = [a[jj + 1], a[jj]] }
          setJ(jj + 1)
        } else {
          setI((x) => x + 1)
          setJ(0)
        }
        return a
      })
    }
    rafRef.current = window.setTimeout(() => {
      if (running && !done) step()
    }, 60)
    return () => clearTimeout(rafRef.current)
  }, [running, done, i, j])

  const max = Math.max(...arr)
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-1 h-40">
        {arr.map((v, idx) => (
          <div
            key={idx}
            className={`flex-1 rounded-t ${idx === j || idx === j + 1 ? 'bg-accent' : 'bg-muted'}`}
            style={{ height: `${(v / max) * 100}%` }}
          />
        ))}
      </div>
      <p className="text-xs text-muted">Bubble sort. Highlighted bars are being compared/swapped.</p>
      <div className="flex gap-2">
        {!running ? <Button onClick={() => setRunning(true)} disabled={done}><Play className="w-4 h-4" /> {done ? 'Done' : 'Play'}</Button> : <Button onClick={() => setRunning(false)}><Pause className="w-4 h-4" /> Pause</Button>}
        <Button variant="secondary" onClick={reset}><RotateCcw className="w-4 h-4" /> Reset</Button>
      </div>
    </div>
  )
}

// ---------- Ohm's law ----------
function OhmLab() {
  const [v, setV] = useState(12)
  const [r, setR] = useState(4)
  const i = v / r
  const p = v * i
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="text-muted">Current I = V/R: <span className="text-ink">{i.toFixed(2)} A</span></div>
        <div className="text-muted">Power P = VI: <span className="text-ink">{p.toFixed(2)} W</span></div>
      </div>
      <label className="block text-sm text-muted">Voltage V: {v} V <input type="range" min={0} max={24} value={v} onChange={(e) => setV(Number(e.target.value))} className="w-full" /></label>
      <label className="block text-sm text-muted">Resistance R: {r} Ω <input type="range" min={1} max={20} value={r} onChange={(e) => setR(Number(e.target.value))} className="w-full" /></label>
      <p className="text-xs text-muted">Ohm's law: V = I·R. Power P = V·I.</p>
    </div>
  )
}

export default function Lab() {
  return (
    <div className="px-5 pt-6 pb-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Interactive Lab</h1>
      <p className="text-muted">Real interactive visualisations. Adjust sliders and observe.</p>
      <Tabs
        tabs={[
          { id: 'proj', label: 'Projectile' },
          { id: 'spring', label: 'Spring' },
          { id: 'sort', label: 'Sorting' },
          { id: 'ohm', label: 'Ohm\'s law' },
        ]}
      >
        {(active) => (
          <Card>
            {active === 'proj' && <ProjectileLab />}
            {active === 'spring' && <SpringLab />}
            {active === 'sort' && <SortingLab />}
            {active === 'ohm' && <OhmLab />}
          </Card>
        )}
      </Tabs>
    </div>
  )
}
