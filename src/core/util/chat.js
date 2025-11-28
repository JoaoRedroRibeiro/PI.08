import { api } from '../api';

export async function chatWithAI(question) {
  
    const response = await api.post('/chat/ask/', { question });
    return response.data.answer;    
} 