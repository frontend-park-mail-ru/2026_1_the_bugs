import { useEffect, useState } from '@my-react/hooks';
import { CardList } from '../components/CardList/CardList';
import { getPosters } from '../services/posters';
import { UtilCard } from '../components/UtilCard/UtilCard';
import type { Apartment } from '../types';

interface IUtilityComplex{
	alias: string;
}

export function UtilityComplex({ alias }: IUtilityComplex) {
	const [apartments, setApartments] = useState<Apartment[] | undefined>(undefined);

	const handelPostersList = async() => {
		const postersResp = await getPosters({limit: 12, offset: 0});
		setApartments(postersResp.posters);
	}

	useEffect(
		()=>{handelPostersList()}, []
	)

	return (
		<main className="main">
			<UtilCard key="utilCard" alias={alias} />
			<section>
				<div>
					<h2 className="fontHero">Другие объявления в ЖК {alias}</h2>
					<br/>
				</div>
				{apartments && (
					<CardList key="card_list_utility" apartments={apartments} />
				)}
			</section>
		</main>
	);
}
