import { Card } from './Card';
import type { Apartment } from '../types';

interface CardListProps {
  apartments: Apartment[];
  key: string
}

export function CardList({ apartments }: CardListProps) {
  return (
    <div>
    <section className="cards">
      {apartments.map(apt => (
        <Card key={apt.id.toString()} apartment={apt} />
      ))}
    </section>
    </div>
  );
}