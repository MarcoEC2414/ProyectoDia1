# Documentación Técnica Detallada del Proyecto

## 1. Introducción y Visión General
El presente documento ofrece una descripción exhaustiva y técnica de la arquitectura, las herramientas, las librerías y los procesos de despliegue involucrados en el desarrollo del proyecto. Este sistema es una aplicación web moderna y altamente interactiva que combina una interfaz de usuario dinámica con un backend robusto. Su característica principal y diferenciadora es la implementación de un sistema de autenticación dual: un método tradicional basado en credenciales (correo y contraseña) y un método biométrico avanzado que utiliza inteligencia artificial para el reconocimiento facial y la API de voz del navegador para el registro asistido.

El objetivo de esta documentación es servir como manual técnico completo para desarrolladores, arquitectos de software y evaluadores del proyecto, detallando desde la estructura de carpetas hasta la configuración de los servidores en la nube.

---

## 2. Stack Tecnológico y Librerías Utilizadas

El proyecto está dividido en dos partes principales (Frontend y Backend), desarrolladas con el stack MERN (adaptado a MySQL). A continuación, se detallan todas las tecnologías implementadas:

### 2.1. Frontend (Cliente)
El frontend ha sido construido con las últimas tecnologías web para garantizar un rendimiento óptimo y una experiencia de usuario (UX) inmersiva.
*   **React (v19):** Biblioteca principal para la construcción de interfaces de usuario basadas en componentes.
*   **Vite:** Entorno de desarrollo ultrarrápido y empaquetador (bundler) que reemplaza a Create React App, ofreciendo tiempos de recarga en caliente (HMR) casi instantáneos.
*   **Tailwind CSS (v4):** Framework de CSS utilitario utilizado para el diseño responsivo y la estilización rápida sin necesidad de archivos CSS externos pesados.
*   **React Router DOM (v7):** Herramienta para la gestión de rutas y navegación entre páginas (`/login`, `/register`, `/home`, `/face-register`) sin recargar el navegador (Single Page Application).
*   **Framer Motion:** Librería de animaciones utilizada para crear transiciones fluidas, efectos de entrada y elementos interactivos complejos en la UI.
*   **Axios:** Cliente HTTP basado en promesas utilizado para realizar las peticiones a la API del backend, configurado para manejar credenciales y cookies (`withCredentials: true`).
*   **Context API (AuthContext):** Sistema nativo de React utilizado para el manejo del estado global de la autenticación. Permite a cualquier componente saber si hay un usuario logueado y cuáles son sus datos.

### 2.2. Tecnologías Biométricas y de Inteligencia Artificial (Frontend)
*   **face-api.js:** Una potente API de JavaScript para la detección y reconocimiento de rostros en el navegador, construida sobre TensorFlow.js. Se utilizaron modelos pre-entrenados específicos alojados en la carpeta `/public/models`:
    *   *Tiny Face Detector:* Un modelo muy ligero y rápido para la detección facial en tiempo real.
    *   *Face Landmark 68:* Identifica 68 puntos clave en el rostro (ojos, nariz, boca, mandíbula) para dibujar la malla facial.
    *   *Face Recognition Net:* Genera un descriptor facial (un vector de 128 dimensiones) que representa matemáticamente las características únicas del rostro del usuario.
*   **React Webcam:** Componente para acceder a la cámara web del dispositivo del usuario de manera declarativa dentro de React.
*   **Web Speech API (`SpeechRecognition`):** API nativa de los navegadores modernos utilizada en el registro biométrico para capturar la voz del usuario, transcribirla a texto y rellenar automáticamente los campos del formulario (Nombre, Email, Password).

### 2.3. Backend (Servidor)
El servidor está diseñado para ser seguro, rápido y manejar la lógica de negocio y las conexiones a la base de datos.
*   **Node.js:** Entorno de ejecución de JavaScript del lado del servidor.
*   **Express.js:** Framework minimalista para Node.js que facilita la creación de rutas, manejo de peticiones HTTP (GET, POST) y middlewares.
*   **MySQL2:** Cliente de base de datos rápido para Node.js. Permite realizar consultas SQL de forma segura y soporta promesas.
*   **Bcrypt / Bcryptjs:** Librerías utilizadas para el hashing (encriptación unidireccional) de las contraseñas antes de guardarlas en la base de datos, garantizando que ni siquiera los administradores puedan ver las contraseñas en texto plano.
*   **JSON Web Tokens (JWT):** Estándar utilizado para la autenticación sin estado (stateless). Una vez que el usuario se loguea (manual o facialmente), el backend genera un token firmado que se envía al cliente para autorizar futuras peticiones a rutas protegidas.
*   **Cookie-Parser:** Middleware de Express que permite leer las cookies enviadas por el cliente, crucial para extraer el JWT de forma segura.
*   **Cors:** Middleware para habilitar el Intercambio de Recursos de Origen Cruzado, configurado específicamente para aceptar peticiones desde el dominio de Vercel.
*   **Dotenv:** Manejador de variables de entorno para ocultar credenciales sensibles (claves de base de datos, secretos JWT) fuera del código fuente.

