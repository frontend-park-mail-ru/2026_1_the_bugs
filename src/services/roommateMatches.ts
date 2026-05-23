import type { Roommate } from '../types';
import { apiService } from './apiClass';
import { authService } from './auth';

export interface RoommateMatchesResponse {
	len: number;
	users: Roommate[];
}

async function getMatches(endpoint: string): Promise<RoommateMatchesResponse> {
	return await authService.WithRefresh(async () => {
		const token = apiService.getToken();
		return await apiService.get(
			endpoint,
			{},
			{
				Authorization: `Bearer ${token}`,
				Accept: 'application/json',
			}
		);
	});
}

export function getMatchedRoommates(): Promise<RoommateMatchesResponse> {
	return getMatches('/user/me/roommate-matches/matched');
}

export function getIncomingRoommateRequests(): Promise<RoommateMatchesResponse> {
	return getMatches('/user/me/roommate-matches/incoming');
}

