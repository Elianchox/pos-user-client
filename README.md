# Myorder — POS User Client

App móvil para que comensales vean sus órdenes en restaurantes en tiempo real.
Cliente del sistema POS Visum.

## Stack

- **Framework:** Expo 55 (SDK 54)
- **Runtime:** React Native 0.81, React 19
- **Routing:** expo-router (file-based)
- **Lenguaje:** TypeScript
- **Estado servidor:** TanStack React Query v5
- **Persistencia:** AsyncStorage
- **Notificaciones:** Expo Push Notifications
- **Deep links:** QR + URL scheme

## Requisitos

- Node.js 18+
- npm o pnpm
- Expo Go (iOS/Android) o simulador Xcode/Android Studio
- Backend POS Visum corriendo y accesible desde el dispositivo de prueba
  (ver repositorio del backend — https://github.com/anomalyco/visum-pos)

## Variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_API_URL=https://<tunnel-host>/api/mobile
EXPO_PUBLIC_QR_ALLOWED_HOSTS=<tunnel-host>,pos.eliancho.dev
```

| Variable | Descripción | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Base URL del API backend (incluye `/api/mobile`) | `https://pos.eliancho.dev/api/mobile` |
| `EXPO_PUBLIC_QR_ALLOWED_HOSTS` | Hosts permitidos para validar QR separados por coma | `pos.eliancho.dev,192.168.1.17:3000` |

El backend debe estar corriendo y expuesto vía túnel (devtunnels, ngrok, etc.)
para que la app móvil pueda alcanzarlo.

La app valida los QR contra la lista de hosts en `EXPO_PUBLIC_QR_ALLOWED_HOSTS`.
Si el host del túnel no está en esa lista, el QR será rechazado.

## Inicio rápido

```bash
npm install
npx expo start
```

Escanea el QR del terminal con Expo Go, o presiona:
- `a` — Android emulator
- `i` — iOS simulator
- `w` — web browser

## Cómo probar la aplicación

### 1. Vincularse a una mesa

La app se vincula a una mesa escaneando un código QR.
El QR debe tener el formato:

```
https://{host}/deeplink/table/{tableId}
```

Ejemplo:
```
https://pos.eliancho.dev/deeplink/table/abc-123
```

El QR se genera desde el módulo de mesas del backend POS.
También puedes probar sin cámara:

- **En simulador:** Abre la URL directamente en el navegador del dispositivo
- **Deep link manual:** Ejecuta en terminal:
  ```bash
  npx uri-scheme open posuserclient://deeplink/table/{tableId} --ios
  # o
  npx uri-scheme open posuserclient://deeplink/table/{tableId} --android
  ```
- **Generar QR local:** Usa cualquier generador QR online con la URL formateada
- **Web:** En navegador, visita la URL del deep link directamente

### 2. Flujo principal

```
Bienvenida → Escanear QR → Ingresar nombre (opcional) → Ver orden en tiempo real
```

1. **Pantalla de bienvenida** — Presiona "Escanear QR"
2. **Escanear** — Apunta al QR de la mesa. La cámara pide permiso la primera vez
3. **Nombre** — Puedes ingresar tu nombre para que el mesero te identifique
4. **Orden** — Ves los productos agrupados con su estado:
   - `PENDIENTE` → `ENVIADO A COCINA` → `PREPARANDO` → `LISTO` → `SERVIDO`
5. **Filtros** — Filtra por estado o busca productos por nombre
6. **Pago** — Cuando la orden se marca como pagada, ves el resumen con total
   e información de factura

### 3. Historial de órdenes

Accede desde "Ver historial de órdenes" en la bienvenida o desde el header
de la orden actual. Muestra todas las órdenes asociadas al dispositivo.

- Busca por nombre del restaurante
- Filtra por: Todas / Abiertas / Pagadas / Canceladas
- Pull-to-refresh para actualizar
- Toca una orden para ver su detalle completo

### 4. Notificaciones push

Al unirte a una mesa, la app registra un Expo Push Token.
El backend puede enviar notificaciones cuando el estado de la orden cambia.

Si la orden tiene un enlace de pago online, la notificación permite abrirlo
dentro de la app (webview) o en el navegador externo.

> En desarrollo con Expo Go, las notificaciones pueden no funcionar.
> Probar en un build nativo (EAS Build) para funcionalidad completa.

### 5. Deep links

- Scheme: `posuserclient://`
- Formato: `posuserclient://deeplink/table/{tableId}`
- También intercepta URLs del dominio del backend configurado
- Al abrir un deep link, la app navega directamente a la orden
  (si ya hay sesión activa) o a la pantalla de escaneo

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia servidor dev de Expo |
| `npm run android` | Inicia para Android |
| `npm run ios` | Inicia para iOS |
| `npm run web` | Inicia para web |
| `npm run lint` | Ejecuta ESLint |

## Project structure

```
src/
├── app/              # expo-router (rutas por archivo)
│   ├── _layout.tsx
│   ├── index.tsx     # Bienvenida
│   ├── scan.tsx      # Escáner QR / formulario
│   ├── order.tsx     # Orden activa
│   ├── history.tsx   # Historial
│   └── history/[id].tsx  # Detalle de orden histórica
├── components/       # UI reutilizable
│   ├── order/        # Componentes de orden
│   └── ui/           # Componentes base
├── hooks/api/        # TanStack React Query hooks
├── services/         # API client, sesión, notificaciones
├── types/            # TypeScript types
├── constants/        # URLs y endpoints
├── utils/            # Helpers (QR parser, order grouping)
├── context/          # SessionContext, ThemeContext
└── theme/            # Colores, estilos, tema claro/oscuro
```

Path alias: `@/` → `src/`, `@/assets/` → `assets/`

## Temas

Soporte de tema claro/oscuro automático según la configuración del sistema.
Los colores se definen en `src/theme/` y se consumen vía `makeStyles()`.

## Licencia

Proyecto de tesis — Visum POS
