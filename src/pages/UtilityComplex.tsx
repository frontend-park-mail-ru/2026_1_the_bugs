import { useEffect, useState } from '@my-react/hooks';
import { CardList } from '../components/CardList/CardList';
import { getPosters } from '../services/posters';
import type { Apartment } from '../types';

export function UtilityComplex() {
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
            <button type="button" onClick={() => window.location.href = '/'}>
                Вернуться на главную
            </button>
			<section>
				<div>
					<h1>Жилой комплекс</h1>
					<p>Страница комплекса с объявлениями, которые приходят с backend.</p>
				</div>

				<div>
					<h2>Другие объявления в этом ЖК</h2>

				</div>

				{apartments && (
					<CardList key="card_list_utility" apartments={apartments} />
				)}
			</section>
		</main>
	);
}
