import { ApiError } from './api'

export interface ErrorInfo {
  title: string
  message: string
}

export function getErrorInfo(error: any, defaultTitle: string = 'Erro', defaultMessage: string = 'Ocorreu um erro inesperado'): ErrorInfo {
  if (error instanceof ApiError) {
    const errorMessage = error.data?.message || error.message
    
    // Mensagens específicas por status HTTP
    switch (error.status) {
      case 400:
        if (errorMessage.includes('Chave inválida')) {
          return {
            title: 'Erro de segurança',
            message: 'Erro na criptografia dos dados. Tente novamente.'
          }
        }
        if (errorMessage.includes('validation') || errorMessage.includes('required')) {
          return {
            title: 'Dados inválidos',
            message: 'Verifique se todos os campos estão preenchidos corretamente.'
          }
        }
        return {
          title: 'Dados inválidos',
          message: errorMessage || 'Verifique os dados informados e tente novamente.'
        }
        
      case 401:
        if (errorMessage.includes('Credenciais inválidas')) {
          return {
            title: 'Credenciais incorretas',
            message: 'E-mail ou senha incorretos. Verifique os dados e tente novamente.'
          }
        }
        return {
          title: 'Não autorizado',
          message: 'Você não tem permissão para acessar este recurso.'
        }
        
      case 403:
        return {
          title: 'Acesso negado',
          message: 'Você não tem permissão para realizar esta ação.'
        }
        
      case 409:
        if (errorMessage.includes('E-mail já em uso') || errorMessage.includes('já está sendo usado')) {
          return {
            title: 'E-mail já cadastrado',
            message: 'Este e-mail já está sendo usado por outra conta. Tente fazer login ou use outro e-mail.'
          }
        }
        return {
          title: 'Dados já existem',
          message: 'Os dados informados já estão em uso por outra conta.'
        }
        
      case 422:
        return {
          title: 'Dados inválidos',
          message: 'Os dados informados não são válidos. Verifique e tente novamente.'
        }
        
      case 429:
        return {
          title: 'Muitas tentativas',
          message: 'Você fez muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
        }
        
      case 500:
        return {
          title: 'Erro interno',
          message: 'Problema temporário no servidor. Tente novamente em alguns minutos.'
        }
        
      case 503:
        return {
          title: 'Serviço indisponível',
          message: 'O serviço está temporariamente indisponível. Tente novamente em alguns minutos.'
        }
        
      case 0:
        return {
          title: 'Erro de conexão',
          message: 'Verifique sua conexão com a internet e tente novamente.'
        }
        
      default:
        return {
          title: defaultTitle,
          message: errorMessage || defaultMessage
        }
    }
  }
  
  // Erros que não são ApiError (ex: erros de criptografia, rede, etc.)
  if (error?.message) {
    if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
      return {
        title: 'Erro de conexão',
        message: 'Verifique sua conexão com a internet e tente novamente.'
      }
    }
    
    if (error.message.includes('crypto') || error.message.includes('encrypt')) {
      return {
        title: 'Erro de criptografia',
        message: 'Erro ao processar dados de segurança. Tente novamente.'
      }
    }
  }
  
  return {
    title: defaultTitle,
    message: defaultMessage
  }
}

// Mensagens de sucesso padronizadas
export const SUCCESS_MESSAGES = {
  LOGIN: (userName?: string) => ({
    title: 'Login realizado!',
    message: userName ? `Bem-vindo de volta, ${userName}!` : 'Login realizado com sucesso!'
  }),
  
  REGISTER: (userName?: string) => ({
    title: 'Conta criada com sucesso!',
    message: userName ? `Bem-vindo, ${userName}! Faça login para continuar.` : 'Conta criada! Faça login para continuar.'
  }),
  
  LOGOUT: () => ({
    title: 'Logout realizado',
    message: 'Você foi desconectado com sucesso.'
  }),
  
  SAVE: () => ({
    title: 'Salvo!',
    message: 'Dados salvos com sucesso.'
  }),
  
  DELETE: () => ({
    title: 'Removido!',
    message: 'Item removido com sucesso.'
  }),
  
  UPDATE: () => ({
    title: 'Atualizado!',
    message: 'Dados atualizados com sucesso.'
  })
}
