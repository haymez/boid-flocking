import { random } from './math'

export default class Vector {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  add = (vector: Vector): Vector => {
    this.x += vector.x
    this.y += vector.y

    return this
  }

  subtract = (vector: Vector): Vector => {
    this.x -= vector.x
    this.y -= vector.y

    return this
  }

  mult = (value: number): Vector => {
    this.x *= value
    this.y *= value

    return this
  }

  div = (value: number): Vector => {
    this.x /= value
    this.y /= value

    return this
  }

  setMagnitude = (magnitude: number): Vector => {
    return this.div(this.magnitude()).mult(magnitude)
  }

  limit = (magnitude: number): Vector => {
    const currMagnitude = this.magnitude()

    if (currMagnitude <= magnitude) return this

    return this.div(currMagnitude).mult(magnitude)
  }

  distanceFrom(vector: Vector): number {
    return Vector.from(this).subtract(vector).magnitude()
  }

  magnitude(): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
  }

  static blank(): Vector {
    return new Vector(0, 0)
  }

  static from(vector: Vector): Vector {
    return new Vector(vector.x, vector.y)
  }

  static random(): Vector {
    const angle = Math.random() * 2 * Math.PI
    const x = 1 * Math.cos(angle)
    const y = 1 * Math.sin(angle)

    return new Vector(x, y)
  }
}
