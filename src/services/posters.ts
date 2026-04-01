import type {Apartment, ApartmentDetails, MyPoster} from "src/types";
import type { CreatePosterPayload, CreatePosterResponse } from '../types/posterCreate';
import {apiService} from "./apiClass";
import { authService } from "./auth";

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
interface IPostersFilters {
    /** Максимальное количество объявлений для возврата */
    limit: number;
    /** Количество объявлений для пропуска (для пагинации) */
    offset: number;
    /** Alias ЖК для фильтрации объявлений */
    utility_company?: string;
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
    const resp: IPostersResponse = await apiService.get("/posters/flats", params);
    return resp;
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
    formData.append('city_id', payload.city_id.toString());
    if (payload.metro_station_id) {
        formData.append('metro_station_id', payload.metro_station_id.toString());
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

        const resp: CreatePosterResponse = await apiService.post(
            '/posters/flat',
            formData,
            {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        );
        return resp
    });
}
