# Duck Hunt VR (Hand-Tracking)

A modern, web-based adaptation of the classic Duck Hunt game, featuring real-time webcam hand-tracking for a truly immersive, controller-free arcade experience.

## 🎮 Features

- **Real-Time Hand Tracking**: Uses your webcam to track your hand movements using MediaPipe.
- **Index-Finger Aiming**: Move your index finger to control the crosshair precision and fluidity on the screen.
- **Thumb-Based Shooting**: Perform a responsive thumb movement to trigger the shooting mechanic.
- **Structured Progression**: A three-level system that requires specific hit counts to progress, balancing the game's difficulty.
- **Retro Arcade Feel**: Responsive, classic Duck Hunt loop with a modern tracking twist.

## 🛠️ Technology Stack

- **Frontend Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: TypeScript / JavaScript (Vanilla)
- **Hand Tracking Engine**: [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) (@mediapipe/tasks-vision)

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PabloGGuizar/duck-hunt-vr.git
   ```
2. Navigate to the project directory:
   ```bash
   cd duck-hunt-vr
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server, run:

```bash
npm run dev
```

Open your browser and navigate to the URL provided in your terminal (usually `http://localhost:5173`). 

**Note**: You will need to grant your browser permission to access your webcam for the hand-tracking features to work.

## 📜 License

This project is open-source. Feel free to contribute or modify it!
