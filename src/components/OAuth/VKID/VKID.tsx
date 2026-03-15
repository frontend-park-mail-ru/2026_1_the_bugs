import { useEffect } from '@my-react/hooks';
import * as VKID from '@vkid/sdk';
import {generateCodeVerifier, generateState } from '../../../utils/pkce';

const OAuthVKButton = () => {
  

  useEffect(() => {
      const initVKID = () => {
        const verifier = generateCodeVerifier();
        localStorage.setItem("vk_code_verifier", verifier)

        VKID.Config.init({
          app: 54483363,
          redirectUrl: 'https://dom-deli.ru/oauth/vk',
          responseMode: VKID.ConfigResponseMode.Redirect,
          source: VKID.ConfigSource.LOWCODE,
          scope: 'vkid.personal_info email phone',
          state: generateState(),
          codeVerifier: verifier
        });
    };
    initVKID();

    const renderWidget = () => {
      const container = document.getElementById('vk-button-container');
      if (!container) {
        return setTimeout(renderWidget, 100);
      }

      const oneTap = new VKID.OneTap();
      
      const widget = oneTap.render({
        container: container as HTMLElement,
        fastAuthEnabled: false,
        styles: {
          borderRadius: 16,
          width: 200,
        }
      })
      .on(VKID.WidgetEvents.ERROR, console.error);

      (window as any).vkWidget = widget;
    };

    renderWidget();

    return () => {
      const widget = (window as any).vkWidget;
      if (widget?.unmount) widget.unmount();
    };
  }, []);

  return <div id="vk-button-container" onClick={()=>{VKID.Auth.login()}}  />;
};

export default OAuthVKButton;