---

## 3. Arquitectura y Estructura del Código

El repositorio está organizado siguiendo el patrón MVC (Modelo-Vista-Controlador) adaptado para aplicaciones modernas.

### 3.1. Estructura del Backend (`/backend`)
*   **`src/app.js`:** Archivo de entrada. Inicializa el servidor Express, configura los middlewares (CORS, JSON, cookies) y define los prefijos de las rutas (`/api/auth`).
*   **`src/config/db.js`:** Archivo de conexión a la base de datos. Utiliza variables de entorno para conectarse al host de Aiven.
*   **`src/controllers/authController.js`:** Contiene la lógica central de negocio:
    *   `register`: Hashea la contraseña, guarda el usuario (y opcionalmente su descriptor facial) en la base de datos.
    *   `login`: Verifica el correo, compara el hash de la contraseña y genera el JWT.
    *   `loginBiometrico`: Recibe el descriptor facial capturado por la cámara, realiza una comparación matemática (Distancia Euclidiana) con los descriptores almacenados en la base de datos, y si el margen de error es mínimo, autoriza el acceso.
*   **`src/routes/authRoutes.js`:** Define los endpoints HTTP y los enlaza con sus respectivos controladores.
*   **`src/middleware/verifyToken.js`:** Middleware de seguridad que intercepta peticiones a rutas privadas, extrae el JWT de las cookies y verifica su validez antes de permitir el paso al controlador.

### 3.2. Estructura del Frontend (`/frontend`)
*   **`public/models/`:** Contiene los pesos (`.bin`) y manifiestos (`.json`) de los modelos de IA cargados estáticamente.
*   **`src/main.jsx`:** Punto de montaje de React. Envuelve la aplicación con el `BrowserRouter` y el `AuthProvider`.
*   **`src/context/AuthContext.jsx`:** Proveedor de estado global. Mantiene en memoria si el usuario está cargando, si está autenticado y la información de su perfil, evitando tener que pasar "props" manualmente por todos los componentes (Prop Drilling).
*   **`src/hooks/useFaceApi.js`:** Custom Hook (gancho personalizado) que abstrae la lógica de carga asíncrona de los modelos de `face-api.js`, devolviendo un valor booleano (`true`) cuando la IA está lista para usarse.
*   **`src/page/`:** Contiene las vistas completas de la aplicación:
    *   `Login.jsx` / `Register.jsx`: Interfaces de acceso manual.
    *   `FaceRegister.jsx`: El componente más complejo. Coordina la cámara web, el dibujado de canvas superpuesto, la detección de landmarks, la captura del descriptor y la API de reconocimiento de voz.
    *   `Home.jsx` y subcomponentes (`DinoGame.jsx`, `CyberpunkLine.jsx`, `FloatingMusic.jsx`): Interfaz principal post-autenticación con elementos gamificados y estéticos.

---

## 4. Infraestructura, Despliegue y Migración a la Nube

Una de las fases más críticas del proyecto fue la migración de un entorno de desarrollo local (Localhost) a una arquitectura completamente basada en la nube (Cloud Native). Se seleccionaron plataformas especializadas para cada capa de la aplicación.

