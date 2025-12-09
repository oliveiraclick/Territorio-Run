import { supabase } from './supabaseClient';
import { Battle, Team } from '../types';

export const createBattle = async (challengerId: string, challengerName: string, targetId: string, duration: number, bet: number): Promise<Battle | null> => {
    try {
        const startDate = Date.now();
        const endDate = startDate + (duration * 3600000);

        // Fetch target team name
        const { data: targetTeam, error: teamError } = await supabase
            .from('teams')
            .select('name')
            .eq('id', targetId)
            .single();

        if (teamError) throw teamError;

        const { data, error } = await supabase
            .from('battles')
            .insert([{
                challenger_team_id: challengerId,
                challenger_team_name: challengerName,
                target_team_id: targetId,
                target_team_name: targetTeam.name,
                status: 'active',
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString(),
                duration,
                score_challenger: 0,
                score_target: 0,
                bet_amount: bet
            }])
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            challengerTeamId: data.challenger_team_id,
            challengerTeamName: data.challenger_team_name,
            targetTeamId: data.target_team_id,
            targetTeamName: data.target_team_name,
            status: data.status,
            startDate: new Date(data.start_date).getTime(),
            duration: data.duration,
            endDate: new Date(data.end_date).getTime(),
            scoreChallenger: data.score_challenger,
            scoreTarget: data.score_target,
            betAmount: data.bet_amount
        };
    } catch (error) {
        console.warn("Supabase unavailable. Creating local battle.");

        // MOCK for local development
        const startDate = Date.now();
        return {
            id: 'local_battle_' + Date.now(),
            challengerTeamId: challengerId,
            challengerTeamName: challengerName,
            targetTeamId: targetId,
            targetTeamName: 'Equipe Rival (Mock)',
            status: 'active',
            startDate,
            duration,
            endDate: startDate + (duration * 3600000),
            scoreChallenger: 0,
            scoreTarget: 0,
            betAmount: bet
        };
    }
};

export const getTeamBattles = async (teamId: string): Promise<Battle[]> => {
    try {
        const { data, error } = await supabase
            .from('battles')
            .select('*')
            .or(`challenger_team_id.eq.${teamId},target_team_id.eq.${teamId}`)
            .order('start_date', { ascending: false });

        if (error) throw error;

        // Check for expired battles and update them lazily
        const now = Date.now();
        const battlesToUpdate = data.filter(b => b.status === 'active' && new Date(b.end_date).getTime() < now);

        for (const battle of battlesToUpdate) {
            const winnerId = battle.score_challenger > battle.score_target ? battle.challenger_team_id :
                battle.score_target > battle.score_challenger ? battle.target_team_id :
                    null; // Draw

            await supabase.from('battles').update({
                status: 'finished',
                winner_id: winnerId
            }).eq('id', battle.id);

            // Update local object to reflect change immediately
            battle.status = 'finished';
            battle.winner_id = winnerId;
        }

        return data.map(b => ({
            id: b.id,
            challengerTeamId: b.challenger_team_id,
            challengerTeamName: b.challenger_team_name,
            targetTeamId: b.target_team_id,
            targetTeamName: b.target_team_name,
            status: b.status,
            startDate: new Date(b.start_date).getTime(),
            duration: b.duration,
            endDate: new Date(b.end_date).getTime(),
            scoreChallenger: b.score_challenger,
            scoreTarget: b.score_target,
            betAmount: b.bet_amount,
            winnerId: b.winner_id
        }));

    } catch (error) {
        // MOCK
        if (teamId === 'mock_ct_elite') {
            return [{
                id: 'mock_battle_1',
                challengerTeamId: 'mock_ct_elite',
                challengerTeamName: 'CT Elite Performance',
                targetTeamId: 'rival_1',
                targetTeamName: 'Iron Runners',
                status: 'active',
                startDate: Date.now() - 3600000,
                duration: 24,
                endDate: Date.now() + 82800000,
                scoreChallenger: 1540,
                scoreTarget: 1320,
                betAmount: 5000
            }];
        }
        return [];
    }
};

export const updateBattleScore = async (teamId: string, points: number): Promise<void> => {
    try {
        // Find active battle where team is challenger or target
        const { data: battles } = await supabase
            .from('battles')
            .select('*')
            .or(`challenger_team_id.eq.${teamId},target_team_id.eq.${teamId}`)
            .eq('status', 'active');

        if (!battles || battles.length === 0) return;

        const battle = battles[0]; // Assuming one active battle per team for now

        if (battle.challenger_team_id === teamId) {
            await supabase.from('battles').update({ score_challenger: battle.score_challenger + points }).eq('id', battle.id);
        } else {
            await supabase.from('battles').update({ score_target: battle.score_target + points }).eq('id', battle.id);
        }
    } catch (error) {
        console.warn("Supabase unavailable. Skipping battle score update.");

        // MOCK: Update local state if needed, but for now just log
        console.log(`[MOCK] Battle Score Updated: +${points} for Team ${teamId}`);
    }
};
