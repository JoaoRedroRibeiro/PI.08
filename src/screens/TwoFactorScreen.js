import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Image,
} from 'react-native';
import { twoFactorValidation } from '../core/util/two-factor-login'
import { useRoute } from '@react-navigation/native';
import { AuthContext } from '../core/context/auth'
import AsynStorage from '@react-native-async-storage/async-storage'

const TwoFactorScreen = ({ navigation }) => {

    const [verifier, setVerifier] = useState('')
    const [code, setCode] = useState('')

    const { setToken } = useContext(AuthContext)
    const route = useRoute()

    const handleValidation = async () => {

        if (code.length < 6 || !code) {
            Alert.alert('Erro', 'Insira o código corretamente.')
        }
        try {
            const response = await twoFactorValidation(code, verifier)
            setToken(response.data.access_token)
            await AsynStorage.setItem('RB_AT', response.data.access_token)
        } catch {
            Alert.alert('Ops', 'Ocorreu um erro, tente novamente mais tarde.')
        }
    }

    useEffect(() => {
        setVerifier(route.params.verifier)
    }, [])
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >

                        <View style={styles.loginContainer}>
                            <Text style={styles.title}>Autenticação de dois fatores!</Text>
                            <Text style={styles.subtitle}>Insira o código que você recebeu no email</Text>

                            <View style={styles.inputContainer}>
                                <TextInput style={styles.input} keyboardType='default' value={code} onChangeText={(t) => setCode(t)} />
                            </View>
                            <TouchableOpacity style={styles.loginButton} onPress={() => handleValidation()}>
                                <Text style={styles.loginButtonText}>Continuar</Text>
                            </TouchableOpacity>

                            <View style={styles.registerContainer}>
                                <Text style={styles.registerText}>Não tem uma conta? </Text>
                                <TouchableOpacity >
                                    <Text style={styles.registerLink}>Cadastre-se</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Preto principal
    },
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        minHeight: '100%',
        justifyContent: 'center'
    },
    loginContainer: {
        backgroundColor: '#1a1a1a', // Preto mais claro para contraste
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 40,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        borderTopWidth: 2,
        borderTopColor: '#00C851',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#cccccc',
        textAlign: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 15,
        fontSize: 16,
        borderWidth: 2,
        borderColor: '#333333',
        color: '#ffffff',
    },
    loginButton: {
        backgroundColor: '#00C851', // Verde principal
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#00C851',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    loginButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    forgotPassword: {
        alignItems: 'center',
        marginBottom: 30,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: '#cccccc',
        fontSize: 14,
    },
    registerLink: {
        color: '#00C851',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default TwoFactorScreen;
