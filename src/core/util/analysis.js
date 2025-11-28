import { api } from '../api'

/**
 * Resumo de um mês específico de um ano.
 * @param {{year: number, month: number}} params 
 */
export async function getAnalysis(params) {
    
    const urlParams = new URLSearchParams()

    if(params.year) urlParams.set('year', params.year)
    if(params.month) urlParams.set('month', params.month)
    
    const { data } = await api.get('/analysis/monthly_summary/?' + urlParams.toString())
    return data
}