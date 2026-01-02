
import { supabase } from './supabaseClient';
import { StravaActivity, StravaStream, Coordinate } from '../types';

const STRAVA_API_URL = 'https://www.strava.com/api/v3';

export const linkStravaAccount = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'strava',
        options: {
            scopes: 'activity:read_all',
            redirectTo: window.location.origin
        }
    });

    if (error) throw error;
    return data;
};

export const getStravaToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.provider_token || null;
};

export const getRecentActivities = async (joinedAt: number): Promise<StravaActivity[]> => {
    const token = await getStravaToken();
    if (!token) throw new Error("Não conectado ao Strava");

    // Fetch last 30 activities
    const response = await fetch(`${STRAVA_API_URL}/athlete/activities?per_page=30`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error("Token expirado. Reconecte o Strava.");
        throw new Error("Erro ao buscar atividades do Strava");
    }

    const activities: StravaActivity[] = await response.json();

    // Filter by Join Date
    // Strava dates are ISO strings (e.g., "2023-01-01T12:00:00Z")
    const joinDate = new Date(joinedAt);

    const filtered = activities.filter(activity => {
        // Only running (Run) or walking (Walk)? Allowing all for now based on game design, 
        // but typically territory run is running.
        // Let's allow Run and Walk.
        const isSupportedType = ['Run', 'Walk', 'Hike'].includes(activity.type);
        const activityDate = new Date(activity.start_date);

        // Strict Date Check: Activity must be AFTER user joined
        const isAfterJoin = activityDate.getTime() > joinDate.getTime();

        return isSupportedType && isAfterJoin;
    });

    return filtered;
};

export const getActivityStream = async (activityId: number): Promise<Coordinate[]> => {
    const token = await getStravaToken();
    if (!token) throw new Error("Não conectado ao Strava");

    const response = await fetch(`${STRAVA_API_URL}/activities/${activityId}/streams?keys=latlng,time&key_by_type=true`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error("Erro ao baixar GPS da atividade");

    const streams = await response.json();
    const latlngs: { data: [number, number][] } = streams.latlng;
    const times: { data: number[] } = streams.time; // Seconds from start

    if (!latlngs || !latlngs.data) return [];

    // Convert to our Coordinate format
    // Strava stream time is relative to start_date. We need absolute timestamp for the game logic?
    // Actually game logic uses timestamp for speed checks.
    // We should verify if we can get the absolute start time from the activity details passed in?
    // For now, let's just use relative time + a base 0, or we'll need to fetch activity details again to get start_time.
    // Better approach: We usually have the activity object before calling this.
    // Let's assume we just return coordinates with relative timestamps (0, 1, 2...) OR 
    // we can reconstruct absolute if needed.
    // For "Conquest" validation, relative time is fine for speed calculation (delta distance / delta time).

    return latlngs.data.map((pair, index) => ({
        lat: pair[0],
        lng: pair[1],
        timestamp: (times.data[index] * 1000) // Convert to ms
    }));
};
