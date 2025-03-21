import {
  backButton,
  viewport,
  themeParams,
  miniApp,
  initData,
  $debug,
  init as initSDK,
} from '@telegram-apps/sdk-react';

/**
 * Initializes the application and configures its dependencies.
 */
export function init(debug: boolean): void {
  // Set @telegram-apps/sdk-react debug mode.
  $debug.set(debug);

  // Добавляем поддержку пассивных обработчиков событий
  document.addEventListener = ((originalFunction) => {
    return function(this: Document, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
      // Для событий scroll, wheel, touchstart, touchmove делаем passive: true если явно не указано иное
      if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'mousewheel') {
        if (typeof options === 'object') {
          if (options.passive === undefined) {
            options = { ...options, passive: true };
          }
        } else if (options === undefined || options === false) {
          options = { passive: true };
        }
      }
      return originalFunction.call(this, type, listener, options);
    };
  })(document.addEventListener);

  // То же самое для Element.addEventListener
  const originalElementAddEventListener = Element.prototype.addEventListener;
  Element.prototype.addEventListener = function(
    type: string, 
    listener: EventListenerOrEventListenerObject, 
    options?: boolean | AddEventListenerOptions
  ) {
    // Для событий scroll, wheel, touchstart, touchmove делаем passive: true если явно не указано иное
    if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'mousewheel') {
      if (typeof options === 'object') {
        if (options.passive === undefined) {
          options = { ...options, passive: true };
        }
      } else if (options === undefined || options === false) {
        options = { passive: true };
      }
    }
    return originalElementAddEventListener.call(this, type, listener, options);
  };

  // Initialize special event handlers for Telegram Desktop, Android, iOS, etc.
  // Also, configure the package.
  initSDK();

  // Add Eruda if needed.
  debug && import('eruda')
    .then((lib) => lib.default.init())
    .catch(console.error);

  // Check if all required components are supported.
  if (!backButton.isSupported() || !miniApp.isSupported()) {
    throw new Error('ERR_NOT_SUPPORTED');
  }

  // Mount all components used in the project.
  backButton.mount();
  miniApp.mount();
  themeParams.mount();
  initData.restore();
  void viewport
    .mount()
    .catch(e => {
      console.error('Something went wrong mounting the viewport', e);
    })
    .then(() => {
      viewport.bindCssVars();
    });

  // Define components-related CSS variables.
  miniApp.bindCssVars();
  themeParams.bindCssVars();
}