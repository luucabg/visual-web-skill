# Revisión propia — PULSO hero

## Resultado inspeccionado

- Archivo revisado a tamaño original: `evaluation/instrument/hero.png`.
- Dimensiones: **1536 × 1024 px**, horizontal 3:2; PNG RGB de 24 bits.
- SHA-256 medido: `E841B5EE502B5A47457E7506E84972D949DD528EE5BB120AF678B4F6CAC0F128`.
- Generación: herramienta incorporada `image_gen`, usando exactamente el contenido de `prompt.md` y las capturas locales Teenage Engineering `02-instrument` y Oryzo `01-hero-desktop` como referencias de principios, no como activos reutilizados.

## Inspección visual

**Relación con el encargo.** El producto domina la imagen y se reconoce como instrumento portátil por su escala junto a la mano y por la cinta tejida. El cuerpo de grafito, los pads blandos, controles estriados, costuras, piedra y textil transmiten precisión y tacto; el aro coral y la curva de la cinta aportan el gesto expresivo. El exterior cercano evita presentar un estudio o una escena de aventura genérica.

**Jerarquía y lectura.** La primera lectura es `PULSO`, seguida por el instrumento, la frase y el CTA. La palabra está completa, posee gran presencia y no queda tapada. Las tres cadenas requeridas aparecen exactas y legibles:

1. `PULSO`
2. `Haz música donde te encuentre la idea.`
3. `Explorar el instrumento`

La frase se parte de forma natural en dos líneas. El CTA tiene contraste fuerte, espacio interior suficiente y una flecha simple. No hay navegación, tarjetas ni capas que compitan con la acción.

**Producto y encuadre.** El cuerpo del instrumento queda completo dentro de la imagen, con perspectiva, bordes, separaciones y sombra de contacto coherentes. La mano presenta una anatomía creíble y no tapa el control central. La cinta sale de un anclaje visible; su extremo cruza y sale por el borde inferior como gesto de encuadre, pero la silueta funcional del instrumento no se pierde. La pequeña superficie superior contiene barras abstractas sin letras, cifras o menús.

**Veracidad y limpieza.** No aparecen precio, moneda, descuento, compra, premio, reseña, puntuación, testimonio, métrica, especificación, certificación, disponibilidad, logo de terceros o marca de agua. Tampoco hay texto accidental en el instrumento. La escena, el objeto y el copy son propios de PULSO; no replica el embalaje ni el dispositivo de Teenage Engineering, ni el posavasos, la retícula verde, las herramientas o el panel de Oryzo.

**Decisión de selección.** Una pasada adversarial no encontró texto incorrecto, afirmaciones inventadas, deformación material que rompa el foco ni conflicto de jerarquía suficiente para justificar otra generación. Se conserva la primera salida como final para evitar deriva innecesaria.

## Limitaciones

- PULSO es un concepto visual. La imagen no valida ergonomía, fabricación, sonido, funciones, materiales de producción ni comportamiento de los controles.
- Solo se produjo el hero horizontal solicitado. La recomposición móvil está descrita en `direction.md`, pero no se generó una segunda imagen ni se probó en navegador porque quedaban fuera del alcance.
- El texto está integrado en esta composición de referencia. En una implementación real debería recrearse como texto y controles nativos para accesibilidad, traducción y responsive; este encargo no incluye código.
- La legibilidad se comprobó visualmente en la imagen completa, no mediante una auditoría de contraste o accesibilidad funcional.
- Las capturas de referencia son evidencia local para estudio visual; esta entrega no concede derechos sobre los activos de terceros.

## Flujo y problemas

No hubo fallos bloqueantes ni necesidad de usar navegador. La herramienta incorporada guardó primero el PNG original en su directorio administrado de imágenes generadas; siguiendo la política de `imagegen`, se copió sin modificar a `hero.png` dentro del workspace y se dejó el original administrado intacto. No se editó la biblioteca de referencias ni se crearon activos sueltos o una página completa.
