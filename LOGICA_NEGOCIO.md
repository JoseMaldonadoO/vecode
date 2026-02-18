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

## 2. Procesos de Alta y Gestión

### A. Alta de Barco (Vessel Registration)
**Ubicación**: Módulo `Dock` -> `Nuevo Barco`.

**Lógica del Proceso**:
1.  **Llegada de Información**: Se reciben los datos del buque (ETA, Nombre, IMO) antes de su arribo.
2.  **Definición de Operación**: El usuario decide el modo operativo (Descarga Báscula o Burreo).
3.  **Cálculo de Salida (ETC)**: `ETC = Fecha Atraco (ETA) + Días de Estadía`.
4.  **Vinculación Automática**: El operador queda asignado a ese barco para agilizar procesos posteriores.

### B. Gestión de Órdenes de Venta (OV)
Representa el compromiso comercial con el cliente.
- **Edición**: Se permite la edición de OVs siempre que su estatus sea **"CREADO"**. Una vez que tienen embarques asociados o cambian de estado, la edición se bloquea para asegurar la trazabilidad financiera.
- **Saldo**: Se calcula como `Total OV - (Tonelaje Cargado + Reservado en Patio)`.

### C. Registro de Embarques (OE) e Integridad de Datos
Representa un viaje físico para surtir una OV.
- **Vinculación con OV**: Al seleccionar una OV, los campos de **Cliente** y **Producto** se bloquean automáticamente. La OE debe respetar lo pactado en la OV.
- **Vinculación con Operador**: Al seleccionar un operador registrado/escaneado, se bloquean los campos: **Línea Transportista**, **Tipo de Unidad**, **Placas**, **Económico**, **Licencia** y **Unidad/Marca**. Esto asegura que los datos coincidan con el registro oficial.
- **Persistencia del Nombre**: El nombre del operador es editable pero persistente, permitiendo tanto la selección rápida como la corrección manual en contingencias.
- **Validación de Saldo**: El sistema impide programar una OE que exceda el saldo disponible de la OV vinculada.

---

## 3. Lógica de Descarga y Carga (Flows)

### Flujo 1: Vía Báscula (Estándar)
1. **Entrada**: Pesaje inicial (Peso Bruto).
2. **Operación**: Carga/Descarga en Almacén (APT).
3. **Salida**: Pesaje final (Tara). `Peso Bruto - Tara = Peso Neto`.

### Flujo 2: Burreo (Lightering)
1. **Entrada Directa**: Sin báscula de entrada.
2. **Peso Provisional**: Se asigna un peso estimado por viaje durante la operación.
3. **Cierre (Draft Check)**: Al finalizar el barco, se ingresa el peso real promedio por viaje, el cual actualiza todos los tickets anteriores automáticamente.

### Flujo 3: Producto Envasado (Bypass)
1. **Bypass de Báscula**: Las unidades de productos envasados (Sacos/Big Bags) **NO** pasan por báscula.
2. **Cálculo de Carga**: El tonelaje se considera "Cargado" automáticamente al momento de la documentación, usando el valor de `programmed_tons`.
3. **Impacto en Saldo**: El saldo de la OV se reduce inmediatamente después de crear la OE.

---

## 4. Puntos de Control (Checkpoints)

- **Scanner APT**: Valida que la unidad esté activa y autorizada por Vigilancia.
- **Báscula**: Punto de control de peso real para producto a granel.
- **Vigilancia**: Filtro de seguridad inicial que autoriza el ingreso tras checklist físico.

---

## 5. Estándares de Unidades

- **Base de Datos**: Kilogramos (KG).
- **Interfaz (Dashboard/Forms)**: Toneladas Métricas (TM). (`TM = KG / 1000`).
- **Tickets Impresos**: Kilogramos (KG) para exactitud operativa.

---

## 6. Control de Accesos (Vigilancia)

### A. Tipos de Operadores
1. **Operador de Barco (OP)**: Viene a dejar producto (Descarga).
2. **Operador de Salida (OP_EXIT)**: Viene a recoger producto (Ventas). Se identifica en báscula con su **Folio de OE**.

### B. Proceso de Autorización
- El ingreso requiere Checklist (Casco, Chaleco, etc.).
- Las unidades autorizadas pasan a estado `in_plant` y son visibles en Documentación.
- Al salir, se registra el tiempo final de estadía.
