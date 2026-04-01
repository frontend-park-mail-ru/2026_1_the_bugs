import type {Apartment, ApartmentDetails} from "src/types";
import type { CreatePosterPayload, CreatePosterResponse } from '../types/posterCreate';
import {apiService} from "./apiClass";

/**
 * Структура ответа для пагинированного списка объявлений о квартирах.
 */
interface IPostersResponse {
    /** Общее количество доступных объявлений */
    len: number;
    /** Массив объектов объявлений о квартирах */
    posters: Apartment[];
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
    const resp: IPostersResponse = await apiService.get("/posters", params);
    return resp;
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

    formData.append('title', payload.title);
    formData.append('category', payload.category);
    if (payload.city) {
        formData.append('city', payload.city);
    }
    if (payload.district) {
        formData.append('district', payload.district);
    }
    formData.append('address', payload.address);
    formData.append('price', payload.price.toString());
    formData.append('area', payload.area.toString());
    formData.append('floor_count', payload.floor_count.toString());
    formData.append('description', payload.description);

    if (typeof payload.lat === 'number') {
        formData.append('lat', payload.lat.toString());
    }
    if (typeof payload.lon === 'number') {
        formData.append('lon', payload.lon.toString());
    }

    if (typeof payload.developer_id === 'number') {
        formData.append('developer_id', payload.developer_id.toString());
    }
    if (typeof payload.utility_company_id === 'number') {
        formData.append('utility_company_id', payload.utility_company_id.toString());
    }

    payload.features.forEach((feature) => {
        formData.append('features', feature);
    });

    formData.append('flat', JSON.stringify(payload.flat));

    payload.images.forEach((image) => {
        formData.append('images', image.file);
        formData.append('image_orders', image.order.toString());
    });

    const resp: CreatePosterResponse = await apiService.post(
        '/posters/flat',
        formData,
        { 'Accept': 'application/json' }
    );
    return resp;
}
