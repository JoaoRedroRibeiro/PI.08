import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const handleCameraPress = () => {
    navigation.navigate('Câmera');
  };

  const handleMonthlyReports = () => {
    navigation.navigate('MonthlyReports');
  };

  const handleStatistics = () => {
    navigation.navigate('Statistics');
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair do aplicativo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => navigation.navigate('Login'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Controle Financeiro</Text>
            <Text style={styles.welcomeSubtitle}>
              Fotografe suas notas fiscais para manter o controle dos seus gastos
            </Text>
          </View>

          {/* Botão de Câmera Central */}
          <View style={styles.cameraSection}>
            <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
              <View style={styles.cameraButtonInner}>
                <Ionicons name="camera" size={40} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.cameraText}>Fotografar Nota Fiscal</Text>
            <Text style={styles.cameraSubtext}>
              Toque para capturar uma nova nota de compra
            </Text>
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a', // Preto mais claro
    borderBottomWidth: 2,
    borderBottomColor: '#00C851', // Verde para detalhes
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerButton: {
    alignItems: 'center',
    padding: 10,
  },
  headerButtonText: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 4,
    fontWeight: '500',
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a', // Preto mais claro
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4444',
    alignSelf: 'flex-end',
  },
  logoutButtonText: {
    fontSize: 14,
    color: '#ff4444',
    marginLeft: 5,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
  },
  welcomeSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 22,
  },
  cameraSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  cameraButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00C851', // Verde principal
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#00C851',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  cameraButtonInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  cameraSubtext: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
  },
});

export default HomeScreen;
