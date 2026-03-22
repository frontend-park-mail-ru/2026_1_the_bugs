import type { UtilityCompany } from "src/types";
import { apiService } from "./apiClass";

/**
 * Структура ответа для получения данных ЖК по alias.
 */
interface IUtilityCompanyResponse extends UtilityCompany {}

/**
 * Параметры запроса для получения ЖК по alias.
 */
interface IUtilityCompanyFilter {
    /** Уникальный alias ЖК */
    alias: string;
}

/**
 * Получает информацию о ЖК и его фотографиях по alias.
 *
 * @param filter - Параметр alias ЖК.
 * @returns Promise с данными ЖК.
 * @throws Ошибка API при неудачном запросе или не-2xx статусе.
 */
export async function getUtilityCompanyByAlias(filter: IUtilityCompanyFilter): Promise<IUtilityCompanyResponse> {
    const encodedAlias = encodeURIComponent(filter.alias);
    const resp: IUtilityCompanyResponse = await apiService.get(`/utility-companies/by-alias/${encodedAlias}`, {});
    return resp;
}
