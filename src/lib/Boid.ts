import { random } from './math'
import Vector from './Vector'

export default class Boid {
  cageWidth: number
  cageHeight: number
  position: Vector
  velocity: Vector
  acceleration: Vector

  constructor(cageWidth: number, cageHeight: number) {
    this.cageWidth = cageWidth
    this.cageHeight = cageHeight
    // this.position = new Vector(cageWidth / 2, cageHeight / 2)
    this.position = new Vector(random(0, cageWidth), random(0, cageHeight))
    this.velocity = Vector.random()
    this.acceleration = Vector.blank()
  }

  update(): void {
    this.position.add(this.velocity)
    this.velocity.add(this.acceleration)

    this.handleScreenWrap()
  }

  handleScreenWrap(): void {
    if (this.position.x >= this.cageWidth) this.position.x = 0
    else if (this.position.x <= 0) this.position.x = this.cageWidth

    if (this.position.y >= this.cageHeight) this.position.y = 0
    else if (this.position.y <= 0) this.position.y = this.cageHeight
  }
}
