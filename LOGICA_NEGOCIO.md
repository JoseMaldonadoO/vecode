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

39: - **Vinculación Automática**: El operador queda "asignado" a ese barco. Esto permite que en la Báscula o en el Escáner de Almacén, el sistema lo reconozca simplemente por su QR o placa, sin necesidad de re-capturar datos en cada viaje.
40: 
41: ### 📑 Orden de Venta (Sales Order - OV)
Representa el compromiso comercial / contrato con el cliente.
- **Registro**: Se realiza en el módulo **Comercialización**.
- **Función**: Define el cliente, el producto y la cantidad total pactada. Una OV puede ser surtida por múltiples viajes (OE).

### 🚛 Orden de Embarque (Shipment Order - OE)
Representa un viaje físico particular de una unidad para surtir una OV o para descarga de barco.
- **Relación**: Toda OE de surtido **DEBE** estar vinculada a una OV activa.
- **Gestión**: Se registran los datos de transporte (Chofer, Placas, Transportista).

### C. Gestión de Productos (Product Management)
42: **Ubicación**: Módulo `Tráfico` -> `Productos`.
43: 
44: **Lógica del Proceso**:
45: 1.  **Administración**: Permite dar de alta y visualizar el catálogo de productos disponibles en el sistema.
46: 2.  **Campos**: Requiere `Código` (Identificador único), `Nombre` (Descripción comercial) y `Presentación` (Tipo de empaque por defecto, ej: Granel, Saco).
47: 3.  **Uso**: Estos productos son seleccionados al crear Órdenes de Venta (OV) o al configurar descargas de barcos (OB).
48: 
49: ---

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
5.  **Cálculo de Peso Final (Draft)**:
    -   *Cierre de Operación*: Una vez finalizada la descarga total, se ingresa el **Peso de Draft** total (en TM) en el módulo de Tráfico.
    -   *Recálculo Final*: El sistema calcula el promedio real (`Peso Draft / Total de Unidades`) y actualiza automáticamente todos los tickets de Burreo de ese barco con este valor final, sobreescribiendo el provisional.
    *   **Regla de Múltives Viajes**: Cada escaneo genera una nueva Shipment Order. El sistema alerta el número de descarga consecutivo.

---

## 4. Puntos de Control (Checkpoints)

-   **Dashboard Operativo**: Muestra el acumulado de ambos flujos. Es la vista unificada para la toma de decisiones.
-   **Scanner APT**: Punto de control físico en almacén. Valida que la unidad que llega a descargar esté activa y vinculada al barco correcto.
    -   **Validación de Flujo**: Si el barco es tipo `scale`, el sistema **RECHAZARA** el escaneo si no hay una OE con ticket de entrada.
    -   **Protección de Datos**: Evita la auto-creación accidental de registros de "Burreo" para unidades que deben ser pesadas obligatoriamente.
