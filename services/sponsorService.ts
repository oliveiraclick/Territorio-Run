
import { Sponsor } from '../types';
import { supabase } from './supabaseClient';

// Helper for local storage toggle
const USE_LOCAL_STORAGE = true; // Set to true if Supabase table 'sponsors' doesn't exist yet

const saveLocalSponsors = (sponsors: Sponsor[]) => {
    localStorage.setItem('local_sponsors', JSON.stringify(sponsors));
};

const getLocalSponsors = (): Sponsor[] => {
    const data = localStorage.getItem('local_sponsors');
    return data ? JSON.parse(data) : [];
};

export const fetchSponsors = async (): Promise<Sponsor[]> => {
    if (USE_LOCAL_STORAGE) return getLocalSponsors();

    const { data, error } = await supabase
        .from('sponsors')
        .select('*');

    if (error) {
        console.error('Error fetching sponsors:', error);
        return getLocalSponsors();
    }

    // Map Supabase snake_case to CamelCase if needed
    return data.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        coordinates: s.coordinates,
        address: s.address,
        rewardStars: s.reward_stars,
        discountMessage: s.discount_message,
        logoUrl: s.logo_url,
        qrCodeValue: s.qr_code_value
    }));
};

export const addSponsor = async (sponsor: Omit<Sponsor, 'id'>): Promise<Sponsor> => {
    const newSponsor = {
        ...sponsor,
        id: Date.now().toString(),
    };

    if (USE_LOCAL_STORAGE) {
        const current = getLocalSponsors();
        current.push(newSponsor);
        saveLocalSponsors(current);
        return newSponsor;
    }

    const { data, error } = await supabase
        .from('sponsors')
        .insert([{
            name: sponsor.name,
            description: sponsor.description,
            coordinates: sponsor.coordinates,
            address: sponsor.address,
            reward_stars: sponsor.rewardStars,
            discount_message: sponsor.discountMessage,
            logo_url: sponsor.logoUrl,
            qr_code_value: sponsor.qrCodeValue
        }])
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        description: data.description,
        coordinates: data.coordinates,
        address: data.address,
        rewardStars: data.reward_stars,
        discountMessage: data.discount_message,
        logoUrl: data.logo_url,
        qrCodeValue: data.qr_code_value
    };
};

export const deleteSponsor = async (id: string): Promise<boolean> => {
    if (USE_LOCAL_STORAGE) {
        const current = getLocalSponsors();
        const updated = current.filter(s => s.id !== id);
        saveLocalSponsors(updated);
        return true;
    }

    const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting sponsor:', error);
        return false;
    }
    return true;
};
