import Button from 'components/Button'
import Boid from 'lib/Boid'
import FlockSettings from 'lib/FlockSettings'
import React, {
  ChangeEvent,
  CSSProperties,
  FC,
  useEffect,
  useRef,
  useState,
} from 'react'

const css = require('./styles.scss')

const App: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const fpsIntervalRef = useRef<number>()
  const gensRef = useRef(0)
  const lastFpsGensRef = useRef(0)
  const canvasWidth = window.innerWidth
  const canvasHeight = window.innerHeight
  const style: CSSProperties = {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
  }
  const boidsRef = useRef<Boid[]>([])
  const flockSettingsRef = useRef<FlockSettings>()
  const [localRadius, setLocalRadius] = useState(50)
  const [alignment, setAlignment] = useState(1)
  const [cohesion, setCohesion] = useState(1)
  const [separation, setSeparation] = useState(1)
  const [maxForce, setMaxForce] = useState(0.2)
  const [maxSpeed, setMaxSpeed] = useState(5)
  const [fps, setFps] = useState(0)
  const [paused, setPaused] = useState(false)

  // Functions
  const drawStuff = (ctx: CanvasRenderingContext2D) => {
    gensRef.current += 1

    if (!paused) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      for (const boid of boidsRef.current) {
        // Circle
        ctx.beginPath()
        ctx.arc(boid.position.x, boid.position.y, 1, 0, 2 * Math.PI)
        ctx.fill()

        // const angle = boid.velocity.angle()
        // ctx.beginPath()
        // ctx.moveTo(boid.position.x, boid.position.y)
        // ctx.lineTo(boid.position.x - 2, boid.position.y)
        // ctx.lineTo(boid.position.x, boid.position.y + 6)
        // ctx.lineTo(boid.position.x + 2, boid.position.y)
        // ctx.closePath()
        // ctx.fill()

        boid.update(boidsRef.current)
      }
    }

    animationRef.current = requestAnimationFrame(() => {
      drawStuff(ctx)
    })
  }

  const handleChange = (setValue: (value: number) => void) => (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setValue(Number(e.target.value))

    flockSettingsRef.current?.update({
      localRadius,
      alignment,
      cohesion,
      separation,
      maxForce,
      maxSpeed,
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (boidsRef.current.length === 0) {
      flockSettingsRef.current = new FlockSettings({
        localRadius,
        alignment,
        cohesion,
        separation,
        maxForce,
        maxSpeed,
      })

      for (let i = 0; i < 300; i++) {
        boidsRef.current.push(
          new Boid({
            cageWidth: canvasWidth,
            cageHeight: canvasHeight,
            flockSettings: flockSettingsRef.current,
          }),
        )
      }
    }

    if (!canvas || !ctx) return

    ctx.resetTransform()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.scale(2, 2)

    animationRef.current = requestAnimationFrame(() => {
      drawStuff(ctx)
    })

    fpsIntervalRef.current = window.setInterval(() => {
      const framesSinceLastCheck = gensRef.current - lastFpsGensRef.current
      const newFps = framesSinceLastCheck / 0.5
      lastFpsGensRef.current = gensRef.current
      setFps(newFps)
    }, 500)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (fpsIntervalRef.current) clearInterval(fpsIntervalRef.current)
    }
  }, [paused])

  return (
    <div className={css.container}>
      <canvas
        className={css.canvas}
        ref={canvasRef}
        width={canvasWidth * 2}
        height={canvasHeight * 2}
        style={style}
      />
      <div className={css.controlRoomContainer}>
        <div className={css.controlRoomWrapper}>
          <div className={css.fps}>fps: {fps}</div>
          <div className={css.title}>Controls</div>
          <div className={css.rangeContainer}>
            <div className={css.label}>Perception Radius: {localRadius}</div>
            <input
              className={css.slider}
              min={1}
              max={200}
              type="range"
              step="1"
              value={localRadius}
              onChange={handleChange(setLocalRadius)}
            />
          </div>
          <div className={css.rangeContainer}>
            <div className={css.label}>Max Force: {maxForce}</div>
            <input
              className={css.slider}
              min={0}
              max={10}
              type="range"
              step="0.1"
              value={maxForce}
              onChange={handleChange(setMaxForce)}
            />
          </div>
          <div className={css.rangeContainer}>
            <div className={css.label}>Max Speed: {maxSpeed}</div>
            <input
              className={css.slider}
              min={0}
              max={20}
              type="range"
              step="0.5"
              value={maxSpeed}
              onChange={handleChange(setMaxSpeed)}
            />
          </div>
          <div className={css.rangeContainer}>
            <div className={css.label}>Alignment: {alignment}</div>
            <input
              className={css.slider}
              min={0}
              max={1}
              type="range"
              step="0.01"
              value={alignment}
              onChange={handleChange(setAlignment)}
            />
          </div>
          <div className={css.rangeContainer}>
            <div className={css.label}>Cohesion: {cohesion}</div>
            <input
              className={css.slider}
              min={0}
              max={1}
              type="range"
              step="0.01"
              value={cohesion}
              onChange={handleChange(setCohesion)}
            />
          </div>
          <div className={css.rangeContainer}>
            <div className={css.label}>Separation: {separation}</div>
            <input
              className={css.slider}
              min={0}
              max={1}
              type="range"
              step="0.01"
              value={separation}
              onChange={handleChange(setSeparation)}
            />
          </div>
          <Button onClick={() => setPaused(!paused)}>
            {paused ? 'Play' : 'Pause'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App
