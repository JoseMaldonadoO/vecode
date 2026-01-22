# Business Logic & Process Map (Vecode)

Este documento sirve como la fuente de verdad para la lógica de negocio, los procesos operativos y cómo se reflejan en el software. Se actualizará a medida que el sistema crezca.

---

## 1. Entidades Principales

### 🚢 Barco (Vessel)
El eje central de la operación. Todo el flujo de descarga gira en torno a un Barco Activo.
- **Registro**: Se realiza en el módulo **Dock (Muelle)**.
- **Dato Crítico**: `apt_operation_type` (Tipo de Operación). Define si el barco operará flujo estándar (Báscula) o flujo especial (Burreo).

### 🚛 Operador/Unidad (Operator)
El agente que mueve la carga.
- **Vinculación**: Un operador **SIEMPRE** debe estar vinculado a un Barco Activo para poder operar.
- **Ciclo de Vida**: Se da de alta una vez por barco y realiza múltiples viajes (Trips).

---

## 2. Procesos de Alta

### A. Alta de Barco (Vessel Registration)
**Ubicación**: Módulo `Dock` -> `Nuevo Barco`.

**Lógica del Proceso**:
1.  **Llegada de Información**: Se reciben los datos del buque (ETA, Nombre, IMO) antes de su arribo.
2.  **Definición de Operación**: El usuario decide el modo operativo:
    -   **Descarga Báscula**: Flujo estándar. El camión entra por báscula.
    -   **Burreo**: "Aligerar carga". El barco puede estar en otro muelle o en bahía, y se traslada carga de forma interna o directa a almacén.
3.  **Estado Inicial**: El barco se crea y queda disponible para vincular operadores.

### B. Alta de Operador (Operator Registration)
**Ubicación**: Módulo `Documentación` -> Botón `Muelle` -> `Alta Operador`.

**Lógica del Proceso**:
1.  **Requisito Previo**: Debe existir un Barco Activo.
2.  **Registro**: Se capturan datos del chofer y la unidad (Placas, Económico, Tipo de Unidad).
3.  **Vinculación Automática**: El operador queda "asignado" a ese barco. Esto permite que en la Báscula o en el Escáner de Almacén, el sistema lo reconozca simplemente por su QR o placa, sin necesidad de re-capturar datos en cada viaje.

---

## 3. Lógica de Descarga (Discharge Flows)

El sistema maneja dos flujos lógicos distintos para el cálculo de tonelaje y operación:

### Flujo 1: Vía Báscula (Estándar)
El procedimiento normal para camiones que entran y salen del recinto fiscalizado.

1.  **Entrada**: Camión llega a planta.
2.  **Pesaje Inicial (Weigh In)**: Pasa por la báscula de entrada. Se registra **Peso Bruto**.
3.  **Descarga**: Va a Almacén (APT) y descarga. Se escanea el QR para asignar ubicación (Almacén/Cubículo).
4.  **Pesaje Final (Weigh Out)**: Pasa por báscula de salida. Se registra **Tara**.
5.  **Cálculo**: `Peso Bruto - Tara = Peso Neto`. Este es el tonelaje que suma al Dashboard.

### Flujo 2: Burreo (Lightering / Traslado Interno)
Utilizado cuando se aligera un barco o se mueve carga desde una ubicación externa directa sin pesaje de entrada tradicional.

1.  **Entrada Directa**: La unidad ingresa o se carga directamente (ej. desde chalana o muelle alterno).
2.  **Descarga**: Va a Almacén (APT) y descarga producto.
3.  **Pesaje de Destare (Weigh Out)**: *Punto Crítico*. Aunque no hubo pesaje de entrada estricto en el flujo normal, la unidad **SÍ** pasa por báscula al salir (vacía) para registrar la Tara y confirmar el ciclo.
4.  **Cálculo**: El sistema asume/calcula el peso descargado o utiliza el ticket generado en el destare para sumar al inventario.
    *   *Nota Dashboard*: En el "Modo Unicornio", estos tonelajes se separan visualmente para diferenciar qué carga entró por circuito completo y cuál por operación de aligeramiento.

---

## 4. Puntos de Control (Checkpoints)

-   **Dashboard Operativo**: Muestra el acumulado de ambos flujos. Es la vista unificada para la toma de decisiones.
-   **Scanner APT**: Punto de control físico en almacén. Valida que la unidad que llega a descargar esté activa y vinculada al barco correcto. Detecta si es flujo Scale o Burreo según la configuración del barco.
