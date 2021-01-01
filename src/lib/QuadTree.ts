import Vector from './Vector'
import Node from './Node'
import Rectangle from './Rectangle'

const ID = { curr: 0 }

export default class QuadTree<T> {
  boundary: Rectangle
  node: Node<T> | null = null

  northWest: QuadTree<T> | null = null
  northEast: QuadTree<T> | null = null
  southWest: QuadTree<T> | null = null
  southEast: QuadTree<T> | null = null
  id: number

  constructor(topLeft: Vector, bottomRight: Vector) {
    this.boundary = new Rectangle(topLeft, bottomRight)
    this.id = ID.curr++
  }

  insert(node: Node<T>): void {
    if (node === null) return
    if (!this.inBoundary(node.point)) return

    const { point } = node
    const quadWidth = this.boundary.bottomRight.x - this.boundary.topLeft.x
    const quadHeight = this.boundary.bottomRight.y - this.boundary.topLeft.y

    if (quadWidth <= 1 || quadHeight <= 1) {
      if (this.node === null) this.node = node

      return
    }

    const midX = (this.boundary.topLeft.x + this.boundary.bottomRight.x) / 2
    const midY = (this.boundary.topLeft.y + this.boundary.bottomRight.y) / 2

    if (point.x <= midX) {
      if (point.y <= midY) {
        if (this.northWest === null) {
          this.northWest = new QuadTree(
            new Vector(this.boundary.topLeft.x, this.boundary.topLeft.y),
            new Vector(midX, midY),
          )
        }

        this.northWest.insert(node)
      } else {
        if (this.southWest === null) {
          this.southWest = new QuadTree(
            new Vector(this.boundary.topLeft.x, midY),
            new Vector(midX, this.boundary.bottomRight.y),
          )
        }

        this.southWest.insert(node)
      }
    } else {
      if (point.y <= midY) {
        if (this.northEast === null) {
          this.northEast = new QuadTree(
            new Vector(midX, this.boundary.topLeft.y),
            new Vector(this.boundary.bottomRight.x, midY),
          )
        }

        this.northEast.insert(node)
      } else {
        if (this.southEast === null) {
          this.southEast = new QuadTree(
            new Vector(midX, midY),
            new Vector(
              this.boundary.bottomRight.x,
              this.boundary.bottomRight.y,
            ),
          )
        }

        this.southEast.insert(node)
      }
    }
  }

  search(point: Vector): Node<T> | null {
    if (!this.inBoundary(point)) return null
    if (this.node !== null) return this.node

    const midX = (this.boundary.topLeft.x + this.boundary.bottomRight.x) / 2
    const midY = (this.boundary.topLeft.y + this.boundary.bottomRight.y) / 2

    if (point.x <= midX) {
      if (point.y <= midY) {
        if (this.northWest === null) return null

        return this.northWest.search(point)
      } else {
        if (this.southWest === null) return null

        return this.southWest.search(point)
      }
    } else {
      if (point.y <= midY) {
        if (this.northEast === null) return null

        return this.northEast.search(point)
      } else {
        if (this.southEast === null) return null

        return this.southEast.search(point)
      }
    }
  }

  nodesInBound(boundary: Rectangle): T[] {
    if (!boundary.intersects(this.boundary)) return []

    if (this.node) return [this.node.data]

    const nw = this.northWest?.nodesInBound(boundary) || []
    const ne = this.northEast?.nodesInBound(boundary) || []
    const sw = this.southWest?.nodesInBound(boundary) || []
    const se = this.southEast?.nodesInBound(boundary) || []

    return nw.concat(ne).concat(sw).concat(se)
  }

  inBoundary(point: Vector): boolean {
    return this.boundary.contains(point)
  }
}
