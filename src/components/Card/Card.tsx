import type { Apartment } from '../../types';
import style from './Card.module.css';
import { useNavigate } from '@router-dom';

interface CardProps {
  apartment: Apartment;
}

/** Карточка объявления с фото, адресом, площадью, оценкой и ценой. */
export function Card({ apartment }: CardProps) {
  console.log(apartment)
  const ratingClass = 
    apartment.rating >= 8 ? 'good' :
    apartment.rating >= 6 ? 'mid' :
    apartment.rating >= 4 ? 'warn' : 'bad';

  const navigate = useNavigate();
  const onOpenPoster = () => navigate(`/posters/${encodeURIComponent(apartment.alias)}`);

  return (
    <article className={style.card} data-title={apartment.metro} onClick={onOpenPoster}>
      <div className={style.image}>                         
        <img src={apartment.imageUrl} alt="Интерьер" draggable="false"/>
      </div>
      <div className={style.info}>                          
        <div className={style.meta}>                        
          <span className={style.location}>                 
            <img src="/svg/location.svg" alt="" aria-hidden="true" draggable="false"/>
            {apartment.address}
          </span>
          <span>{apartment.area.toString()} м²</span>
        </div>
        <div className={style.footer}>
      
            <span>
              {apartment.flat_category}
            </span>   
          {apartment?.rating && (
             <span className={`${style.rate} ${style[ratingClass]}`}>
            {apartment.rating.toFixed(1)}
          </span>
          )}              
         
          {apartment?.beds && (
              <span className={style.beds}>                  
            <img src="/svg/beds.svg" alt="" aria-hidden="true" draggable="false"/>
            {apartment.beds.toString()}
          </span>
          )}
          <strong>{apartment.price.toLocaleString()} ₽</strong>
        </div>
      </div>
    </article>
  );
}