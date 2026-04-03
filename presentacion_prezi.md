# Presentación: Flujo Operativo y de Control en Vecode
## Pro-Agroindustria: De la Venta a la Salida del Producto

---

## 1. Registro de Clientes
El flujo comienza con el alta de clientes autorizados en el sistema.
- **Proceso:** Se registran los datos fiscales, razón social e información de contacto del cliente.
- **Prevención de Errores:** Evita errores tipográficos en facturación y operaciones posteriores, centralizando la información en un catálogo único y estandarizado, forzando campos obligatorios (Razón Social, RFC, Dirección).

---

## 2. Creación de Órdenes de Venta (OV)
La Orden de Venta representa el contrato o compromiso comercial con el cliente.
- **Proceso:** Se vincula a un cliente y un producto específico, estableciendo el tonelaje total pactado y las condiciones de entrega.
- **Prevención de Errores:** 
  - Generación automática de folios secuenciales basados en el año y el consecutivo (ej. OV-AMO-25-1).
  - Bloqueo de edición: Una vez que la OV entra en proceso operativo (tiene embarques vinculados), se bloquea cualquier modificación para garantizar la trazabilidad financiera.

---

## 3. Creación de Órdenes de Embarque (OE)
La Orden de Embarque (OE) autoriza un viaje físico para cumplir con la Orden de Venta.
- **Proceso:** Se selecciona la OV correspondiente y se programa el tonelaje esperado (Documentación).
- **Prevención de Errores (Crítico):**
  - **Saldo Inteligente:** El sistema bloquea automáticamente la creación de una OE si el "tonelaje programado" supera el "saldo disponible" de la OV vinculada.
  - **Duplicidad:** Implementa validación estricta para asegurar que la "Carta Porte" sea única e irrepetible por cada línea transportista.
  - **Estandarización:** Normaliza y fuerza a mayúsculas toda la información (placas, nombres, línea de transporte) para homogeneizar las bases de datos.

---

## 4. Gestión de Operadores de Salida
Antes de que una unidad ingrese a la planta, se debe registrar al conductor y al vehículo.
- **Proceso:** Se capturan los datos del operador (Licencia, Nombre) y de la unidad (Placas del tractocamión y remolque, tipo de unidad, número económico, línea transportista).
- **Prevención de Errores:**
  - **Vinculación directa:** Carga automáticamente los datos verificados del camión y conductor al seleccionar un operador existente, eliminando la captura manual repetitiva.
  - **Validación de Vetos:** Bloqueo íntegro si el operador tiene un estatus de "Vetado" por seguridad o faltas previas.

---

## 5. Ingreso y Pesaje Inicial en Báscula
La unidad ingresa físicamente a la instalación para su carga.
- **Proceso:** La unidad se pesa vacía (Tara). Desde la interfaz de báscula, el operador selecciona la Orden de Embarque correspondiente.
- **Prevención de Errores:**
  - El sistema extrae en cascada toda la información sin intervención del pesador (Cliente, Producto, Unidad, Conductor).
  - La báscula genera el estatus "En Progreso", evitando que la misma Orden de Embarque sea procesada dos veces por error.

---

## 6. Registro y Asignación en Almacén (APT)
Punto de control interno para carga del producto.
- **Proceso:** Mediante escaneo del código QR (de la orden o del operador), el personal de Almacén de Producto Terminado (APT) recibe la unidad y le asigna la nave (y cubículo si aplica) donde será cargado.
- **Prevención de Errores:**
  - **Bloqueo de Secuencia:** No permite escanear a un camión en APT si este no ha pasado previamente por el pesaje inicial en Báscula.
  - **Trazabilidad de Inventario:** Registra el momento exacto y la ubicación exacta de carga en el sistema (ej. Almacén 4, Cubículo 2).

---

## 7. Destare en Báscula y Cierre
Finalización del viaje con el pesaje del vehículo cargado.
- **Proceso:** El camión regresa a la báscula de salida. Se registra el Peso Bruto (camión + carga).
- **Cálculo Automático:** El sistema calcula de inmediato: `Peso Neto = Peso Bruto - Tara`.
- **Prevención de Errores:**
  - Cálculos matemáticos protegidos por la aplicación, impidiendo el error humano en las restas de pesaje manuales.
  - Descuento inmediato del Peso Neto real sobre el saldo histórico de la Orden de Venta.
  - Cierre automático de ciclo para habilitar la impresión de salida.

---

## 8. Impresión de Tickets e Instrucciones
Se generan los comprobantes físicos del viaje finalizado.
- **Proceso:** Creación de Tickets de Báscula y de la "Instrucción de Carga" (Formato GLS-AP-FO-001).
- **Prevención de Errores:**
  - Plantillas inmutables que extraen datos directos de la base de datos de los pasos anteriores.
  - Ajuste dinámico de descripciones (como el tamaño de los sacos automatizado a "25 KG" en caso de producto envasado).

---

## 9. Reportes y Trazabilidad Activa
Monitorización en tiempo real y exportación contable.
- **Seguimiento al Mínimo Detalle:** Reportes de seguimiento de Órdenes de Embarque (`Excel general` / `Excel Sader`) listos para usarse en Excel y pre-filtrados.
- **Saldos Transparentes:** El Dashboard y listado de Ventas muestran cuántas toneladas quedan reales por entregar, sumando automáticamente los viajes en progreso y los tickets completados.
- **Dashboard Activo:** Un conteo en tiempo real de los camiones "En Circuito", lo que permite a logística visualizar cuellos de botella al instante.

