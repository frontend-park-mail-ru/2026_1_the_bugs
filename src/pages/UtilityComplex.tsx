import { useEffect, useState } from 'the-react/hooks';
import { CardList } from '../components/CardList/CardList';
import { getPosters } from '../services/posters';
import { UtilCard } from '../components/UtilCard/UtilCard';
import { UtilCardSkeleton } from '../components/UtilCard/UtilCardSkeleton';
import { getUtilityCompanyByAlias } from '../services/complex';
import type { Apartment, UtilityCompany } from '../types';
import { ErrorView } from '../components/Errors/Errors';

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
	const [utilityError, setUtilityError] = useState<unknown>(null);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const pageSize = 12;

	const handelPostersList = async() => {
		const postersResp = await getPosters({limit: 12, offset: 0, utility_company: alias});
		setApartments(postersResp.posters);
	}

	const handleUtilityByAlias = async () => {
		setIsLoading(true)
		setUtilityError(null);
		try {
			const utilityResp = await getUtilityCompanyByAlias({ alias });
			setUtilityCompany(utilityResp);
		} catch (error) {
			console.error('Failed to load utility complex by alias:', error);
			setUtilityError(error);
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
		return (
			<div>
				<UtilCardSkeleton />
			</div>
		);
	}

	return (
		<div>
			{utilityCompany && (<UtilCard key="utilCard" alias={alias} utilityCompany={utilityCompany as UtilityCompany} />)}
			{utilityError && (
				<ErrorView
					error={utilityError}
					fallbackMessage="Не удалось загрузить данные ЖК"
					notFoundMessage="ЖК не найден"
				/>
			)}
			<section>
				
				{utilityCompany && apartments && (
					<div>
						<br/>
						<h2 className="fontHero">Объявления в этом ЖК</h2>
						<CardList isAuth={false} key="card_list_utility" styles={{'justify-content': 'start'}}apartments={apartments} isFetchingMore={isFetchingMore} hasMore={hasMore} onLoadMore={handleLoadMore} pageSize={pageSize} />
					</div>
					
				)}
			</section>
		</div>
	);
}
