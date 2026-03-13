import { useEffect } from '@my-react/hooks';
import * as VKID from '@vkid/sdk';

let isVKIDInitialized = false; // Глобальный флаг инициализации
const OAuthVKButton = () => {

  useEffect(() => {
    // Шаг 1: Инициализация Config (только один раз)
    if (!isVKIDInitialized) {
      VKID.Config.init({
        app: 54479788,
        redirectUrl: 'https://dom-deli.ru/oauth/vk',
        responseMode: VKID.ConfigResponseMode.Callback,
        source: VKID.ConfigSource.LOWCODE,
        scope: 'email',
      });
      isVKIDInitialized = true;
    }

    const renderWidget = () => {
      const container = document.getElementById('vk-button-container');
      if (!container) {
        return setTimeout(renderWidget, 100);
      }

      const oneTap = new VKID.OneTap();
      const widget = oneTap.render({
        container: container as HTMLElement,
        showAlternativeLogin: true,
        styles: {
          borderRadius: 17,
          width: 20
        }
      })
      .on(VKID.WidgetEvents.ERROR, console.error)
      .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, ({ code, device_id }) => {
        VKID.Auth.exchangeCode(code, device_id)
          .then(data => {
            console.log('Auth success:', data);
            // Отправка на бэкенд
          })
          .catch(console.error);
      });

      // Сохраняем для cleanup
      (window as any).vkWidget = widget;
    };

    renderWidget();

    return () => {
      const widget = (window as any).vkWidget;
      if (widget?.unmount) widget.unmount();
    };
  }, []);

  return <div id="vk-button-container" />;
};

export default OAuthVKButton;
