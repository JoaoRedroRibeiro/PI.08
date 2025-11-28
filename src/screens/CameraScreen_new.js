import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadReceiptImage } from '../core/util/receipts';

const CameraScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasMediaPermission, setHasMediaPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isProcessingModalVisible, setIsProcessingModalVisible] = useState(false);
  const [isManualEntryModalVisible, setIsManualEntryModalVisible] = useState(false);
  const [extractedData, setExtractedData] = useState({
    merchant: '',
    amount: '',
    date: '',
    items: [],
  });
  const [facing, setFacing] = useState('back');

  useEffect(() => {
    (async () => {
      if (!permission) {
        await requestPermission();
      }
      // pede permissão de biblioteca (para salvar/abrir galeria)
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(mediaStatus.status === 'granted');
      // ImagePicker também pode requerer permissão separada em algumas plataformas
      const pickerStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (pickerStatus.status !== 'granted') {
        // não bloqueia, apenas informa
        console.warn('Permissão de galeria não concedida');
      }
    })();
  }, []);

  if (!permission) {
    return <View style={styles.centered}><Text>Carregando permissões...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text>Permissão para usar a câmera negada.</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: '#07cf18ff' }}>Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
  if (cameraRef) {
    try {
      const photo = await cameraRef.takePictureAsync({ quality: 0.8 });
      setCapturedPhoto(photo.uri);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao tirar foto.');
    }
  }
};

const pickImageFromGallery = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setCapturedPhoto(uri);

      setIsProcessingModalVisible(true);

      try {
        await uploadReceiptImage(uri);
        setIsProcessingModalVisible(false);
        Alert.alert('Sucesso', 'Imagem enviada com sucesso.');
        setCapturedPhoto(null);
        navigation.navigate('Estatísticas');
      } catch (err) {
        console.error('Erro upload:', JSON.stringify(err));
        setIsProcessingModalVisible(false);
        Alert.alert('Erro', 'Falha ao enviar imagem. Tente novamente.');
      }
    }
  } catch (err) {
    console.error(err);
    Alert.alert('Erro', 'Falha ao acessar a galeria.');
  }
};

const handleUpload = async () => {
  if (!capturedPhoto) {
    Alert.alert('Nenhuma imagem', 'Tire uma foto ou escolha uma da galeria antes de enviar.');
    return;
  }

  setIsProcessingModalVisible(true);

  try {
    await uploadReceiptImage(capturedPhoto);
    setIsProcessingModalVisible(false);
    Alert.alert('Sucesso', 'Imagem enviada com sucesso.');
    setCapturedPhoto(null);
    navigation.navigate('Estatísticas');
  } catch (err) {
    console.error('Erro upload:', err);
    setIsProcessingModalVisible(false);
    Alert.alert('Erro', 'Falha ao enviar imagem. Tente novamente.');
  }
};

  return (
    <View style={styles.container}>
      {capturedPhoto ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto }} style={styles.preview} />
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#07cf18ff' }]}
              onPress={handleUpload}
            >
              <Text style={styles.actionText}>Enviar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#444' }]}
              onPress={() => setCapturedPhoto(null)}
            >
              <Text style={styles.actionText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView
          ref={setCameraRef}
          facing={facing}
          style={styles.camera}
        >
          <View style={styles.buttonContainer}>

            <TouchableOpacity style={styles.galleryButton} onPress={pickImageFromGallery}>
              <Ionicons name="images" size={34} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <Ionicons name="camera-outline" size={42} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            >
              <Ionicons name="camera-reverse" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}

      {/* Modal de processamento */}
      <Modal
        animationType="fade"
        transparent
        visible={isProcessingModalVisible}
        onRequestClose={() => setIsProcessingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#07cf18ff" />
            <Text style={styles.modalText}>Processando imagem...</Text>
          </View>
        </View>
      </Modal>

      {/* Modal de inserção manual */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isManualEntryModalVisible}
        onRequestClose={() => setIsManualEntryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.manualModal}>
            <Text style={styles.modalTitle}>Inserir dados manualmente</Text>
            <TextInput
              style={styles.input}
              placeholder="Comerciante"
              value={extractedData.merchant}
              onChangeText={(text) => setExtractedData({ ...extractedData, merchant: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Valor"
              keyboardType="numeric"
              value={extractedData.amount}
              onChangeText={(text) => setExtractedData({ ...extractedData, amount: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Data"
              value={extractedData.date}
              onChangeText={(text) => setExtractedData({ ...extractedData, date: text })}
            />

            <View style={styles.manualButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#07cf18ff', marginRight: 8 }]}
                onPress={() => {
                  // ao salvar manualmente, podemos navegar para Estatísticas (comportamento simples)
                  setIsManualEntryModalVisible(false);
                  navigation.navigate('Estatísticas');
                }}
              >
                <Text style={styles.actionText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#444' }]}
                onPress={() => setIsManualEntryModalVisible(false)}
              >
                <Text style={styles.actionText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1, justifyContent: 'flex-end' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 20 },
  flipButton: { backgroundColor: '#00000088', padding: 12, borderRadius: 50 },
  captureButton: { backgroundColor: '#07cf18ff', padding: 20, borderRadius: 50 },
  galleryButton: { backgroundColor: '#00000066', padding: 14, borderRadius: 50 },
  previewContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  preview: { width: '100%', height: '80%', borderRadius: 12 },
  actionsContainer: { flexDirection: 'row', marginTop: 20 },
  actionButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  actionText: { color: '#fff', fontWeight: 'bold' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: '#00000099', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#222', padding: 24, borderRadius: 12, alignItems: 'center' },
  modalText: { color: '#fff', marginTop: 12, fontSize: 16 },
  manualModal: { backgroundColor: '#fff', width: '90%', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { backgroundColor: '#f3f3f3', borderRadius: 8, padding: 10, marginBottom: 12 },
  manualButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
});

export default CameraScreen;
