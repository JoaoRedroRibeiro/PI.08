import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';

export async function uploadReceiptImage(uri) {
  try {
    const url = (api?.defaults?.baseURL || '') + '/receipts/upload';
    const token = await AsyncStorage.getItem('RB_AT');

    const formData = new FormData();
    const file = {
      uri: uri.startsWith('file://') ? uri : uri,
      name: 'receipt.jpg',
      type: 'image/jpeg'
    };
    formData.append('file', file);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        // Não setar Content-Type; fetch/React Native cuidam do multipart boundary
        Accept: 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => null);
      const err = new Error(`Upload failed: ${res.status} ${res.statusText} ${text ?? ''}`);
      err.status = res.status;
      throw err;
    }

    const data = await res.json().catch(() => null);
    return data;
  } catch (err) {
    console.error('uploadReceiptImage error:', err?.message ? err.message : err);
    throw err;
  }
}
