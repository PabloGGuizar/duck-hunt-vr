export class Game {
  constructor(canvas, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audio = audio; // Guardar referencia al motor de audio
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.ducks = [];
    this.score = 0;
    this.ammo = 3;
    this.level = 1;
    this.ducksSpawned = 0;
    
    this.isRunning = false;
    this.lastTime = 0;
    
    this.updateScoreUI();
    this.updateAmmoUI();

    // Resize handling
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    const container = document.getElementById('game-container');
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  start() {
    this.score = 0;
    this.level = 1;
    this.ducks = [];
    this.isRunning = true;
    this.lastTime = performance.now();
    this.startRound();
    this.loop(this.lastTime);
  }

  startRound() {
    this.ducksSpawned = 0;
    this.hitsThisLevel = 0; // Resetear aciertos
    this.ammo = 3;
    this.updateScoreUI();
    this.updateAmmoUI();
    this.updateLevelUI();
    
    const messageOverlay = document.getElementById('message-overlay');
    const mainMessage = document.getElementById('main-message');
    const subMessage = document.getElementById('sub-message');
    
    messageOverlay.classList.remove('hidden');
    mainMessage.innerText = `ROUND ${this.level}`;
    subMessage.innerText = "¡PREPÁRATE! Objetivo: 5 aciertos";
    
    // Ocultar botón de jugar durante el mensaje de ronda
    document.getElementById('start-btn').style.display = 'none';
    
    setTimeout(() => {
      messageOverlay.classList.add('hidden');
      this.spawnDuck();
    }, 2000);
  }

  stop() {
    this.isRunning = false;
  }

  spawnDuck() {
    if (!this.isRunning) return;
    
    if (this.ducksSpawned >= 10) {
      // Fin de la ronda
      this.endRound();
      return;
    }
    
    this.ducksSpawned++;
    
    const isLeftToRight = Math.random() > 0.5;
    const startX = isLeftToRight ? -50 : this.width + 50;
    // Pato aparece desde el pasto (abajo) y sube, o vuela horizontal
    const startY = this.height * 0.75 - Math.random() * 100;
    
    // Aumentar velocidad según el nivel (más suave)
    const speedMultiplier = 1 + (this.level - 1) * 0.2; // 20% más rápido por nivel en vez de 40%
    const speedX = (Math.random() * 150 + 100) * speedMultiplier * (isLeftToRight ? 1 : -1);
    const speedY = (-Math.random() * 100 - 50) * speedMultiplier; // Siempre hacia arriba
    
    this.ducks.push(new Duck(startX, startY, speedX, speedY, isLeftToRight));
    
    // Recargar munición al aparecer pato nuevo (estilo NES básico por ronda)
    this.ammo = 3;
    this.updateAmmoUI();
  }

  endRound() {
    const requiredHits = 5; // Mínimo 5 de 10 para pasar
    
    const messageOverlay = document.getElementById('message-overlay');
    const mainMessage = document.getElementById('main-message');
    const subMessage = document.getElementById('sub-message');
    
    if (this.hitsThisLevel < requiredHits) {
      // GAME OVER
      messageOverlay.classList.remove('hidden');
      mainMessage.innerText = "GAME OVER";
      subMessage.innerText = `Aciertos: ${this.hitsThisLevel}/${this.ducksSpawned}. Mínimo requerido: ${requiredHits}.`;
      
      document.getElementById('start-btn').style.display = 'inline-block';
      document.getElementById('start-btn').innerText = "REINTENTAR";
      
      this.isRunning = false;
    } else if (this.level >= 3) {
      // WIN
      messageOverlay.classList.remove('hidden');
      mainMessage.innerText = "¡GANASTE!";
      subMessage.innerText = `Puntuación Final: ${this.score}. ¡Completaste todos los niveles!`;
      
      document.getElementById('start-btn').style.display = 'inline-block';
      document.getElementById('start-btn').innerText = "JUGAR OTRA VEZ";
      
      this.isRunning = false;
    } else {
      // PASS LEVEL
      this.level++;
      this.startRound();
    }
  }

  shoot(x, y) {
    if (!this.isRunning) return;
    
    if (this.ammo <= 0) return; // No hay balas
    
    this.ammo--;
    this.updateAmmoUI();
    
    // Flash effect
    const flash = document.getElementById('flash-effect');
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 50);
    
    // Check collision (iterar al revés para dar al pato de enfrente si se solapan)
    for (let i = this.ducks.length - 1; i >= 0; i--) {
      const duck = this.ducks[i];
      if (duck.isHit) continue;
      
      // Bounding box simple (radio de 40px aprox)
      const dx = duck.x - x;
      const dy = duck.y - y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      if (distance < 50) { // Radio de colisión
        duck.hit();
        if (this.audio) this.audio.playHit();
        this.score += 500;
        this.hitsThisLevel++; // Contar acierto
        this.updateScoreUI();
        return; // Solo dar a un pato por disparo
      }
    }
    
    // Si falla, no hacemos nada extra, el pato escapará y se generará uno nuevo al salir
  }

  updateScoreUI() {
    document.getElementById('score').innerText = this.score.toString().padStart(6, '0');
  }

  updateAmmoUI() {
    document.getElementById('ammo').innerText = this.ammo.toString();
  }

  updateLevelUI() {
    document.getElementById('round-display').innerText = this.level.toString();
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.ducks.length - 1; i >= 0; i--) {
      const duck = this.ducks[i];
      duck.update(dt, this.width, this.height);
      duck.draw(this.ctx);
      
      // Eliminar patos que salieron de pantalla (abajo o a los lados si ya escaparon)
      if (duck.y > this.height + 100 || duck.x < -200 || duck.x > this.width + 200) {
        this.ducks.splice(i, 1);
      }
    }

    if (this.ducks.length === 0 && !this.isSpawning) {
      this.isSpawning = true;
      setTimeout(() => {
        this.spawnDuck();
        this.isSpawning = false;
      }, 1500);
    }

    requestAnimationFrame((time) => this.loop(time));
  }
}

