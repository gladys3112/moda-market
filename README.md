# Moda Market 👗

Tienda de ropa online demostrativa construida con **Node.js, Express, HTML, CSS y JavaScript**. Incluye catálogo, búsqueda, filtros por categoría, carrito persistente en el navegador y flujo de pedido de demostración.

## Funcionalidades

- Diseño adaptable a móvil y escritorio.
- Catálogo con categorías y búsqueda.
- Carrito con cantidades, eliminación y total estimado.
- Formulario de pedido conectado a una API de Express.
- Imágenes de muestra cargadas desde Unsplash.
- Dockerfile y Docker Compose para ejecutar el proyecto en Linux o en cualquier equipo compatible.

## Requisitos

- Node.js 18 o superior y npm; o Docker con Docker Compose.

## Ejecutar localmente

```bash
npm install
npm start
```

Abre [http://localhost:3000](http://localhost:3000).

En modo desarrollo:

```bash
npm run dev
```

## Ejecutar con Docker

```bash
docker compose up --build -d
```

Luego abre [http://localhost:3000](http://localhost:3000). Para detener:

```bash
docker compose down
```

## API

- `GET /api/products`: lista productos. Admite `q` para búsqueda y `category` para filtrar.
- `POST /api/orders`: valida un pedido de demostración y devuelve un número de pedido y el total estimado.

## Importante antes de usar en producción

Este repositorio es una **base de demostración**, no una tienda lista para recibir pagos reales. Los pedidos no se guardan en una base de datos y no se integra una pasarela de pago. Antes de vender de verdad, añade persistencia (por ejemplo, PostgreSQL), autenticación y administración, validación de inventario en el servidor, protección de datos, políticas de privacidad/devolución, HTTPS y un proveedor de pagos seguro. Nunca almacenes datos de tarjetas.

## Publicar en un servidor online

Puedes desplegar el contenedor en un servidor Linux con Docker, configurar el dominio y habilitar HTTPS mediante un proxy inverso como Caddy o Nginx. Configura el puerto externo según tu proveedor y no expongas servicios internos innecesarios.
