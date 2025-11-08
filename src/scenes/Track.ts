import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Vehicle } from '../entities/Vehicle'

/**
 * Track class manages the racing environment
 */
export class Track {
  private scene: THREE.Scene
  private physics: CANNON.World
  private groundMaterial: CANNON.Material

  constructor(scene: THREE.Scene, physics: CANNON.World, groundMaterial: CANNON.Material) {
    this.scene = scene
    this.physics = physics
    this.groundMaterial = groundMaterial

    this.createGround()
    this.createTrackRing()
  }

  /**
   * Create ground plane with physics and visuals
   */
  private createGround(): void {
    // Physics ground
    const groundShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({
      mass: 0, // Static body
      shape: groundShape,
      material: this.groundMaterial
    })
    // Rotate to horizontal (planes face up in Z direction by default)
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.physics.addBody(groundBody)

    // Visual ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200)
    const groundMaterialThree = new THREE.MeshStandardMaterial({
      color: 0x228b22, // Forest green
      roughness: 0.8,
      metalness: 0.2
    })
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterialThree)
    groundMesh.rotation.x = -Math.PI / 2
    groundMesh.receiveShadow = true
    this.scene.add(groundMesh)

    // Add grid helper for reference
    const gridHelper = new THREE.GridHelper(200, 40, 0x444444, 0x888888)
    this.scene.add(gridHelper)
  }

  /**
   * Create a simple track ring as a placeholder
   */
  private createTrackRing(): void {
    const torusGeometry = new THREE.TorusGeometry(30, 2, 16, 32)
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.6,
      metalness: 0.4
    })
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial)
    torusMesh.rotation.x = Math.PI / 2
    torusMesh.position.y = 0.1
    torusMesh.receiveShadow = true
    torusMesh.castShadow = true
    this.scene.add(torusMesh)
  }

  /**
   * Spawn player vehicle at starting position
   */
  public spawnPlayerVehicle(): Vehicle {
    const startPosition = new CANNON.Vec3(0, 2, 0)
    return new Vehicle(this.physics, this.scene, startPosition)
  }
}
