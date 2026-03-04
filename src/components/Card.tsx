import type { Apartment } from '../types';

interface CardProps {
  apartment: Apartment;
}

export function Card({ apartment }: CardProps) {
  const ratingClass = 
    apartment.rating >= 8 ? 'card__rate--good' :
    apartment.rating >= 6 ? 'card__rate--mid' :
    apartment.rating >= 4 ? 'card__rate--warn' : 'card__rate--bad';

  return (
    <article className="card" data-title={apartment.title}>
      <div className="card__image">                         
        <img src={apartment.imageUrl} alt="Интерьер" />
      </div>
      <div className="card__info">                          
        <div className="card__meta">                        
          <span className="card__location">                 
            <img src="/svg/location.svg" alt="" aria-hidden="true" />
            {apartment.location}
          </span>
          <span>{apartment.area.toString()} м²</span>
        </div>
        <div className="card__footer">                   
          <span className={`card__rate ${ratingClass}`}>
            {apartment.rating.toFixed(1)}
          </span>
          <span className="card__beds">                  
            <img src="/svg/beds.svg" alt="" aria-hidden="true" />
            {apartment.beds.toString()}
          </span>
          <strong>{apartment.price.toLocaleString()} ₽</strong>
        </div>
      </div>
    </article>
  );
}