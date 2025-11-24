import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadUserData } from '../core/util/load-user';
import { updateProfile } from '../core/util/update-user';
import { api } from '../core/api';
import * as ImagePicker from 'expo-image-picker'
import { updateProfileImage } from '../core/util/update-profile-image';
import { AuthContext } from '../core/context/auth'
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID = 1;

// ProfileField movido para fora e memoizado
const ProfileField = React.memo(({ label, value, field, icon, isEditing, editedInfo, setEditedInfo }) => (
  <View style={styles.fieldContainer}>
    <View style={styles.fieldHeader}>
      <Ionicons name={icon} size={20} color="#00C851" />
      <Text style={styles.fieldLabel}>{label}</Text>
    </View>

    {isEditing ? (
      <TextInput
        style={styles.fieldInput}
        value={editedInfo[field] ?? ''}
        onChangeText={(text) => setEditedInfo((prev) => ({ ...prev, [field]: text }))}
        placeholder={label}
        placeholderTextColor="#666"
        autoCorrect={false}
        autoCapitalize="none"
        keyboardAppearance="dark"
      />
    ) : (
      <Text style={styles.fieldValue}>{value}</Text>
    )}
  </View>
));

const ProfileScreen = ({ navigation }) => {

  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'João Silva',
    email: 'admin@gmail.com',
    phone: '(11) 99999-9999',
    birthDate: '15/03/1990',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    profession: 'Desenvolvedor',
  });

  const [userId, setUserId] = useState(USER_ID);
  const [editedInfo, setEditedInfo] = useState(userInfo);
  const [imageUrl, setImageUrl] = useState('')
  const { setToken } = useContext(AuthContext)

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo(userInfo);
  };

  const handleSave = async () => {
    // atualiza estado local primeiro
    setUserInfo(editedInfo);

    try {
      // enviar editedInfo (corrigido)
      console.log('Salvando perfil com as seguintes informações:', editedInfo);
      await updateProfile(userId, editedInfo);

      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.log(error);
      if (error.response?.data) {
        Alert.alert('Ops', `Ocorreu um erro: ${error.response.data.detail[0].msg}`);
        return;
      } else if (error.request) {
        Alert.alert('Ops', 'verifique sua conexão com a internet e tente novamente mais tarde.');
      }
    }
  };

  const handleImageUpdate = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Acesso à galeria é necessário.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: false
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri

    try {

      await updateProfileImage(userId, uri)
      setImageUrl(uri)
    } catch (error) {

      console.log(error)
    }

  };


  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo(userInfo);
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair do aplicativo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setToken(null)
          await AsyncStorage.clear()
        },
      },
    ]);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await loadUserData(userId);

        const mapped = {
          name: data.full_name,
          email: data.email,
          phone: data.phone_number,
          birthDate: new Date(data.birthdate).toLocaleDateString(),
          address: data.address,
          city: data.city,
          profession: data.profession,
        };

        setUserInfo(mapped);
        setEditedInfo(mapped);
      } catch (error) {
        console.log(error);
        if (error.response?.data) {
          Alert.alert('Ops', `Ocorreu um erro: ${error.response.data.detail[0].msg}`);
          return;
        } else if (error.request) {
          Alert.alert('Ops', 'Verifique sua conexão com a internet e tente novamente mais tarde.');
        }
      }
    })();
  }, []);

  useEffect(() => {

    (async () => {
      try {

        const image = await api.get(`/users/${userId}/profile_image?download=false`)

        if (image.status !== 200) {
          setImageUrl('')
          return
        }
        setImageUrl(process.env.EXPO_PUBLIC_API_BASE_URL + `/users/${userId}/profile_image?download=false`)
      } catch {
        setImageUrl('')
      } f

    })()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity onPress={isEditing ? () => handleSave() : () => handleEdit()}>
          <Ionicons
            name={isEditing ? 'checkmark' : 'create'}
            size={24}
            color="#00C851"
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 0}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={imageUrl ? { uri: imageUrl, height: 100, width: 100 } : require('../../assets/logo.jpg')}
                style={styles.avatar}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.avatarEdit} onPress={() => handleImageUpdate()}>
                <Ionicons name="camera" size={16} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{userInfo.name}</Text>
            <Text style={styles.userEmail}>{userInfo.email}</Text>
          </View>

          {/* Personal Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>

            <ProfileField
              label="Nome Completo"
              value={userInfo.name}
              field="name"
              icon="person-outline"
              isEditing={isEditing}
              editedInfo={editedInfo}
              setEditedInfo={setEditedInfo}
            />
            <ProfileField
              label="Email"
              value={userInfo.email}
              field="email"
              icon="mail-outline"
              isEditing={isEditing}
              editedInfo={editedInfo}
              setEditedInfo={setEditedInfo}
            />
            <ProfileField
              label="Telefone"
              value={userInfo.phone}
              field="phone"
              icon="call-outline"
              isEditing={isEditing}
              editedInfo={editedInfo}
              setEditedInfo={setEditedInfo}
            />
            <ProfileField
              label="Data de Nascimento"
              value={userInfo.birthDate}
              field="birthDate"
              icon="calendar-outline"
              isEditing={isEditing}
              editedInfo={editedInfo}
              setEditedInfo={setEditedInfo}
            />
            <ProfileField
              label="Profissão"
              value={userInfo.profession}
              field="profession"
              icon="briefcase-outline"
              isEditing={isEditing}
              editedInfo={editedInfo}
              setEditedInfo={setEditedInfo}
            />
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Endereço</Text>

            <ProfileField
              label="Endereço"
              value={userInfo.address}
              field="address"
              icon="location-outline"
              isEditing={isEditing}
              editedInfo={editedInfo}
              setEditedInfo={setEditedInfo}
            />
            <ProfileField
              label="Cidade"
              value={userInfo.city}
              field="city"
              icon="business-outline"
              isEditing={isEditing}
              editedInfo={editedInfo}
              setEditedInfo={setEditedInfo}
            />
          </View>

          {/* Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conta</Text>

            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="lock-closed-outline" size={20} color="#00C851" />
              <Text style={styles.settingText}>Alterar Senha</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="notifications-outline" size={20} color="#00C851" />
              <Text style={styles.settingText}>Notificações</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#00C851" />
              <Text style={styles.settingText}>Privacidade</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View style={styles.actionSection}>
            {isEditing && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutButtonText}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 2,
    borderBottomColor: '#00C851',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#1a1a1a',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#00C851',
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00C851',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#cccccc',
  },
  section: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#00C851',
    paddingBottom: 10,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#cccccc',
    marginLeft: 8,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    color: '#fff',
    paddingLeft: 28,
  },
  fieldInput: {
    fontSize: 16,
    color: '#fff',
    paddingLeft: 28,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#00C851',
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  cancelButton: {
    backgroundColor: '#333333',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#666666',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen;
