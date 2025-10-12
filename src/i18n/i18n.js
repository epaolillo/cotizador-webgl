import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  es: {
    translation: {
      "app": {
        "title": "Editor de Bloques 3D",
        "description": "Haz clic para colocar bloques en la grilla"
      },
      "controls": {
        "instructions": "Instrucciones",
        "firstClick": "Primer clic: define la base del bloque",
        "secondClick": "Segundo clic: confirma la inserción",
        "samePoint": "Mismo punto: bloque unitario",
        "rotate": "Arrastra para rotar la cámara",
        "zoom": "Rueda del mouse para zoom",
        "ready": "Listo para colocar bloques"
      },
      "blocks": {
        "count": "Bloques: {{count}}",
        "clear": "Limpiar Todo",
        "clearConfirm": "¿Estás seguro de que quieres eliminar todos los bloques?"
      },
      "views": {
        "title": "Vistas",
        "left": "Izquierda",
        "center": "Centro",
        "right": "Derecha"
      },
      "camera": {
        "info": "Información de Cámara",
        "position": "Posición",
        "target": "Objetivo",
        "distance": "Distancia",
        "fov": "Campo Visual",
        "zoom": "Zoom",
        "height": "Altura",
        "metrics": "Métricas",
        "additional": "Adicional"
      }
    }
  },
  en: {
    translation: {
      "app": {
        "title": "3D Block Editor",
        "description": "Click to place blocks on the grid"
      },
      "controls": {
        "instructions": "Instructions",
        "firstClick": "First click: define block base",
        "secondClick": "Second click: confirm insertion",
        "samePoint": "Same point: unit block",
        "rotate": "Drag to rotate camera",
        "zoom": "Mouse wheel to zoom",
        "ready": "Ready to place blocks"
      },
      "blocks": {
        "count": "Blocks: {{count}}",
        "clear": "Clear All",
        "clearConfirm": "Are you sure you want to remove all blocks?"
      },
      "views": {
        "title": "Views",
        "left": "Left",
        "center": "Center",
        "right": "Right"
      },
      "camera": {
        "info": "Camera Information",
        "position": "Position",
        "target": "Target",
        "distance": "Distance",
        "fov": "Field of View",
        "zoom": "Zoom",
        "height": "Height",
        "metrics": "Metrics",
        "additional": "Additional"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    debug: false,
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;
