import type { Apartment } from "src/types"
import { apiService } from "./apiClass"

interface IPostersResponse{
    len: number
    posters: Apartment[]
}
interface IPostersFilters{
    limit: number
    offset: number
}

export async function getPosters(filters: IPostersFilters){
    const resp: IPostersResponse = await apiService.get("/posters", {"limit": filters.limit, "offset": filters.offset})
    return resp

}