import { Territory, Coordinate } from '../types';
// import { createTerritory } from './gameService'; // Removed to avoid circular
import { addPointsToSquad } from './teamService';
import { supabase } from './supabaseClient';

export interface OfflineItem {
    id: string;
    type: 'conquest' | 'run_points' | 'update_owner';
    payload: any;
    timestamp: number;
    retryCount: number;
}

const STORAGE_KEY = 'offline_activity_queue';

export const getOfflineQueue = (): OfflineItem[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
};

export const saveToOfflineQueue = (item: Omit<OfflineItem, 'id' | 'timestamp' | 'retryCount'>) => {
    const queue = getOfflineQueue();
    const newItem: OfflineItem = {
        ...item,
        id: Date.now().toString() + Math.random(),
        timestamp: Date.now(),
        retryCount: 0
    };
    queue.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    console.log('Saved to offline queue:', newItem);
};

export const removeFromQueue = (id: string) => {
    const queue = getOfflineQueue();
    const updated = queue.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const processOfflineQueue = async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    console.log(`Processing ${queue.length} offline items...`);

    if (!navigator.onLine) {
        console.log('Still offline, skipping sync.');
        return;
    }

    for (const item of queue) {
        try {
            if (item.type === 'conquest') {
                const territory = item.payload as Territory;
                const { error } = await supabase
                    .from('territories')
                    .insert([{
                        name: territory.name,
                        description: territory.description,
                        coordinates: territory.coordinates,
                        owner_id: territory.ownerId,
                        owner_name: territory.ownerName,
                        color: territory.color,
                        value: territory.value,
                        conquered_at: new Date(territory.conqueredAt).toISOString()
                    }]);
                if (error) throw error;
                console.log('Synced conquest:', territory.name);

            } else if (item.type === 'run_points') {
                const { teamId, userId, points } = item.payload;
                if (teamId) {
                    await addPointsToSquad(teamId, userId, points);
                    console.log('Synced points for squad:', points);
                }

            } else if (item.type === 'update_owner') {
                const { territoryId, newOwnerId, newOwnerName, newColor } = item.payload;
                const { error } = await supabase
                    .from('territories')
                    .update({
                        owner_id: newOwnerId,
                        owner_name: newOwnerName,
                        color: newColor,
                        conquered_at: new Date().toISOString()
                    })
                    .eq('id', territoryId);
                if (error) throw error;
                console.log('Synced ownership update:', territoryId);
            }

            removeFromQueue(item.id);
        } catch (error) {
            console.error('Failed to sync item:', item.id, error);
        }
    }
};
