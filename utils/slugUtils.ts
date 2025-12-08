/**
 * Converte um nome em slug URL-friendly
 * @param name Nome da equipe
 * @returns Slug formatado
 */
export const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .normalize('NFD') // Normaliza caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .trim()
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-'); // Remove hífens duplicados
};

/**
 * Garante que o slug seja único adicionando número se necessário
 * @param baseSlug Slug base
 * @param existingSlugs Lista de slugs já existentes
 * @returns Slug único
 */
export const ensureUniqueSlug = (baseSlug: string, existingSlugs: string[]): string => {
    let slug = baseSlug;
    let counter = 1;

    while (existingSlugs.includes(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
};

/**
 * Valida se um slug é válido
 * @param slug Slug a validar
 * @returns true se válido
 */
export const isValidSlug = (slug: string): boolean => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
};
