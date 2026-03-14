import { useEffect } from '@my-react/hooks';
import * as VKID from '@vkid/sdk';

const OAuthVKButton = () => {
  const generateState = () => {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 32);
  };

  useEffect(() => {
      VKID.Config.init({
        app: 54483363,
        redirectUrl: 'https://dom-deli.ru/oauth/vk',
        responseMode: VKID.ConfigResponseMode.Redirect,
        source: VKID.ConfigSource.LOWCODE,
        scope: 'email phone',
        state: generateState()
      });

    const renderWidget = () => {
      const container = document.getElementById('vk-button-container');
      if (!container) {
        return setTimeout(renderWidget, 100);
      }

      const oneTap = new VKID.OneTap();
      VKID.Auth.login()
      const widget = oneTap.render({
        container: container as HTMLElement,
        showAlternativeLogin: true,
        styles: {
          borderRadius: 16,  // Скругление как у вас
          width: 240,
          height: 48
        }
      })
      .on(VKID.WidgetEvents.ERROR, console.error);

      // Сохраняем для cleanup
      (window as any).vkWidget = widget;
    };

    renderWidget();

    return () => {
      const widget = (window as any).vkWidget;
      if (widget?.unmount) widget.unmount();
    };
  }, []);

  return <div id="vk-button-container" style={{ 
        width: '240px', 
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}  />;
};

export default OAuthVKButton;
