import { Router } from "@my-react/router-dom/Router";
import {HomePage} from '../pages/HomePage'
import {OAuthVerifyPage} from '../pages/OAuthVerifyPage/OAuthVerifyPage'
import { useEffect, useState } from "@my-react/hooks";
import { CompanyPage } from "../pages/CompanyPage";
import { PosterPage } from '../pages/PosterPage';


export function App() {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    useEffect(() => {
        const handler = () => setCurrentPath(window.location.pathname);
        window.addEventListener('popstate', handler);
        return () => window.removeEventListener('popstate', handler);
    }, []);
    return (
        <div>
            <Router key='router1' currentPath={currentPath} path="/">
                <HomePage  key='HomePage' />
            </Router>
            <Router  key='router2' currentPath={currentPath} path="/oauth/vk">
                <OAuthVerifyPage provider="vk" key='OAuthVerifyPageVK' />
            </Router>
            <Router  key='router3' currentPath={currentPath} path="/oauth/yandex">
                <OAuthVerifyPage provider="yandex" key='OAuthVerifyPageYandex' />
            </Router>
            <Router  key='router4' currentPath={currentPath} path="/company/{alias}">
                <CompanyPage alias="{alias}" key='CompanyPage' />
            </Router>
            <Router key='routerPoster' currentPath={currentPath} path="/posters/{alias}">
                <PosterPage alias="{alias}" key='PosterPage' />
            </Router>
        </div>
    );
}