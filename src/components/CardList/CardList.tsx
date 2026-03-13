import { Card } from '../Card/Card';
import type { Apartment } from '../../types';
import style from './CardList.module.css';

interface CardListProps {
  apartments: Apartment[];
  key: string
}

/** Отображает список карточек объявлений на основе переданного массива обьявлений. */
export function CardList({ apartments }: CardListProps) {
  return (
    
    <section className={style.cards}>
      {apartments.map(apt => (
        <Card key={apt.id.toString()} apartment={apt} />
      ))}
    </section>
  );
}