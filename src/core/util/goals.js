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
  const searchParams = new URLSearchParams();

  // user_id sempre existe
  searchParams.set("user_id", params.user_id);

  // adiciona dinamicamente somente se existir
  if (params.initial_month)   searchParams.set("initial_month", params.initial_month);
  if (params.initial_year)    searchParams.set("initial_year", params.initial_year);
  if (params.final_month)     searchParams.set("final_month", params.final_month);
  if (params.final_year)      searchParams.set("final_year", params.final_year);
  if (params.category_id)     searchParams.set("category_id", params.category_id);

  const { data } = await api.get(`/goals?${searchParams.toString()}`);
  return data;
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