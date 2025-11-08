import * as CANNON from 'cannon-es'

/**
 * Physics class manages the cannon-es physics world and simulation step
 */
export class Physics {
  public world: CANNON.World
  private fixedTimeStep: number = 1 / 60 // 60 FPS physics
  private maxSubSteps: number = 3

  constructor() {
    // Initialize physics world
    this.world = new CANNON.World()
    
    // Set gravity (m/s²)
    this.world.gravity.set(0, -9.82, 0)
    
    // Improve solver performance and stability
    this.world.broadphase = new CANNON.SAPBroadphase(this.world)
    this.world.defaultContactMaterial.friction = 0.3
    this.world.defaultContactMaterial.restitution = 0.2
    
    // Allow objects to sleep when not moving (performance optimization)
    this.world.allowSleep = true
  }

  /**
   * Step the physics simulation forward
   * @param deltaTime Time elapsed since last frame (seconds)
   */
  public step(deltaTime: number): void {
    // Use fixed time step for stable physics
    this.world.step(this.fixedTimeStep, deltaTime, this.maxSubSteps)
  }

  /**
   * Add a physics body to the world
   */
  public addBody(body: CANNON.Body): void {
    this.world.addBody(body)
  }

  /**
   * Remove a physics body from the world
   */
  public removeBody(body: CANNON.Body): void {
    this.world.removeBody(body)
  }

  /**
   * Create ground contact material (for vehicle-ground interaction)
   */
  public createGroundMaterial(): CANNON.Material {
    const groundMaterial = new CANNON.Material('ground')
    
    // Define contact material between default and ground
    const groundContactMaterial = new CANNON.ContactMaterial(
      this.world.defaultMaterial,
      groundMaterial,
      {
        friction: 0.8,
        restitution: 0.1,
      }
    )
    
    this.world.addContactMaterial(groundContactMaterial)
    return groundMaterial
  }
}
