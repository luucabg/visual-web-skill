# Caso OFFGRID: de composición a activo y web

Proyecto conceptual de viajes creado en esta sesión de trabajo. Las fotografías son generadas, no documentación de destinos ni de servicios reales. Es un caso de proceso: la marca, paleta y estructura no son valores por defecto para otros encargos.

## Abre solo lo necesario

Cada fila contiene dos imágenes distintas: un diseño completo de sección y una fotografía independiente sin interfaz. Para estudiar el método, abre primero una pareja. Para reproducir la secuencia de diseño de este caso, abre las ocho composiciones en orden.

| Función | Composición generada | Activo independiente |
|---|---|---|
| Portada | [01 Hero](sections/01-hero-reference.png) | [Patagonia](photos/01-patagonia.png) |
| Manifiesto | [02 Manifiesto](sections/02-manifesto-reference.png) | [Quietud](photos/02-stillness.png) |
| Destinos | [03 Destinos](sections/03-destinations-reference.png) | [Noruega](photos/03-norway.png) |
| Ruta destacada | [04 Islandia](sections/04-iceland-reference.png) | [Río glaciar](photos/04-iceland.png) |
| Filosofía | [05 Filosofía](sections/05-philosophy-reference.png) | [Cabaña](photos/05-cabin.png) |
| Cuaderno | [06 Cuaderno](sections/06-journal-reference.png) | [Caminante](photos/06-hiker.png) |
| Planificador | [07 Planificador](sections/07-planner-reference.png) | [Tienda](photos/07-tent.png) |
| Cierre | [08 Cierre](sections/08-closing-reference.png) | [Horizonte](photos/08-horizon.png) |

## Prompts y traducción

- [Registro de secciones 1–3](art-opening.md): prompts de composición y fotografía, proporciones y revisión visual.
- [Registro de secciones 4–6](art-story.md): alternancia de imagen dominante, texto y galería editorial.
- [Registro de secciones 7–8](art-closing.md): formulario abierto y cierre de marca, activos de distinta orientación.
- [Análisis de implementación](ANALYSIS.md): decisiones para trasladar las imágenes a HTML y CSS.

Son registros históricos conservados: las rutas de la máquina original citadas dentro no son dependencias. Los archivos de este paquete se encuentran mediante la tabla anterior. Las capturas de inspiración antiguas mencionadas por los registros no están incluidas; no confundas esas observaciones con las capturas actuales de la biblioteca.

## Qué transferir

1. Una idea de marca organiza copy, fotografía y ritmo antes de generar.
2. Cada sección tiene una función y una composición propia dentro de la misma identidad.
3. El diseño de sección permite decidir encuadre y espacio para texto. La fotografía se genera después como activo nuevo sin letras ni botones.
4. Los tamaños solicitados al generador y los tamaños devueltos pueden diferir: mide los archivos reales.
5. El código conserva texto seleccionable, enlaces, controles y estados reales. Una captura de diseño no sustituye estas funciones.
6. Las referencias se revisan antes de pasarlas al generador: el registro de cierre detectó un aviso de cookies y descartó esa entrada como referencia principal.

No transfieras automáticamente el verde, los paisajes, los ocho apartados, las frases, las restricciones específicas del brief ni la afirmación histórica de que una comprobación pasó. Una nueva implementación requiere sus propias pruebas.
