import { api } from "../api";

export async function updateProfile(userId, userData) {

    const [day, month, year] = userData.birthDate.split('/')
    const response = await api.patch(`/users/${userId}`, {
        "email": userData.email,
        "full_name": userData.name,
        "phone_number": userData.phone,
        "birthdate": `${year}-${month}-${day}`,
        "profession": userData.profession,
        "address": userData.address,
        "city": userData.city
    })

    return response.data
}

export async function createUser(params) {
    // params deve conter:
    // {
    //   email, full_name, phone_number, birthdate (DD/MM/YYYY ou YYYY-MM-DD), profession, address, city, password
    // }
    const {
      email,
      full_name,
      phone_number,
      birthdate,
      profession,
      address,
      city,
      password
    } = params;

    // normaliza birthdate para YYYY-MM-DD
    let bd = birthdate || '';
    if (bd.includes('/')) {
      const [d, m, y] = bd.split('/');
      if (d && m && y) bd = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    }

    const payload = {
      email,
      full_name,
      phone_number,
      birthdate: bd || null,
      profession,
      address,
      city,
      password
    };

    const response = await api.post('/users', payload);
    return response.data;
}