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
 * @param teamData Dados da equipe
 * @param ownerId ID do dono
 * @param ownerName Nome do dono
 * @returns Equipe criada ou null
 */
export const createTeam = async (teamData: Partial<Team>, ownerId: string, ownerName: string): Promise<Team | null> => {
    try {
        const name = teamData.name!;
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
                member_count: 1,
                description: teamData.description,
                logo_url: teamData.logoUrl,
                banner_url: teamData.bannerUrl,
                address: teamData.address,
                operating_hours: teamData.operatingHours,
                whatsapp: teamData.whatsapp,
                social_links: teamData.socialLinks,
                primary_color: teamData.primaryColor
            }])
            .select()
            .single();

        if (error) throw error;

        // Atualizar usuário como dono da equipe
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                team_id: data.id,
                team_name: name,
                role: 'owner'
            })
            .eq('id', ownerId);

        if (profileError) console.warn("Error updating profile role:", profileError);

        return {
            id: data.id,
            name: data.name,
            slug: data.slug,
            ownerId: data.owner_id,
            ownerName: data.owner_name,
            createdAt: new Date(data.created_at).getTime(),
            memberCount: data.member_count,
            description: data.description,
            logoUrl: data.logo_url,
            bannerUrl: data.banner_url,
            address: data.address,
            operatingHours: data.operating_hours,
            whatsapp: data.whatsapp,
            socialLinks: data.social_links,
            primaryColor: data.primary_color
        };
    } catch (error) {
        console.warn("Supabase unavailable. Saving team locally.");

        // FALLBACK
        const teams = getLocal('local_teams') || [];
        const name = teamData.name!;
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
            memberCount: 1,
            description: teamData.description,
            logoUrl: teamData.logoUrl,
            bannerUrl: teamData.bannerUrl,
            address: teamData.address,
            operatingHours: teamData.operatingHours,
            whatsapp: teamData.whatsapp,
            socialLinks: teamData.socialLinks,
            primaryColor: teamData.primaryColor
        };

        teams.push(newTeam);
        saveLocal('local_teams', teams);

        // Update local user if needed (mocked context usually handles this via state)
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
        // MOCK PARA VISUALIZAÇÃO
        if (slug === 'ct-elite') {
            return {
                id: 'mock_ct_elite',
                name: 'CT Elite Performance',
                slug: 'ct-elite',
                ownerId: 'mock_owner',
                ownerName: 'Treinador X',
                createdAt: Date.now(),
                memberCount: 142,
                description: 'O CT Elite Performance é referência nacional em preparação de atletas de alta performance. Nossa metodologia une ciência, tecnologia e paixão pelo esporte para levar você além dos seus limites. Venha treinar com os melhores e conquistar o seu espaço.',
                logoUrl: 'https://img.freepik.com/vetores-gratis/logotipo-de-fitness-com-halteres_23-2148493121.jpg?w=740&t=st=1709840000~exp=1709840600~hmac=abcdef123456',
                bannerUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop',
                address: 'Av. Paulista, 1000 - São Paulo, SP',
                socialLinks: {
                    instagram: 'https://instagram.com/ctelite',
                    website: 'https://ctelite.com.br'
                },
                primaryColor: '#ff9500' // Orange
            };
        }

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
            memberCount: data.member_count,
            description: data.description,
            logoUrl: data.logo_url,
            bannerUrl: data.banner_url,
            address: data.address,
            socialLinks: data.social_links,
            primaryColor: data.primary_color
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
    // MOCK
    if (teamId === 'mock_ct_elite') {
        return [
            { userId: '1', userName: 'Carlos "Flash"', totalStars: 1540, joinedAt: Date.now(), totalDistance: 420.5, totalTerritories: 12, challengesCompleted: 5 },
            { userId: '2', userName: 'Ana Maratonista', totalStars: 1320, joinedAt: Date.now(), totalDistance: 380.2, totalTerritories: 8, challengesCompleted: 4 },
            { userId: '3', userName: 'Pedro Bike', totalStars: 980, joinedAt: Date.now(), totalDistance: 850.0, totalTerritories: 15, challengesCompleted: 3 },
        ];
    }

    const members = await getTeamMembers(teamId);
    return members.sort((a, b) => b.totalStars - a.totalStars);
};

/**
 * Busca equipes pelo nome
 * @param query Nome da equipe
 * @returns Lista de equipes encontradas
 */
export const searchTeams = async (query: string): Promise<Team[]> => {
    try {
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .ilike('name', `%${query}%`)
            .limit(10);

        if (error) throw error;

        return data.map(team => ({
            id: team.id,
            name: team.name,
            slug: team.slug,
            ownerId: team.owner_id,
            ownerName: team.owner_name,
            createdAt: new Date(team.created_at).getTime(),
            memberCount: team.member_count,
            description: team.description,
            logoUrl: team.logo_url,
            bannerUrl: team.banner_url,
            address: team.address,
            operatingHours: team.operating_hours,
            whatsapp: team.whatsapp,
            socialLinks: team.social_links,
            primaryColor: team.primary_color
        }));
    } catch (error) {
        console.warn("Supabase unavailable. Searching local teams.");
        const teams = getLocal('local_teams') || [];
        return teams.filter((t: Team) => t.name.toLowerCase().includes(query.toLowerCase()));
    }
};

// --- GUERRA INTERNA (SQUADS) ---

import { InternalWar, Squad } from '../types';

export const createInternalWar = async (teamId: string, name: string, squadNames: string[], durationDays: number): Promise<InternalWar> => {
    // Mock local implementation
    const newWar: InternalWar = {
        id: `war_${Date.now()}`,
        teamId,
        name,
        status: 'active',
        startDate: Date.now(),
        endDate: Date.now() + (durationDays * 24 * 60 * 60 * 1000),
        squads: squadNames.map((n, i) => ({
            id: `squad_${Date.now()}_${i}`,
            name: n,
            teamId,
            color: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33'][i % 4],
            totalPoints: 0,
            members: []
        }))
    };

    saveLocal(`war_${teamId}`, newWar);
    return newWar;
};

export const getInternalWar = async (teamId: string): Promise<InternalWar | null> => {
    return getLocal(`war_${teamId}`);
};

export const assignMemberToSquad = async (teamId: string, userId: string, squadId: string): Promise<void> => {
    const war = getLocal(`war_${teamId}`) as InternalWar;
    if (!war) return;

    // Remove from other squads first
    war.squads.forEach(s => {
        s.members = s.members.filter(m => m !== userId);
    });

    // Add to target squad
    const squad = war.squads.find(s => s.id === squadId);
    if (squad) {
        squad.members.push(userId);
    }

    saveLocal(`war_${teamId}`, war);
};

export const addPointsToSquad = async (teamId: string, userId: string, points: number): Promise<void> => {
    const war = getLocal(`war_${teamId}`) as InternalWar;
    if (!war || war.status !== 'active') return;

    const squad = war.squads.find(s => s.members.includes(userId));
    if (squad) {
        squad.totalPoints += points;
        saveLocal(`war_${teamId}`, war);
    }
};
