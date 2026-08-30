# Revisión propia — hero MESA

## Resultado inspeccionado

Se generó una sola composición horizontal con ImageGen incorporado y se copió al workspace como `hero.png`. El archivo inspeccionado mide **1568 × 1003 px**, usa RGB sin canal alfa y pesa **2.283.685 bytes**. SHA-256: `94FBE7C5A2B5B5A3B2802D361131C6D581E6CEFF081D7D01094FF6670C011E3E`.

La inspección se hizo sobre el PNG final a tamaño original, después de copiarlo; no se evaluó solo la previsualización del generador.

## Qué funciona

- **Relación con el negocio:** la mesa, las manos adultas y los materiales dejan claro que se trata de una experiencia creativa presencial y práctica. No aparece un aula genérica, una interfaz ni una metáfora tecnológica.
- **Primera lectura:** marca, titular, apoyo y CTA forman una columna clara. La fotografía entra desde la derecha y el borde inferior sin tapar el contenido.
- **Acción principal:** “Explorar los talleres” es el único control de alto énfasis, se reconoce como botón y queda visible sin depender de navegación secundaria.
- **Copy:** se renderizan correctamente `MESA`, `Talleres`, `La escuela`, `Preguntas`, `Hacer también se aprende.`, el texto de apoyo y `Explorar los talleres`, con acentos correctos. No se observan cifras, testimonios, nombres, ubicaciones, fechas, precios, horarios, premios ni pseudotexto añadido. La flecha del botón es un signo gráfico, no una afirmación o dato.
- **Tono:** la escala tipográfica aporta carácter adulto; el papel crema, la madera y la luz lateral hacen la escena cercana. La imagen evita letras burbuja, iconos escolares, personajes infantiles, gradientes de IA, vidrio, tarjetas o dashboard.
- **Focal y segunda lectura:** el titular domina primero; después aparecen tres acciones manuales —modelar, estampar y dibujar— dentro de una misma mesa. Los bordes de papel y paño crean una transición irregular controlada entre texto y fotografía.
- **Plausibilidad:** las manos y herramientas se ven coherentes en la revisión visual. Algunas manos quedan cortadas por el borde inferior, pero el corte pertenece al encuadre y no impide entender la acción. No se detectaron dedos duplicados ni herramientas flotantes evidentes.
- **Independencia de las referencias:** se conserva el principio de zona verbal despejada de Floema, la materialidad cenital de Oryzo y la contundencia tipográfica/acento cálido de Teenage Engineering. No se copiaron sus marcas, productos, personajes, símbolos, textos o composiciones exactas.

## Desviaciones aceptadas

- El generador redujo la paleta prevista: el resultado usa crema, negro, coral, madera y oliva, pero prácticamente omite el azul ultramar. La reducción favorece continuidad fotográfica y mantiene suficiente identidad mediante el borde irregular, la tipografía y el CTA; por eso no se regeneró.
- La proporción final es aproximadamente **1,56:1**, más cercana a 14:9 que a 16:9. Sigue siendo inequívocamente horizontal y muestra el hero completo. Si la implementación futura necesita 16:9 exacto, debe recomponerse el layout y proteger el copy, no recortarse a ciegas.
- La dirección hablaba de varias personas adultas; la imagen lo sugiere mediante distintos brazos y tareas, pero no demuestra identidades separadas. Es apropiado para una escena conceptual y evita inventar alumnos o profesores reales.

## Limitaciones

- Es una **composición visual**, no una interfaz funcional ni un activo fotográfico listo para producción. El texto y el botón están rasterizados. Si se construye la web, deben recrearse en HTML/CSS y la fotografía tendría que regenerarse o separarse como activo sin interfaz.
- No se generó versión móvil porque el encargo pidió una sola imagen horizontal. `direction.md` describe el criterio móvil, pero no lo verifica.
- No se midieron contraste WCAG, tamaños táctiles, foco, teclado, lectura por tecnologías de asistencia ni comportamiento responsive. El CTA parece contrastado, pero su combinación coral/blanco debe medirse durante implementación.
- La escena muestra prácticas creativas conceptuales; no debe interpretarse como catálogo real de talleres disponibles.
- No se verificó movimiento. La imagen es estática y no acredita transiciones, hover o técnicas de animación.

## Flujo y problemas encontrados

- Se respetó la restricción de no usar navegador. Las referencias proceden únicamente de la biblioteca local y se abrieron con la herramienta de inspección de imágenes.
- La búsqueda local devolvió una salida amplia que quedó truncada al combinar consultas y lecturas; se resolvió volviendo al índice, reduciendo la selección a tres sitios y abriendo manualmente las cuatro capturas registradas en `selection.json`. No se inventaron referencias por la truncación.
- ImageGen incorporado completó la primera llamada sin error. El prompt exacto fue leído desde `prompt.md` y se pasaron las cuatro capturas abiertas como referencias con roles explícitos.
- No se generaron variantes ni activos sueltos. No fue necesaria una segunda llamada: el primer resultado superó la revisión de contenido, legibilidad, tono, manos y composición. Solo `hero.png` se considera entrega final.
- No se modificó ninguna captura, análisis, manifiesto, script o catálogo de la biblioteca. Todos los archivos nuevos de esta evaluación están dentro de `visual-web/evaluation/school`.
