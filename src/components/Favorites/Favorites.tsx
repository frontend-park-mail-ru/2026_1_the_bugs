import { useEffect, useState } from 'the-react/hooks';
import { CardList } from '../CardList/CardList';
import type { Apartment } from '../../types';
import { getFavorites } from '../../services/posters';

export function Favorites() {
    const [favorites, setFavorites] = useState<Apartment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchFavorites = async () => {
            setIsLoading(true);
            try {
                const resp = await getFavorites();
                setFavorites(resp.posters || []);
            } catch (e) {
                setFavorites([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    // Build a Set of favorite IDs for fast lookup
    const favoritesIds = new Set(favorites.map(f => f.id));

    return (
        <div>
            <CardList
                apartments={favorites as any}
                pageSize={favorites.length || 8}
                isFetchingMore={false}
                hasMore={false}
                onLoadMore={() => {}}
                favoritesIds={favoritesIds}
                hideEmptyState={true}
            />
            {isLoading && <div>Загрузка…</div>}
            {!isLoading && favorites.length === 0 && <div>Нет избранных объявлений</div>}
        </div>
    );
}