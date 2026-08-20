export const translateAuthError = (errorMessage: string | undefined | null): string => {
    if (!errorMessage) return 'Ocorreu um erro desconhecido. Tente novamente.';

    const lowerError = errorMessage.toLowerCase();

    // Sign in errors
    if (lowerError.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (lowerError.includes('email not confirmed')) return 'Por favor, confirme seu e-mail antes de fazer login.';
    
    // Sign up errors
    if (lowerError.includes('user already registered')) return 'Este e-mail já está cadastrado no sistema.';
    if (lowerError.includes('password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
    
    // Reset password errors
    if (lowerError.includes('user not found')) return 'Não encontramos nenhum usuário com este e-mail.';
    if (lowerError.includes('over_email_send_rate_limit')) return 'Muitos e-mails enviados. Aguarde um momento e tente novamente.';
    
    // Token / Link errors
    if (lowerError.includes('token expired') || lowerError.includes('expired token')) return 'O link de recuperação expirou. Por favor, solicite um novo.';
    if (lowerError.includes('invalid token') || lowerError.includes('invalid recovery token')) return 'Link de recuperação inválido. Por favor, solicite um novo.';
    
    // Generic
    if (lowerError.includes('network request failed')) return 'Erro de conexão. Verifique sua internet e tente novamente.';
    
    // Default fallback (returns original if no match, though usually we want to mask it)
    return 'Ocorreu um erro ao processar sua solicitação. Tente novamente.';
};
