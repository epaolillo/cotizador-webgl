# Framework WebGL - Editor de Bloques 3D

## Descripción

Framework genérico en React + WebGL para construir un editor 3D basados en bloques. Proporciona la base mínima para renderizar un espacio 3D vacío con una grilla invisible, sobre la cual se pueden insertar bloques cúbicos siguiendo reglas discretas.

## Características

### 🟦 Sistema de Bloques

- Espacio discreto definido por una grilla invisible en 3D
- Colocación de bloques unitarios en posiciones válidas

**Restricciones:**
- No se pueden apilar bloques
- No se pueden superponer bloques
- Cada movimiento es digital (step-by-step en la grilla, no continuo)

#### 📐 Sistema de Grilla Digital (Movimiento Discreto)

El editor utiliza un **sistema de coordenadas discreto** que funciona de manera fundamentalmente diferente a los editores 3D tradicionales:

**¿Qué significa "movimiento digital"?**
- **NO hay posicionamiento libre**: Los bloques solo pueden colocarse en intersecciones exactas de una grilla invisible
- **Coordenadas enteras únicamente**: Cada posición válida tiene coordenadas como (0,0,0), (1,0,0), (0,1,0), etc.
- **Sin valores decimales**: No existen posiciones como (0.5, 1.3, 2.7)

**Diferencias con editores tradicionales:**
- **Editores continuos** (como Blender): Permite colocar objetos en cualquier posición (x: 1.2534, y: 3.8921, z: 0.4567)
- **Este editor discreto**: Solo posiciones "encajadas" en la grilla (x: 1, y: 3, z: 0)

**Ventajas del sistema discreto:**
- **Precisión perfecta**: Los bloques siempre están perfectamente alineados
- **Construcción predictible**: No hay problemas de "casi-alineado" o "casi-encajado"
- **Lógica simple**: Fácil de entender y usar, similar a juegos como Minecraft
- **Performance optimizada**: Cálculos más rápidos al trabajar solo con enteros

**Comportamiento en la práctica:**
- Cuando mueves el cursor, este "salta" de posición en posición
- No hay movimiento suave/continuo del cursor
- Cada click coloca el bloque exactamente en el centro de una "celda" de la grilla
- La grilla es invisible pero define todas las posiciones válidas

### 🖱️ Interacción

#### 🛠️ Sistema de Herramientas
- **Panel de control flotante**: ubicado en la esquina inferior derecha
- **Modo Bloque (🟦)**: Para colocar bloques en la grilla
- **Modo Mover (✋)**: Para navegar y mover el espacio 3D

#### 📍 Modo Bloque
- **Cursor fantasma**: muestra un bloque transparente indicando dónde se insertará el próximo bloque
- **Inserción step-by-step:**
  - Primer click/tap: define la base del bloque/prisma
  - Segundo click/tap: confirma la inserción y cierra el prisma
  - Caso base: dos clicks en el mismo punto → bloque unitario

#### 🚀 Modo Mover
- **Navegación mejorada**: arrastra para mover el espacio 3D con mayor sensibilidad
- **Pan habilitado**: arrastra con botón derecho para mover la vista lateralmente
- **Zoom y rotación**: velocidades optimizadas para exploración rápida

**Soporte para desktop y mobile:**
- Click con ratón (desktop)
- Tap con dedo (mobile)

### 🌍 Entorno 3D

- Renderizado básico con Three.js
- Cámara orbital con zoom y rotación
- Espacio inicial vacío para permitir futuros módulos (materiales, iluminación, skybox, etc.)

## Uso

### 🛠️ Seleccionar Herramienta
1. **Panel flotante**: Localiza el panel en la esquina inferior derecha
2. **Modo Bloque (🟦)**: Click para activar modo de construcción
3. **Modo Mover (✋)**: Click para activar modo de navegación

### 📍 En Modo Bloque
1. **Primer click**: Define la base del bloque (aparece cursor naranja)
2. **Segundo click**: Confirma la inserción (se crea el bloque)
3. **Mismo punto**: Crea un bloque unitario
4. **ESC**: Cancela la operación actual

### 🚀 En Modo Mover
1. **Arrastra (botón izquierdo)**: Rota la cámara
2. **Arrastra (botón derecho)**: Mueve la vista lateralmente (pan)
3. **Rueda del mouse**: Zoom con velocidad mejorada
4. **Navegación fluida**: Controles optimizados para exploración

### ⌨️ Controles Generales
- **Rueda del mouse**: Zoom (en ambos modos)
- **ESC**: Cancela operación o vuelve al modo anterior
- **Banderas**: Cambia idioma (🇪🇸 ES / 🇺🇸 EN)

## Estructura del Proyecto

```
src/
├── components/
│   ├── Scene.jsx         # Escena 3D principal
│   ├── Block.jsx         # Componente de bloque individual
│   ├── BlockGrid.jsx     # Lógica de grilla y restricciones
│   ├── CursorPreview.jsx # Bloque fantasma (preview)
│   └── UI.jsx            # Interfaz básica
├── context/
│   └── EditorContext.jsx # Estado global del editor
└── App.jsx               # Componente raíz
```

## Instalación y Uso

### Requisitos
- Node.js 16 o superior
- npm o yarn

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

### Comandos Disponibles
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la construcción
- `npm run lint` - Ejecuta el linter

## Tecnologías Utilizadas

- **Importante utilizar archivos jsx, es decir no usar typescript**
- **React 18**
- **Javascript**
- **Three.js** (motor WebGL)
- **React Three Fiber** (integración React/Three.js)
- **React Three Drei** (helpers de cámara, controles, etc.)
- **Vite** (bundler y servidor de desarrollo)
- **react-i18next** (internacionalización)

## Características Implementadas

### ✅ Sistema de Bloques Funcional
- ✅ Grilla discreta invisible
- ✅ Colocación step-by-step (dos clicks)
- ✅ Restricciones de no superposición
- ✅ Cursor fantasma con preview

### ✅ Interacción Completa
- ✅ Soporte desktop (mouse)
- ✅ Soporte mobile (touch) - *preparado*
- ✅ Cámara orbital con zoom y rotación
- ✅ Cancelación con tecla ESC
- ✅ **Panel de herramientas flotante**
- ✅ **Modo Bloque vs Modo Mover**

### ✅ Interfaz de Usuario
- ✅ Panel de instrucciones
- ✅ Contador de bloques
- ✅ Botón para limpiar todo
- ✅ Internacionalización (Español/Inglés)
- ✅ **Panel de control de herramientas (inferior derecha)**
- ✅ **Tooltips informativos**

### ✅ Renderizado 3D
- ✅ Iluminación realista
- ✅ Sombras
- ✅ Materiales y texturas
- ✅ Optimizaciones de performance