import { useEffect } from '@my-react/hooks';
import * as VKID from '@vkid/sdk';
import {generateCodeVerifier, generateState } from '../../../utils/pkce';
import { VK_OAUTH_CLIENT_ID, VK_OAUTH_REDIRECT_URL, VK_SCOPE } from '../../../config';

let isRender = false

const OAuthVKButton = () => {
  useEffect(() => {
      const initVKID = () => {
        const verifier = generateCodeVerifier();
        localStorage.setItem("vk_code_verifier", verifier)

        VKID.Config.init({
          app: VK_OAUTH_CLIENT_ID,
          redirectUrl: VK_OAUTH_REDIRECT_URL,
          responseMode: VKID.ConfigResponseMode.Redirect,
          source: VKID.ConfigSource.LOWCODE,
          scope: VK_SCOPE,
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
      if (isRender){
        return
      }
      isRender = true

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
      isRender =false;
      if (widget?.unmount) widget.unmount();
    };
  }, []);

  return <div id="vk-button-container" onClick={()=>{VKID.Auth.login()}}  />;
};

export default OAuthVKButton;
