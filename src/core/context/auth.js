import { createContext, useState } from 'react'

export const AuthContext = createContext({
    loading: false,
    token: undefined,
    setToken: () => { },
    setLoading: () => { }
})

const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(undefined)
    const [loading, setLoading] = useState(false)

    return (
        <AuthContext.Provider value={{ token, loading, setToken, setLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider