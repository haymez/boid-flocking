import FlockSettings from './FlockSettings'
import { random } from './math'
import Vector from './Vector'

interface BoidOpts {
  cageWidth: number
  cageHeight: number
  flockSettings: FlockSettings
}

const MAX_FORCE = 0.2
const MAX_SPEED = 4

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

  update(boids: Boid[]): void {
    this.acceleration.mult(0)
    this.flock(boids)

    this.position.add(this.velocity)
    this.velocity.add(this.acceleration).limit(MAX_SPEED)
    this.handleScreenWrap()
  }

  handleScreenWrap(): void {
    if (this.position.x > this.cageWidth) this.position.x = 0
    else if (this.position.x < 0) this.position.x = this.cageWidth

    if (this.position.y > this.cageHeight) this.position.y = 0
    else if (this.position.y < 0) this.position.y = this.cageHeight
  }

  flock(boids: Boid[]): void {
    const alignmentForce = Vector.blank()
    const cohesionForce = Vector.blank()
    const separationForce = Vector.blank()
    let total = 0

    for (const boid of boids) {
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
        .setMagnitude(MAX_SPEED)
        .subtract(this.velocity)
        .limit(MAX_FORCE)

      cohesionForce
        .div(total)
        .subtract(this.position)
        .setMagnitude(MAX_SPEED)
        .subtract(this.velocity)
        .limit(MAX_FORCE)

      separationForce
        .div(total)
        .setMagnitude(MAX_SPEED)
        .subtract(this.velocity)
        .limit(MAX_FORCE)
    }

    this.acceleration
      .add(alignmentForce)
      .add(cohesionForce)
      .add(separationForce)
  }
}
