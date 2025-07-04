# Guía Técnica Paso a Paso para BeerFinder

Este archivo contiene explicaciones detalladas y pasos a seguir para las configuraciones técnicas clave de tu proyecto.

---

## 1. Configuración de GitHub para el Proyecto BeerFinder

Para que tu código local (en tu PC) se sincronice con Netlify y Supabase, necesitamos usar **GitHub** como el punto central de tu código.

### ¿Por qué GitHub?
*   **Control de Versiones:** Guarda un historial de todos tus cambios, permitiéndote volver a versiones anteriores si algo sale mal.
*   **Colaboración:** Facilita trabajar con otras personas (si en el futuro quieres ayuda).
*   **Despliegue Automático:** Netlify se conecta a GitHub para publicar tu sitio web automáticamente cada vez que haces un cambio.

### ¿Repositorio Público o Privado?
Para este proyecto, **te recomiendo que sea PÚBLICO**.

*   **Público:** Cualquiera puede ver el código. Es ideal para proyectos de código abierto o aplicaciones frontend como BeerFinder, donde no hay información sensible en el código que necesites ocultar. Facilita el despliegue con Netlify.
*   **Privado:** Solo tú y las personas que invites pueden ver el código. Es para proyectos con información confidencial.

### Pasos para Crear el Repositorio en GitHub:

