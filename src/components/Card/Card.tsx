import type { Apartment } from '../../types';
import style from './Card.module.css';

interface CardProps {
  apartment: Apartment;
}

export function Card({ apartment }: CardProps) {
  const ratingClass = 
    apartment.rating >= 8 ? 'good' :
    apartment.rating >= 6 ? 'mid' :
    apartment.rating >= 4 ? 'warn' : 'bad';

  return (
    <article className={style.card} data-title={apartment.metro}>
      <div className={style.image}>                         
        <img src={apartment.imageUrl} alt="Интерьер" />
      </div>
      <div className={style.info}>                          
        <div className={style.meta}>                        
          <span className={style.location}>                 
            <img src="/svg/location.svg" alt="" aria-hidden="true" />
            {apartment.address}
          </span>
          <span>{apartment.area.toString()} м²</span>
        </div>
        <div className={style.footer}>
          {apartment?.rating && (
             <span className={`${style.rate} ${style[ratingClass]}`}>
            {apartment.rating.toFixed(1)}
          </span>
          )}              
         
          {apartment?.beds && (
              <span className={style.beds}>                  
            <img src="/svg/beds.svg" alt="" aria-hidden="true" />
            {apartment.beds.toString()}
          </span>
          )}
          <strong>{apartment.price.toLocaleString()} ₽</strong>
        </div>
      </div>
    </article>
  );
}