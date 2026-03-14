import { useEffect, useState } from '@my-react/hooks';
import { Header } from '../components/Header/Header';
import { Hero } from '../components/Here/Here';

import { authService } from '../services/auth';
import type { IOAuthFlow } from 'src/types/api';
import { useNavigate } from '@my-react/router-dom/hooks';


/**
 * Страница валидации OAuth
 */
export function OAuthVerifyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate()


  const handleSearch = async () => {
    const params = new URLSearchParams(window.location.pathname)
    setIsLoading(true)
    setIsError(false)
    try{
        await authService.loginFromVK(Object.fromEntries(params.entries()); as IOAuthFlow)
        navigate('/')
    
    }catch(err){
        setIsError(true)
    }finally{
        setIsLoading(false)
    }
  };
  useEffect(
    ()=>{
        handleSearch()
    }, []
  )

  return (
    <div className="page">
    </div>
  );
}