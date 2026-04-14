import { useEffect, useState } from 'the-react/hooks';
import { CardList } from '../components/CardList/CardList';
import { getPosters } from '../services/posters';
import { UtilCard } from '../components/UtilCard/UtilCard';
import { getUtilityCompanyByAlias } from '../services/complex';
import type { Apartment, UtilityCompany } from '../types';

interface IUtilityComplex{
	alias?: string;
}

export function UtilityComplex({ alias }: IUtilityComplex) {
	if (alias === undefined){
		return null
	}
	const [isLoading, setIsLoading] = useState(false)
	const [apartments, setApartments] = useState<Apartment[] | undefined>(undefined);
	const [utilityCompany, setUtilityCompany] = useState<UtilityCompany | undefined>(undefined);
	const [utilityError, setUtilityError] = useState<string | undefined>(undefined);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const pageSize = 12;

	const handelPostersList = async() => {
		const postersResp = await getPosters({limit: 12, offset: 0, utility_company: alias});
		setApartments(postersResp.posters);
	}

	const handleUtilityByAlias = async () => {
		setIsLoading(true)
		setUtilityError(undefined);
		try {
			const utilityResp = await getUtilityCompanyByAlias({ alias });
			setUtilityCompany(utilityResp);
		} catch (error) {
			console.error('Failed to load utility complex by alias:', error);
			setUtilityError('Не удалось загрузить данные ЖК');
		} finally{
			setIsLoading(false)
		}
	}

	const handleLoadMore = async () => {
		setIsFetchingMore(true);
		const offset = apartments?.length || 0;
		const postersResp = await getPosters({limit: pageSize, offset, utility_company: alias});
		if (postersResp.posters.length < pageSize) {
			setHasMore(false);
		}
		setApartments([...(apartments || []), ...postersResp.posters]);
		setIsFetchingMore(false);
	}

	useEffect(
		()=>{
			handelPostersList();
			handleUtilityByAlias();
		}, []
	)
	if (isLoading){
		return(
			<div>
				<p className="fontHero">Загрузка ЖК...</p>
			</div>
		)
	}

	return (
		<div>
			{utilityCompany && (<UtilCard key="utilCard" alias={alias} utilityCompany={utilityCompany as UtilityCompany} />)}
			{utilityError && <p className="fontHero">{utilityError}</p>}
			<section>
				
				{apartments && (
					<div>
						<br/>
						<h2 className="fontHero">Объявления в этом ЖК</h2>
						<CardList key="card_list_utility" styles={{'justify-content': 'start'}}apartments={apartments} isFetchingMore={isFetchingMore} hasMore={hasMore} onLoadMore={handleLoadMore} pageSize={pageSize} />
					</div>
					
				)}
			</section>
		</div>
	);
}
