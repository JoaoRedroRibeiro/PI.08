import { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const AuthContext = createContext({
    loading: false,
    token: undefined,
    setToken: () => { },
    setLoading: () => { }
})

const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(undefined)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        (async () => {
            const item = await AsyncStorage.getItem('RB_AT')

            if (item) {
                setToken(item)
                return
            }
        })()
    }, [])

    return (
        <AuthContext.Provider value={{ token, loading, setToken, setLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider