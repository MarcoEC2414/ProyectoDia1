# Flujos de la Aplicación

## 1. Flujo General de Uso de la Aplicación

El siguiente es el flujo paso a paso de cómo un usuario interactúa con la aplicación desde el momento en que ingresa por primera vez.

1. **Ingreso a la Plataforma (Login):**
   - El usuario accede a la URL pública de la aplicación (desplegada en Vercel).
   - Es recibido por la pantalla de inicio de sesión (`/login`).
   - El usuario tiene dos opciones para entrar:
     - **Opción A (Tradicional):** Ingresar con su correo electrónico y contraseña.
     - **Opción B (Biométrica):** Acercar su rostro a la cámara. El sistema detecta el rostro utilizando los modelos de inteligencia artificial en el frontend, extrae los descriptores faciales y los envía al backend (en Render) para validar su identidad automáticamente sin necesidad de escribir nada.

2. **Registro de Nuevo Usuario:**
   - Si el usuario no tiene cuenta, se dirige a la sección de registro.
   - Puede registrarse de forma manual ingresando su Nombre, Email y Contraseña (`/register`).
   - Alternativamente, puede optar por el **Registro Biométrico (`/face-register`)** utilizando su voz y su rostro (Ver sección 2 para el flujo detallado de esta tarea importante).

3. **Acceso a la Vista Principal (Home):**
   - Una vez autenticado correctamente en el sistema (ya sea por credenciales tradicionales o reconocimiento facial), el backend autoriza el acceso.
   - El usuario es redirigido a la pantalla principal (`/home`), donde puede interactuar con las diversas funcionalidades del sistema (ej. DinoGame, animaciones, visualización de proyectos, interfaz cyberpunk, etc.).

4. **Navegación y Cierre de Sesión:**
   - El usuario puede navegar por las rutas protegidas del sistema.
   - Si la sesión expira o el usuario decide cerrar sesión, el acceso se invalida y es redirigido de vuelta a la pantalla de Login para proteger sus datos.

---

## 2. Flujo de Tarea Importante: "Registro Biométrico Asistido por Voz"

Esta es la tarea más crítica, innovadora y específica del sistema. A continuación se detalla rigurosamente cómo funciona el flujo cuando un usuario decide crear una cuenta utilizando sus datos biométricos.

**Paso 1: Inicialización del Entorno de Captura**
- El usuario hace clic en "Registrar por Face ID" y navega a la ruta `/face-register`.
- El frontend en Vercel solicita permisos al navegador del usuario para acceder a la **Cámara Web** y al **Micrófono**.
- En segundo plano, la aplicación descarga y carga los modelos neuronales de IA de reconocimiento facial (`TinyFaceDetector`, `FaceLandmark68Net`, etc.) alojados en la carpeta pública del frontend.

**Paso 2: Captura de Datos por Comandos de Voz (Speech-to-Text)**
- Para llenar el formulario sin usar el teclado, el usuario presiona el icono de micrófono (🎙️) situado junto a los campos de Nombre, Email o Password.
- Esto activa el API de reconocimiento de voz nativo del navegador (`SpeechRecognition`).
- El usuario dicta su información en voz alta.
- El sistema captura el audio, lo transcribe a texto, aplica reglas de limpieza (como eliminar espacios o añadir automáticamente `@gmail.com` si es un email) y rellena el campo de texto de forma automática en la interfaz.

**Paso 3: Detección Facial y Generación de Descriptores**
- Paralelamente, el usuario coloca su rostro frente a la cámara web.
- La aplicación dibuja en tiempo real una malla facial de puntos sobre el rostro del usuario en la pantalla, confirmando que la IA está haciendo un seguimiento exitoso de sus facciones.
- Una vez que los campos están llenos, el usuario hace clic en el botón de confirmación ("Registrar Usuario").
- En ese milisegundo, el sistema captura un fotograma del video, lo procesa y extrae un **descriptor facial** (un arreglo matemático único de múltiples dimensiones que representa matemáticamente la cara del usuario).

**Paso 4: Envío y Almacenamiento Seguro (Render + Aiven)**
- El frontend empaqueta de forma segura la información: `Nombre`, `Email`, `Password` y el `Descriptor Facial` (convertido a un formato JSON compatible).
- Se realiza una petición HTTP `POST` a la API de producción en Render (`https://proyectodia1.onrender.com/api/auth/register`).
- El backend alojado en Render recibe el paquete de datos y ejecuta la lógica de negocio:
  - Encripta la contraseña de texto usando `bcrypt` por seguridad.
  - Almacena todos los datos del usuario, incluyendo el pesado arreglo del descriptor facial, en la base de datos MySQL que se encuentra alojada en la nube mediante **Aiven**.
- Una vez guardados, el backend responde al frontend con un código de éxito (HTTP 200/201).

**Paso 5: Finalización y Redirección**
- El frontend recibe la respuesta de éxito de Render.
- Muestra una notificación visual indicando que el registro biométrico fue completado correctamente.
- Redirige al usuario automáticamente a la pantalla de `/login`, donde ahora el sistema podrá reconocer su rostro en el flujo de inicio de sesión automático.
