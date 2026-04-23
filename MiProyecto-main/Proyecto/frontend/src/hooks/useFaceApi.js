import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceApi = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadModels = async () => {
      // ✅ CORREGIDO: Usar import.meta.env.BASE_URL para Vite
      // Esto resuelve correctamente la ruta a /public/models/
      const MODEL_URL = `${import.meta.env.BASE_URL}models`;

      try {
        if (!faceapi.nets.tinyFaceDetector.params) {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
          ]);
        }

        if (isMounted) {
          setLoaded(true);
          console.log("PROTOCOLO BIOMÉTRICO: Modelos activos ✅");
        }
      } catch (error) {
        console.error("FALLO CRÍTICO EN MODELOS:", error);
      }
    };

    loadModels();

    return () => {
      isMounted = false;
    };
  }, []);

  return loaded;
};