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
4.  **Validación de Ocupación**:
    -   El sistema valida que el muelle asignado esté disponible en las fechas indicadas.
    -   Permite programar barcos futuros en un muelle "ocupado" actualmente, siempre que los intervalos de tiempo no se solapen (Fecha Atraco vs Fecha Salida).
5.  **Cálculo Automático de Salida (ETC)**:
    -   Al ingresar los "Días de Estadía", el sistema debe calcular y pre-llenar automáticamente la Fecha Estimada de Finalización (ETC).
    -   *Fórmula*: `ETC = Fecha Atraco (ETA) + Días de Estadía`.
    -   Aplica para **TODOS** los tipos de operación (Descarga Báscula y Burreo).
    -   *Nota*: NO debe llenar automáticamente la "Fecha Salida" (`departure_date`), ya que este campo se registra hasta que el barco zarpa realmente.

- **Vinculación Automática**: El operador queda "asignado" a ese barco. Esto permite que en la Báscula o en el Escáner de Almacén, el sistema lo reconozca simplemente por su QR o placa, sin necesidad de re-capturar datos en cada viaje.

### 📑 Orden de Venta (Sales Order - OV)
Representa el compromiso comercial / contrato con el cliente.
- **Registro**: Se realiza en el módulo **Comercialización**.
- **Función**: Define el cliente, el producto y la cantidad total pactada. Una OV puede ser surtida por múltiples viajes (OE).

### 🚛 Orden de Embarque (Shipment Order - OE)
Representa un viaje físico particular de una unidad para surtir una OV o para descarga de barco.
- **Relación**: Toda OE de surtido **DEBE** estar vinculada a una OV activa.
- **Gestión**: Se registran los datos de transporte (Chofer, Placas, Transportista).

### C. Gestión de Productos (Product Management)
**Ubicación**: Módulo `Tráfico` -> `Productos`.

**Lógica del Proceso**:
1.  **Administración**: Permite dar de alta y visualizar el catálogo de productos disponibles en el sistema.
2.  **Campos**: Requiere `Código` (Identificador único), `Nombre` (Descripción comercial) y `Presentación` (Tipo de empaque por defecto, ej: Granel, Saco).
3.  **Uso**: Estos productos son seleccionados al crear Órdenes de Venta (OV) o al configurar descargas de barcos (OB).

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
2.  **Peso Provisional (Módulo Tráfico)**: Se asigna un **Peso Promedio Provisional en Toneladas Métricas (TM)** al barco. 
    -   *Nota*: Este valor es dinámico. Si se cambia el peso provisional en Tráfico, todos los viajes anteriores de ese barco se actualizan automáticamente con el nuevo valor (siempre que no se haya aplicado el Draft).
3.  **Descarga (Escaneo APT)**: La unidad va a Almacén (APT) y se escanea el QR.
    -   *Cálculo Inmediato*: El sistema genera el registro con el peso neto equivalente al **Peso Provisional** actual del barco.
4.  **No requiere Báscula**: Las unidades de Burreo **NO** pasan por la báscula de salida (Destare). El flujo se completa al momento del escaneo en almacén.
5.    -   *Cálculo de Peso Final (Draft)*:
    -   *Cierre de Operación*: Al finalizar, se ingresa el **Peso Final Promedio por Viaje** (en TM) en el módulo de Tráfico.
    -   *Recálculo Final*: El sistema actualiza automáticamente todos los tickets de Burreo con este valor final (Asignación Directa), sobreescribiendo el provisional.
    -   *Nota*: Anteriormente se dividía un total, pero se cambió la reglas para asignar directamente el peso ingresado a cada ticket.

### Flujo 3: Producto Envasado (Venta/Carga Bypass)
Aplicable a Órdenes de Embarque (OE) de productos envasados (Sacos / Big Bags).

1.  **Bypass de Báscula**: Las unidades que cargan producto envasado **NO** pasan por la báscula (entrada ni salida).
2.  **Carga Directa**: La unidad va directo a Almacén, carga los bultos programados y se retira de la planta.
3.  **Cálculo de Carga (Reporte Comercial)**: 
    -   Debido a que no hay pesaje físico, el tonelaje de estas órdenes se considera **Cargado** automáticamente al momento de crear la Orden de Embarque (OE) en el sistema.
    -   *Valor utilizado*: Se toma el campo `programmed_tons` (Toneladas Programadas) de la OE.
    -   *Impacto*: El saldo de la Orden de Venta (OV) se reduce inmediatamente después de la documentación.

---

