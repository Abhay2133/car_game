import * as THREE from 'three'
import * as CANNON from 'cannon-es'

interface WheelInfo {
  position: CANNON.Vec3
  raycast: CANNON.RaycastResult
  suspensionLength: number
  mesh: THREE.Mesh
}

/**
 * Vehicle class implementing a raycast-based suspension system
 * Each wheel uses a raycast downward to simulate suspension springs
 */
export class Vehicle {
  // Physics body
  public body: CANNON.Body
  
  // Visual mesh
  public mesh: THREE.Group
  
  // Wheel configuration
  private wheels: WheelInfo[] = []
  private wheelBase: number = 2.0 // Distance between front and rear axles
  private wheelTrack: number = 1.5 // Distance between left and right wheels
  
  // Suspension parameters
  private suspensionRestLength: number = 0.4
  private suspensionStiffness: number = 30
  private suspensionDamping: number = 2.5
  private suspensionTravel: number = 0.3
  
  // Control inputs
  private throttleInput: number = 0
  private steerInput: number = 0
  private brakeInput: number = 0
  
  // Vehicle parameters
  private maxEngineForce: number = 1500
  private maxBrakeForce: number = 100
  private maxSteerAngle: number = 0.5 // radians (~28 degrees)
  
  // Wheel friction
  private lateralFriction: number = 2.0
  
  private physics: CANNON.World

