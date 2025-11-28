import { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const AuthContext = createContext({
    loading: false,
    token: undefined,
    setToken: () => { },
    setLoading: () => { },
    user: undefined,
    setUser: () => { }
})

const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(undefined)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(undefined)

    useEffect(() => {
        (async () => {
            const [[, accessToken], [, u]] = await AsyncStorage.multiGet(['RB_AT', 'USER']);

            if (accessToken && u) {
                setToken(accessToken)
                setUser(u)
                return
            }
            return
        })()
    }, [])

    return (
        <AuthContext.Provider value={{ token, loading, setToken, setLoading, user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider