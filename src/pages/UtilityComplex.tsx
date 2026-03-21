import { useEffect, useState } from '@my-react/hooks';
import { CardList } from '../components/CardList/CardList';
import { getPosters } from '../services/posters';
import { UtilCard } from '../components/UtilCard/UtilCard';
import { getUtilityCompanyByAlias } from '../services/complex';
import type { Apartment, UtilityCompany } from '../types';

interface IUtilityComplex{
	alias: string;
}

export function UtilityComplex({ alias }: IUtilityComplex) {
	const [apartments, setApartments] = useState<Apartment[] | undefined>(undefined);
	const [utilityCompany, setUtilityCompany] = useState<UtilityCompany | undefined>(undefined);
	const [utilityError, setUtilityError] = useState<string | undefined>(undefined);
	const companyName = utilityCompany?.company_name;

	const handelPostersList = async() => {
		const postersResp = await getPosters({limit: 12, offset: 0, utility_company: alias});
		setApartments(postersResp.posters);
	}

	const handleUtilityByAlias = async () => {
		setUtilityError(undefined);
		try {
			const utilityResp = await getUtilityCompanyByAlias({ alias });
			setUtilityCompany(utilityResp);
			console.log(utilityResp)
		} catch (error) {
			console.error('Failed to load utility complex by alias:', error);
			setUtilityError('Не удалось загрузить данные ЖК');
		}
	}

	useEffect(
		()=>{
			handelPostersList();
			handleUtilityByAlias();
		}, []
	)

	return (
		<main className="main">
			{utilityCompany && (<UtilCard key="utilCard" alias={alias} utilityCompany={utilityCompany as UtilityCompany} />)}
			{utilityError && <p className="fontHero">{utilityError}</p>}
			<section>
				<div>
					<h2 className="fontHero">Объявления в этом ЖК</h2>
					<br/>
				</div>
				{apartments && (
					<CardList key="card_list_utility" apartments={apartments} />
				)}
			</section>
		</main>
	);
}
