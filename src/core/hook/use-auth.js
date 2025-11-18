import { useContext } from "react";
import { AuthContext } from "../context/auth";

export const useAuth = () => {

    const ctx = useContext(AuthContext)
    return ctx
}