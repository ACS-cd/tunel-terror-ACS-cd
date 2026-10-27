# Sala 3 · Nombre de la sala (HTML) · Morgue municipal · Soporte técnico

**Autor/a:** Angela Colorado Sousa - ACS-cd
**Compañero/a (JavaFX):** David Cabrera González - IZialexI

## La historia
Desde el 13 de octubre el sistema de soporte técnico de la morgue municipal funciona de forma extraña: contraseñas que se escriben solas, botones que huyen del ratón… y el departamento TI no encuentra el fallo.

## La pista
Un comentario oculto en el código de index.html indica que el usuario válido está en pergamino.html.


## Diario de investigación
Una entrada por reto (8 en total). Rellénala mientras trabajas y súbela en el commit de ese paso.

### Reto 1 · La voz del narrador
- **Pregunta:** ¿strong o b para la palabra que asusta? ¿em o i?
- **Fuente:** https://developer.mozilla.org/es/docs/Web/HTML/Element/strong
- **Lo que dice (con mis palabras):** `<b>` pone el texto en negrita, `<strong>` indica que es importante, los lectores para personas ciegas indican que es un texto importante, con `<b>` no ven nada, los buscadores como Google le dan más importante a lo marcado por esta etiqueta, a mayores, terror.css hace referencia a `<strong>`, la referencia se rompería
- **Prueba en pruebas.html:** No hay diferencias visuales entre `<b>` y `<strong>` y entre `<i>` y `<em>`, sin embargo, con terror.css, strong sale en rojo
- **Decisión en mi sala:** Uso `<strong>` en "soporte técnico" porque es importante, y `<em>` en "se escribe sola" para darle énfasis al leerlo
- **Pista de nivel usada:** ninguna

### Reto 2 · Tachado, letra pequeña, sup, sub, abbr y comentarios
- **Pregunta:** ¿qué etiqueta uso para algo borrado, una nota en letra pequeña, un superíndice, un subíndice, una palabra que se explica al pasar el ratón y un texto oculto?
- **Fuente:** https://developer.mozilla.org/es/docs/Web/HTML/Element/abbr y el índice de elementos de MDN
- **Lo que dice (con mis palabras):** `<del>` marca texto eliminado, `<small>` sirve para aclaraciones o notas legales, `<sup>` y `<sub>` suben o bajan el texto, y `<abbr>` con el atributo `title` muestra la explicación al pasar el ratón. Un comentario `<!-- -->` no se ve en la página pero sí en el código fuente.
- **Prueba en pruebas.html:** Probé `<abbr title="...">` y salía el texto al pasar el ratón. Con Ctrl+U vi el comentario en el código fuente.
- **Decisión en mi sala:** `<del>` en "correctamente", `<abbr>` en "departamento TI", `<sup>` en 4 ºC, `<sub>` en CH₂O, `<mark>` en "No entréis solos", `<small>` en el mensaje automático, y un comentario con la pista hacia pergamino.html.
- **Pista de nivel usada:** ninguna

## Captura
![Mi sala](docs/captura.png)

## Créditos
Imágenes y sonidos con autor, web y licencia.
