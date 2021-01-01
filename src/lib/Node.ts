import Vector from './Vector'

export default class Node<T> {
  point: Vector
  data: T

  constructor(point: Vector, data: T) {
    this.point = point
    this.data = data
  }
}