### 4.1. Base de Datos: De Local a Aiven (MySQL Cloud)
Durante el desarrollo, se utilizó una base de datos MySQL en el servidor local (XAMPP/WAMP o Docker local). Para la etapa de producción, se requería alta disponibilidad y acceso remoto.
*   **Aiven:** Se seleccionó Aiven como proveedor de Database-as-a-Service (DBaaS).
*   **Proceso:** Se creó una instancia de MySQL en los servidores de Aiven. Se obtuvieron las credenciales de producción (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
*   **Migración:** Se configuró el archivo `.env` del backend para apuntar a la URL (URI) proporcionada por Aiven. Esto permitió que el backend, una vez en la nube, tuviera un repositorio centralizado de datos al cual acceder 24/7.

### 4.2. Backend: Despliegue en Render
Render fue la plataforma PaaS (Platform as a Service) elegida para hospedar la API de Node.js.
*   **Proceso de Despliegue:** Se vinculó el repositorio de GitHub a Render. Render detectó automáticamente que se trataba de un proyecto Node.js.
*   **Variables de Entorno:** En el panel de Render, se inyectaron todas las variables de entorno necesarias para conectarse a Aiven (las credenciales de MySQL) y los secretos de JWT.
*   **Creación de Tablas:** Una vez que el backend se conectó exitosamente a Aiven desde los servidores de Render, se ejecutaron scripts SQL iniciales (o se usó la lógica del código) para **crear las tablas** requeridas (`usuarios`, etc.) directamente en la nube de Aiven.
*   **URL de Producción:** Render proporcionó un subdominio seguro con certificado SSL automático: `https://proyectodia1.onrender.com`.

### 4.3. Frontend: Reescritura de Código y Despliegue en Vercel
Para que la interfaz de usuario estuviera disponible globalmente con tiempos de carga mínimos, se utilizó Vercel (Edge Network).
*   **Refactorización de Endpoints (Crucial):** Durante el desarrollo, todos los archivos del frontend que hacían llamadas a la API mediante Axios apuntaban a rutas locales (por ejemplo, `http://localhost:3000/api/auth/login`). Antes del despliegue, **se modificó todo el código fuente del frontend**, buscando exhaustivamente cualquier referencia a `http://localhost` y reemplazándola por la nueva URL de producción provista por Render (`https://proyectodia1.onrender.com/api/...`).
*   **Ajuste de CORS y Cookies:** Se garantizó que tanto en las peticiones del frontend (`withCredentials: true`) como en la configuración de CORS del backend en Render, se permitiera explícitamente el origen del dominio final asignado por Vercel.
*   **Despliegue Final:** Mediante el CLI de Vercel o la integración con Git, se ejecutó el comando de construcción (`npm run build` o `vite build`), que minificó, ofuscó y empaquetó el código React en archivos estáticos HTML/CSS/JS puros, los cuales fueron distribuidos en la red de Vercel.

---

## 5. Flujos de Seguridad y Autenticación Biométrica (Deep Dive)

La seguridad es el pilar de este proyecto. El flujo biométrico merece una explicación técnica detallada:

1.  **Captura (Frontend):** Cuando el usuario entra al login biométrico, `face-api.js` utiliza el modelo `Tiny Face Detector` para encontrar la cara en el feed de video.
2.  **Extracción de Características:** Si se detecta un rostro con alta confianza (score > 0.8), el modelo `Face Recognition Net` calcula un *Face Descriptor*. Este descriptor es un `Float32Array` de 128 números. Es importante destacar que **no se guarda una foto del usuario**, sino una representación matemática (un vector multidimensional).
3.  **Transmisión (Frontend a Backend):** Este array se convierte a una cadena JSON (`JSON.stringify(Array.from(desc))`) para poder ser enviado vía HTTP POST a Render.
4.  **Comparación (Backend en Render):** El controlador de Node.js recibe este vector. Hace una consulta a la base de datos MySQL en Aiven para obtener todos los usuarios y sus descriptores almacenados. Utiliza un algoritmo de Distancia Euclidiana para medir qué tan cerca matemáticamente está el vector recibido del vector almacenado. Si la distancia es menor a un umbral predefinido (ej. 0.45 o 0.5), se considera una coincidencia (Match).
5.  **Emisión de Token:** Tras el "Match", el servidor genera un JWT firmado, lo incrusta en una cookie `HttpOnly` (inmune a ataques XSS) y responde con un código 200 OK.
6.  **Acceso Concedido:** El Contexto de React detecta la autenticación exitosa y desbloquea las rutas protegidas (`<RutaProtegida>`), renderizando el componente `<Home />`.

---

## 6. Atajos, Scripts y Comandos de Desarrollo Utilizados

A lo largo de la creación del proyecto, se utilizaron diversos comandos de terminal y configuraciones (visibles en los `package.json`):

**Backend:**
*   `npm install`: Instalación de dependencias (express, mysql2, bcrypt, etc.).
*   `npm run start`: Comando para producción, ejecuta `node src/app.js`.
*   `npm run dev`: Comando de desarrollo (puede estar asociado a `nodemon` para reinicios automáticos del servidor ante cambios en el código).
*   `npm run limpiar`: Comando personalizado para limpiar la consola (`cls`).

**Frontend:**
*   `npm create vite@latest`: Inicialización del proyecto React.
*   `npm run dev`: Levanta el servidor local de Vite con Hot Module Replacement en el puerto 5173.
*   `npm run build`: Comando ejecutado por Vercel para crear la carpeta `dist/` optimizada para producción.
*   `npm run lint`: Ejecuta ESLint para analizar el código en busca de errores de sintaxis y anti-patrones.
*   `npm run preview`: Levanta un servidor estático local para probar la versión de producción antes de subirla a Vercel.

**Atajos de IDE (VS Code / Trae):**
*   Uso extensivo de atajos de teclado para refactorización (`F2` para renombrar variables en múltiples archivos).
*   Búsqueda global (`Ctrl + Shift + F`) para localizar rápidamente todas las instancias de `http://localhost` y reemplazarlas masivamente por la URL de Render.
*   Comandos de Git (`git add .`, `git commit -m`, `git push`) para sincronizar el código con repositorios remotos y disparar los despliegues continuos (CI/CD) en Vercel y Render.

## 7. Conclusión
El proyecto representa una implementación Full-Stack moderna de alta complejidad. Demuestra un dominio profundo sobre integraciones de inteligencia artificial en el cliente, APIs del navegador (reconocimiento de voz), seguridad de sesiones basada en tokens y bases de datos relacionales en la nube. La migración exitosa de un entorno local fragmentado a un ecosistema unificado en la nube usando Aiven, Render y Vercel, certifica la preparación del sistema para entornos de producción reales, escalables y seguros.
