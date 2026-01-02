
import { supabase } from './supabaseClient';
import { Territory, User, Coordinate } from '../types';
import { saveToOfflineQueue } from './offlineService';

// Helper to save to local storage (Fallback)
const saveLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getLocal = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// --- USERS ---

export const getOrCreateUser = async (name: string, phone: string, password: string, role?: 'owner' | 'member' | 'individual', companyName?: string, cnpj?: string): Promise<User | null> => {
  // Clean phone for consistency (remove spaces, dashes, parens)
  const cleanPhone = phone.replace(/\D/g, '');

  try {
    // 1. TENTATIVA DE LOGIN: Busca usuário pelo TELEFONE
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', cleanPhone)
      .single();

    // Se achou o usuário pelo telefone, é um LOGIN
    if (!fetchError && existingUser) {
      console.log("Usuário encontrado. Verificando credenciais...");

      // VERIFICAÇÃO DE SENHA
      if (existingUser.password) {
        // Se já tem senha, tem que bater
        if (existingUser.password !== password) {
          throw new Error("Senha incorreta. Acesso negado.");
        }
      } else {
        // LEGADO: Se é um usuário antigo sem senha, vamos definir a senha agora
        console.log("Usuário legado sem senha. Definindo nova senha segura.");
        await supabase.from('profiles').update({ password: password }).eq('id', existingUser.id);
      }

      // Opcional: Atualizar o nome se o usuário mudou
      if (existingUser.name !== name) {
        await supabase.from('profiles').update({ name }).eq('id', existingUser.id);
      }

      return {
        id: existingUser.id,
        name: name,
        phone: existingUser.phone,
        score: existingUser.score,
        territoriesHeld: 0,
        joinedAt: new Date(existingUser.joined_at).getTime()
      };
    }

    // 2. CADASTRO: Se não achou, cria um novo com SENHA
    if (!existingUser) {
      console.log("Novo usuário. Criando conta protegida...");
      const { data: newUser, error: insertError } = await supabase
        .from('profiles')
        .insert([{ name, phone: cleanPhone, score: 0, password: password, role, company_name: companyName, cnpj }])
        .select()
        .single();

      if (insertError) throw insertError;

      return {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        score: newUser.score,
        territoriesHeld: 0,
        joinedAt: new Date(newUser.joined_at).getTime()
      };
    }

    throw fetchError || new Error("Connection failed");

  } catch (error: any) {
    // Propagate password error specifically
    if (error.message && error.message.includes("Senha")) {
      throw error;
    }

    console.warn("Supabase unavailable (Offline/NoConfig). Fallback to LocalStorage.", error);

    // FALLBACK: Local Storage Logic (Simulado para Offline)
    let localUsers = getLocal('local_users') || [];

    // Tenta achar localmente pelo telefone
    let user = localUsers.find((u: any) => u.phone === cleanPhone);

    if (!user) {
      user = {
        id: 'local_' + Date.now(),
        name,
        phone: cleanPhone,
        password: password,
        score: 0,
        territoriesHeld: 0,
        joinedAt: Date.now(),
        role: role || 'individual',
        companyName: companyName,
        cnpj: cnpj
      };
      localUsers.push(user);
      saveLocal('local_users', localUsers);
    } else {
      // Check local password
      if (user.password && user.password !== password) {
        throw new Error("Senha incorreta (Modo Offline).");
      }
      // Atualiza dados
      user.name = name;
      if (!user.password) user.password = password;
      saveLocal('local_users', localUsers);
    }
    return user;
  }
};

export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('score', { ascending: false });

    if (error) throw error;

    return data.map((u: any) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      score: u.score,
      territoriesHeld: 0, // We'll need to calculate this separately if needed, or join tables
      joinedAt: new Date(u.joined_at).getTime()
    }));
  } catch (error) {
    console.warn("Supabase unavailable. Fetching local users.");
    const localUsers = getLocal('local_users') || [];
    return localUsers.sort((a: User, b: User) => b.score - a.score);
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        phone: updates.phone,
        // Add other fields as necessary, ensuring they map to DB columns
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      score: data.score,
      territoriesHeld: 0, // Should be re-fetched or kept from previous state if possible
      joinedAt: new Date(data.joined_at).getTime(),
      role: data.role,
      teamId: data.team_id, // Ensure these allow null/undefined mapping correctly if changed
    };
  } catch (error) {
    console.warn("Supabase unavailable. Updating local user.", error);

    // Add to offline queue
    saveToOfflineQueue({ type: 'update_user', payload: { userId, updates } });

    // Local Fallback
    const localUsers = getLocal('local_users') || [];
    const index = localUsers.findIndex((u: any) => u.id === userId);

    if (index !== -1) {
      localUsers[index] = { ...localUsers[index], ...updates };
      saveLocal('local_users', localUsers);
      return localUsers[index];
    }

    // If not in local users but we are logged in (probably session storage), we might need to handle returning the merged object
    // For now assuming it returns the updated object based on input for UI optimism
    return { ...updates, id: userId } as User;
  }
};

// --- TERRITORIES ---

export const fetchAllTerritories = async (): Promise<Territory[]> => {
  try {
    const { data, error } = await supabase
      .from('territories')
      .select('*');

    if (error) throw error;

    return data.map((t: any) => ({
      id: t.id,
      name: t.name,
      coordinates: t.coordinates as Coordinate[],
      ownerId: t.owner_id,
      ownerName: t.owner_name,
      color: t.color,
      value: t.value,
      conqueredAt: new Date(t.conquered_at).getTime(),
      description: t.description
    }));
  } catch (error) {
    console.warn("Supabase unavailable. Fetching local territories.");
    return getLocal('local_territories') || [];
  }
};

export const createTerritory = async (territory: Territory): Promise<boolean> => {
  try {
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
    return true;
  } catch (error) {
    console.warn("Supabase unavailable. Saving territory locally.");

    // Add to offline queue for sync
    saveToOfflineQueue({ type: 'conquest', payload: territory });

    // FALLBACK
    const current = getLocal('local_territories') || [];
    current.push(territory);
    saveLocal('local_territories', current);
    return true;
  }
};

export const updateTerritoryOwner = async (territoryId: string, newOwnerId: string, newOwnerName: string, newColor: string): Promise<boolean> => {
  try {
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
    return true;
  } catch (error) {
    console.warn("Supabase unavailable. Updating territory locally.");

    // Add to offline queue for sync
    saveToOfflineQueue({
      type: 'update_owner',
      payload: { territoryId, newOwnerId, newOwnerName, newColor }
    });

    // FALLBACK
    const current = getLocal('local_territories') || [];
    const updated = current.map((t: Territory) => {
      if (t.id === territoryId) {
        return { ...t, ownerId: newOwnerId, ownerName: newOwnerName, color: newColor, conqueredAt: Date.now() };
      }
      return t;
    });
    saveLocal('local_territories', updated);
    return true;
  }
};

export const deleteTerritory = async (territoryId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('territories')
      .delete()
      .eq('id', territoryId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.warn("Supabase unavailable. Deleting territory locally.");

    // FALLBACK
    let current = getLocal('local_territories') || [];
    current = current.filter((t: Territory) => t.id !== territoryId);
    saveLocal('local_territories', current);
    return true;
  }
};
