# Bitácora de Cambios - JONA

Este archivo sirve como historial de las modificaciones realizadas en el sistema para mantener la sincronización entre los miembros del equipo.

---

## 📅 09 de Abril de 2026 - Control de Referencias y Dashboard de Buques

### 1. Sistema de Referencias (Destinos)
- **Nuevo Módulo**: Se creó una tabla de base de datos (`loading_order_references`) y su respectivo mantenimiento para gestionar un catálogo dinámico de destinos (ej. Bodega Cangrejera, Isquisa, etc.).
- **Componentes UI**: Se desarrollaron los componentes `ReferenceDropdown.tsx` y se integraron en los formularios de la báscula.

### 2. Flujo Especial para Barcos "Chief Foreman + Almacén Externo"
- **Entrada (EntryMP)**: Se ocultó el campo de referencia para cumplir con la lógica de que en estos barcos el destino no se define al entrar.
- **Salida (ExitMP)**: Se integró el selector de referencias para que el pesador asigne el destino final al momento del destare.
- **Persistencia**: Se modificó `WeightTicketController@storeExit` para asegurar que el valor seleccionado se guarde en la orden de carga.

### 3. Logística de Tickets
- **Mapeo Inteligente**: En la impresión del ticket (`WeightTicketController@printTicket`), para barcos con flujo especial, el valor de la "Referencia" se imprime automáticamente en el campo **"DESTINO"**, permitiendo que el documento físico sea válido para la logística externa.

### 4. Dashboards y Analítica
- **Dashboard Almacén**: Las gráficas de almacenamiento ahora usan el nombre de la **Referencia** como etiqueta en lugar de "ALMACÉN CLIENTE" para barcos especiales. Se implementó un patrón de consulta anidada para garantizar que el desglose (drill-down) funcione sin errores.
- **Dashboard de Buques (DoctorController)**: Se corrigió la lógica del panel de e-estatus de muelle. Ahora el tonelaje "Descargado" y "Pendiente" por bodega (B1, B2, B3) se lee directamente de los tickets de báscula, reflejando el peso real descargado.

### 5. Formato de Ticket Media Carta Vertical
- **Optimización Barcos**: Se implementó un nuevo diseño de ticket exclusivo para operaciones de buques, optimizado para impresión en **hojas media carta vertical**.
- **Layout Inteligente**: El diseño es más estrecho (14cm) y organiza la información de manera vertical (apilada) para evitar encimamiento de textos.
- **Configuración de Impresión**: Se configuró el estilo de impresión para detectar automáticamente el tamaño `half-letter portrait` cuando es un ticket de barco.

---

> [!NOTE]
> **Acción Requerida**: Siempre que se suban cambios al servidor de producción, favor de verificar si hay nuevas migraciones pendientes para el catálogo de referencias.