class Duck {
  constructor(x, y, speedX, speedY, isLeftToRight) {
    this.x = x;
    this.y = y;
    this.speedX = speedX;
    this.speedY = speedY;
    this.isLeftToRight = isLeftToRight;
    
    this.isHit = false;
    this.deadTimer = 0;
    
    this.size = 40; // Radio visual
    this.flapTimer = 0;
    this.flapState = 0; // 0: alas arriba, 1: alas centro, 2: alas abajo
  }

  update(dt, screenWidth, screenHeight) {
    if (this.isHit) {
      this.deadTimer += dt;
      if (this.deadTimer > 0.5) {
        // Caer después de medio segundo de ser disparado
        this.speedY = 300;
        this.speedX = 0;
      } else {
        // Detenido en el aire asustado
        this.speedX = 0;
        this.speedY = 0;
      }
    } else {
      // Movimiento errático
      if (Math.random() < 0.02) {
        this.speedY = -this.speedY; // cambia dirección Y de vez en cuando
      }
      
      // Animación de aleteo
      this.flapTimer += dt;
      if (this.flapTimer > 0.15) {
        this.flapTimer = 0;
        this.flapState = (this.flapState + 1) % 3;
      }
    }
    
    this.x += this.speedX * dt;
    this.y += this.speedY * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Dibujar un pato básico con formas (estilo 8-bits simulado)
    const duckColor = '#000000';
    const bodyColor = '#3CBFCF'; // Cyan pato
    const headColor = '#006E00'; // Cabeza verde
    const beakColor = '#FFB800'; // Pico naranja
    
    const scale = this.isLeftToRight ? 1 : -1;
    ctx.scale(scale, 1);
    
    if (this.isHit) {
      if (this.deadTimer > 0.5) {
        // Cayendo (cabeza abajo)
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-15, -20, 30, 40); // Cuerpo
        
        ctx.fillStyle = beakColor; // patas
        ctx.fillRect(-10, -30, 5, 10);
        ctx.fillRect(5, -30, 5, 10);
        
      } else {
        // Asustado (cuadrado congelado)
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-20, -15, 40, 30);
        ctx.fillStyle = headColor;
        ctx.fillRect(-10, -35, 20, 20); // Cabeza asustada
        
        // Ojos X_X
        ctx.fillStyle = 'white';
        ctx.fillRect(-5, -30, 5, 5);
        ctx.fillRect(10, -30, 5, 5);
      }
    } else {
      // Volando
      // Cuerpo
      ctx.fillStyle = bodyColor;
      ctx.fillRect(-20, -10, 40, 20);
      
      // Cabeza
      ctx.fillStyle = headColor;
      // Posición de cabeza según dirección
      ctx.fillRect(10, -25, 20, 20);
      
      // Ojo
      ctx.fillStyle = 'white';
      ctx.fillRect(20, -20, 5, 5);
      ctx.fillStyle = 'black';
      ctx.fillRect(22, -18, 3, 3);
      
      // Pico
      ctx.fillStyle = beakColor;
      ctx.fillRect(30, -15, 10, 5);
      
      // Alas basadas en flapState
      ctx.fillStyle = '#000'; // ala oscura
      if (this.flapState === 0) {
        ctx.fillRect(-10, -25, 15, 15); // Arriba
      } else if (this.flapState === 1) {
        ctx.fillRect(-10, -5, 15, 10);  // Medio
      } else {
        ctx.fillRect(-10, 10, 15, 15);  // Abajo
      }
    }
    
    ctx.restore();
  }

  hit() {
    this.isHit = true;
    this.flapState = 0;
  }
}
