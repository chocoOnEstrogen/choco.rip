export function normalizeSocial(social: string) {
    // Something like this
    // github -> GitHub
    // twitter -> Twitter
    // linkedin -> LinkedIn
    // etc.
    return social.charAt(0).toUpperCase() + social.slice(1);
}
