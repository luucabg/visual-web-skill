# Pruebas independientes de Visual Web

Tres agentes recibieron briefs distintos y utilizaron la misma skill sin instrucciones de copiar OFFGRID. Cada uno seleccionó y abrió capturas reales, explicó sus decisiones, generó un hero horizontal con ImageGen y revisó el PNG final. La revisión de integración volvió a abrir los tres resultados y contrastó sus registros con el catálogo.

Son pruebas de dirección de arte y generación. **No son tres webs implementadas** ni una evaluación de accesibilidad, animación, responsive o rendimiento. Las marcas, espacios, objetos y escenas son conceptos ficticios.

| Encargo | Referencias realmente abiertas | Resultado observado |
| --- | --- | --- |
| ARCO · rehabilitación residencial | Norm Architects: hero y móvil. Oryzo: hero. | Panel mineral escalonado, serif editorial y escena de rehabilitación. Acción de contacto visible y declaración de imagen conceptual dentro del diseño. |
| PULSO · instrumento musical portátil | Teenage Engineering: hero, instrumento y móvil. Oryzo: hero y móvil. | Producto dominante sobre piedra, marca condensada de gran escala y acento coral en cinta y control. No aparecen especificaciones, precio ni avales inventados. |
| MESA · talleres creativos para adultos | Floema: hero y móvil. Oryzo: hero. Teenage Engineering: hero. | Titular contundente y mesa compartida con acciones manuales. El borde irregular separa fotografía y lectura; CTA único sin datos de cursos ficticios. |

## ARCO

![Hero conceptual de ARCO](architecture/hero.png)

[Selección](architecture/selection.json) · [Dirección](architecture/direction.md) · [Prompt exacto](architecture/prompt.md) · [Revisión](architecture/review.md)

Salida original: 1536 × 1024. El panel conserva lectura independiente de la foto; una anotación de material introduce una segunda lectura ligada al negocio. No demuestra obras construidas. Una futura implementación deberá medir contraste, fijar alturas para portátil y recomponer móvil.

## PULSO

![Hero conceptual de PULSO](instrument/hero.png)

[Selección](instrument/selection.json) · [Dirección](instrument/direction.md) · [Prompt exacto](instrument/prompt.md) · [Revisión](instrument/review.md)

Salida original: 1536 × 1024. La escala del objeto, la mano y la cinta comunican uso y portabilidad. Su diseño es conceptual: no demuestra fabricación, ergonomía ni funciones. Esta condición consta en el brief y la revisión; antes de publicarlo fuera de ese contexto debe hacerse visible también en la página.

## MESA

![Hero conceptual de MESA](school/hero.png)

[Selección](school/selection.json) · [Dirección](school/direction.md) · [Prompt exacto](school/prompt.md) · [Revisión](school/review.md)

Salida original: 1568 × 1003. La fotografía explica el aprendizaje presencial sin inventar profesores, fechas o ubicación. La paleta generada omite casi todo el azul previsto y conserva crema, coral y materiales naturales. Se aceptó por coherencia, no por una coincidencia literal con el prompt. El contraste coral/blanco debe medirse al implementar.

## Aprendizajes y límites

- Las tres propuestas conservaron fuente → observación → adaptación → descarte, con IDs reales y al menos una captura móvil. El verificador comprueba los archivos y los IDs; la apertura real y la calidad visual se revisaron aparte.
- ARCO consultó dos portadas y una vista móvil para resolver solo un hero. Se precisó el protocolo para exigir interiores en una página completa, sin imponerlos cuando una pieza aislada no los necesita. Es un ajuste de alcance, no una nueva regla estética.
- Las composiciones tienen jerarquías distintas, aunque los tres briefs favorecieron fotografía material. Esta muestra no prueba todavía ilustración, software complejo, todos los sectores ni una mejora comparativa frente a otra skill.
- Los formatos horizontales no coinciden exactamente con todas las proporciones sugeridas. No se recortaron ni deformaron para ocultarlo.
- Cada hero es una composición raster de referencia. Texto y botones deben reconstruirse en código; las fotografías de producción requieren su propio paso de generación o material autorizado.
- Los registros usan rutas simbólicas o relativas para que el paquete no revele información del equipo donde se creó. Esas rutas documentan procedencia y no son dependencias.

Comprobación reproducible desde la raíz del paquete: `node scripts/check-evaluations.mjs`. No sustituye la inspección visual descrita arriba.
