# Duck Hunt VR (Seguimiento de Manos)

Una adaptación web moderna del clásico juego Duck Hunt, con seguimiento de manos en tiempo real usando la cámara web para una experiencia arcade inmersiva sin necesidad de controles.

## 🎮 Características

- **Seguimiento de Manos en Tiempo Real**: Utiliza tu cámara web para rastrear los movimientos de tus manos usando MediaPipe.
- **Apuntado con el Dedo Índice**: Mueve tu dedo índice para controlar la precisión y fluidez de la mira en la pantalla.
- **Disparo con el Pulgar**: Realiza un movimiento responsivo con el pulgar para activar la mecánica de disparo.
- **Progresión Estructurada**: Un sistema de tres niveles que requiere una cantidad específica de aciertos para progresar, equilibrando la dificultad del juego.
- **Sensación Arcade Retro**: El clásico ciclo de juego de Duck Hunt, ágil y responsivo, pero con un toque moderno de seguimiento.

## 🛠️ Tecnologías

- **Herramienta de Construcción Frontend**: [Vite](https://vitejs.dev/)
- **Lenguaje**: TypeScript / JavaScript (Vanilla)
- **Motor de Seguimiento de Manos**: [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) (@mediapipe/tasks-vision)

## 🚀 Cómo Empezar

### Requisitos Previos

Asegúrate de tener [Node.js](https://nodejs.org/) instalado en tu computadora.

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/PabloGGuizar/duck-hunt-vr.git
   ```
2. Entra al directorio del proyecto:
   ```bash
   cd duck-hunt-vr
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```

### Ejecutar Localmente

Para iniciar el servidor de desarrollo, ejecuta:

```bash
npm run dev
```

Abre tu navegador y ve a la URL proporcionada en tu terminal (generalmente `http://localhost:5173`). 

**Nota**: Necesitarás darle permiso a tu navegador para acceder a tu cámara web y así poder utilizar las funciones de seguimiento de manos.

## 📜 Licencia

Este proyecto es de código abierto. ¡Siéntete libre de contribuir o modificarlo!
