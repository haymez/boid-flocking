interface FlockSettingsOpts {
  localRadius: number
}

export default class FlockSettings {
  localRadius: number

  constructor({ localRadius }: FlockSettingsOpts) {
    this.localRadius = localRadius
  }
}
