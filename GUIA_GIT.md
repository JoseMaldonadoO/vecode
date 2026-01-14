# Guía de Trabajo con Git (Equipo Vecode)

Para evitar conflictos y errores en producción, seguiremos este flujo de trabajo estricto.

## Regla de Oro
🚫 **NUNCA trabajar ni hacer commit directamente en la rama `main`.**

## Configuración Inicial (Solo una vez)

Cada desarrollador debe tener su propia rama de trabajo.

**Jose:**
```bash
git checkout -b Jose
git push -u origin Jose
```

**Jona:**
```bash
git checkout -b Jona
git push -u origin Jona
```

---

## Flujo Diario de Trabajo

### 1. Actualizar (Al empezar el día)
Antes de escribir código, descarga los últimos cambios aprobados de `main` a tu rama.

```bash
# Estando en tu rama (Jose o Jona)
git pull origin main
```
*Esto mezcla lo nuevo de main en tu rama automáticamente.*

### 2. Guardar Cambios (Durante el día)
Trabaja en tu rama. Guarda seguido.

```bash
git add .
git commit -m "Descripción clara del cambio"
```

### 3. Subir Cambios (Al terminar una tarea)
Sube tu rama a la nube para respaldo o revisión.

```bash
git push
```

---


## Integración Automática (El Rol de Jose)

Para simplificar, usaremos un flujo de **Integrador**:

1.  **Jona:** Solo se preocupa por trabajar en su rama `Jona` y hacer `git push`.
2.  **Jose (y su Antigravity):** Son los encargados de llevar todo a producción (`main`).

### Instrucciones para el Antigravity de Jona:
> "Solo asegúrate de subir mis cambios a mi rama `origin/Jona`. No toques Main."

### Instrucciones para el Antigravity de Jose (Al finalizar una tarea):
> "Antigravity, integra los cambios de Jona y los míos en Main."

El agente de Jose ejecutará automáticamente:
1.  Bajar cambios de Jona (`git fetch origin Jona`).
2.  Mezclarlos en Main.
3.  Mezclar cambios de Jose en Main.
4.  Subir Main actualizado.


---

## Solución de Problemas

**¿Hice cambios en `main` por error?**
No entres en pánico. Muévelos a tu rama así:

```bash
git checkout -b mi-rama-recuperada
# Ahora tus cambios están a salvo aquí
```

**¿Hay Conflictos?**
Si al hacer `git pull origin main` git te avisa de conflictos:
1. Abre los archivos marcados en rojo.
2. Decide qué código se queda (el tuyo o el que viene de main).
3. Guarda, haz `git add .` y `git commit`.
