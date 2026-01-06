import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { CheckedState } from '@radix-ui/react-checkbox'
import usePrevious from 'hooks/usePrevious'
import Boid from 'lib/Boid'
import FlockSettings from 'lib/FlockSettings'
import Node from 'lib/Node'
import QuadTree from 'lib/QuadTree'
import Vector from 'lib/Vector'
import { CSSProperties, useEffect, useRef, useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import { LucideArrowUpDown } from 'lucide-react'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
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
  const [boidCount, setBoidCount] = useState(300)
  const [quadTreeLimit, setQuadTreeLimit] = useState(10)
  const [localRadius, setLocalRadius] = useState(50)
  const [alignment, setAlignment] = useState(1)
  const [cohesion, setCohesion] = useState(1)
  const [separation, setSeparation] = useState(1)
  const [maxForce, setMaxForce] = useState(0.2)
  const [maxSpeed, setMaxSpeed] = useState(5)
  const [fps, setFps] = useState(0)
  const [paused, setPaused] = useState(false)
  const [visualizeQtree, setVisualizeQtree] = useState(false)
  const prevBoidCount = usePrevious(boidCount)

  // Functions
  const drawTriangle = (ctx: CanvasRenderingContext2D, boid: Boid): void => {
    const triangleHeight = 8
    const triangleWidth = 3
    const angle = boid.velocity.angle()
    const flipTriangle = boid.velocity.x < 0 ? -1 : 1
    const topPoint = new Vector(
      Math.cos(angle) * triangleHeight * flipTriangle,
      Math.sin(angle) * triangleHeight * flipTriangle,
    ).add(boid.position)
    const leftAngle = angle - 0.5 * Math.PI
    const leftPoint = new Vector(
      Math.cos(leftAngle) * (triangleWidth / 2),
      Math.sin(leftAngle) * (triangleWidth / 2),
    ).add(boid.position)
    const rightAngle = angle + 0.5 * Math.PI
    const rightPoint = new Vector(
      Math.cos(rightAngle) * (triangleWidth / 2),
      Math.sin(rightAngle) * (triangleWidth / 2),
    ).add(boid.position)

    ctx.beginPath()
    ctx.moveTo(leftPoint.x, leftPoint.y)
    ctx.lineTo(topPoint.x, topPoint.y)
    ctx.lineTo(rightPoint.x, rightPoint.y)
    ctx.closePath()
    ctx.fill()
  }

  const drawQtree = (ctx: CanvasRenderingContext2D, qtree: QuadTree<Boid>) => {
    if (!visualizeQtree) return

    ctx.beginPath()
    ctx.moveTo(qtree.boundary.topLeft.x, qtree.boundary.topLeft.y)
    ctx.lineTo(qtree.boundary.bottomRight.x, qtree.boundary.topLeft.y)
    ctx.lineTo(qtree.boundary.bottomRight.x, qtree.boundary.bottomRight.y)
    ctx.lineTo(qtree.boundary.topLeft.x, qtree.boundary.bottomRight.y)
    ctx.closePath()
    ctx.stroke()

    if (qtree.northWest) drawQtree(ctx, qtree.northWest)
    if (qtree.northEast) drawQtree(ctx, qtree.northEast)
    if (qtree.southWest) drawQtree(ctx, qtree.southWest)
    if (qtree.southEast) drawQtree(ctx, qtree.southEast)
  }

  const drawStuff = (ctx: CanvasRenderingContext2D) => {
    gensRef.current += 1

    if (!paused) {
      const qTree = new QuadTree<Boid>(
        new Vector(0, 0),
        new Vector(canvasWidth, canvasHeight),
        quadTreeLimit,
      )
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      for (const boid of boidsRef.current) {
        qTree.insert(new Node(boid.position, boid))
      }

      drawQtree(ctx, qTree)

      for (const boid of boidsRef.current) {
        drawTriangle(ctx, boid)
        boid.update(qTree)
      }
    }

    animationRef.current = requestAnimationFrame(() => {
      drawStuff(ctx)
    })
  }

  const handleSliderChange =
    (setValue: (value: number) => void) => (values: number[]) => {
      setValue(values[0])

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
    const boidCountChanged = prevBoidCount !== boidCount

    if (boidsRef.current.length === 0 || boidCountChanged) {
      boidsRef.current = []
      flockSettingsRef.current = new FlockSettings({
        localRadius,
        alignment,
        cohesion,
        separation,
        maxForce,
        maxSpeed,
      })

      for (let i = 0; i < boidCount; i++) {
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
  }, [paused, visualizeQtree, boidCount, quadTreeLimit])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      <canvas
        className="absolute inset-0"
        ref={canvasRef}
        width={canvasWidth * 2}
        height={canvasHeight * 2}
        style={style}
      />
      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
        fps: {fps}
      </div>
      <Collapsible
        open={menuOpen}
        onOpenChange={setMenuOpen}
        className="absolute top-10 right-2 z-10 flex flex-col items-end"
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 mb-2">
            Settings
            <Button variant="ghost" aria-label="Settings" size="icon">
              <LucideArrowUpDown />
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="bg-card border border-border rounded-lg p-4 shadow-lg min-w-[280px] space-y-4">
            <div className="text-lg font-semibold text-center mb-2">
              Controls
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Boid count: {boidCount}</Label>
              <Slider
                aria-label="Boid count slider"
                min={1}
                max={2000}
                step={1}
                value={[boidCount]}
                onValueChange={handleSliderChange(setBoidCount)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">
                Quad Tree Limit: {quadTreeLimit}
              </Label>
              <Slider
                aria-label="Quad tree limit slider"
                min={1}
                max={100}
                step={1}
                value={[quadTreeLimit]}
                onValueChange={handleSliderChange(setQuadTreeLimit)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">
                Perception Radius: {localRadius}
              </Label>
              <Slider
                aria-label="Local radius slider"
                min={1}
                max={200}
                step={1}
                value={[localRadius]}
                onValueChange={handleSliderChange(setLocalRadius)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Max Force: {maxForce}</Label>
              <Slider
                aria-label="Max force slider"
                min={0}
                max={10}
                step={0.1}
                value={[maxForce]}
                onValueChange={handleSliderChange(setMaxForce)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Max Speed: {maxSpeed}</Label>
              <Slider
                aria-label="Max speed slider"
                min={0}
                max={20}
                step={0.5}
                value={[maxSpeed]}
                onValueChange={handleSliderChange(setMaxSpeed)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Alignment: {alignment}</Label>
              <Slider
                aria-label="Alignment slider"
                min={0}
                max={1}
                step={0.01}
                value={[alignment]}
                onValueChange={handleSliderChange(setAlignment)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Cohesion: {cohesion}</Label>
              <Slider
                aria-label="Cohesion slider"
                min={0}
                max={1}
                step={0.01}
                value={[cohesion]}
                onValueChange={handleSliderChange(setCohesion)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Separation: {separation}</Label>
              <Slider
                aria-label="Separation slider"
                min={0}
                max={1}
                step={0.01}
                value={[separation]}
                onValueChange={handleSliderChange(setSeparation)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                aria-label="Visualize quadtree checkbox"
                id="visualize-qtree"
                checked={visualizeQtree}
                onCheckedChange={(checked: CheckedState) =>
                  setVisualizeQtree(!!checked)
                }
              />
              <Label
                htmlFor="visualize-qtree"
                className="text-sm cursor-pointer"
              >
                Visualize Quad Tree
              </Label>
            </div>
            <Button
              aria-label="Play pause toggle"
              onClick={() => setPaused(!paused)}
              className="w-full"
            >
              {paused ? 'Play' : 'Pause'}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default App
