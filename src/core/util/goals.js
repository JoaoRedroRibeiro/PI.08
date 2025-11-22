import { api } from '../api'

/**
 * 
 * @param {{month: number, year: number, value: number, user_id: number, category_id: number}} params 
 */
export async function createGoal(params) {
    const { data } = await api.post('/goals', {
        "month": params.month,
        "year": params.year,
        "value": params.value,
        "user_id": params.user_id,
        "category_id": params.category_id
    })

    return data
}

/**
 * 
 * @param {{initial_month: number | null, initial_year: number | null, user_id: number, category_id: number | null, final_month: number | null, final_year: number | null}} params 
 */
export async function getGoals(params) {

    const { data } = await api.get(`/goals?user_id=${params.user_id}&initial_month=${params.initial_month ?? null}&initial_year=${params.initial_year ?? null}&final_month=${params.final_month ?? null}&final_year=${params.final_year ?? null}&category_id=${params.category_id ?? null}`)

    return data
}

/**
 * 
 * @param {{month: number, year: number, value: number, user_id: number, category_id: number}} params 
 */
export async function updateGoal(params, goal_id) {
    const { data } = await api.patch(`/goals/${goal_id}`, params)
}

export async function getGoalProgress(goal_id) {
    const { data } = await api.get(`/goals/${goal_id}/progress`)
    return data
}