import { generateCodeVerifier, generateCodeChallenge, generateState } from '../../../utils/pkce';
import './YandexID.css';

const CLIENT_ID = '8bcbe6284aee41e2944c4330e34a712e';
const AUTHORIZE_URL = 'https://oauth.yandex.ru/authorize';

const YandexAuthButton = () => {
  const handleClick = async (e: any) => {
    e.preventDefault();

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem('yandex_code_verifier', codeVerifier);

    const redirectUri = `${window.location.origin}/oauth/yandex`;

    const params: Record<string, string> = {
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      state: generateState(),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    };

    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) search.set(k, v);
    });

    window.location.href = `${AUTHORIZE_URL}?${search.toString()}`;
  };

  return (
    <button className="yandex-id-button" onClick={handleClick}>
        <img src="/svg/ya.svg" alt="" aria-hidden="true" draggable="false"/>
        <span>Яндекс ID</span>
      </button>
  );
};

export default YandexAuthButton;
