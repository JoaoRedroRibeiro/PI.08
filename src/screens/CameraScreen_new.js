import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

const { width, height } = Dimensions.get('window');

const CameraScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isProcessingModalVisible, setIsProcessingModalVisible] = useState(false);
  const [isManualEntryModalVisible, setIsManualEntryModalVisible] = useState(false);
  const [extractedData, setExtractedData] = useState({
    merchant: '',
    amount: '',
    date: '',
    items: []
  });

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted' && mediaLibraryStatus.status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        // Salvar na galeria
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        
        setCapturedPhoto(photo);
        setIsProcessingModalVisible(true);
        
        // Simular processamento de OCR/AI
        setTimeout(() => {
          simulateOCRProcessing();
        }, 2000);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível tirar a foto');
        console.error(error);
      }
    }
  };

  const simulateOCRProcessing = () => {
    // Simular extração de dados da nota fiscal
    const mockData = {
      merchant: 'Supermercado ABC',
      amount: (Math.random() * 200 + 50).toFixed(2),
      date: new Date().toLocaleDateString('pt-BR'),
      items: [
        { name: 'Arroz 5kg', price: '15.99', category: 'alimentacao' },
        { name: 'Feijão 1kg', price: '8.50', category: 'alimentacao' },
        { name: 'Carne 1kg', price: '45.00', category: 'alimentacao' },
      ]
    };
    
    setExtractedData(mockData);
    setIsProcessingModalVisible(false);
    setIsManualEntryModalVisible(true);
  };

  const saveTransaction = () => {
    if (!extractedData.merchant || !extractedData.amount) {
      Alert.alert('Erro', 'Preencha pelo menos o estabelecimento e valor total');
      return;
    }

    // Aqui você salvaria os dados em seu sistema de armazenamento
    Alert.alert(
      'Transação Salva!',
      `Nota fiscal de ${extractedData.merchant} no valor de R$ ${extractedData.amount} foi salva com sucesso.`,
      [
        {
          text: 'Ver Estatísticas',
          onPress: () => {
            setIsManualEntryModalVisible(false);
            navigation.navigate('Statistics');
          },
        },
        {
          text: 'Nova Foto',
          onPress: () => {
            setIsManualEntryModalVisible(false);
            setCapturedPhoto(null);
            setExtractedData({ merchant: '', amount: '', date: '', items: [] });
          },
        },
      ]
    );
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setIsProcessingModalVisible(false);
    setIsManualEntryModalVisible(false);
    setExtractedData({ merchant: '', amount: '', date: '', items: [] });
  };

  const goBack = () => {
    navigation.goBack();
  };

  const addNewItem = () => {
    const newItems = [...extractedData.items];
    newItems.push({ name: '', price: '', category: 'alimentacao' });
    setExtractedData({ ...extractedData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...extractedData.items];
    newItems[index][field] = value;
    setExtractedData({ ...extractedData, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = extractedData.items.filter((_, i) => i !== index);
    setExtractedData({ ...extractedData, items: newItems });
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Solicitando permissões...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Acesso à câmera e galeria negado</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera style={styles.camera} type={type} ref={setCameraRef}>
        <View style={styles.cameraOverlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={goBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Fotografar Nota Fiscal</Text>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                setType(
                  type === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back
                );
              }}
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Guia visual para posicionar a nota */}
          <View style={styles.guidanceContainer}>
            <View style={styles.frameGuide}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.guidanceText}>
              Posicione a nota fiscal dentro do quadro
            </Text>
            <Text style={styles.guidanceSubtext}>
              Certifique-se de que toda a nota esteja visível e bem iluminada
            </Text>
          </View>

          {/* Controles da câmera */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.galleryButton}>
              <Ionicons name="images" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.captureButtonContainer}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.manualButton}
              onPress={() => setIsManualEntryModalVisible(true)}
            >
              <Ionicons name="create" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>

      {/* Modal de Processamento */}
      <Modal
        visible={isProcessingModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.processingModal}>
            <View style={styles.processingAnimation}>
              <Ionicons name="scan" size={48} color="#00C851" />
            </View>
            <Text style={styles.processingTitle}>Processando Nota Fiscal</Text>
            <Text style={styles.processingText}>
              Extraindo informações da sua nota fiscal...
            </Text>
            {capturedPhoto && (
              <Image source={{ uri: capturedPhoto.uri }} style={styles.processingImage} />
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Entrada Manual */}
      <Modal
        visible={isManualEntryModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.manualEntryModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dados da Nota Fiscal</Text>
              <TouchableOpacity onPress={() => setIsManualEntryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {capturedPhoto && (
                <Image source={{ uri: capturedPhoto.uri }} style={styles.receiptImage} />
              )}
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Estabelecimento *</Text>
                <TextInput
                  style={styles.formInput}
                  value={extractedData.merchant}
                  onChangeText={(text) => setExtractedData({...extractedData, merchant: text})}
                  placeholder="Nome do estabelecimento"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Valor Total *</Text>
                <TextInput
                  style={styles.formInput}
                  value={extractedData.amount}
                  onChangeText={(text) => setExtractedData({...extractedData, amount: text})}
                  placeholder="0,00"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Data</Text>
                <TextInput
                  style={styles.formInput}
                  value={extractedData.date}
                  onChangeText={(text) => setExtractedData({...extractedData, date: text})}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.itemsHeader}>
                  <Text style={styles.formLabel}>Itens da Compra</Text>
                  <TouchableOpacity style={styles.addItemButton} onPress={addNewItem}>
                    <Ionicons name="add" size={20} color="#00C851" />
                    <Text style={styles.addItemText}>Adicionar Item</Text>
                  </TouchableOpacity>
                </View>
                
                {extractedData.items.map((item, index) => (
                  <View key={index} style={styles.itemContainer}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemNumber}>Item {index + 1}</Text>
                      <TouchableOpacity onPress={() => removeItem(index)}>
                        <Ionicons name="trash" size={20} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                    
                    <TextInput
                      style={styles.itemInput}
                      value={item.name}
                      onChangeText={(text) => updateItem(index, 'name', text)}
                      placeholder="Nome do produto"
                      placeholderTextColor="#666"
                    />
                    
                    <View style={styles.itemRow}>
                      <TextInput
                        style={[styles.itemInput, styles.priceInput]}
                        value={item.price}
                        onChangeText={(text) => updateItem(index, 'price', text)}
                        placeholder="Preço"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                      />
                      
                      <View style={styles.categorySelector}>
                        {[
                          { key: 'alimentacao', label: 'Alimentação' },
                          { key: 'transporte', label: 'Transporte' },
                          { key: 'saude', label: 'Saúde' },
                          { key: 'outros', label: 'Outros' },
                        ].map((cat) => (
                          <TouchableOpacity
                            key={cat.key}
                            style={[
                              styles.categoryPill,
                              item.category === cat.key && styles.categoryPillSelected
                            ]}
                            onPress={() => updateItem(index, 'category', cat.key)}
                          >
                            <Text style={[
                              styles.categoryPillText,
                              item.category === cat.key && styles.categoryPillTextSelected
                            ]}>
                              {cat.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
                <Text style={styles.retakeButtonText}>Nova Foto</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={saveTransaction}>
                <Text style={styles.saveButtonText}>Salvar Transação</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerButton: {
    padding: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  guidanceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  frameGuide: {
    width: 280,
    height: 200,
    position: 'relative',
    marginBottom: 20,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#00C851',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  guidanceText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  guidanceSubtext: {
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  captureButtonContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  manualButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    width: width * 0.8,
  },
  processingAnimation: {
    marginBottom: 20,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  processingText: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  processingImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  manualEntryModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    width: width * 0.95,
    height: height * 0.9,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00C851',
  },
  addItemText: {
    color: '#00C851',
    marginLeft: 5,
    fontSize: 14,
  },
  itemContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00C851',
  },
  itemInput: {
    backgroundColor: '#333333',
    borderRadius: 6,
    padding: 10,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceInput: {
    flex: 1,
    marginBottom: 0,
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 5,
    flex: 2,
  },
  categoryPill: {
    backgroundColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#555555',
  },
  categoryPillSelected: {
    backgroundColor: '#1a3a1a',
    borderColor: '#00C851',
  },
  categoryPillText: {
    fontSize: 11,
    color: '#999999',
  },
  categoryPillTextSelected: {
    color: '#00C851',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    gap: 10,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#00C851',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CameraScreen;