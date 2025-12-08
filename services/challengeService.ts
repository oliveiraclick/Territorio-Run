import { supabase } from './supabaseClient';
import { Challenge } from '../types';

// Helper to save to local storage (Fallback)
const saveLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const getLocal = (key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

/**
 * Cria um novo desafio
 * @param challenge Dados do desafio
 * @returns Desafio criado ou null
 */
export const createChallenge = async (challenge: Omit<Challenge, 'id' | 'createdAt'>): Promise<Challenge | null> => {
    try {
        const { data, error } = await supabase
            .from('challenges')
            .insert([{
                name: challenge.name,
                description: challenge.description,
                team_id: challenge.teamId,
                territory_id: challenge.territoryId,
                points: challenge.points,
                start_date: new Date(challenge.startDate).toISOString(),
                end_date: new Date(challenge.endDate).toISOString(),
                is_active: challenge.isActive,
                created_by: challenge.createdBy
            }])
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            description: data.description,
            teamId: data.team_id,
            territoryId: data.territory_id,
            points: data.points,
            startDate: new Date(data.start_date).getTime(),
            endDate: new Date(data.end_date).getTime(),
            isActive: data.is_active,
            createdAt: new Date(data.created_at).getTime(),
            createdBy: data.created_by
        };
    } catch (error) {
        console.warn("Supabase unavailable. Saving challenge locally.");

        // FALLBACK
        const challenges = getLocal('local_challenges') || [];
        const newChallenge: Challenge = {
            id: 'challenge_' + Date.now(),
            ...challenge,
            createdAt: Date.now()
        };

        challenges.push(newChallenge);
        saveLocal('local_challenges', challenges);
        return newChallenge;
    }
};

/**
 * Busca desafios de uma equipe
 * @param teamId ID da equipe
 * @returns Lista de desafios
 */
export const getTeamChallenges = async (teamId: string): Promise<Challenge[]> => {
    try {
        const { data, error } = await supabase
            .from('challenges')
            .select('*')
            .eq('team_id', teamId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            teamId: c.team_id,
            territoryId: c.territory_id,
            points: c.points,
            startDate: new Date(c.start_date).getTime(),
            endDate: new Date(c.end_date).getTime(),
            isActive: c.is_active,
            createdAt: new Date(c.created_at).getTime(),
            createdBy: c.created_by
        }));
    } catch (error) {
        console.warn("Supabase unavailable. Fetching local challenges.");
        const challenges = getLocal('local_challenges') || [];
        return challenges.filter((c: Challenge) => c.teamId === teamId);
    }
};

/**
 * Busca desafios ativos de uma equipe
 * @param teamId ID da equipe
 * @returns Lista de desafios ativos
 */
export const getActiveChallenges = async (teamId: string): Promise<Challenge[]> => {
    const challenges = await getTeamChallenges(teamId);
    const now = Date.now();

    return challenges.filter(c =>
        c.isActive &&
        c.startDate <= now &&
        c.endDate >= now
    );
};

/**
 * Atualiza status de um desafio
 * @param challengeId ID do desafio
 * @param isActive Novo status
 * @returns Sucesso
 */
export const updateChallengeStatus = async (challengeId: string, isActive: boolean): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('challenges')
            .update({ is_active: isActive })
            .eq('id', challengeId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.warn("Supabase unavailable. Updating challenge locally.");

        // FALLBACK
        const challenges = getLocal('local_challenges') || [];
        const updated = challenges.map((c: Challenge) =>
            c.id === challengeId ? { ...c, isActive } : c
        );
        saveLocal('local_challenges', updated);
        return true;
    }
};

/**
 * Verifica e desativa desafios expirados
 * @param teamId ID da equipe
 */
export const deactivateExpiredChallenges = async (teamId: string): Promise<void> => {
    const challenges = await getTeamChallenges(teamId);
    const now = Date.now();

    for (const challenge of challenges) {
        if (challenge.isActive && challenge.endDate < now) {
            await updateChallengeStatus(challenge.id, false);
        }
    }
};