  constructor(physics: CANNON.World, scene: THREE.Scene, position: CANNON.Vec3) {
    this.physics = physics

    // Create physics body (box representing car chassis)
    const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2))
    this.body = new CANNON.Body({
      mass: 800, // kg
      position: position,
      shape: chassisShape,
      linearDamping: 0.1,
      angularDamping: 0.3
    })
    physics.addBody(this.body)

    // Create visual mesh group
    this.mesh = new THREE.Group()
    
    // Chassis mesh
    const chassisGeometry = new THREE.BoxGeometry(2, 1, 4)
    const chassisMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      metalness: 0.6,
      roughness: 0.4
    })
    const chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial)
    chassisMesh.castShadow = true
    chassisMesh.receiveShadow = true
    this.mesh.add(chassisMesh)

    scene.add(this.mesh)

    // Setup wheels
    this.setupWheels(scene)
  }

  /**
   * Initialize wheel positions and visual meshes
   */
  private setupWheels(_scene: THREE.Scene): void {
    const wheelRadius = 0.4
    const wheelWidth = 0.3

    // Define wheel positions relative to chassis center
    const wheelPositions = [
      new CANNON.Vec3(-this.wheelTrack / 2, -this.suspensionRestLength, this.wheelBase / 2),   // Front-left
      new CANNON.Vec3(this.wheelTrack / 2, -this.suspensionRestLength, this.wheelBase / 2),    // Front-right
      new CANNON.Vec3(-this.wheelTrack / 2, -this.suspensionRestLength, -this.wheelBase / 2),  // Rear-left
      new CANNON.Vec3(this.wheelTrack / 2, -this.suspensionRestLength, -this.wheelBase / 2)    // Rear-right
    ]

    wheelPositions.forEach((pos) => {
      // Create wheel visual mesh
      const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16)
      const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
      const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheelMesh.rotation.z = Math.PI / 2 // Rotate to correct orientation
      wheelMesh.castShadow = true
      this.mesh.add(wheelMesh)

      // Store wheel info
      this.wheels.push({
        position: pos.clone(),
        raycast: new CANNON.RaycastResult(),
        suspensionLength: this.suspensionRestLength,
        mesh: wheelMesh
      })
    })
  }

  /**
   * Set throttle input (-1 to 1, where 1 is full forward)
   */
  public setThrottle(value: number): void {
    this.throttleInput = Math.max(-1, Math.min(1, value))
  }

  /**
   * Set steering input (-1 to 1, where -1 is full left)
   */
  public setSteering(value: number): void {
    this.steerInput = Math.max(-1, Math.min(1, value))
  }

  /**
   * Set brake input (0 to 1, where 1 is full brake)
   */
  public setBrake(value: number): void {
    this.brakeInput = Math.max(0, Math.min(1, value))
  }

  /**
   * Update physics simulation for this vehicle
   * Performs raycasts for suspension and applies forces
   */
  public updatePhysics(): void {
    // Calculate steering angle for front wheels
    const steerAngle = this.steerInput * this.maxSteerAngle

    // Process each wheel
    this.wheels.forEach((wheel, index) => {
      const isFrontWheel = index < 2

      // Perform raycast from wheel position downward
      const rayStart = new CANNON.Vec3()
      this.body.pointToWorldFrame(wheel.position, rayStart)
      
      const rayEnd = new CANNON.Vec3()
      const rayDirection = new CANNON.Vec3(0, -1, 0)
      this.body.vectorToWorldFrame(rayDirection, rayDirection)
      rayEnd.copy(rayStart).vadd(rayDirection.scale(this.suspensionRestLength + this.suspensionTravel))

      // Cast ray to detect ground
      this.physics.raycastClosest(rayStart, rayEnd, {}, wheel.raycast)

      if (wheel.raycast.hasHit) {
        // Calculate suspension compression
        const hitDistance = wheel.raycast.distance
        wheel.suspensionLength = hitDistance
        const compression = this.suspensionRestLength - hitDistance
        
        // Apply suspension force (spring + damper)
        const suspensionForce = compression * this.suspensionStiffness
        
        // Calculate suspension velocity for damping
        const wheelWorldPos = new CANNON.Vec3()
        this.body.pointToWorldFrame(wheel.position, wheelWorldPos)
        const wheelVelocity = this.body.getVelocityAtWorldPoint(wheelWorldPos, new CANNON.Vec3())
        const suspensionVelocity = wheelVelocity.dot(new CANNON.Vec3(0, -1, 0))
        const dampingForce = suspensionVelocity * this.suspensionDamping
        
        const totalForce = suspensionForce - dampingForce
        
        // Apply upward force at wheel contact point
        const forceVector = new CANNON.Vec3(0, totalForce, 0)
        const worldWheelPos = new CANNON.Vec3()
        this.body.pointToWorldFrame(wheel.position, worldWheelPos)
        this.body.applyForce(forceVector, worldWheelPos)

        // Apply engine/brake forces (only if wheel is on ground)
        if (isFrontWheel || !isFrontWheel) { // All wheels driven (AWD)
          // Calculate forward direction based on steering angle
          let forwardDir = new CANNON.Vec3(0, 0, 1)
          if (isFrontWheel) {
            // Apply steering to front wheels
            const steerQuat = new CANNON.Quaternion()
            steerQuat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), steerAngle)
            steerQuat.vmult(forwardDir, forwardDir)
          }
          this.body.vectorToWorldFrame(forwardDir, forwardDir)

          // Apply throttle force
          const engineForce = this.throttleInput * this.maxEngineForce
          const driveForce = forwardDir.scale(engineForce)
          this.body.applyForce(driveForce, worldWheelPos)

          // Apply brake force (opposite to velocity)
          if (this.brakeInput > 0) {
            const velocity = this.body.getVelocityAtWorldPoint(worldWheelPos, new CANNON.Vec3())
            const brakeForce = velocity.scale(-this.brakeInput * this.maxBrakeForce)
            this.body.applyForce(brakeForce, worldWheelPos)
          }

          // Apply lateral friction to prevent sliding
          const rightDir = new CANNON.Vec3(1, 0, 0)
          if (isFrontWheel) {
            const steerQuat = new CANNON.Quaternion()
            steerQuat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), steerAngle)
            steerQuat.vmult(rightDir, rightDir)
          }
          this.body.vectorToWorldFrame(rightDir, rightDir)
          
          const lateralVelocity = wheelVelocity.dot(rightDir)
          const lateralForce = rightDir.scale(-lateralVelocity * this.lateralFriction * this.body.mass)
          this.body.applyForce(lateralForce, worldWheelPos)
        }
      } else {
        // Wheel is in the air
        wheel.suspensionLength = this.suspensionRestLength + this.suspensionTravel
      }
    })
  }

  /**
   * Synchronize visual mesh with physics body
   */
  public sync(): void {
    // Update chassis mesh position and rotation
    this.mesh.position.copy(this.body.position as any)
    this.mesh.quaternion.copy(this.body.quaternion as any)

    // Update wheel visual positions
    this.wheels.forEach((wheel, index) => {
      const worldPos = new CANNON.Vec3()
      this.body.pointToWorldFrame(wheel.position, worldPos)
      
      // Offset wheel down by suspension length
      worldPos.y -= wheel.suspensionLength
      
      const localPos = new THREE.Vector3()
      this.mesh.worldToLocal(localPos.set(worldPos.x, worldPos.y, worldPos.z))
      wheel.mesh.position.copy(localPos)

      // Apply steering rotation to front wheels
      if (index < 2) {
        wheel.mesh.rotation.y = this.steerInput * this.maxSteerAngle
      }
    })
  }

  /**
   * Get current speed in km/h
   */
  public getSpeedKmh(): number {
    const velocityMagnitude = this.body.velocity.length()
    return velocityMagnitude * 3.6 // Convert m/s to km/h
  }

  /**
   * Get vehicle position
   */
  public getPosition(): THREE.Vector3 {
    return new THREE.Vector3(this.body.position.x, this.body.position.y, this.body.position.z)
  }
}
