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
        "singleClick": "Clic para colocar (objeto único)",
        "rotate": "Arrastra para rotar la cámara",
        "zoom": "Rueda del mouse para zoom",
        "ready": "Listo para colocar bloques"
      },
      "blocks": {
        "count": "Bloques: {{count}}",
        "clear": "Limpiar Todo",
        "clearConfirm": "¿Estás seguro de que quieres eliminar todos los bloques?",
        "undo": "Deshacer"
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
      },
      "objectTypes": {
        "title": "Tipos de Objetos",
        "selected": "Seleccionado",
        "pool": "Pileta",
        "tree": "Árbol",
        "fence": "Cerco",
        "terrain": "Movimiento de suelo",
        "path": "Camino",
        "block": "Bloque",
        "toolActive": "Herramienta Activa",
        "toolInactive": "Herramienta Inactiva",
        "toggleTool": "Activar/Desactivar herramienta (Q)",
        "expand": "Expandir",
        "collapse": "Contraer"
      },
      "placement": {
        "errors": {
          "occupied": "Esta posición está ocupada",
          "invalid": "Posición no válida",
          "on_boundary": "La pileta no se puede colocar en el contorno del terreno",
          "too_close_to_edge": "La pileta debe estar al menos 1 unidad alejada de los bordes",
          "anti_slip_overlap": "Los antideslizantes se solapan con otro objeto",
          "path_on_edge": "Los antideslizantes no se pueden colocar en los extremos del grid"
        }
      },
      "toast": {
        "blockAdded": "Bloque agregado correctamente",
        "blockRemoved": "Bloque eliminado",
        "allBlocksCleared": "Todos los bloques fueron eliminados"
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
        "singleClick": "Click to place (unique object)",
        "rotate": "Drag to rotate camera",
        "zoom": "Mouse wheel to zoom",
        "ready": "Ready to place blocks"
      },
      "blocks": {
        "count": "Blocks: {{count}}",
        "clear": "Clear All",
        "clearConfirm": "Are you sure you want to remove all blocks?",
        "undo": "Undo"
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
      },
      "objectTypes": {
        "title": "Object Types",
        "selected": "Selected",
        "pool": "Pool",
        "tree": "Tree",
        "fence": "Fence",
        "terrain": "Ground Movement",
        "path": "Path",
        "block": "Block",
        "toolActive": "Tool Active",
        "toolInactive": "Tool Inactive",
        "toggleTool": "Toggle tool (Q)",
        "expand": "Expand",
        "collapse": "Collapse"
      },
      "placement": {
        "errors": {
          "occupied": "This position is occupied",
          "invalid": "Invalid position",
          "on_boundary": "Pool cannot be placed on the terrain boundary",
          "too_close_to_edge": "Pool must be at least 1 unit away from edges",
          "anti_slip_overlap": "Anti-slip tiles overlap with another object",
          "path_on_edge": "Anti-slip tiles cannot be placed on grid edges"
        }
      },
      "toast": {
        "blockAdded": "Block added successfully",
        "blockRemoved": "Block removed",
        "allBlocksCleared": "All blocks have been cleared"
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
