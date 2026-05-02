import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export class HandTracker {
  constructor(videoElement, crosshairElement) {
    this.video = videoElement;
    this.crosshair = crosshairElement;
    this.handLandmarker = null;
    this.isTracking = false;
    
    this.onShoot = null;
    
    // Calibración
    this.isCalibrating = false;
    this.calibMinX = 0;
    this.calibMaxX = 1;
    this.calibMinY = 0;
    this.calibMaxY = 1;
    this.rawX = 0; // Para reportar durante la calibración
    this.rawY = 0;

    // Para detectar retroceso/pulgar
    this.lastHandY = null;
    this.lastTime = 0;
    this.recoilVelocityThreshold = -0.5; // Velocidad negativa = hacia arriba (pantalla Y va de arriba a abajo)
    this.cooldown = 0; // Prevenir múltiples disparos rápidos
    
    this.isInitialized = false; // Bandera para evitar doble inicialización
  }

  async initialize() {
    if (this.isInitialized) return; // Evitar cargar el modelo IA en memoria múltiples veces
    
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 1
    });

    await this.setupCamera();
    this.isInitialized = true;
  }

  async setupCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      this.video.srcObject = stream;
      
      return new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play();
          resolve();
        };
      });
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("No se pudo acceder a la cámara. Asegúrate de que no esté siendo usada por otra aplicación (como Zoom, Teams, u otra pestaña). Error: " + error.message);
      throw error;
    }
  }

  startTracking() {
    if (this.isTracking) return; // Evitar loops infinitos de requestAnimationFrame
    this.isTracking = true;
    this.crosshair.classList.remove("hidden");
    this.lastTime = performance.now();
    this.trackFrame();
  }

  stopTracking() {
    this.isTracking = false;
    this.crosshair.classList.add("hidden");
  }

  trackFrame() {
    if (!this.isTracking) return;

    const currentTime = performance.now();
    const dt = (currentTime - this.lastTime) / 1000; // segundos
    this.lastTime = currentTime;

    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }

    // --- PARTE 1: IA (30 FPS, solo cuando hay nuevo frame de video) ---
    if (this.video.readyState >= 2 && this.video.videoWidth > 0 && this.video.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.video.currentTime;
      
      try {
        const results = this.handLandmarker.detectForVideo(this.video, currentTime);

        if (results.landmarks && results.landmarks.length > 0) {
          const hand = results.landmarks[0];
          const indexTip = hand[8];
          const wrist = hand[0];

          // Obtener dimensiones de la pantalla
          const container = document.getElementById('game-container');
          const width = container.clientWidth;
          const height = container.clientHeight;

          // Corrección de Aspect Ratio
          const videoRatio = this.video.videoWidth / this.video.videoHeight;
          const containerRatio = width / height;
          
          let renderWidth, renderHeight, offsetX = 0, offsetY = 0;
          
          if (containerRatio > videoRatio) {
            renderWidth = width;
            renderHeight = width / videoRatio;
            offsetY = (height - renderHeight) / 2;
          } else {
            renderHeight = height;
            renderWidth = height * videoRatio;
            offsetX = (width - renderWidth) / 2;
          }

          // Coordenadas base
          const rawScreenX = offsetX + (1 - indexTip.x) * renderWidth;
          const rawScreenY = offsetY + indexTip.y * renderHeight;

          // Sensibilidad
          const sensitivity = 1.5; 
          const centerX = width / 2;
          const centerY = height / 2;

          this.targetX = centerX + (rawScreenX - centerX) * sensitivity;
          this.targetY = centerY + (rawScreenY - centerY) * sensitivity;
          
          // Limitar a los bordes
          this.targetX = Math.max(0, Math.min(width, this.targetX));
          this.targetY = Math.max(0, Math.min(height, this.targetY));

          // Detección de Disparo: Pulgar (Basado en Estado Absoluto, no en velocidad)
          const thumbTip = hand[4];
          const indexBase = hand[5];
          
          const dx = thumbTip.x - indexBase.x;
          const dy = thumbTip.y - indexBase.y;
          const thumbDistance = Math.sqrt(dx*dx + dy*dy);
          
          // Lógica de Gatillo tipo botón
          // Si la distancia es menor a 0.08, el pulgar está tocando/cerca de la base del índice (Apretado)
          // Si la distancia es mayor a 0.12, el pulgar está levantado (Suelto)
          
          if (this.isTriggerPressed === undefined) {
            this.isTriggerPressed = false;
          }

          if (thumbDistance < 0.12 && !this.isTriggerPressed && this.cooldown <= 0) {
            // Se acaba de apretar el gatillo
            this.fireShootEvent(this.smoothedX || this.targetX, this.smoothedY || this.targetY);
            this.cooldown = 0.5;
            this.isTriggerPressed = true;
          } else if (thumbDistance > 0.18) {
            // El usuario levantó el pulgar de forma clara, listo para otro disparo
            this.isTriggerPressed = false;
          }
        } // Cierre del if (results.landmarks ...)
      } catch (err) {
        console.error("Error in MediaPipe tracking:", err);
      }
    }

    // --- PARTE 2: UI FLUIDA (60 FPS, siempre se ejecuta) ---
    if (this.targetX !== undefined && this.targetY !== undefined) {
      if (this.smoothedX === undefined) {
        this.smoothedX = this.targetX;
        this.smoothedY = this.targetY;
      } else {
        // Interpolación rápida independientemente de los frames de la cámara
        // 0.4 a 60fps = seguimiento suave pero extremadamente responsivo
        this.smoothedX += (this.targetX - this.smoothedX) * 0.4;
        this.smoothedY += (this.targetY - this.smoothedY) * 0.4;
      }

      // Mover la mira
      this.crosshair.style.left = `${this.smoothedX}px`;
      this.crosshair.style.top = `${this.smoothedY}px`;
    }

    requestAnimationFrame(() => this.trackFrame());
  }

  fireShootEvent(x, y) {
    if (this.onShoot) {
      this.onShoot(x, y);
    }
  }
}
