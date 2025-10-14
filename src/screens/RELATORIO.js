import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const RELATORIO = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const financialData = {
    2024: {
      janeiro: { total: 2850.5, gastos: [{ categoria: 'Alimentação', valor: 850.5, data: '15/01' }] },
      fevereiro: { total: 3200.75, gastos: [{ categoria: 'Lazer', valor: 1150, data: '28/02' }] },
      março: { total: 2650.3, gastos: [{ categoria: 'Educação', valor: 800, data: '20/03' }] }
    }
  };

  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  const getMonthData = (month) => {
    return financialData[selectedYear]?.[month] || { total: 0, gastos: [] };
  };

  const getTotalYear = () => {
    const yearData = financialData[selectedYear] || {};
    return Object.values(yearData).reduce((sum, month) => sum + month.total, 0);
  };

  const handleAIQuestion = () => {
    if (!aiQuestion.trim()) {
      Alert.alert('Erro', 'Por favor, digite uma pergunta');
      return;
    }

    const question = aiQuestion.toLowerCase();
    let response = '';

    if (question.includes('maior gasto') || question.includes('mais gastei')) {
      response = `Em ${selectedYear}, seu maior gasto foi em fevereiro com R$ 3200,75.`;
    } else if (question.includes('categoria')) {
      response = `Suas principais categorias de gastos foram Alimentação e Lazer.`;
    } else if (question.includes('total')) {
      response = `Em ${selectedYear}, você gastou um total de R$ ${getTotalYear().toFixed(2)}.`;
    } else {
      response = `Tente perguntar sobre "maior gasto", "categoria" ou "total".`;
    }

    setChatHistory(prev => [
      ...prev,
      { from: 'user', text: aiQuestion },
      { from: 'ai', text: response }
    ]);

    setAiQuestion('');
  };

  const renderMonthCard = (month, index) => {
    const monthData = getMonthData(month);
    const monthNumber = String(index + 1).padStart(2, '0');
    return (
      <TouchableOpacity
        key={month}
        style={styles.monthCard}
        onPress={() => setSelectedMonth(month)}
      >
        <View style={styles.monthHeader}>
          <Text style={styles.monthName}>{month.toUpperCase()}</Text>
          <Text style={styles.monthNumber}>{monthNumber}</Text>
        </View>
        <Text style={styles.monthTotal}>R$ {monthData.total.toFixed(2)}</Text>
        <Text style={styles.monthGastos}>{monthData.gastos.length} gastos</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Seleção de ano */}
      <View style={styles.yearSelector}>
        <Text style={styles.yearLabel}>Ano:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {years.map(year => (
            <TouchableOpacity
              key={year}
              style={[styles.yearButton, selectedYear === year && styles.yearButtonActive]}
              onPress={() => setSelectedYear(year)}
            >
              <Text style={[styles.yearText, selectedYear === year && styles.yearTextActive]}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Total anual */}
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total {selectedYear}</Text>
        <Text style={styles.summaryValue}>R$ {getTotalYear().toFixed(2)}</Text>
      </View>

      {/* Lista de meses */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.monthsGrid}>{months.map(renderMonthCard)}</View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAIModal(true)}>
        <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal de chat da IA */}
      <Modal visible={showAIModal} animationType="slide" transparent>
        <View style={styles.chatOverlay}>
          <View style={styles.chatContainer}>
            {/* Cabeçalho */}
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Chat com IA</Text>
              <TouchableOpacity onPress={() => setShowAIModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Corpo (mensagens) */}
            <ScrollView
              style={styles.chatMessages}
              contentContainerStyle={{ padding: 16 }}
            >
              {chatHistory.map((msg, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.chatBubble,
                    msg.from === 'user' ? styles.userBubble : styles.aiBubble
                  ]}
                >
                  <Text style={styles.chatText}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Campo de texto e botão */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={10}
            >
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Digite sua pergunta..."
                  placeholderTextColor="#888"
                  value={aiQuestion}
                  onChangeText={setAiQuestion}
                />
                <TouchableOpacity style={styles.chatSendButton} onPress={handleAIQuestion}>
                  <Ionicons name="send" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111',
  },
  yearLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginRight: 15 },
  yearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  yearButtonActive: { backgroundColor: '#00C851' },
  yearText: { color: '#ccc', fontSize: 16, fontWeight: 'bold' },
  yearTextActive: { color: '#fff' },
  summary: { backgroundColor: '#1a1a1a', padding: 20, alignItems: 'center' },
  summaryLabel: { color: '#ccc', fontSize: 14, marginBottom: 5 },
  summaryValue: { color: '#00C851', fontSize: 28, fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 15 },
  contentContainer: { paddingBottom: 80 },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 15,
  },
  monthCard: {
    width: (width - 40) / 3,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthName: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  monthNumber: { color: '#00C851', fontSize: 10, fontWeight: 'bold' },
  monthTotal: { color: '#00C851', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  monthGastos: { color: '#999', fontSize: 10 },

  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#00C851',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },

  // 🔽 Chat modal
  chatOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  chatContainer: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  chatTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  chatMessages: { flexGrow: 1 },
  chatBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#00C851',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#222',
    alignSelf: 'flex-start',
  },
  chatText: { color: '#fff', fontSize: 15 },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  chatInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    padding: 10,
    backgroundColor: '#222',
    borderRadius: 20,
    marginRight: 10,
  },
  chatSendButton: {
    backgroundColor: '#00C851',
    padding: 10,
    borderRadius: 20,
  },
});

export default RELATORIO;
