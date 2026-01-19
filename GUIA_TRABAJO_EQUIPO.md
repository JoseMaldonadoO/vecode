# 🤝 Guía de Trabajo en Equipo (Git Flow)

Cuando varias personas trabajan en el mismo proyecto, **trabajar directamente en `main` causa conflictos** y sobreescritura de código (como pasó con la Carta Porte).

Para evitar esto, sigan estas reglas de oro:

## 1. La Regla de Oro
**NUNCA trabajes ni hagas push directo a la rama `main`.**
La rama `main` es sagrada: solo debe tener código funcional listo para producción (ya que Hostinger despliega automáticamente).

## 2. Flujo de Trabajo (Feature Branches)

Cada nueva tarea o arreglo es una "rama" (branch) separada.

### Paso 1: Crear una rama para tu tarea
Antes de escribir código, crea una copia fresca:
```bash
git checkout main
git pull origin main           # Descarga lo último de tu compañero
git checkout -b feature/nombre-tarea  # Crea tu rama personal
```
*Ejemplos:* `feature/carta-porte`, `fix/error-login`, `style/navbar`.

### Paso 2: Trabajar y Guardar
Trabaja en tu rama. Haz commits frecuentes:
```bash
git add .
git commit -m "Avance en carta porte..."
```

### Paso 3: Subir tu rama
Sube TU rama, no la main:
```bash
git push origin feature/nombre-tarea
```

### Paso 4: Unir cambios (Merge/Pull Request)
1. Ve a GitHub.
2. Verás un botón "Compare & pull request".
3. Crea el Pull Request.
4. **Tu compañero revisa** que no rompas nada.
5. Si todo está bien, le dan al botón **Merge** en GitHub.
6. GitHub Actions desplegará automáticamente.

## 3. ¿Qué hago si mi compañero actualizó main?
Si tu compañero hizo merge de sus cambios a `main` y tú sigues trabajando en tu rama, necesitas actualizarte:

```bash
git checkout main
git pull origin main           # Bajas los cambios de tu compañero
git checkout feature/tu-rama
git merge main                 # Mezclas sus cambios en TU rama
```
*Aquí resuelves conflictos si los hay, en tu propia rama, sin romper producción.*

---

## Resumen de Comandos

| Acción | Comando |
|--------|---------|
| **Empezar tarea** | `git checkout -b feature/nueva-tarea` |
| **Guardar** | `git commit -m "Cambios"` |
| **Subir** | `git push origin feature/nueva-tarea` |
| **Actualizar mi rama** | `git pull origin main` (estando en main) -> `git merge main` (en tu rama) |

---

## 🧪 Verificación de Despliegue

**Timestamp de última modificación**: 2026-01-19 11:25 CST

✅ Si puedes ver esta sección en el servidor de producción, significa que:
- El archivo `release.zip` se está creando correctamente
- El archivo `extract.php` está funcionando
- Los archivos se están extrayendo exitosamente en `/VECODE/`

**Workflow ejecutado**: #261 (fix: Corregir ruta de eliminación del archivo de estado FTP)
