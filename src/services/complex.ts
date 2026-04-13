/**
 * Получить список девелоперов (ЖК) с бэкенда.
 * @returns Promise<{ developers: { avatar_url: string, developer_id: number, developer_name: string }[], len: number }>
 */
export async function getDevelopers() {
    return apiService.get('/utility-companies/developers', {});
}
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

/**
 * Получить список ЖК по developer_id (пока только developer_id=1).
 * @returns Promise<{ utility_companies: { id: number, company_name: string }[], len: number }>
 */
export async function getComplexesByDeveloper(developer_id: number) {
    return apiService.get('/utility-companies/', { developer_id });
}