## 4. Puntos de Control (Checkpoints)

-   **Dashboard Operativo**: Muestra el acumulado de ambos flujos. Es la vista unificada para la toma de decisiones.
-   **Scanner APT**: Punto de control físico en almacén. Valida que la unidad que llega a descargar esté activa y vinculada al barco correcto.
    -   **Validación de Flujo**: Si el barco es tipo `scale`, el sistema **RECHAZARA** el escaneo si no hay una OE con ticket de entrada.
    -   **Protección de Datos**: Evita la auto-creación accidental de registros de "Burreo" para unidades que deben ser pesadas obligatoriamente.

---

## 5. Estándares de Unidades (Unit Standards)

Para garantizar consistencia en todo el sistema, se establecen las siguientes reglas de conversión y visualización:

### A. Base de Datos (Source of Truth)
-   **Unidad**: Kilogramos (KG).
-   **Regla**: Todos los campos de peso en la base de datos (`net_weight`, `provisional_burreo_weight`, etc.) almacenan el valor absoluto en **KG**.

### B. Interfaz de Usuario (Dashboard, APT, Tráfico)
-   **Unidad**: Toneladas Métricas (TM).
-   **Regla**:
    -   **Visualización**: El frontend debe dividir el valor de la base de datos entre `1000`.
    -   **Captura**: El usuario ingresa TM, el backend multiplica por `1000` antes de guardar.
    -   **Formato**: Mostrar siempre con 2 o 3 decimales (e.g., `30.000 T` o `30.45 T`).

### C. Tickets de Báscula (Documentos Físicos)
-   **Unidad**: Kilogramos (KG).
-   **Regla**: En los documentos impresos y vistas de detalle de ticket, se debe mostrar el valor crudo en KILOGRAMOS para coincidir con la lectura directa de la báscula.

---

## 6. Control de Accesos (Vigilancia)

El módulo de Vigilancia es el punto de inicio y fin de toda la operación en planta. Su función es filtrar, registrar y autorizar el ingreso físico.

### A. Tipos de Operadores y Origen
Para que la lógica sea clara, el sistema diferencia el origen del operador mediante su QR:
1.  **Operador de Barco (Descarga/MI/MP)**:
    -   **Prefijo QR**: `OP {id}`.
    -   **Origen**: Módulo `Dock` -> `VesselOperator`.
    -   **Flujo**: Vienen a **DEJAR** producto del barco.
2.  **Operador de Salida (Carga/Ventas)**:
    -   **Prefijo QR**: `OP_EXIT {id}`.
    -   **Origen**: Módulo `Documentation` -> `ExitOperator`.
    -   **Flujo**: Vienen a **RECOGER** producto para clientes.

### B. Proceso Operativo Integral

| Fase | Operador de Barco (MI/MP) | Operador de Salida (Carga) |
| :--- | :--- | :--- |
| **1. Vigilancia (Entrada)** | Escaneo -> Pendiente -> Checklist Físico -> **Autorizar**. | Escaneo -> Pendiente -> Checklist Físico -> **Autorizar**. |
| **2. Documentación** | Generación de Orden de Embarque (OE). | Generación de OE vinculada a Orden de Venta (OV). |
| **3. Báscula (Entrada)** | Pesaje **LLENO** (Peso Bruto). *ID vía QR*. | Pesaje **VACÍO** (Tara Inicial). *ID vía Folio OE*. |
| **4. Almacén (APT)** | Descarga de producto (Escaneo QR Ubicación). | **PENDIENTE** (Sin proceso de carga definido). |
| **5. Báscula (Salida)** | Pesaje **VACÍO** (Tara Final). *ID vía QR*. | Pesaje **LLENO** (Peso Neto cargado). *ID vía Folio OE*. |
| **6. Vigilancia (Salida)** | Registro de Salida (Fecha/Hora manual). | Registro de Salida (Fecha/Hora manual). |

> [!IMPORTANT]
> **Identificación en Báscula**: A diferencia de los operadores de barco que utilizan el código QR para identificarse, los **Operadores de Salida** se identificarán en la báscula mediante el **Folio de la Orden de Embarque (OE)** generado en Documentación.

---

## 7. Reglas de Vigilancia

### Checklist y Autorización
- El checklist es **físico** (Casco, Chaleco, Botas, Estado de Unidad). 
- El sistema de Vigilancia **no es bloqueante**: se pueden escanear múltiples unidades y quedan en la pestaña **Pendientes**.
- Un usuario supervisor decide si el checklist fue exitoso haciendo clic en **Autorizar** o **Denegar**.
- Solo las unidades autorizadas pasan al estado `in_plant` y pueden ser procesadas en los siguientes módulos (Documentación/Báscula).

