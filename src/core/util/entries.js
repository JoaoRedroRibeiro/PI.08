import { api } from "../api";

/**
 * 
 * @param {{title: string, entry_date: string, description: string, value: number, entry_type_id: number, category_id: number, user_id: number}} entry 
 * @param {number} user_id 
 * @returns 
 */
export async function createEntry(entry, user_id) {
    const { data } = await api.post("/entries/", {
        "title": entry.title,
        "entry_date": entry.entry_date,
        "description": entry.description,
        "value": entry.value,
        "entry_type_id": entry.entry_type_id,
        "category_id": entry.category_id,
        "user_id": user_id
    })

    return data
}

/**
 * Retorna as entries de um usuário.
 * @param {{title: string | null, start_date: string | null, end_date: string | null, user_id: number, category_id: number | null, entry_type_id: number | null}} params 
 */
export async function getEntries(params) {

    const urlSearch = new URLSearchParams()

    urlSearch.set('user_id', params.user_id)

    if(params.start_date) urlSearch.set('start_date', params.start_date)
    if(params.end_date) urlSearch.set('end_date', params.end_date)
    if(params.category_id) urlSearch.set('category_id', params.category_id)
    if(params.entry_type_id) urlSearch.set('entry_type_id', params.entry_type_id)

    const { data } = await api.get(`/entries/?${urlSearch}`)

    return data
}

/**
 * 
 * @param {{title: string, start_date: string, end_date: string, user_id: number, category_id: number, entry_type_id: number, value: number}} params 
 */
export async function updateEntry(params, entry_id) {
    console.log(params)
    const { data } = await api.patch(`/entries/${entry_id}`, params)
    return data
}