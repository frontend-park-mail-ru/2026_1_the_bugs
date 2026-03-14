import { Router } from "@my-react/router-dom/Router";
import {HomePage} from '../pages/HomePage'
import {OAuthVerifyPage} from '../pages/OAuthVerifyPage/OAuthVerifyPage'
import { useEffect, useState } from "@my-react/hooks";


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
                <OAuthVerifyPage key='OAuthVerifyPage' />
            </Router>
        </div>
    );
}