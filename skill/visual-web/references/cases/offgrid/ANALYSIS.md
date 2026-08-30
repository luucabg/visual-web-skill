# Traducción de las ocho referencias

Las ocho composiciones se inspeccionaron antes del frontend. Originales en `sections/`; prompts completos en los tres archivos `art-*.md`.

1. Hero: foto a sangre; montaña y lago a la derecha, espacio oscuro inferior izquierdo para dos líneas. Grotesca normal, tracking -0.058em, titular de 128px sobre referencia de 1672px. Márgenes 49–56px; navegación sobre la imagen. CTA principal lima y secundario con contorno. Escalar a un viewport con mínimo usable móvil.
2. Manifiesto: crema sin contenedor, titular largo de dos líneas, peso 400; bloque inferior separa texto izquierdo y lago pequeño 5:3 a la derecha. Separación vertical amplia. Reducir el titular a 5.5vw, sin forzar dos líneas en móvil.
3. Destinos: titular izquierdo y frase secundaria derecha. Foto panorámica inferior ocupando 64%, lista a la derecha con tres filas y divisores. Botones con estado pulsado cambian la fotografía y abren un itinerario.
4. Islandia: foto aérea a sangre, río turquesa diagonal, titular inferior izquierdo y botón con contorno a la derecha. Gradiente oscuro suave para contraste. Parallax pequeño, texto siempre real.
5. Filosofía: foto vertical de cabaña a la izquierda, titular y acordeón derecho. Líneas finas, números separados del texto, primer panel abierto. Primitivas accesibles con teclado y altura animada.
6. Cuaderno: bosque oscuro, foto derecha, espacio negativo entre titular y artículo izquierdo. Chaqueta naranja como contraste natural, sin añadirlo a la paleta de interfaz. Artículo completo en diálogo. Móvil: título, foto, artículo.
7. Planificador: crema, dos columnas, controles sin caja exterior. Normalizar peso tipográfico y botón cápsula. Foto vertical conserva la tienda completa. Destino y ritmo generan un borrador local descargable.
8. Cierre: campo lima, titular arriba a la izquierda, foto marina derecha, CTA bosque y divisor. Wordmark fluido ocupa el ancho inferior sin desbordar. Se reutiliza la referencia como imagen social, sin una novena composición.

Sistema: crema #f1f0e8, bosque #19251d, lima #d5ed45. Geist reproduce la grotesca refinada. Cuerpo 16–20px, etiquetas 11–12px, títulos 56–100px escritorio. Márgenes fluidos 22–64px. Imágenes sin sombra, esquinas 0–4px. HTML para textos, iconos funcionales y controles. Ocho fotografías regeneradas con imagegen como recursos individuales, comprimidas a WebP sin modificar su composición.

Movimiento: aparición escalonada y deriva parallax. Un frame de actualización por scroll, sin render de React por frame. Preferencia de movimiento reducido del sistema y botón explícito. Fallback visible sin JavaScript; ninguna función depende de hover.

Referencias originales: Lando Norris (acento y fotografía), MindMarket (tipografía y color), Floema (espacio), Oryzo (materialidad y composición), Shopify Editions (narrativa) y Mistral (retícula). No se copiaron logos, textos o fotos de estas marcas al sitio.
