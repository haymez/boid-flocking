import Vector from './Vector'

export default class Rectangle {
  topLeft: Vector
  bottomRight: Vector

  constructor(topLeft: Vector, bottomRight: Vector) {
    this.topLeft = topLeft
    this.bottomRight = bottomRight
  }

  contains(point: Vector): boolean {
    return (
      point.x >= this.topLeft.x &&
      point.x <= this.bottomRight.x &&
      point.y >= this.topLeft.y &&
      point.y <= this.bottomRight.y
    )
  }

  intersects(rectangle: Rectangle): boolean {
    return !(
      rectangle.bottomRight.x < this.topLeft.x ||
      rectangle.topLeft.x > this.bottomRight.x ||
      rectangle.bottomRight.y < this.topLeft.y ||
      rectangle.topLeft.y > this.bottomRight.y
    )
  }
}
