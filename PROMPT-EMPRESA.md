# Prompt maestro para crear una web desde los datos de una empresa

Completa lo que sepas. Si desconoces algo, escribe **NO SÉ**; la IA omitirá cualquier afirmación que dependa de ese dato. Puedes borrar ejemplos y campos que no correspondan.

No necesitas decidir cuántas secciones tendrá la web. La frase más útil es:

> Decide tú cuántas secciones necesita la web. Usa solo las necesarias para explicar bien la oferta, resolver las dudas principales y conducir a la acción prioritaria. Antes de diseñar, presenta el mapa de secciones y justifica brevemente cada una.

## Plantilla para copiar y rellenar

```text
Usa $visual-web para diseñar y construir una web completa para la empresa
descrita abajo. Lee todos los datos antes de tomar decisiones.

DATOS DE LA EMPRESA

- Nombre comercial: [NOMBRE]
- Qué es y qué ofrece, explicado de forma sencilla: [DESCRIPCIÓN]
- Sector: [SECTOR]
- Ubicación o zona donde trabaja: [UBICACIÓN / ONLINE / ZONAS]
- Público principal: [TIPO DE CLIENTE]
- Problema o necesidad que resuelve: [PROBLEMA]
- Servicios o productos reales: [LISTA]
- Servicio o producto prioritario: [OFERTA PRINCIPAL]
- Diferencias reales frente a otras opciones: [DIFERENCIAS]
- Proceso real de trabajo o compra: [PROCESO]
- Acción principal que queremos que haga el visitante: [PEDIR PRESUPUESTO /
  RESERVAR / COMPRAR / LLAMAR / ESCRIBIR / OTRA]
- Acción secundaria, si existe: [ACCIÓN SECUNDARIA O NO SÉ]
- Pruebas reales disponibles: [AÑOS, CIFRAS, CLIENTES, PREMIOS, RESEÑAS,
  CERTIFICACIONES O NO SÉ]
- Preguntas o dudas frecuentes de los clientes: [LISTA O NO SÉ]
- Personalidad de la marca en 3–5 palabras: [ADJETIVOS]
- Estilos que deben evitarse: [ESTILOS, COLORES O RECURSOS A EVITAR]
- Colores, tipografías o normas existentes: [DATOS O NO SÉ]
- Material disponible: [LOGO, FOTOS, VÍDEOS, TEXTOS, CATÁLOGO, CAPTURAS,
  ENLACES O NO SÉ]
- Web actual, si existe: [URL O NO SÉ]
- Referencias que le gustan a la empresa y por qué: [URL + MOTIVO O NO SÉ]
- Competidores conocidos: [URL O NOMBRES O NO SÉ]
- Idioma de la web: [IDIOMA]
- Datos de contacto autorizados: [EMAIL, TELÉFONO, DIRECCIÓN, REDES O NO SÉ]
- Restricciones legales o del sector: [RESTRICCIONES O NO SÉ]
- Tecnología o proyecto existente: [STACK / CARPETA / NO HAY PROYECTO]
- Cualquier otro dato que deba respetarse: [NOTAS]

DECISIONES QUE TE DELEGO

1. Decide tú cuántas secciones necesita la web. Usa solo las necesarias para
   explicar bien la oferta, resolver las dudas principales y conducir a la
   acción prioritaria. No fuerces ocho secciones ni una estructura genérica.
2. Antes de diseñar, presenta un mapa compacto con: nombre de sección, función,
   contenido real que utilizará, acción, recurso visual y motivo para incluirla.
3. Redacta el copy final a partir de los datos facilitados. Puedes mejorar el
   lenguaje y la jerarquía, pero no cambies hechos ni inventes afirmaciones.
4. Si falta un dato, omite la afirmación o la sección dependiente de él. No uses
   Lorem ipsum, testimonios ficticios, cifras, premios, clientes, ubicaciones,
   precios, disponibilidad ni certificaciones inventadas.
5. Si falta logo, utiliza el nombre como tratamiento tipográfico provisional;
   no inventes una identidad registrada. Si faltan fotos, usa imágenes
   conceptuales solo cuando no puedan confundirse con productos, proyectos,
   empleados o instalaciones reales.
6. Resuelve de forma autónoma las decisiones reversibles. Pregunta únicamente
   si falta un dato imprescindible que impida construir una web honesta o hacer
   funcionar la acción principal.

PROCESO VISUAL OBLIGATORIO

1. Busca en la biblioteca de $visual-web por sector, tono, fotografía,
   tipografía y tipo de conversión. Selecciona normalmente 2–4 referencias
   compatibles e incluye al menos una captura móvil.
2. Abre a tamaño legible las capturas concretas. No diseñes basándote solo en
   nombres, URLs o análisis escritos.
3. Registra las decisiones importantes como:
   fuente → rasgo observado → adaptación propia → motivo.
4. Construye una dirección de arte original conectada con el negocio. No copies
   marcas, textos, fotografías, productos ni composiciones completas.
5. Genera una imagen horizontal independiente y legible para cada sección que
   hayas decidido. Mantén una sola identidad, pero varía escala, ritmo,
   alineación y relación entre texto e imagen cuando el contenido lo pida.
6. Inspecciona todos los diseños y corrige los que sean ilegibles, incoherentes,
   repetitivos o imposibles de implementar.
7. Genera después los activos necesarios por separado, sin títulos, botones ni
   interfaz incrustada. Construye texto, botones, formularios, iconos sencillos
   y estructura como HTML/CSS/SVG accesibles.

IMPLEMENTACIÓN Y COMPROBACIÓN

- Si existe un proyecto, conserva su stack y sus componentes adecuados. Si la
  carpeta está vacía, elige una solución ligera y mantenible.
- Implementa toda la web, responsive y funcional. No uses la imagen completa de
  una sección como interfaz final.
- Todos los botones y enlaces deben tener un destino real. Si faltan datos para
  una función, no simules reservas, compras, formularios enviados o descargas.
- Usa movimiento suave con una función clara y respeta prefers-reduced-motion.
- Comprueba como mínimo un portátil pequeño y un móvil, además de teclado,
  foco, contraste, recortes, imágenes, enlaces y la acción principal.
- Compara la implementación con cada diseño generado y corrige las diferencias
  importantes de composición, tipografía, encuadre y espacio.
- Ejecuta build, lint, pruebas y verificaciones apropiadas. No declares la tarea
  terminada mientras haya secciones, estados o funciones incompletos.

ENTREGA

Entrega la web completa, sus activos, el registro de referencias y una nota
breve con: secciones elegidas, decisiones visuales, comprobaciones realizadas y
limitaciones reales. Indica con claridad cualquier dato que la empresa todavía
deba facilitar.
```

## Qué datos son realmente imprescindibles

Si quieres empezar rápido, basta con completar estos ocho:

1. Nombre de la empresa.
2. Qué vende u ofrece.
3. A quién se dirige.
4. Qué problema resuelve.
5. Servicios o productos reales.
6. Acción principal deseada.
7. Tono de marca.
8. Material disponible.

Cuanto mejores sean los datos reales, más concreta será la web. La plantilla evita que una composición atractiva se apoye en promesas o contenido inventado.
