interface FlockSettingsOpts {
  localRadius: number
  alignment: number
  cohesion: number
  separation: number
  maxForce: number
  maxSpeed: number
}

export default class FlockSettings {
  localRadius: number
  alignment: number
  cohesion: number
  separation: number
  maxForce: number
  maxSpeed: number

  constructor({
    localRadius,
    alignment,
    cohesion,
    separation,
    maxForce,
    maxSpeed,
  }: FlockSettingsOpts) {
    this.localRadius = localRadius
    this.alignment = alignment
    this.cohesion = cohesion
    this.separation = separation
    this.maxForce = maxForce
    this.maxSpeed = maxSpeed
  }

  update({
    localRadius,
    alignment,
    cohesion,
    separation,
    maxForce,
    maxSpeed,
  }: FlockSettingsOpts): void {
    this.localRadius = localRadius
    this.alignment = alignment
    this.cohesion = cohesion
    this.separation = separation
    this.maxForce = maxForce
    this.maxSpeed = maxSpeed
  }
}
