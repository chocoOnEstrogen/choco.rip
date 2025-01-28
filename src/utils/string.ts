export function normalizeSocial(social: string) {
    return social.charAt(0).toUpperCase() + social.slice(1);
}
