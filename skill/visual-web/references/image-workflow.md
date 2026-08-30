# Imágenes: de referencia a activo

## Dos salidas distintas

1. **Composición de sección:** muestra imagen, tipografía, contenido, controles y espacios. Es una especificación visual, no el archivo final que se coloca como fondo de toda la web.
2. **Activo independiente:** fotografía, ilustración, textura u objeto sin interfaz ni texto añadido, listo para integrarse en HTML/CSS.

Si se piden N secciones, crea N composiciones separadas cuando el encargo requiera diseñarlas. El número de activos adicionales depende del contenido. Explica esa diferencia al anunciar generaciones; no cuentes una fotografía como dos diseños de sección ni un collage como N composiciones.

## Antes de generar

Define identidad y contenido suficiente. Registra una tabla con: sección, función, título real, CTA real, composición, papel de la imagen, formato y activo necesario. Decide qué ya existe y qué se debe generar. No inventes nuevos productos o imágenes de producto cuando el usuario exige fidelidad a fotografías existentes.

Abre las capturas elegidas y proporciona a la herramienta solo las referencias pertinentes. Con herramientas que acepten rutas, utiliza los archivos originales. Especifica los rasgos a adaptar para que la fuente no se convierta accidentalmente en un clon.

## Esqueleto de prompt de composición

El siguiente formato es una guía de campos; rellénalos con el brief y las referencias efectivamente analizadas:

- Entregable: una sección de una web, imagen horizontal legible, sin collage ni marco de dispositivo salvo necesidad del encargo.
- Contexto: marca, público, objetivo y posición de la sección en la historia.
- Sistema común: colores decididos, carácter tipográfico, jerarquía, controles y ritmo.
- Composición: foco, alineación, proporción texto/imagen, zonas de descanso y orden de lectura.
- Imagen: sujeto, acción, entorno, perspectiva, luz, materiales y acabado.
- Contenido: título, apoyo y CTA concretos; no añadir métricas ni credenciales inexistentes.
- Referencias: explicar qué se toma de cada captura y qué se transforma; no copiar marcas, texto, personajes o fotografías originales.
- Condiciones: encuadre implementable, texto legible y una idea de adaptación móvil.

## Esqueleto de prompt de activo fotográfico

Describe una fotografía independiente para la sección ya diseñada. Incluye sujeto y escala, cámara y perspectiva, posición del sujeto, luz, materiales, paleta, atmósfera, relación de aspecto, zonas reservadas para texto y recortes previstos. Pide explícitamente ausencia de logos, titulares, botones, bordes de interfaz y marcas de agua. Evita instrucciones contradictorias sobre focal, luz y perspectiva.

Ejemplo de dirección, no una estética obligatoria: fotografía editorial de una silla de madera clara en un taller, plano lateral bajo, luz de ventana desde la izquierda, marcas de trabajo visibles, tonos cálidos contenidos, silla en el tercio derecho y pared tranquila en el izquierdo para el título. La foto debe explicar material y fabricación, no añadir objetos decorativos aleatorios.

## Consistencia y revisión

Usa una composición aprobada como referencia de continuidad cuando la herramienta lo permita. Repite las decisiones esenciales del sistema en cada prompt, pero cambia composición e imagen cuando la función lo pida. Revisa cada resultado en tamaño suficiente.

Evalúa primero: relación con el negocio, lectura, focal, contenido, encuadre y coherencia. Rechaza texto inventado, deformaciones del producto, sujetos cortados sin intención, exceso de detalles y cambios arbitrarios de marca. Regenera la sección o el activo que falla; no compenses toda la web para acomodar un error de generación.

Conserva el prompt exacto, las entradas de referencia, el archivo resultante y el destino previsto. Guarda originales y derivados optimizados separados. Nunca etiquetes una imagen generada como captura real de una web existente. Las capturas de `references/sites` no deben modificarse ni convertirse en activos de producción.

## Alcance de las herramientas

Usa generación de imágenes para crear o editar raster cuando esté disponible y autorizada. Usa código/vector para texto, layout, iconos sencillos y elementos nativos. Para editar una imagen existente, sigue el flujo de edición de la herramienta y abre primero la referencia. No simules una llamada de generación con una imagen stock ni inventes archivos que no existen.
