# Verificación de una implementación visual

## Antes de decir que está terminada

- Cuenta secciones diseñadas, composiciones generadas, activos y secciones implementadas. Explica diferencias deliberadas.
- Ejecuta el proyecto y abre su página real. Una imagen de diseño no verifica HTML/CSS, y una compilación no verifica encuadre.
- Compara cada sección con su diseño: estructura, jerarquía, márgenes, escala, saltos de línea, foto, posición focal y controles. Corrige las diferencias grandes antes de detalles menores.
- Prueba un portátil pequeño, escritorio y móvil cuando el alcance lo justifique. Verifica también textos largos, zoom y la anchura mínima prometida. No ocultes desbordamiento para encubrir contenido cortado.
- Comprueba carga y dimensiones de todas las imágenes, versiones responsive y estabilidad del layout. Evita cargar activos enormes que nunca se mostrarán a ese tamaño.
- Activa realmente cada CTA, menú, selector, acordeón y formulario pertinente. Los enlaces deben llevar a un destino real. Las descargas deben producir un archivo correcto; no basta con un atributo `download`.
- Verifica diálogo desde el título, foco inicial, retorno del foco, Escape y recorrido con teclado. Los botones inferiores no deben superponerse al cierre superior. Informa si el entorno no permite comprobar una interacción.
- Prueba movimiento reducido y pausa cuando proceda. No bloquees lectura o acciones hasta que termine una animación.
- Revisa consola después de recargar la versión final y repetir interacciones. Distingue mensajes históricos durante edición de errores reproducibles actuales.
- Ejecuta tipos, lint, pruebas y compilación apropiados. No escribas pruebas que solo confirmen el texto del código. Usa casos reales, límites e invariantes.

## Informe veraz

Registra dispositivos o viewports, flujos probados, resultados y limitaciones. `Se ve bien` no equivale a accesibilidad auditada, alto rendimiento medido o compatibilidad universal. No afirmes una puntuación Lighthouse, aprobación WCAG o premio Awwwards sin la medición o evidencia correspondiente.

La revisión final debe buscar activamente un defecto: una sección sin inspeccionar, un texto demasiado pequeño, un activo reutilizado por comodidad o una interacción incompleta. Corrige lo encontrado y repite la comprobación relevante.