---

## 10. Creación y Configuración del Barco
El flujo de descarga (importación) inicia definiendo las reglas de operación del Barco.
- **Proceso:** Se capturan datos del buque (ETA, Nombre), la distribución de carga por bodegas y las configuraciones de flujo: ¿Usará Muelle Externo?, ¿Almacén Externo?, ¿Tipo de Operación (Báscula o Burreo)? y si ¿Requiere Chief Foreman en muelle?
- **Prevención de Errores:**
  - **Validación Matemática:** La suma del tonelaje declarado por cada bodega debe ser exactamente igual al "Tonelaje Programado" total (Impide discrepancias de captura).
  - **Control de Ocupación:** Al asignar muelle (ECO o WHISKY) y fecha (ETB), el sistema verifica automáticamente que no se traslape con otro barco activo, bloqueando colisiones logísticas en sistema.

---

## 11. Arribo y Control de Muelle (Dock Trips)
Gestión del tráfico de camiones desde el muelle (lado buque) hacia la planta.
- **Proceso:** Si el barco requiere "Chief Foreman", un supervisor en muelle escanea a cada camión (Código QR) indicando la bodega de la que está extrayendo producto.
- **Prevención de Errores:**
  - **Trazabilidad Ininterrumpida:** Ningún camión puede registrar su descarga en Almacén (APT) si no tiene primero su "vuelta" registrada en el Muelle (Garantiza el flujo FIFO).
  - **Validaciones Especiales:** Si el barco usa almacén externo pero pesa en báscula, obliga al operador a ir primero a la Báscula (Genera Ticket MI) antes de poder asignarle carga en muelle.

---

## 12. Rutas Dinámicas: Burreo vs Báscula
El sistema adapta automáticamente sus reglas según la operación seleccionada.
- **Flujo Báscula:** El camión obligatoriamente debe pesarse vacío a la entrada, y lleno a la salida, obteniendo el peso neto físico.
- **Flujo Burreo (Descarga Directa):**
  - **Proceso:** Se asigna un "Peso Provisional" por viaje basado en promedios o lecturas preliminares de calado (Draft).
  - **Automatización Ultrasónica:** Si la operación es "Burreo" + "Almacén Externo", el escaneo en muelle genera automáticamente la Orden de Carga, asigna el Almacén de Cliente, genera el Ticket de Báscula y aprueba la salida instantáneamente (Cierra 4 pasos manuales en 1 segundo y evita discrepancia).
  - **Retroactividad:** Transforma todos los tickets provisionales masivamente una vez se tiene el Peso Calado Oficial final del buque.

---

## 13. Visibilidad y Monitoreo: Dashboards Integrales
Tres centros de control que vigilan todas las vertientes en tiempo real:
- **Dashboard General:** Muestra viajes completados, "Unidades en Circuito" de las últimas 4 horas (detectando atascos viales), el progreso (% descargado vs programado) y gráficas de desempeño.
- **Estatus Muelle:** Calcula el desempeño por "Bodega" del barco en vivo. Sabe cuántas toneladas tenían, cuántos viajes se han hecho en esa bodega exacta, y cuánto peso falta por descargar.
- **Estatus APT (Almacén):** Mapea cada almacén físico y sus cubículos. Muestra el porcentaje de ocupación en tiempo real de los almacenes , indicando qué peso resguardan hoy.

---

## 14. Vigilancia: El Guardián del Recinto
El primer y último filtro de seguridad de la planta.
- **Proceso:** Escaneo obligatorio de códigos QR para todo operador (Barco o Ventas). El sistema identifica instantáneamente si es una unidad propia (Vessel Operator) o externa (Exit Operator).
- **Prevención de Errores:**
  - **Filtro de Veto:** Si un operador ha sido sancionado o vetado por seguridad, el sistema bloquea su registro en rojo brillante, impidiendo que avance a la lista de espera.
  - **Control de Aforo Real:** Impide registrar el ingreso de una unidad que el sistema detecta que "Ya está en planta" (Evita duplicidad de registros por error de dedo).
  - **Checklist de Seguridad:** Obliga al personal de vigilancia a confirmar que la unidad y el operador cumplen con el equipo de protección personal (Casco, Chaleco, etc.) antes de autorizar el acceso.

---

## 15. Inteligencia en Almacenes (APT e Inventarios)
Más que una bodega, es un mapa de datos vivo.
- **Proceso:** Visualización gráfica de las naves y cubículos. El personal puede ver qué producto hay en cada sección y cuántas toneladas se han depositado en cada una.
- **Prevención de Errores:**
  - **Sincronización Automática:** Toda tonelada que sale de la báscula se descuenta o suma al inventario del cubículo seleccionado sin intervención manual.
  - **Trazabilidad de Movimientos:** Cada vez que se escanea un camión en APT, el sistema guarda quién fue el montacarguista o personal de almacén que recibió esa unidad específica.

---

## 16. Auditoría y Responsabilidad (User Tracking)
Transparencia total en cada clic.
- **Proceso:** Vecode registra el ID de usuario en cada evento crítico: creación de venta, impresión de ticket, autorización de acceso o cambio de configuración.
- **Prevención de Errores:**
  - **Historial de Cambios:** Permite rastrear quién modificó una Orden de Embarque o quién permitió el acceso a un operador vetado (en caso de excepciones manuales).
  - **Seguridad por Perfiles:** El sistema segmenta funciones; el personal de báscula no puede modificar inventarios de almacén, y el personal de vigilancia no puede alterar pesos de tickets.
