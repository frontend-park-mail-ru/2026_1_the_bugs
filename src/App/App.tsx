import { Router } from "@my-react/router-dom/Router";
import {HomePage} from '../pages/HomePage'
import { useNavigate } from "@my-react/router-dom/hooks";
import { useEffect, useState } from "@my-react/hooks";


export function App() {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    useEffect(() => {
        const handler = () => setCurrentPath(window.location.pathname);
        window.addEventListener('popstate', handler);
        return () => window.removeEventListener('popstate', handler);
    }, []);
    const navigate = useNavigate()
    console.log('App render', currentPath);
    return (
        <div>
            <Router key='router1' currentPath={currentPath} path="/">
                <HomePage  key='page' />
            </Router>
            <Router  key='router2' currentPath={currentPath} path="/oauth/vk">
                <button onClick={()=>{navigate('/')}}>YBack</button>
            </Router>
        </div>
    );
}