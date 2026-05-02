import { HandTracker } from './tracker.js';
import { Game } from './game.js';
import { AudioEngine } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  const videoElement = document.getElementById('webcam');
  const crosshairElement = document.getElementById('crosshair');
  const canvasElement = document.getElementById('game-canvas');
  const startBtn = document.getElementById('start-btn');
  const messageOverlay = document.getElementById('message-overlay');
  
  const audio = new AudioEngine();
  const game = new Game(canvasElement, audio);
  const tracker = new HandTracker(videoElement, crosshairElement);
  
  // Conectar el rastreador de mano con el juego
  tracker.onShoot = (x, y) => {
    audio.playShoot();
    game.shoot(x, y);
  };
  
  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    startBtn.innerText = "CARGANDO...";
    
    try {
      audio.init();
      audio.playStart();

      // Inicializar MediaPipe y cámara
      await tracker.initialize();
      
      messageOverlay.classList.add('hidden');
      
      // Iniciar el sistema de tracking y el juego inmediatamente (Sin calibración manual)
      tracker.startTracking();
      // Reasignar por si acaso
      tracker.onShoot = (x, y) => {
        audio.playShoot();
        game.shoot(x, y);
      };
      game.start();
      
    } catch (err) {
      startBtn.disabled = false;
      startBtn.innerText = "JUGAR";
    }
  });
});
