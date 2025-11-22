import { api } from '../api'

/**
 * Resumo de um mês específico de um ano.
 * @param {{year: number | null, month: number | null}} params 
 */
export async function getAnalysis(params) {
    
    const { data } = await api.get('/analysis/monthly_summary')
    return data
}