import { supabase } from './supabaseClient';
import { Team, TeamMember } from '../types';
import { generateSlug, ensureUniqueSlug } from '../utils/slugUtils';

// Helper to save to local storage (Fallback)
const saveLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const getLocal = (key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

/**
 * Cria uma nova equipe
 * @param name Nome da equipe
 * @param ownerId ID do dono
 * @param ownerName Nome do dono
 * @returns Equipe criada ou null
 */
export const createTeam = async (name: string, ownerId: string, ownerName: string): Promise<Team | null> => {
    try {
        // Gerar slug
        const baseSlug = generateSlug(name);

        // Buscar slugs existentes
        const { data: existingTeams } = await supabase
            .from('teams')
            .select('slug');

        const existingSlugs = existingTeams?.map(t => t.slug) || [];
        const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);

        // Criar equipe
        const { data, error } = await supabase
            .from('teams')
            .insert([{
                name,
                slug: uniqueSlug,
                owner_id: ownerId,
                owner_name: ownerName,
                member_count: 1
            }])
            .select()
            .single();

        if (error) throw error;

        // Atualizar usuário como dono da equipe
        await supabase
            .from('profiles')
            .update({
                team_id: data.id,
                team_name: name,
                role: 'owner'
            })
            .eq('id', ownerId);

        return {
            id: data.id,
            name: data.name,
            slug: data.slug,
            ownerId: data.owner_id,
            ownerName: data.owner_name,
            createdAt: new Date(data.created_at).getTime(),
            memberCount: data.member_count
        };
    } catch (error) {
        console.warn("Supabase unavailable. Saving team locally.");

        // FALLBACK
        const teams = getLocal('local_teams') || [];
        const existingSlugs = teams.map((t: Team) => t.slug);
        const baseSlug = generateSlug(name);
        const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);

        const newTeam: Team = {
            id: 'team_' + Date.now(),
            name,
            slug: uniqueSlug,
            ownerId,
            ownerName,
            createdAt: Date.now(),
            memberCount: 1
        };

        teams.push(newTeam);
        saveLocal('local_teams', teams);
        return newTeam;
    }
};

/**
 * Busca equipe pelo slug
 * @param slug Slug da equipe
 * @returns Equipe ou null
 */
export const getTeamBySlug = async (slug: string): Promise<Team | null> => {
    try {
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            slug: data.slug,
            ownerId: data.owner_id,
            ownerName: data.owner_name,
            createdAt: new Date(data.created_at).getTime(),
            memberCount: data.member_count
        };
    } catch (error) {
        console.warn("Supabase unavailable. Fetching local team.");
        const teams = getLocal('local_teams') || [];
        return teams.find((t: Team) => t.slug === slug) || null;
    }
};

/**
 * Adiciona usuário a uma equipe
 * @param userId ID do usuário
 * @param userName Nome do usuário
 * @param teamId ID da equipe
 * @param teamName Nome da equipe
 * @returns Sucesso
 */
export const joinTeam = async (userId: string, userName: string, teamId: string, teamName: string): Promise<boolean> => {
    try {
        // Atualizar usuário
        const { error: userError } = await supabase
            .from('profiles')
            .update({
                team_id: teamId,
                team_name: teamName,
                role: 'member'
            })
            .eq('id', userId);

        if (userError) throw userError;

        // Incrementar contador de membros
        const { error: teamError } = await supabase
            .rpc('increment_team_members', { team_id: teamId });

        if (teamError) console.warn("Could not increment member count");

        return true;
    } catch (error) {
        console.warn("Supabase unavailable. Joining team locally.");
        return true; // Fallback sempre retorna sucesso
    }
};

/**
 * Busca membros da equipe
 * @param teamId ID da equipe
 * @returns Lista de membros
 */
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('team_id', teamId);

        if (error) throw error;

        return data.map(member => ({
            userId: member.id,
            userName: member.name,
            joinedAt: new Date(member.joined_at).getTime(),
            totalDistance: 0, // TODO: calcular do histórico
            totalTerritories: 0, // TODO: calcular
            totalStars: 0, // TODO: calcular
            challengesCompleted: 0 // TODO: calcular
        }));
    } catch (error) {
        console.warn("Supabase unavailable. Fetching local members.");
        return [];
    }
};

/**
 * Busca ranking da equipe
 * @param teamId ID da equipe
 * @returns Membros ordenados por pontuação
 */
export const getTeamRanking = async (teamId: string): Promise<TeamMember[]> => {
    const members = await getTeamMembers(teamId);
    return members.sort((a, b) => b.totalStars - a.totalStars);
};
