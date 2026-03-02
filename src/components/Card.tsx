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
    <div>
    <article className="card" data-title={apartment.title}>
      <div className="card__image">                         
        <img src={apartment.imageUrl} alt="Интерьер" />
      </div>
      <div className="card__info">                          
        <div className="card__meta">                        
          <span className="card__location">                 
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M10.832 2.688A4.056 4.056 0 0 0 8.02 1.5h-.04a4.056 4.056 0 0 0-4 4c-.013.75.198 1.487.606 2.117L7.734 14h.533l3.147-6.383c.409-.63.62-1.367.606-2.117a4.056 4.056 0 0 0-1.188-2.812zM7.925 2.5l.082.01.074-.01a3.075 3.075 0 0 1 2.941 3.037 2.74 2.74 0 0 1-.467 1.568l-.02.034-.017.035L8 12.279l-2.517-5.1-.017-.039-.02-.034a2.74 2.74 0 0 1-.467-1.568A3.074 3.074 0 0 1 7.924 2.5z"/>
            </svg>
            {apartment.location}
          </span>
          <span>{apartment.area.toString()} м²</span>
        </div>
        <div className="card__footer">                   
          <span className={`card__rate ${ratingClass}`}>
            {apartment.rating.toFixed(1)}
          </span>
          <span className="card__beds">                  
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7,12.5a3,3,0,1,0-3-3A3,3,0,0,0,7,12.5Zm0-4a1,1,0,1,1-1,1A1,1,0,0,1,7,8.5Zm13-2H12a1,1,0,0,0-1,1v6H3v-8a1,1,0,0,0-2,0v13a1,1,0,0,0,2,0v-3H21v3a1,1,0,0,0,2,0v-9A3,3,0,0,0,20,6.5Zm1,7H13v-5h7a1,1,0,0,1,1,1Z"/>
            </svg>
            {apartment.beds.toString()}
          </span>
          <strong>{apartment.price.toLocaleString()} ₽</strong>
        </div>
      </div>
    </article>
    </div>
  );
}