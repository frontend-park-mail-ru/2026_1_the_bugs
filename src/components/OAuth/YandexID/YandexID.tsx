import { YANDEX_OAUTH_AUTHORIZE_URL, YANDEX_OAUTH_CLIENT_ID, YANDEX_OAUTH_REDIRECT_URL, YANDEX_SCOPE } from '../../../config';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '../../../utils/pkce';
import './YandexID.css';



const YandexAuthButton = () => {
  const handleClick = async (e: any) => {
    e.preventDefault();

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem('yandex_code_verifier', codeVerifier);

    const params: Record<string, string> = {
      response_type: 'code',
      client_id: YANDEX_OAUTH_CLIENT_ID,
      redirect_uri: YANDEX_OAUTH_REDIRECT_URL,
      state: generateState(),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      scope: YANDEX_SCOPE,
    };

    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) search.set(k, v);
    });

    window.location.href = `${YANDEX_OAUTH_AUTHORIZE_URL}?${search.toString()}`;
  };

  return (
    <button className="yandex-id-button" onClick={handleClick}>
        <img src="/svg/ya.svg" alt="" aria-hidden="true" draggable="false"/>
        <span>Яндекс ID</span>
      </button>
  );
};

export default YandexAuthButton;
