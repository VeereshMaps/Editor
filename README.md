<!-- // README.md
# Notification-All 🔔

Universal notification service that works across all JavaScript frameworks and platforms.

## Installation

```bash
npm install notification-all
```

## Usage

### Vanilla JavaScript / Plain HTML

```javascript
import alertService from 'notification-all';

// Show notifications
alertService.success('Operation successful!');
alertService.error('Something went wrong!');
alertService.info('Here is some info');
alertService.warn('Warning message');

// Loading notification
const loadingId = alertService.loading('Processing...');

// Update notification
alertService.update(loadingId, {
  type: 'success',
  message: 'Completed!'
});

// Configure defaults
alertService.configure({
  position: 'bottom-right',
  theme: 'dark',
  autoClose: 5000
});
```

### React

```jsx
import React from 'react';
import { NotificationProvider, useToast } from 'notification-all/react';

// Wrap your app
function App() {
  return (
    <NotificationProvider options={{ theme: 'dark' }}>
      <MyComponent />
    </NotificationProvider>
  );
}

// Use in components
function MyComponent() {
  const toast = useToast();

  const handleClick = () => {
    toast.success('Hello from React!');
  };

  return <button onClick={handleClick}>Show Notification</button>;
}
```

### Vue 3

```javascript
import { createApp } from 'vue';
import NotificationPlugin, { useNotifications } from 'notification-all/vue';

const app = createApp({});
app.use(NotificationPlugin, { theme: 'dark' });

// In components
export default {
  setup() {
    const notify = useNotifications();
    
    const showSuccess = () => {
      notify.success('Hello from Vue!');
    };

    return { showSuccess };
  }
}

// Or using this.$toast
this.$toast.success('Success message');
```

### Angular

```typescript
import { NgModule } from '@angular/core';
import { NotificationService } from 'notification-all/angular';

@NgModule({
  providers: [
    NotificationService,
    { provide: 'NOTIFICATION_CONFIG', useValue: { theme: 'dark' } }
  ]
})
export class AppModule {}

// In components
import { Component } from '@angular/core';
import { NotificationService } from 'notification-all/angular';

@Component({
  selector: 'app-example',
  template: '<button (click)="showNotification()">Show Toast</button>'
})
export class ExampleComponent {
  constructor(private notify: NotificationService) {}

  showNotification() {
    this.notify.success('Hello from Angular!');
  }
}
```

### React Native

```javascript
import notify from 'notification-all/react-native';

// Uses native Toast on Android and Alert on iOS
notify.success('Success message');
notify.error('Error message');
```

### Next.js

```javascript
// Works the same as React
import { useToast } from 'notification-all/react';

export default function Page() {
  const toast = useToast();
  
  return (
    <button onClick={() => toast.success('Next.js notification!')}>
      Show Notification
    </button>
  );
}
```

## API Reference

### Methods

- `success(message, options?)` - Show success notification
- `error(message, options?)` - Show error notification  
- `info(message, options?)` - Show info notification
- `warn(message, options?)` - Show warning notification
- `loading(message, options?)` - Show loading notification
- `update(toastId, newState)` - Update existing notification
- `dismiss(toastId)` - Dismiss specific notification
- `clearAll()` - Clear all notifications

### Options

```javascript
{
  position: 'top-center' | 'top-left' | 'top-right' | 'bottom-center' | 'bottom-left' | 'bottom-right',
  autoClose: number | false, // milliseconds
  hideProgressBar: boolean,
  closeOnClick: boolean,
  pauseOnHover: boolean,
  draggable: boolean,
  theme: 'light' | 'dark'
}
```

## Platform Support

- ✅ Vanilla JavaScript
- ✅ React (16.8+)
- ✅ Vue 3
- ✅ Angular (12+)
- ✅ React Native
- ✅ Next.js
- ✅ Nuxt.js
- ✅ Any JavaScript framework

## Features

- 🎨 Beautiful, customizable UI
- 📱 Mobile responsive
- 🎭 Dark/Light theme support
- 🖱️ Drag to dismiss
- ⏯️ Pause on hover
- 📍 Multiple positions
- 🔄 Update notifications
- 🎯 Framework agnostic core
- 📦 Tree-shakable
- 🎪 Zero dependencies
- 📝 TypeScript support

## Publishing Steps

1. Build the package:
```bash
npm run build
```

2. Test locally:
```bash
npm pack
npm install ./notification-all-1.0.0.tgz
```

3. Publish to NPM:
```bash
npm login
npm publish
```

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build
npm run build

# Test
npm run test

# Lint
npm run lint
```

This package provides a unified API across all platforms while respecting each framework's conventions and native capabilities. -->



# Notification-All 🔔

Universal notification service that works across all JavaScript frameworks and platforms with a single, consistent API.

## Installation

```bash
npm install notification-all
```

## Quick Start

### Vanilla JavaScript

```javascript
import { alertService } from 'notification-all';

