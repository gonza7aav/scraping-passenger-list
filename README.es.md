# scraping-passenger-list

<div align='center'>

![Release en GitHub](https://img.shields.io/github/v/release/gonza7aav/scraping-passenger-list?label=release&color=informational)
![Tamaño del repositorio de GitHub](https://img.shields.io/github/repo-size/gonza7aav/scraping-passenger-list?label=tamaño&color=informational)
![Licencia del repositorio](https://img.shields.io/github/license/gonza7aav/scraping-passenger-list?label=licencia&color=informational)

[![Read me in English](https://img.shields.io/badge/Read%20me%20in-English-brightgreen)](README.en.md)

</div>

Un conjunto de programas de web scraping para recolectar información sobre barcos, arribos y pasajeros de [Genealogía Judía en Argentina](https://www.hebrewsurnames.com/).

Los archivos de resultados pueden ser importados a una base de datos para ser consultados. Estos archivos están disponibles en [Releases](https://github.com/gonza7aav/scraping-passenger-list/releases).

## 💡 Motivación

La familia de mi madre emigró principalmente de _República Checa_. Mientras los buscaba entre listas de pasajeros, se presentaron algunos problemas. El primero fue el apellido. Todavía no entiendo muy bien como es, pero a las mujeres se les "cambia" el apellido agregándole "ova". Por ejemplo, "Vonka" es "Vonkova". El segundo fue como eran registrados cuando llegaban a _Argentina_. Cuando los nombres eran algo complejos, los cambiaban por otros similares. Por ejemplo, "Jan" a "Juan" o "František" a "Francisco".

Esto hacía las cosas más difíciles, tenía que buscar todas las combinaciones. ¿Cuál fue la solución? Expresiones regulares. Pero como la página no tenía opción para buscar con ellas, decidí copiar toda información a una base de datos personal para trabajar allí.

## 🚧 Requisitos

- _[Node.js](https://nodejs.org/)_

Si vas a crear la base de datos para consultarla, también necesitas:

- _[MySQL](https://www.mysql.com/)_

Puedes importar los archivos `.csv` a tu servicio preferido de bases de datos. Pero este código solo cubre _MySQL_.

## 🛠️ Instalación

1. Descargar este repositorio

2. Instalar las dependencias

   ```console
   npm install
   ```

3. Rellenar el archivo `.env.sample` y renómbralo como `.env`

## 🚀 Ejecución

Si no quieres molestarte por obtener la información:

1. Crear una carpeta `results` dentro del proyecto

2. Descargar la [última versión de los datos](https://github.com/gonza7aav/scraping-passenger-list/releases)

3. Descomprimir el archivo descargado dentro de `results`

4. Salta la sección "🔍 Obteniendo información"

### 🔍 Obteniendo información

Estos son los programas de recolección que puedes ejecutar:

- Obtener barcos

  ```console
  npm run get-ships
  ```

  Busca los barcos disponibles en la página. Luego, los guardará en `ships.csv`.

- Obtener arribos

  ```console
  npm run get-arrivals -- [opciones]
  ```

  Busca las llegadas de cada barco en `ships.csv`. Entonces, es necesario haber ejecutado `get-ships` antes.

  Después, los resultados serán guardados en `arrivals.csv`. Si alguna petición fallase por error de conexión o debido a un límite, estará en `ships.error.csv` para ser intentadas nuevamente.

- Obtener pasajeros

  ```console
  npm run get-passengers -- [opciones]
  ```

  Obtiene las listas de pasajeros de cada arribo en `arrivals.csv`. Entonces, es necesario haber ejecutado el comando `get-arrivals` previamente.

  Luego, todos los pasajeros podrán ser encontrados en `passangers.csv`. Si alguna petición fallase por error de conexión o debido a un límite, estará en `arrivals.error.csv` para ser intentadas nuevamente.

#### 🚩 Opciones

Añadí estas para modificar el comportamiento sin tener que cambiar archivos de configuración o alguna constante dentro del código.

- Limitar la cantidad de trabajo a procesar

  Ejemplo:

  ```console
  npm run get-arrivals -- [-l | --limit <número>]
  ```

  Cuando estableces un límite, algunas peticiones o inserciones pueden excederlo. Entonces, ellas serán guardadas en un archivo `.error.csv` para poder ser reanudadas luego. El valor por defecto es 500. Con 0 no ponemos límite.

- Cambiar el retraso

  Ejemplo:

  ```console
  npm run get-passengers -- [-d | --delay <número>]
  ```

  El valor por defecto es 200ms. **No es recomendable ir por debajo** sin saber cuantas peticiones permite o puede soportar el servidor. No soy responsable por bloqueos al realizar muchas peticiones en muy poco tiempo.

### ♻️ Reintentando los fallidos

Si te encontraste algún error o has puesto un límite, entonces tendrás un archivo `.error.csv` y aquí está que deberías hacer para reintentarlos.

Ejemplo: Si quieres volver a obtener las llegadas de barcos que fallaron

```console
npm run get-arrivals -- [-r | --retry]
```

Esto busca los arribos de los barcos en `ships.error.csv`. Los resultados serán agregados a `arrivals.csv`. La misma lógica es ocupada para los demás comandos.

### 🔣 Consultando la base de datos

Eh? Qué base de datos? Bueno... primero tenemos que crearla con:

```console
npm run init-database
```

Una vez creada, podremos insertar los archivos de resultados con:

- Barcos

  ```console
  npm run insert-ships -- [opciones]
  ```

- Arribos

  ```console
  npm run insert-arrivals -- [opciones]
  ```

- Pasajeros

  ```console
  npm run insert-passengers -- [opciones]
  ```

Para cuando escribí esto, he recolectado casi 1.2 millones de pasajeros. Insertar esta cantidad tomará su tiempo... en serio, muchos minutos. Así que ve a despejarte y tómate un café.

Una vez finalizado, vas a poder consultar la base de datos `scraping-passenger-list`. No tienes que preocuparte por las uniones de tablas, dejé una plantilla llamada [`selectPassenger.sql`](src/selectPassenger.sql).

## 📝 Licencia

Copyright © 2021 _Aguirre Gonzalo Adolfo_.
Este proyecto se encuentra bajo la licencia _[MIT](LICENSE)_.
