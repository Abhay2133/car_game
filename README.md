# AAA 3D Car Racing Game

A complete 3D car racing game prototype built with **Vite**, **TypeScript**, **Three.js**, and **cannon-es** physics engine. Features a raycast-based vehicle controller with realistic suspension simulation.

## 🚗 Features

- **Raycast-based vehicle physics** with per-wheel suspension simulation
- **Real-time physics** powered by cannon-es
- **3D rendering** using Three.js with shadows and lighting
- **Keyboard controls** for driving (W/A/S/D + Space)
- **HUD display** showing current speed
- **Full TypeScript** support with type safety
- **Hot reload** development with Vite

## 🛠️ Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd car_game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## 🎮 Running the Game

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

Then open your browser to [http://localhost:5173](http://localhost:5173)

### Production Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🎯 Controls

| Key | Action |
|-----|--------|
| **W** / **↑** | Accelerate forward |
| **S** / **↓** | Reverse / Brake while moving forward |
| **A** / **←** | Steer left |
| **D** / **→** | Steer right |
| **Space** | Brake |

## 🏗️ Project Structure

```
car_game/
├── public/
│   └── assets/              # Game assets (textures, models)
│       ├── car_placeholder.png
│       ├── wheel_placeholder.png
│       └── track_placeholder.jpg
├── src/
│   ├── engine/              # Core engine systems
│   │   ├── Renderer.ts      # Three.js rendering setup
│   │   └── Physics.ts       # cannon-es physics world
│   ├── entities/            # Game entities
│   │   └── Vehicle.ts       # Raycast-based vehicle controller
│   ├── scenes/              # Game scenes
│   │   └── Track.ts         # Racing track and environment
│   ├── ui/                  # User interface
│   │   └── HUD.ts           # Heads-up display
│   ├── main.ts              # Game entry point and loop
│   └── style.css            # Styling
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## 🔧 Physics Tuning

The vehicle physics can be adjusted in `src/entities/Vehicle.ts`:

### Engine & Control Parameters

```typescript
private maxEngineForce: number = 1500      // Maximum acceleration force
private maxBrakeForce: number = 100        // Braking force
private maxSteerAngle: number = 0.5        // Maximum steering angle (radians)
```

### Suspension Parameters

```typescript
private suspensionRestLength: number = 0.4   // Default suspension length
private suspensionStiffness: number = 30     // Spring stiffness
private suspensionDamping: number = 2.5      // Damping coefficient
private suspensionTravel: number = 0.3       // Maximum compression distance
```

### Friction & Handling

```typescript
private lateralFriction: number = 2.0        // Side-to-side grip
```

### Vehicle Dimensions

```typescript
private wheelBase: number = 2.0              // Front-to-rear axle distance
private wheelTrack: number = 1.5             // Left-to-right wheel distance
```

## 📐 How Raycast Suspension Works

Traditional physics engines use constraint-based wheel joints, which can be unstable. This implementation uses **raycasting** for better stability:

1. **Each wheel casts a ray** downward from its position
2. **When the ray hits ground**, it calculates the distance (suspension compression)
3. **Spring force** is applied based on compression: `F = compression × stiffness`
4. **Damping force** opposes suspension velocity to prevent bouncing
5. **Drive forces** are applied only when wheels are on the ground
6. **Lateral friction** prevents unrealistic sliding

This approach provides:
- ✅ Stable physics at high speeds
- ✅ Natural suspension behavior
- ✅ Easy parameter tuning
- ✅ Good performance

## 🎨 Replacing Assets

The placeholder assets in `public/assets/` can be replaced with your own:

### 3D Models (Future Enhancement)

Replace primitive meshes with GLTF models:

```typescript
// In Vehicle.ts
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const loader = new GLTFLoader()
loader.load('assets/car_model.glb', (gltf) => {
  this.mesh.add(gltf.scene)
})
```

### Textures

Load textures for the ground or vehicle:

```typescript
import { TextureLoader } from 'three'

const textureLoader = new TextureLoader()
const groundTexture = textureLoader.load('assets/track_placeholder.jpg')
groundMaterial.map = groundTexture
```

## 🚀 Future Enhancements

- [ ] Replace primitives with GLTF 3D models
- [ ] Add track barriers, ramps, and obstacles  
- [ ] Implement checkpoint system and lap timing
- [ ] Add particle effects (dust, skid marks)
- [ ] Sound effects (engine, skid, collisions)
- [ ] Smooth camera follow with damping
- [ ] Minimap for navigation
- [ ] Multiple vehicle choices
- [ ] Opponent AI vehicles
- [ ] Multiplayer support

## 🐛 Troubleshooting

### Vehicle is too slow/fast

Adjust `maxEngineForce` in `Vehicle.ts`

### Vehicle bounces too much

Reduce `suspensionStiffness` or increase `suspensionDamping`

### Steering feels unresponsive

Increase `maxSteerAngle` or adjust `lateralFriction`

### Physics feels unstable

Check that your frame rate is stable. The physics step uses a fixed timestep for stability.

## 📚 Technologies Used

- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Three.js](https://threejs.org/)** - 3D rendering library
- **[cannon-es](https://pmndrs.github.io/cannon-es/)** - Physics engine

## 📝 License

MIT License - Feel free to use this project for learning or as a base for your own games!

## 🙏 Credits

Built as a demonstration of modern web-based 3D game development techniques.

---

**Happy Racing! 🏎️💨**