// Basic notifications
alertService.success('Operation successful!');
alertService.error('Something went wrong!');
alertService.info('Here is some information');
alertService.warning('Warning message');

// Loading notification
const loadingId = alertService.loading('Processing...');

// Update notification
alertService.update(loadingId, {
  type: 'success',
  message: 'Completed!'
});

// Configure global defaults
alertService.configure({
  position: 'top-right',
  theme: 'dark',
  autoClose: 5000
});
```

### React

```jsx
import React from 'react';
import { NotificationProvider, useNotification } from 'notification-all/react';

// Wrap your app with the provider
function App() {
  return (
    <NotificationProvider 
      options={{ 
        theme: 'dark',
        position: 'top-right'
      }}
    >
      <MyComponent />
    </NotificationProvider>
  );
}

// Use notifications in components
function MyComponent() {
  const notify = useNotification();

  const handleSuccess = () => {
    notify.success('Hello from React!');
  };

  const handleError = () => {
    notify.error('Something went wrong!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
}
```

### Vue 3

```javascript
// main.js
import { createApp } from 'vue';
import NotificationPlugin from 'notification-all/vue';

const app = createApp(App);
app.use(NotificationPlugin, { 
  theme: 'dark',
  position: 'bottom-right'
});

// Component usage
<template>
  <button @click="showSuccess">Success</button>
  <button @click="showError">Error</button>
</template>

<script setup>
import { useNotifications } from 'notification-all/vue';

const notify = useNotifications();

const showSuccess = () => {
  notify.success('Hello from Vue!');
};

const showError = () => {
  notify.error('Something went wrong!');
};
</script>

// Or use global method
export default {
  methods: {
    showNotification() {
      this.$notify.success('Success message');
    }
  }
}
```

### Angular

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { NotificationService, NOTIFICATION_CONFIG } from 'notification-all/angular';

@NgModule({
  providers: [
    NotificationService,
    { 
      provide: NOTIFICATION_CONFIG, 
      useValue: { 
        theme: 'dark',
        position: 'top-center'
      } 
    }
  ]
})
export class AppModule {}

// component.ts
import { Component } from '@angular/core';
import { NotificationService } from 'notification-all/angular';

@Component({
  selector: 'app-example',
  template: `
    <button (click)="showSuccess()">Success</button>
    <button (click)="showError()">Error</button>
  `
})
export class ExampleComponent {
  constructor(private notificationService: NotificationService) {}

  showSuccess() {
    this.notificationService.success('Hello from Angular!');
  }

  showError() {
    this.notificationService.error('Something went wrong!');
  }
}
```

### React Native

```javascript
import { notify } from 'notification-all/react-native';

// Uses native components - Toast on Android, Alert on iOS
const handleSuccess = () => {
  notify.success('Success message');
};

const handleError = () => {
  notify.error('Error occurred');
};

const handleInfo = () => {
  notify.info('Information message');
};
```

### Next.js

```javascript
// _app.js
import { NotificationProvider } from 'notification-all/react';

export default function App({ Component, pageProps }) {
  return (
    <NotificationProvider options={{ theme: 'dark' }}>
      <Component {...pageProps} />
    </NotificationProvider>
  );
}

// Any page/component
import { useNotification } from 'notification-all/react';

export default function HomePage() {
  const notify = useNotification();
  
  return (
    <button onClick={() => notify.success('Next.js notification!')}>
      Show Notification
    </button>
  );
}
```

### Nuxt.js

```javascript
// plugins/notifications.client.js
import NotificationPlugin from 'notification-all/vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(NotificationPlugin, {
    theme: 'dark',
    position: 'top-right'
  });
});

// In any component
<script setup>
import { useNotifications } from 'notification-all/vue';

const notify = useNotifications();

const showNotification = () => {
  notify.success('Hello from Nuxt!');
};
</script>
```

## API Reference

### Core Methods

All notification methods return a unique ID that can be used to update or dismiss the notification.

```javascript
// Basic notification types
const id1 = alertService.success(message, options?);
const id2 = alertService.error(message, options?);
const id3 = alertService.info(message, options?);
const id4 = alertService.warning(message, options?);

// Special notifications
const loadingId = alertService.loading(message, options?);

// Notification management
alertService.update(id, { type: 'success', message: 'Updated!' });
alertService.dismiss(id);
alertService.dismissAll();

// Configuration
alertService.configure(globalOptions);
```

### Configuration Options

```javascript
const options = {
  // Position on screen
  position: 'top-center' | 'top-left' | 'top-right' | 
           'bottom-center' | 'bottom-left' | 'bottom-right',
  
  // Auto dismiss timing (false to disable)
  autoClose: 5000, // milliseconds or false
  
  // Visual options
  hideProgressBar: false,
  closeButton: true,
  
  // Interaction
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  
  // Theming
  theme: 'light' | 'dark',
  
  // Animation
  transition: 'bounce' | 'slide' | 'zoom' | 'flip',
  
  // Custom styling
  className: 'custom-notification',
  style: { backgroundColor: '#333' },
  
  // Callbacks
  onOpen: (toast) => {},
  onClose: (toast) => {},
  onClick: (toast) => {}
};
```

### Framework-Specific Features

#### React Hooks
```javascript
import { useNotification, useNotificationConfig } from 'notification-all/react';

const notify = useNotification();
const config = useNotificationConfig();

// Update global config
config.update({ theme: 'dark' });
```

#### Vue Composables
```javascript
import { useNotifications, useNotificationConfig } from 'notification-all/vue';

const notify = useNotifications();
const config = useNotificationConfig();

// Reactive configuration
const isDark = ref(true);
config.theme = computed(() => isDark.value ? 'dark' : 'light');
```

#### Angular Services
```typescript
import { NotificationService, NotificationConfig } from 'notification-all/angular';

@Injectable()
export class MyService {
  constructor(
    private notify: NotificationService,
    private config: NotificationConfig
  ) {}

  updateTheme(theme: 'light' | 'dark') {
    this.config.update({ theme });
  }
}
```

## Platform Support

| Platform | Status | Native Features |
|----------|--------|-----------------|
| ✅ Vanilla JavaScript | Full Support | DOM notifications |
| ✅ React 16.8+ | Full Support | Hooks, Context |
| ✅ Vue 3 | Full Support | Composition API |
| ✅ Angular 12+ | Full Support | Dependency Injection |
| ✅ React Native | Full Support | Native Toast/Alert |
| ✅ Next.js | Full Support | SSR Compatible |
| ✅ Nuxt.js | Full Support | SSR Compatible |
| ✅ Any Framework | Core Support | Universal API |

## Features

### 🎨 **Beautiful UI**
- Modern, clean design
- Smooth animations and transitions
- Customizable themes and styling

### 📱 **Responsive Design**
- Mobile-first approach
- Touch-friendly interactions
- Adaptive positioning

### 🎭 **Theming**
- Built-in light/dark themes
- Custom theme support
- CSS custom properties

### 🖱️ **Interactive**
- Drag to dismiss
- Pause on hover
- Click actions
- Swipe gestures (mobile)

### 📍 **Flexible Positioning**
- 6 predefined positions
- Custom positioning
- Multi-container support

### 🔄 **Dynamic Updates**
- Update existing notifications
- Progress indicators
- Loading states

### 🎯 **Framework Agnostic**
- Single API across all platforms
- Framework-specific optimizations
- Native integrations

### 📦 **Developer Experience**
- Tree-shakable
- Zero dependencies
- Full TypeScript support
- Comprehensive documentation

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { AlertService, NotificationOptions, NotificationId } from 'notification-all';

interface CustomOptions extends NotificationOptions {
  customProp?: string;
}

const notify: AlertService = alertService;
const id: NotificationId = notify.success('Hello TypeScript!');
```

## Styling & Customization

### CSS Custom Properties

```css
:root {
  --notification-bg: #ffffff;
  --notification-text: #333333;
  --notification-border: #e0e0e0;
  --notification-success: #4caf50;
  --notification-error: #f44336;
  --notification-warning: #ff9800;
  --notification-info: #2196f3;
}
```

### Custom CSS Classes

```javascript
alertService.success('Message', {
  className: 'my-custom-notification',
  style: {
    backgroundColor: 'var(--my-color)',
    borderRadius: '12px'
  }
});
```

## Advanced Usage

### Promise-based notifications
```javascript
const result = await alertService.promise(
  fetchData(),
  {
    loading: 'Fetching data...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data'
  }
);
```

### Notification queuing
```javascript
alertService.configure({
  limit: 3, // Maximum notifications shown
  newestOnTop: true,
  preventDuplicates: true
});
```

### Custom render function
```javascript
// React
notify.custom((t) => (
  <div className={`custom-toast ${t.visible ? 'show' : 'hide'}`}>
    <h4>Custom Toast</h4>
    <p>This is completely custom!</p>
    <button onClick={() => notify.dismiss(t.id)}>Close</button>
  </div>
));
```

## Development

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build all distributions
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Type check
npm run type-check
```

## Building & Publishing

```bash
# Build for production
npm run build

# Test the package locally
npm pack
npm install ./notification-all-1.0.0.tgz

# Publish to npm
npm login
npm publish
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@notification-all.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/notification-all/issues)
- 📖 Docs: [Documentation Site](https://notification-all.com/docs)
- 💬 Discord: [Community Server](https://discord.gg/notification-all)

---

**notification-all** - One API to notify them all! 🔔
