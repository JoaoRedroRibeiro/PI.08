import React, { useState } from 'react';
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
} from 'react-native';
import { createUser } from '../core/util/update-user';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // novos campos
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState(''); // DD/MM/YYYY
  const [profession, setProfession] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    // validação básica de birthDate (opcional)
    if (birthDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
      Alert.alert('Erro', 'Data de nascimento inválida. Use DD/MM/YYYY');
      return;
    }

    setLoading(true);
    try {
      await createUser({
        email,
        full_name: name,
        phone_number: phone,
        birthdate: birthDate,
        profession,
        address,
        city,
        password
      });

      setLoading(false);
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      setLoading(false);
      const msg = err?.response?.data?.message || err?.message || 'Erro ao criar usuário';
      Alert.alert('Erro', msg.toString());
    }
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
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
            <View style={styles.imageContainer}>
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>
                  Adicione sua logo aqui
                </Text>
              </View>
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>Preencha os dados para se cadastrar</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Nome completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Senha (mínimo 6 caracteres)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Confirmar senha</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(00) 91234-5678"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Data de nascimento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  value={birthDate}
                  onChangeText={setBirthDate}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Profissão</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Profissão"
                  value={profession}
                  onChangeText={setProfession}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Endereço</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Endereço"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Cidade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Cidade"
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
                <Text style={styles.registerButtonText}>{loading ? 'Salvando...' : 'Cadastrar'}</Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Já tem uma conta? </Text>
                <TouchableOpacity onPress={goToLogin}>
                  <Text style={styles.loginLink}>Fazer login</Text>
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
    backgroundColor: '#f5f5f5',
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
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 30,
    minHeight: 150,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#e1e1e1',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  registerContainer: {
    backgroundColor: 'white',
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  labelText: {
    color: '#333',
    marginBottom: 6,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  registerButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