1.  **Abre tu navegador web** y ve a [github.com](https://github.com/).
2.  **Inicia sesión** en tu cuenta de GitHub. Si no tienes una, crea una.
3.  Una vez dentro, busca el botón **"New"** (Nuevo) en la esquina superior izquierda de la página (o en tu perfil, busca el signo `+` y selecciona "New repository").
4.  En la página de creación del repositorio:
    *   **Repository name (Nombre del repositorio):** Escribe `BeerFinder` (es buena práctica que coincida con el nombre de tu carpeta local).
    *   **Description (Descripción):** (Opcional, pero recomendado) Puedes escribir algo como: `Aplicación para comparar precios de cerveza en Praia do Rosa.`
    *   **Public/Private (Público/Privado):** Selecciona **"Public"** (Público).
    *   **NO marques ninguna de las siguientes opciones:**
        *   "Add a README file"
        *   "Add .gitignore"
        *   "Choose a license"
        (Ya tenemos nuestros archivos y los añadiremos nosotros).
5.  Haz clic en el botón verde **"Create repository"** (Crear repositorio).

6.  Una vez creado, GitHub te mostrará una página con instrucciones. Busca la sección que dice **"…or push an existing repository from the command line"** (o subir un repositorio existente desde la línea de comandos).

    Verás una línea que empieza con `git remote add origin` y luego una URL.
    **Copia esa URL HTTPS.** Se verá algo como: `https://github.com/tu_usuario/BeerFinder.git`

    **Por favor, pega esa URL aquí en el chat.** Una vez que me la des, yo me encargaré de ejecutar los comandos necesarios para conectar tu carpeta local con este repositorio de GitHub y subir tu código.

---

## 2. Configuración de Supabase para BeerFinder

Supabase es tu "backend" (la parte de la aplicación que no ves, que guarda y gestiona los datos). Para BeerFinder, Supabase se encarga de:

*   **Base de Datos:** Almacena toda la información de las cervezas (marca, precio, volumen, establecimiento) y de los establecimientos.
*   **API:** Permite que tu código JavaScript en el navegador "hable" con la base de datos para guardar y leer información.

### Pasos para Configurar Supabase:

#### 2.1. Crear tu Proyecto Supabase

1.  **Abre tu navegador web** y ve a [supabase.com](https://supabase.com/).
2.  **Inicia sesión** en tu cuenta de Supabase. Si no tienes una, crea una.
3.  Una vez dentro, haz clic en **"New project"** (Nuevo proyecto).
4.  En la página de creación del proyecto:
    *   **Name (Nombre):** Escribe `BeerFinder` (o el nombre que prefieras para tu proyecto de Supabase).
    *   **Database Password (Contraseña de la Base de Datos):** Crea una contraseña segura y **guárdala en un lugar seguro**. La necesitarás si alguna vez accedes directamente a la base de datos.
    *   **Region (Región):** Elige la región más cercana a ti o a tus usuarios para un mejor rendimiento.
    *   **Pricing Plan (Plan de Precios):** Selecciona el plan **"Free"** (Gratis). Es más que suficiente para empezar.
5.  Haz clic en el botón verde **"Create new project"** (Crear nuevo proyecto). Esto tomará unos minutos.

#### 2.2. Crear las Tablas de la Base de Datos

Una vez que tu proyecto de Supabase esté listo:

1.  En el panel lateral izquierdo de Supabase, haz clic en el icono de **"SQL Editor"** (parece un `< >`).
2.  Verás un área donde puedes escribir y ejecutar comandos SQL.
3.  **Copia el código SQL** que te proporcioné en el archivo `README.md` de tu proyecto local. Es el siguiente:

    ```sql
    -- Tabela de Cervejas
    CREATE TABLE public.cervejas (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      marca text NOT NULL,
      preco real NOT NULL,
      volumen_ml integer NOT NULL,
      tipo_envase text NOT NULL,
      estabelecimento text NOT NULL,
      ubicacion geography(point, 4326) NULL,
      "timestamp" timestamp with time zone NULL DEFAULT now(),
      CONSTRAINT cervejas_pkey PRIMARY KEY (id)
    );

    -- Tabela de Estabelecimentos
    CREATE TABLE public.estabelecimentos (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      nome text NOT NULL,
      ubicacion geography(point, 4326) NULL,
      contato text NULL,
      CONSTRAINT estabelecimentos_pkey PRIMARY KEY (id)
    );
    ```

4.  **Pega este código SQL** en el editor de SQL de Supabase.
5.  Haz clic en el botón **"Run"** (Ejecutar) o el icono de "Play" para ejecutar el script. Esto creará las tablas `cervejas` y `estabelecimentos` en tu base de datos.

    *   **Verificación:** Puedes ir a la sección **"Table Editor"** (Editor de Tablas) en el panel lateral izquierdo para confirmar que las tablas `cervejas` y `estabelecimentos` han sido creadas correctamente.

#### 2.3. Obtener tus Claves de Supabase (URL y Anon Key)

Para que tu aplicación se conecte a Supabase, necesita dos piezas de información clave:

1.  En el panel lateral izquierdo de Supabase, haz clic en el icono de **"Project Settings"** (Configuración del Proyecto) (parece un engranaje).
2.  Dentro de "Project Settings", selecciona la opción **"API"**.
3.  Aquí encontrarás:
    *   **URL:** Es la URL de tu proyecto Supabase. Se verá algo como `https://abcdefg1234.supabase.co`.
    *   **Project API keys (Claves API del Proyecto):** Busca la clave que dice **`anon public`** (también conocida como `anon key` o `public key`). Es una cadena larga de caracteres.

    **Copia ambas: la URL y la clave `anon public`.**

#### 2.4. Configurar `js/config.js` en tu Proyecto Local

Ahora, vamos a decirle a tu aplicación cómo conectarse a tu proyecto Supabase:

1.  Abre tu editor de código (Visual Studio Code) y navega hasta el archivo `C:\Users\jfran\BeerFinder\js\config.js`.
2.  Verás el siguiente contenido:

    ```javascript
    // Adicione aqui a URL e a Chave Anônima do seu projeto Supabase
    const SUPABASE_URL = 'URL_DO_SEU_PROJETO_SUPABASE';
    const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANONIMA_SUPABASE';
    ```

3.  **Reemplaza** `'URL_DO_SEU_PROJETO_SUPABASE'` con la **URL** que copiaste de Supabase.
4.  **Reemplaza** `'SUA_CHAVE_ANONIMA_SUPABASE'` con la **clave `anon public`** que copiaste de Supabase.

    El archivo `config.js` debería verse algo así (con tus propias claves):

    ```javascript
    // Adicione aqui a URL e a Chave Anônima do seu projeto Supabase
    const SUPABASE_URL = 'https://abcdefg1234.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZjEyMzQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3ODkwMTIzNCwiZXhwIjoxNjc4OTA1NjY2fQ.tu_clave_anonima_larga';
    ```

    **¡Importante!** No compartas tu clave `anon public` con nadie, aunque sea pública, es mejor mantenerla en tu código y no en lugares públicos como comentarios de GitHub.

#### 2.5. Subir los Cambios a GitHub

Después de actualizar `js/config.js` con tus claves de Supabase, necesitas subir estos cambios a GitHub para que Netlify pueda desplegar la versión actualizada de tu aplicación.

1.  Abre la terminal en Visual Studio Code (asegúrate de estar en la carpeta `C:\Users\jfran\BeerFinder`).
2.  **Añade los cambios:**
    ```bash
    git add js/config.js
    ```
3.  **Haz un commit (guarda los cambios):**
    ```bash
    git commit -m "Configured Supabase keys"
    ```
4.  **Sube los cambios a GitHub:**
    ```bash
    git push origin master
    ```
    (Si tu rama principal se llama `main`, usa `git push origin main` en su lugar).

Una vez que los cambios estén en GitHub, Netlify detectará automáticamente la actualización y volverá a desplegar tu sitio web con las claves de Supabase configuradas. ¡Tu aplicación estará lista para interactuar con la base de datos!