import type {Apartment, ApartmentDetails, MyPoster, IFilters} from "src/types";
import type { CreatePosterPayload, CreatePosterResponse } from '../types/posterCreate';
import {apiService} from "./apiClass";
import { authService } from "./auth";
import type { PosterViews } from "src/types/api";

export async function getFavorites(): Promise<IPostersResponse> {
    return await authService.WithRefresh(async () => {
        const token = apiService.getToken();
        return await apiService.get('/posters/favorites', {}, {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
        });
    });
}

/**
 * Удаляет постер из избранного пользователя.
 * @param alias - alias постера
 * @returns Promise<void>
 */
export async function removePosterFromFavorites(alias: string): Promise<void> {
    await authService.WithRefresh(async () => {
        const token = apiService.getToken();
        await apiService.delete(
            `/posters/${alias}/favorites`,
            {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        );
    });
}
/**
 * Добавляет постер в избранное пользователя.
 * @param alias - alias постера
 * @returns Promise<void>
 */
export async function addPosterToFavorites(alias: string): Promise<void> {
    const encodedAlias = encodeURIComponent(alias);
    await authService.WithRefresh(async () => {
        const token = apiService.getToken();
        await apiService.post(
            `/posters/${encodedAlias}/favorites`,
            null,
            {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        );
    });
}

/**
 * Структура ответа для пагинированного списка объявлений о квартирах.
 */
interface IPostersResponse {
    /** Общее количество доступных объявлений */
    len: number;
    /** Массив объектов объявлений о квартирах */
    posters: Apartment[];
}

interface IMyPostersResponse {
    /** Общее количество доступных объявлений */
    len: number;
    /** Массив объектов объявлений о квартирах */
    posters: MyPoster[];
}


/**
 * Параметры запроса для пагинированного получения объявлений.
 */
interface IPostersFilters extends IFilters {
    limit: number;
    offset: number;
    utility_company?: string;
    search?: string;
}

/**
 * Получает пагинированный список объявлений о квартирах из API.
 * Поддерживает пагинацию на основе offset для бесконечной прокрутки или навигации по страницам.
 *
 * @param filters - Параметры пагинации (limit/offset).
 * @returns Promise с ответом содержащим общее количество и данные объявлений.
 * @throws Ошибка API при неудачном запросе или не-2xx статусе.
 */
export async function getPosters(filters: IPostersFilters): Promise<IPostersResponse> {
    const params: Record<string, any> = {
        "limit": filters.limit,
        "offset": filters.offset,
    };
    if (filters.utility_company) {
        params["utility_company"] = filters.utility_company;
    }
    if (filters.search) {
        params["search_query"] = filters.search;
    }
    if (filters.category) params["category"] = filters.category;
    if (filters.room_count != null) params["room_count"] = filters.room_count;
    if (filters.min_price != null) params["min_price"] = filters.min_price;
    if (filters.max_price != null) params["max_price"] = filters.max_price;
    if (filters.min_square != null) params["min_square"] = filters.min_square;
    if (filters.max_square != null) params["max_square"] = filters.max_square;
    if (filters.min_flat_floor != null) params["min_flat_floor"] = filters.min_flat_floor;
    if (filters.max_flat_floor != null) params["max_flat_floor"] = filters.max_flat_floor;
    if (filters.min_building_floor != null) params["min_building_floor"] = filters.min_building_floor;
    if (filters.max_building_floor != null) params["max_building_floor"] = filters.max_building_floor;
    if (filters.facilities && filters.facilities.length > 0) params["facilities"] = filters.facilities.join(",");
    if (filters.not_first_floor) params["not_first_floor"] = true;
    if (filters.not_last_floor) params["not_last_floor"] = true;
    const resp: IPostersResponse = await apiService.get("/posters/flats", params);
    return resp;
}

export async function getMyPosterByAlias(alias: string): Promise<ApartmentDetails> {
    const resp = await authService.WithRefresh(async () => {
        const token = apiService.getToken();
        return await apiService.get(`/posters/me/${alias}`, {}, {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
        });
    });
    return resp.poster as ApartmentDetails
}

export async function getMyPosters(): Promise<IMyPostersResponse> {
    return await authService.WithRefresh(async () => {
        const token = apiService.getToken();
        return await apiService.get('/posters/me', {}, {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
        });
    });
}

/**
 * Получает детальную информацию об объявлении по его alias.
 * Выполняет URL-кодирование alias и обращается к эндпоинту детали объявления.
 * Из ответа API возвращает объект объявления из поля `poster`.
 *
 * @param alias - Уникальный alias объявления (часть URL маршрута).
 * @returns Promise с детальной структурой объявления.
 * @throws Ошибка API при неудачном запросе или не-2xx статусе.
 */
export async function getPosterByAlias(alias: string): Promise<ApartmentDetails> {
    const encodedAlias = encodeURIComponent(alias);
    const resp: { poster: ApartmentDetails } = await apiService.get(
        `/posters/by-alias/${encodedAlias}`,
        {}
    );
    return resp.poster;
}


export async function deletePosterByAlias(alias: string): Promise<ApartmentDetails> {
    const encodedAlias = encodeURIComponent(alias);
    const resp = await authService.WithRefresh(async () => {
        const token = apiService.getToken();
        const resp: { poster: ApartmentDetails } = await apiService.delete(
            `/posters/flat/${encodedAlias}`,
             {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        );
        return resp
    })
    return resp.poster;
}


/**
 * Создает новое объявление о квартире.
 *
 * @param payload - Данные нового объявления.
 * @returns Ответ API с alias/id созданного объявления.
 */
export async function createPoster(payload: CreatePosterPayload): Promise<CreatePosterResponse> {
    
    const formData = new FormData();

    formData.append('price', payload.price.toString());
    formData.append('description', payload.description);
    formData.append('category_alias', payload.category_alias.toString());
    formData.append('area', payload.area.toString());

    formData.append('address', payload.address);
    if (payload.lat && payload.lon) {
        formData.append('geo_lat', payload.lat.toString());
        formData.append('geo_lon', payload.lon.toString());
    }
    if (payload.city) {
        formData.append('city', payload.city);
    }
    if (payload.district) {
        formData.append('district', payload.district);
    }
    formData.append('floor_count', payload.floor_count.toString());
    if (payload.company_id) {
        formData.append('company_id', payload.company_id.toString());
    }

    formData.append('flat_category_id', payload.flat_category_id.toString());
    formData.append('flat_number', payload.flat_number?.toString() || '');
    formData.append('flat_floor', payload.flat_floor.toString());

    payload.features.forEach((feature) => {
        formData.append('features', feature);
    });

    payload.images.forEach((image, index) => {
        formData.append(`photos.${index}.file`, image.file, `img_${image.order}.jpg`);
        formData.append(`photos.${index}.order`, image.order.toString());
    });

   
    return await authService.WithRefresh(async () => {
        const token = apiService.getToken();

        const resp: {poster: CreatePosterResponse} = await apiService.post(
            '/posters/flat',
            formData,
            {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        );
        return resp.poster
    });
}


export async function updatePoster(alias: string, payload: CreatePosterPayload) {
    const formData = new FormData();

    formData.append('price', payload.price.toString());
    formData.append('description', payload.description);
    formData.append('category_alias', payload.category_alias.toString());
    formData.append('area', payload.area.toString());

    formData.append('address', payload.address);
    if (payload.lat && payload.lon) {
        formData.append('geo_lat', payload.lat.toString());
        formData.append('geo_lon', payload.lon.toString());
    }
    if (payload.city) {
        formData.append('city', payload.city);
    }
    if (payload.district) {
        formData.append('district', payload.district);
    }
    formData.append('floor_count', payload.floor_count.toString());
    if (payload.company_id) {
        formData.append('company_id', payload.company_id.toString());
    }

    formData.append('flat_category_id', payload.flat_category_id.toString());
    formData.append('flat_number', payload.flat_number?.toString() || '');
    formData.append('flat_floor', payload.flat_floor.toString());

    payload.features.forEach((feature) => {
        formData.append('features', feature);
    });
    payload.images.forEach((image, index) => {
        if (image.file instanceof File) {
            formData.append(`photos.${index}.file`, image.file, `img_${image.order}.jpg`);
            formData.append(`photos.${index}.order`, image.order.toString());
        } else if (image.url && typeof image.url === 'string') {
            formData.append(`photos.${index}.url`, image.url);
            formData.append(`photos.${index}.order`, image.order.toString());
        } else {
            console.warn('Фото без file и url пропущено', image);
        }
    });

   
    return await authService.WithRefresh(async () => {
        const token = apiService.getToken();

        const resp: CreatePosterResponse = await apiService.put(
            `/posters/flat/${alias}`,
            formData,
            {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        );
        return resp
    });
}



export async function addView(alias: string) {
    await authService.WithRefresh(async () => {
        const token = apiService.getToken();
        const resp: CreatePosterResponse = await apiService.post(
            `/posters/${alias}/views`,
            {},
            {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        );
        return resp
    });
}


export async function getViews(alias: string) {
    const resp: PosterViews = await apiService.get(
        `/posters/${alias}/views`,
        {},
        {
            'Accept': 'application/json',
        },
    );
    return resp
}

export async function generateDescription(data: {
    category: string;
    area: number;
    flat_category: string;
    city: string;
    features: string[];
}): Promise<string> {
    const resp: { description: string } = await authService.WithRefresh(async () => {
        const token = apiService.getToken();
        return await apiService.post(
            `/posters/generate-description`,
            JSON.stringify(data),
             {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        );
    });
    return resp.description;
}

export async function getFavoritesCount(alias: string): Promise<{ favorites: number, is_favorite: boolean }> {
    const resp: { favorites: number, is_favorite: boolean } = await authService.WithRefresh(async () => {
        const token = apiService.getToken();
        return await apiService.get(
            `/posters/${alias}/favorites`,
            {},
            {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        );
    });
    return resp;
}