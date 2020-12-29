import Boid from 'lib/Boid'
import React, { CSSProperties, FC, useEffect, useRef } from 'react'

const css = require('./styles.scss')

const App: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const canvasWidth = window.innerWidth
  const canvasHeight = window.innerHeight
  const style: CSSProperties = {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
  }
  const boidsRef = useRef<Boid[]>([])

  // Functions
  const drawStuff = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    for (const boid of boidsRef.current) {
      ctx.beginPath()
      ctx.arc(boid.position.x, boid.position.y, 8, 0, 2 * Math.PI)

      boid.update()
      ctx.fill()
    }

    animationRef.current = requestAnimationFrame(() => {
      drawStuff(ctx)
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    boidsRef.current = []

    for (let i = 0; i < 100; i++) {
      boidsRef.current.push(new Boid(canvasWidth, canvasHeight))
    }

    if (!canvas || !ctx) return

    ctx.resetTransform()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.scale(2, 2)

    animationRef.current = requestAnimationFrame(() => {
      drawStuff(ctx)
    })
  }, [])

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
        <div>Controls</div>
      </div>
    </div>
  )
}

export default App
