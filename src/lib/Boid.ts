import FlockSettings from './FlockSettings'
import { random } from './math'
import QuadTree from './QuadTree'
import Rectangle from './Rectangle'
import Vector from './Vector'

interface BoidOpts {
  cageWidth: number
  cageHeight: number
  flockSettings: FlockSettings
}

export default class Boid {
  cageWidth: number
  cageHeight: number
  position: Vector
  velocity: Vector
  acceleration: Vector
  flockSettings: FlockSettings

  constructor({ cageWidth, cageHeight, flockSettings }: BoidOpts) {
    this.cageWidth = cageWidth
    this.cageHeight = cageHeight
    this.position = new Vector(random(0, cageWidth), random(0, cageHeight))
    this.velocity = Vector.random()
    this.acceleration = Vector.blank()
    this.flockSettings = flockSettings
  }

  update(quadTree: QuadTree<Boid>): void {
    this.acceleration.mult(0)
    this.flock(quadTree)

    this.position.add(this.velocity)
    this.velocity.add(this.acceleration).limit(this.flockSettings.maxSpeed)
    this.handleScreenWrap()
  }

  handleScreenWrap(): void {
    if (this.position.x > this.cageWidth) this.position.x = 0
    else if (this.position.x < 0) this.position.x = this.cageWidth

    if (this.position.y > this.cageHeight) this.position.y = 0
    else if (this.position.y < 0) this.position.y = this.cageHeight
  }

  flock(quadTree: QuadTree<Boid>): void {
    const alignmentForce = Vector.blank()
    const cohesionForce = Vector.blank()
    const separationForce = Vector.blank()
    let total = 0
    const radius = this.flockSettings.localRadius / 2
    const perceptionRadius = new Vector(radius, radius)
    const perceptionRect = new Rectangle(
      Vector.from(this.position).subtract(perceptionRadius),
      Vector.from(this.position).add(perceptionRadius),
    )

    const nodes = quadTree.nodesInBound(perceptionRect)
    for (const node of nodes) {
      const boid = node.data
      const distance = boid.position.distanceFrom(this.position)
      const withinLocalRadius = distance <= this.flockSettings.localRadius
      const notThisBoid = boid !== this

      if (withinLocalRadius && notThisBoid) {
        const separationDiff = Vector.from(this.position).subtract(
          boid.position,
        )

        if (distance !== 0) separationDiff.div(distance)
        else separationDiff.mult(Infinity)

        total++
        alignmentForce.add(boid.velocity)
        cohesionForce.add(boid.position)

        separationForce.add(separationDiff)
      }
    }

    if (total > 0) {
      alignmentForce
        .div(total)
        .setMagnitude(this.flockSettings.maxSpeed)
        .subtract(this.velocity)
        .limit(this.flockSettings.maxForce)

      cohesionForce
        .div(total)
        .subtract(this.position)
        .setMagnitude(this.flockSettings.maxSpeed)
        .subtract(this.velocity)
        .limit(this.flockSettings.maxForce)

      separationForce
        .div(total)
        .setMagnitude(this.flockSettings.maxSpeed)
        .subtract(this.velocity)
        .limit(this.flockSettings.maxForce)
    }

    this.acceleration
      .add(alignmentForce.mult(this.flockSettings.alignment))
      .add(cohesionForce.mult(this.flockSettings.cohesion))
      .add(separationForce.mult(this.flockSettings.separation))
  }
}
