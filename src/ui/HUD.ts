/**
 * HUD class manages the in-game heads-up display
 */
export class HUD {
  private hudRoot: HTMLElement
  private speedElement: HTMLElement

  constructor() {
    this.hudRoot = document.getElementById('hud-root')!
    
    // Create speed display
    this.speedElement = document.createElement('div')
    this.speedElement.className = 'speed-display'
    this.speedElement.textContent = 'Speed: 0 km/h'
    this.hudRoot.appendChild(this.speedElement)
  }

  /**
   * Update speed display
   * @param speedKmh Current speed in km/h
   */
  public updateSpeed(speedKmh: number): void {
    this.speedElement.textContent = `Speed: ${Math.round(speedKmh)} km/h`
  }

  /**
   * Add additional HUD elements in the future
   * - Lap time
   * - Current gear
   * - Position
   * - Minimap
   */
}
