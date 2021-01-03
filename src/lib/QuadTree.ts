import Vector from './Vector'
import Node from './Node'
import Rectangle from './Rectangle'

export default class QuadTree<T> {
  boundary: Rectangle
  nodes: Node<T>[]
  limit: number
  northWest: QuadTree<T> | null = null
  northEast: QuadTree<T> | null = null
  southWest: QuadTree<T> | null = null
  southEast: QuadTree<T> | null = null

  constructor(topLeft: Vector, bottomRight: Vector, limit: number) {
    this.boundary = new Rectangle(topLeft, bottomRight)
    this.nodes = []
    this.limit = limit
  }

  insert(node: Node<T>): void {
    if (!this.inBoundary(node.point)) return

    const { point } = node
    const quadWidth = this.boundary.bottomRight.x - this.boundary.topLeft.x
    const quadHeight = this.boundary.bottomRight.y - this.boundary.topLeft.y

    if (quadWidth <= 1 || quadHeight <= 1 || this.nodes.length < this.limit) {
      this.nodes.push(node)

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
            this.limit,
          )
        }

        this.northWest.insert(node)
      } else {
        if (this.southWest === null) {
          this.southWest = new QuadTree(
            new Vector(this.boundary.topLeft.x, midY),
            new Vector(midX, this.boundary.bottomRight.y),
            this.limit,
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
            this.limit,
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
            this.limit,
          )
        }

        this.southEast.insert(node)
      }
    }
  }

  nodesInBound(boundary: Rectangle): Node<T>[] {
    if (!boundary.intersects(this.boundary)) return []

    const nodes: Node<T>[] = this.nodes

    const nw = this.northWest?.nodesInBound(boundary) || []
    const ne = this.northEast?.nodesInBound(boundary) || []
    const sw = this.southWest?.nodesInBound(boundary) || []
    const se = this.southEast?.nodesInBound(boundary) || []

    return nodes.concat(nw).concat(ne).concat(sw).concat(se)
  }

  inBoundary(point: Vector): boolean {
    return this.boundary.contains(point)
  }
}