### Control de Salida
- Al salir, se debe registrar manualmente la fecha y hora exacta de salida para mantener la precisión de los tiempos de estadía en planta.

### Historial y Auditoría
- El sistema mantiene una bitácora completa de cada ingreso con filtros por fecha y paginación debido al alto volumen de unidades diarias.
- Se puede consultar la información completa del operador (Empresa, Placas, Licencia) en cualquier momento mediante el botón de detalles.

---

## 8. Detalle Avanzado: Comercialización y Embarques

Esta sección detalla la lógica de negocio específica para el flujo de ventas, saldos y despacho de mercancía, actualizada con las reglas de validación y operación más recientes.

### A. Orden de Venta (Sales Order - OV)
Documento rector que ampara la transacción comercial.
- **Estructura**:
    - **Cabecera**: Cliente, Folio, Fecha.
    - **Detalle**: Producto, Cantidad Solicitada (Toneladas), Precio Unitario.
- **Lógica de Saldos (Balances)**:
    - **Solicitado**: Cantidad total contratada en la OV.
    - **Cargado (Surtiendo)**: Suma del tonelaje de todas las Órdenes de Embarque (OE) vinculadas.
        - *Regla de Cálculo*:
            - **Envasado (Sacos)**: Si el producto es envasado, la carga se asume completa (programada) al documentar, o se ajusta si hay proceso de conteo diferente. (Actualmente se mapea lo programado).
            - **Granel**: Se considera el `Peso Neto` real de báscula una vez que la unidad ha salido (Ticket cerrado).
    - **Saldo Pendiente**: `Solicitado - Cargado`.
        - *Bloqueo*: El sistema **NO** permite crear una nueva OE si el `Saldo Pendiente` es insuficiente.

### B. Orden de Embarque (Shipment Order - OE)
Representa la instrucción logística para un viaje específico.

#### 1. Reglas de Creación y Validación
- **Vinculación Obligatoria**: Debe seleccionarse un Cliente y una OV con saldo disponible.
- **Validación de Tonelaje**: El sistema valida estrictamente que `Toneladas Programadas` <= `Saldo Disponible de la OV`.
- **Validación de Carta Porte**:
    - El campo `Carta Porte` es obligatorio y funcional.
    - **Regla de Unicidad**: No pueden existir dos OEs activas o completadas con el mismo número de Carta Porte para la misma Transportista. Se muestra una alerta inmediata si se detecta duplicidad.
- **Datos del Consignatario (Consignee)**:
    - Campo editable. Permite facturar al Cliente A pero entregar al Consignatario B.
    - Se inicializa con el nombre del Cliente.

#### 2. Selección de Transporte y Operador
Flujo optimizado para Documentación:
- **Búsqueda de Operador**:
    - Se busca por Nombre o ID interno.
    - Al seleccionar, se auto-completa el campo `Licencia`.
- **Búsqueda de Unidad**:
    - Se busca por Número Económico.
    - Al seleccionar, se auto-completan: `Placas Tractor`, `Placas Remolque`, `Tipo de Unidad` (Tolva/Volteo) y `Marca/Modelo`.

#### 3. Estados Operativos (Status)
- **Creada**: OE generada en Documentación.
- **En Proceso**: Unidad pesando o cargando.
- **Completada**: Unidad despachada con peso final. Afecta saldo real (Granel).
- **Cancelada**: Libera el saldo reservado.

### C. Mapeo de Datos para Impresión (Formato Oficial)
El formato de impresión de la OE (PDF) cumple con requisitos estrictos de imagen corporativa y legalidad:

- **Estructura de Documento**:
    - **Página 1**: Información operativa compacta, firmas, tiempos.
    - **Página 2**: "POLÍTICA PARA EL PROCESO DE EMBARQUES" (Texto legal completo).
- **Mapeo de Visualización**:
    - **Unidad**: Muestra la `Marca/Modelo` del vehículo (ej: "KENWORTH T680").
    - **Económico**: Muestra el número económico interno de la flota.
    - **Estado**: Muestra el estado federativa de destino seleccionado.
    - **Cálculo de Sacos**:
        - Si la presentación es sacos (25kg, 50kg, etc.), el sistema calcula automáticamente la cantidad de sacos basada en las toneladas programadas para mostrarlo en el documento.
        - Fórmula: `Tons * 1000 / Kg_por_saco`.
