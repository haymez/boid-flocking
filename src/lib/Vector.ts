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

  static blank(): Vector {
    return new Vector(0, 0)
  }

  static random(): Vector {
    const angle = Math.random() * 2 * Math.PI
    const magnitude = 1
    const x = magnitude * Math.cos(angle)
    const y = magnitude * Math.sin(angle)

    return new Vector(x, y)
  }
}
