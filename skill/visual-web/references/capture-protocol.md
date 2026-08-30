# Añadir referencias reales

## Captura

1. Abre la URL pública en el navegador disponible y cumple las instrucciones de su herramienta. No sustituyas una captura por una imagen generada. No eludas bloqueos, login ni restricciones de acceso.
2. Espera al contenido legible observando el estado real. Descarta pantallas de carga, avisos de error y capturas accidentales durante transiciones. Cierra avisos de cookies mediante la opción de rechazo cuando exista; no edites la captura para borrarlos.
3. Elige una portada, secciones interiores distintas y una vista móvil. Una captura debe explicar una decisión de diseño concreta. Si una sección continúa fuera del viewport, indícalo; no la describas como una captura completa.
4. Usa navegación y desplazamiento reales para encuadrar. No alteres CSS, DOM, texto ni estado de la página para mejorar artificialmente el resultado. Los efectos de hover deben capturarse y etiquetarse como tales o retirarse moviendo el puntero antes de la captura de reposo.
5. Guarda los bytes originales JPEG o PNG de viewport sin edición visual, con extensión acorde a la firma, fecha, URL final, scrollY, viewport CSS e imageDimensions de los bytes. Pueden diferir por barras de scroll o captura del navegador; no inventes un DPR. Identifica claramente estados antes/después cuando documentes interacción. Una pareja de capturas acredita los estados observados, no su duración ni biblioteca de animación.

## Metadatos y análisis

Crea `references/sites/<id>/source.json` y las imágenes originales. Usa IDs minúsculos con guiones. El manifiesto guarda id, name, url, capturedAt y captures; cada captura contiene id, file, kind, viewport, imageDimensions, pageUrl, capturedAt, scrollY y sectionLabel. Las rutas son relativas a la raíz de la skill. Conserva el JSON sin secretos ni datos de sesión.

Abre todas las imágenes guardadas y redacta analysis.md y analysis.json con los campos del catálogo. El análisis debe describir lo visible, explicar cómo adaptarlo y señalar qué no reutilizar. `motion.status` será `not-tested` salvo interacción observada. Incluye etiquetas útiles en español e inglés, sin listas indiscriminadas de términos.

Integra los datos en catalog.json y regenera INDEX.md. Ejecuta `node <raíz>/scripts/validate.mjs` y las pruebas del paquete. El validador puede comprobar integridad y dimensiones; un humano o agente visual aún debe comprobar encuadre y contenido.

## Fuente y uso

Las capturas conservan marcas y contenidos de sus autores. Se incluyen como referencias para estudio y análisis, sin afirmar autoría ni otorgar derechos de reutilización. No copies sus fotos, ilustraciones, logos o textos a entregables de otra marca. Mantén separados los activos propios y el material de referencia.

Antes de distribuir públicamente un paquete con capturas de terceros, revisa la procedencia y los permisos aplicables. La biblioteca local no presupone autorización para publicar todos sus archivos en GitHub. Una alternativa de distribución es publicar instrucciones, catálogo y análisis propios, y mantener las capturas en una colección privada.
