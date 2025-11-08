import './style.css'
import * as THREE from 'three'
import { Renderer } from './engine/Renderer'
import { Physics } from './engine/Physics'
import { Track } from './scenes/Track'
import { Vehicle } from './entities/Vehicle'
import { HUD } from './ui/HUD'

/**
 * Main game class - orchestrates the entire game loop
 */
class Game {
  private renderer: Renderer
  private physics: Physics
  private track: Track
  private vehicle: Vehicle
  private hud: HUD

  // Keyboard state
  private keys: { [key: string]: boolean } = {}

  // Timing
  private lastTime: number = 0

  constructor() {
    // Get canvas element
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
    if (!canvas) {
      throw new Error('Canvas element not found')
    }

    // Initialize core systems
    this.renderer = new Renderer(canvas)
    this.physics = new Physics()
    
    // Create ground material for vehicle physics
    const groundMaterial = this.physics.createGroundMaterial()
    
    // Setup track and spawn vehicle
    this.track = new Track(this.renderer.scene, this.physics.world, groundMaterial)
    this.vehicle = this.track.spawnPlayerVehicle()
    
    // Initialize HUD
    this.hud = new HUD()

    // Setup controls
    this.setupControls()

    // Start game loop
    this.lastTime = performance.now()
    this.gameLoop()
  }

  /**
   * Setup keyboard controls
   */
  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true
    })

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false
    })
  }

  /**
   * Process user input and update vehicle controls
   */
  private processInput(): void {
    // Throttle (W = forward, S = reverse)
    let throttle = 0
    if (this.keys['w'] || this.keys['arrowup']) {
      throttle = 1
    } else if (this.keys['s'] || this.keys['arrowdown']) {
      throttle = -1
    }
    this.vehicle.setThrottle(throttle)

    // Steering (A = left, D = right)
    let steering = 0
    if (this.keys['a'] || this.keys['arrowleft']) {
      steering = -1
    } else if (this.keys['d'] || this.keys['arrowright']) {
      steering = 1
    }
    this.vehicle.setSteering(steering)

    // Brake (Space)
    const brake = this.keys[' '] ? 1 : 0
    this.vehicle.setBrake(brake)
  }

  /**
   * Main game loop
   */
  private gameLoop = (): void => {
    requestAnimationFrame(this.gameLoop)

    // Calculate delta time
    const currentTime = performance.now()
    const deltaTime = (currentTime - this.lastTime) / 1000 // Convert to seconds
    this.lastTime = currentTime

    // Cap delta time to prevent physics explosions
    const clampedDeltaTime = Math.min(deltaTime, 0.1)

    // Process input
    this.processInput()

    // Update physics
    this.vehicle.updatePhysics()
    this.physics.step(clampedDeltaTime)

    // Sync visuals with physics
    this.vehicle.sync()

    // Update camera to follow vehicle
    const vehiclePos = this.vehicle.getPosition()
    const cameraOffset = new THREE.Vector3(0, 8, 15)
    this.renderer.updateCamera(vehiclePos, cameraOffset)

    // Update HUD
    this.hud.updateSpeed(this.vehicle.getSpeedKmh())

    // Render frame
    this.renderer.render()
  }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
  new Game()
})
