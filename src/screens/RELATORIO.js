import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Platform,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const RELATORIO = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [manualExpense, setManualExpense] = useState({
    description: '',
    amount: '',
    category: 'Alimentação',
    date: new Date().toLocaleDateString('pt-BR'),
    merchant: ''
  });

  // Gerar anos dinamicamente baseado no ano atual
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear - i);

  // Dados fictícios de gastos por mês
  const financialData = {
    2024: {
      janeiro: { total: 2850.50, gastos: [
        { categoria: 'Alimentação', valor: 850.50, data: '15/01' },
        { categoria: 'Transporte', valor: 450.00, data: '20/01' },
        { categoria: 'Lazer', valor: 300.00, data: '25/01' },
        { categoria: 'Saúde', valor: 1250.00, data: '30/01' }
      ]},
      fevereiro: { total: 3200.75, gastos: [
        { categoria: 'Alimentação', valor: 920.25, data: '10/02' },
        { categoria: 'Transporte', valor: 480.00, data: '18/02' },
        { categoria: 'Roupas', valor: 650.50, data: '22/02' },
        { categoria: 'Entretenimento', valor: 1150.00, data: '28/02' }
      ]},
      março: { total: 2650.30, gastos: [
        { categoria: 'Alimentação', valor: 780.30, data: '05/03' },
        { categoria: 'Transporte', valor: 420.00, data: '12/03' },
        { categoria: 'Educação', valor: 800.00, data: '20/03' },
        { categoria: 'Outros', valor: 650.00, data: '25/03' }
      ]},
      abril: { total: 3450.80, gastos: [
        { categoria: 'Alimentação', valor: 950.80, data: '08/04' },
        { categoria: 'Transporte', valor: 500.00, data: '15/04' },
        { categoria: 'Casa', valor: 1200.00, data: '22/04' },
        { categoria: 'Lazer', valor: 800.00, data: '28/04' }
      ]},
      maio: { total: 2890.45, gastos: [
        { categoria: 'Alimentação', valor: 820.45, data: '03/05' },
        { categoria: 'Transporte', valor: 470.00, data: '10/05' },
        { categoria: 'Saúde', valor: 900.00, data: '18/05' },
        { categoria: 'Tecnologia', valor: 700.00, data: '25/05' }
      ]},
      junho: { total: 3100.90, gastos: [
        { categoria: 'Alimentação', valor: 880.90, data: '05/06' },
        { categoria: 'Transporte', valor: 520.00, data: '12/06' },
        { categoria: 'Viagem', valor: 1200.00, data: '20/06' },
        { categoria: 'Outros', valor: 500.00, data: '28/06' }
      ]},
      julho: { total: 2750.60, gastos: [
        { categoria: 'Alimentação', valor: 750.60, data: '07/07' },
        { categoria: 'Transporte', valor: 450.00, data: '14/07' },
        { categoria: 'Entretenimento', valor: 800.00, data: '21/07' },
        { categoria: 'Casa', valor: 750.00, data: '28/07' }
      ]},
      agosto: { total: 3350.25, gastos: [
        { categoria: 'Alimentação', valor: 900.25, data: '04/08' },
        { categoria: 'Transporte', valor: 550.00, data: '11/08' },
        { categoria: 'Educação', valor: 1000.00, data: '18/08' },
        { categoria: 'Lazer', valor: 900.00, data: '25/08' }
      ]},
      setembro: { total: 2980.15, gastos: [
        { categoria: 'Alimentação', valor: 830.15, data: '06/09' },
        { categoria: 'Transporte', valor: 480.00, data: '13/09' },
        { categoria: 'Roupas', valor: 700.00, data: '20/09' },
        { categoria: 'Tecnologia', valor: 970.00, data: '27/09' }
      ]},
      outubro: { total: 3180.40, gastos: [
        { categoria: 'Alimentação', valor: 880.40, data: '04/10' },
        { categoria: 'Transporte', valor: 500.00, data: '11/10' },
        { categoria: 'Casa', valor: 1000.00, data: '18/10' },
        { categoria: 'Saúde', valor: 800.00, data: '25/10' }
      ]},
      novembro: { total: 2850.90, gastos: [
        { categoria: 'Alimentação', valor: 750.90, data: '02/11' },
        { categoria: 'Transporte', valor: 450.00, data: '09/11' },
        { categoria: 'Presentes', valor: 900.00, data: '16/11' },
        { categoria: 'Outros', valor: 750.00, data: '23/11' }
      ]},
      dezembro: { total: 4200.75, gastos: [
        { categoria: 'Alimentação', valor: 1100.75, data: '01/12' },
        { categoria: 'Transporte', valor: 600.00, data: '08/12' },
        { categoria: 'Presentes', valor: 1500.00, data: '15/12' },
        { categoria: 'Festa', valor: 1000.00, data: '31/12' }
      ]}
    },
    2023: {
      janeiro: { total: 2650.30, gastos: [
        { categoria: 'Alimentação', valor: 750.30, data: '12/01' },
        { categoria: 'Transporte', valor: 400.00, data: '18/01' },
        { categoria: 'Outros', valor: 1500.00, data: '25/01' }
      ]},
      fevereiro: { total: 2800.45, gastos: [
        { categoria: 'Alimentação', valor: 800.45, data: '10/02' },
        { categoria: 'Transporte', valor: 450.00, data: '15/02' },
        { categoria: 'Lazer', valor: 1550.00, data: '28/02' }
      ]},
      março: { total: 3200.80, gastos: [
        { categoria: 'Alimentação', valor: 950.80, data: '05/03' },
        { categoria: 'Transporte', valor: 500.00, data: '12/03' },
        { categoria: 'Casa', valor: 1750.00, data: '25/03' }
      ]}
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

    let response = '';
    const question = aiQuestion.toLowerCase();
    
    if (question.includes('maior gasto') || question.includes('mais gastei')) {
      const yearData = financialData[selectedYear] || {};
      const monthTotals = Object.entries(yearData).map(([month, data]) => ({
        month,
        total: data.total
      }));
      const maxMonth = monthTotals.reduce((max, current) => 
        current.total > max.total ? current : max, { month: '', total: 0 });
      
      response = `Em ${selectedYear}, você gastou mais em ${maxMonth.month} com um total de R$ ${maxMonth.total.toFixed(2)}.`;
    } else if (question.includes('categoria') || question.includes('onde')) {
      response = `Em ${selectedYear}, suas principais categorias de gastos foram: Alimentação, Transporte, Casa e Saúde. A alimentação representa cerca de 30% dos seus gastos totais.`;
    } else if (question.includes('total') || question.includes('quanto gastei')) {
      const total = getTotalYear();
      response = `Em ${selectedYear}, você gastou um total de R$ ${total.toFixed(2)}.`;
    } else if (question.includes('média') || question.includes('media')) {
      const total = getTotalYear();
      const monthsWithData = Object.keys(financialData[selectedYear] || {}).length;
      const average = monthsWithData > 0 ? total / monthsWithData : 0;
      response = `Sua média mensal de gastos em ${selectedYear} foi de R$ ${average.toFixed(2)}.`;
    } else {
      response = `Com base nos seus dados de ${selectedYear}, posso ajudar você a analisar seus gastos por categoria, identificar padrões de consumo e sugerir otimizações. Tente perguntar sobre "maior gasto", "categoria", "total" ou "média".`;
    }

    setAiResponse(response);
  };

  const handleManualExpenseSubmit = () => {
    if (!manualExpense.description || !manualExpense.amount) {
      Alert.alert('Erro', 'Por favor, preencha pelo menos a descrição e o valor');
      return;
    }

    const amount = parseFloat(manualExpense.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido');
      return;
    }

    // Aqui você salvaria o gasto no seu sistema de dados
    Alert.alert(
      'Gasto Adicionado!',
      `Gasto de R$ ${amount.toFixed(2)} foi adicionado com sucesso.`,
      [
        {
          text: 'Adicionar Outro',
          onPress: () => {
            setManualExpense({
              description: '',
              amount: '',
              category: 'Alimentação',
              date: new Date().toLocaleDateString('pt-BR'),
              merchant: ''
            });
          },
        },
        {
          text: 'Concluir',
          onPress: () => {
            setShowManualEntry(false);
            setManualExpense({
              description: '',
              amount: '',
              category: 'Alimentação',
              date: new Date().toLocaleDateString('pt-BR'),
              merchant: ''
            });
          },
        },
      ]
    );
  };

  const resetManualForm = () => {
    setManualExpense({
      description: '',
      amount: '',
      category: 'Alimentação',
      date: new Date().toLocaleDateString('pt-BR'),
      merchant: ''
    });
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
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatórios Financeiros</Text>
        <TouchableOpacity onPress={() => setShowAIModal(true)}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#00C851" />
        </TouchableOpacity>
      </View>

      <View style={styles.yearSelector}>
        <Text style={styles.yearLabel}>Ano:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {years.map(year => (
            <TouchableOpacity
              key={year}
              style={[
                styles.yearButton,
                selectedYear === year && styles.yearButtonActive
              ]}
              onPress={() => setSelectedYear(year)}
            >
              <Text style={[
                styles.yearText,
                selectedYear === year && styles.yearTextActive
              ]}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total {selectedYear}</Text>
        <Text style={styles.summaryValue}>R$ {getTotalYear().toFixed(2)}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.monthsGrid}>
          {months.map((month, index) => renderMonthCard(month, index))}
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedMonth}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedMonth(null)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedMonth?.toUpperCase()} {selectedYear}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total do Mês</Text>
              <Text style={styles.totalValue}>R$ {getMonthData(selectedMonth).total.toFixed(2)}</Text>
            </View>
            
            <Text style={styles.sectionTitle}>Detalhes dos Gastos</Text>
            
            <TouchableOpacity 
              style={styles.addExpenseButton}
              onPress={() => setShowAddOptions(true)}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.addExpenseText}>Adicionar Novo Gasto</Text>
            </TouchableOpacity>
            
            {getMonthData(selectedMonth).gastos.map((gasto, index) => (
              <View key={index} style={styles.gastoItem}>
                <View style={styles.gastoInfo}>
                  <Text style={styles.gastoCategoria}>{gasto.categoria}</Text>
                  <Text style={styles.gastoData}>{gasto.data}/{selectedYear}</Text>
                </View>
                <Text style={styles.gastoValor}>R$ {gasto.valor.toFixed(2)}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showAIModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAIModal(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Assistente I.A. Financeiro</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <View style={styles.aiContainer}>
              <View style={styles.aiHeader}>
                <Ionicons name="chatbubble-ellipses" size={32} color="#00C851" />
                <Text style={styles.aiTitle}>
                  Pergunte sobre seus dados de {selectedYear}
                </Text>
              </View>
              
              <Text style={styles.aiDescription}>
                Faça perguntas como: "Qual foi meu maior gasto?", "Em que categoria mais gastei?", "Qual minha média mensal?"
              </Text>
              
              <TextInput
                style={styles.aiInput}
                placeholder="Digite sua pergunta aqui..."
                placeholderTextColor="#999"
                value={aiQuestion}
                onChangeText={setAiQuestion}
                multiline
              />
              
              <TouchableOpacity
                style={styles.aiButton}
                onPress={handleAIQuestion}
              >
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.aiButtonText}>Perguntar</Text>
              </TouchableOpacity>
              
              {aiResponse ? (
                <View style={styles.aiResponse}>
                  <Text style={styles.aiResponseLabel}>Resposta:</Text>
                  <Text style={styles.aiResponseText}>{aiResponse}</Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal de Opções de Entrada de Gasto */}
      <Modal
        visible={showAddOptions}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.optionsModalOverlay}>
          <View style={styles.optionsModal}>
            <View style={styles.optionsHeader}>
              <Text style={styles.optionsTitle}>Como deseja adicionar o gasto?</Text>
              <TouchableOpacity onPress={() => setShowAddOptions(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => {
                  setShowAddOptions(false);
                  setSelectedMonth(null);
                  navigation.navigate('Camera');
                }}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name="camera" size={32} color="#00C851" />
                </View>
                <Text style={styles.optionTitle}>Fotografar Recibo</Text>
                <Text style={styles.optionDescription}>
                  Tire uma foto da nota fiscal e deixe a IA extrair os dados automaticamente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => {
                  setShowAddOptions(false);
                  setShowManualEntry(true);
                }}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name="create" size={32} color="#00C851" />
                </View>
                <Text style={styles.optionTitle}>Inserir Manualmente</Text>
                <Text style={styles.optionDescription}>
                  Digite os dados do gasto manualmente usando um formulário
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Entrada Manual */}
      <Modal
        visible={showManualEntry}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowManualEntry(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Inserir Gasto Manualmente</Text>
            <TouchableOpacity onPress={resetManualForm}>
              <Ionicons name="refresh" size={24} color="#00C851" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            
            <View style={styles.manualFormGroup}>
              <Text style={styles.manualFormLabel}>Descrição *</Text>
              <TextInput
                style={styles.manualFormInput}
                value={manualExpense.description}
                onChangeText={(text) => setManualExpense({...manualExpense, description: text})}
                placeholder="Ex: Almoço no restaurante"
                placeholderTextColor="#666"
                maxLength={100}
              />
            </View>

            <View style={styles.manualFormGroup}>
              <Text style={styles.manualFormLabel}>Valor (R$) *</Text>
              <TextInput
                style={styles.manualFormInput}
                value={manualExpense.amount}
                onChangeText={(text) => setManualExpense({...manualExpense, amount: text})}
                placeholder="0,00"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.manualFormGroup}>
              <Text style={styles.manualFormLabel}>Estabelecimento</Text>
              <TextInput
                style={styles.manualFormInput}
                value={manualExpense.merchant}
                onChangeText={(text) => setManualExpense({...manualExpense, merchant: text})}
                placeholder="Ex: Supermercado ABC"
                placeholderTextColor="#666"
                maxLength={50}
              />
            </View>

            <View style={styles.manualFormGroup}>
              <Text style={styles.manualFormLabel}>Data</Text>
              <TextInput
                style={styles.manualFormInput}
                value={manualExpense.date}
                onChangeText={(text) => setManualExpense({...manualExpense, date: text})}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.manualFormGroup}>
              <Text style={styles.manualFormLabel}>Categoria</Text>
              <View style={styles.categoryGrid}>
                {[
                  { key: 'Alimentação', icon: 'restaurant', color: '#FF6B6B' },
                  { key: 'Transporte', icon: 'car', color: '#4ECDC4' },
                  { key: 'Entretenimento', icon: 'game-controller', color: '#45B7D1' },
                  { key: 'Saúde', icon: 'medical', color: '#96CEB4' },
                  { key: 'Educação', icon: 'school', color: '#FECA57' },
                  { key: 'Casa', icon: 'home', color: '#FF9FF3' },
                  { key: 'Roupas', icon: 'shirt', color: '#54A0FF' },
                  { key: 'Outros', icon: 'ellipsis-horizontal', color: '#5F27CD' },
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryCard,
                      { borderColor: manualExpense.category === cat.key ? cat.color : '#333333' },
                      manualExpense.category === cat.key && { backgroundColor: cat.color + '20' }
                    ]}
                    onPress={() => setManualExpense({...manualExpense, category: cat.key})}
                  >
                    <Ionicons 
                      name={cat.icon} 
                      size={24} 
                      color={manualExpense.category === cat.key ? cat.color : '#666'} 
                    />
                    <Text style={[
                      styles.categoryCardText,
                      { color: manualExpense.category === cat.key ? cat.color : '#666' }
                    ]}>
                      {cat.key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.manualFormActions}>
              <TouchableOpacity 
                style={styles.manualCancelButton}
                onPress={() => setShowManualEntry(false)}
              >
                <Text style={styles.manualCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.manualSubmitButton}
                onPress={handleManualExpenseSubmit}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.manualSubmitButtonText}>Salvar Gasto</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#00C851',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111111',
  },
  yearLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 15,
  },
  yearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#333333',
  },
  yearButtonActive: {
    backgroundColor: '#00C851',
  },
  yearText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  yearTextActive: {
    color: '#fff',
  },
  summary: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  summaryValue: {
    color: '#00C851',
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  contentContainer: {
    paddingBottom: 50,
  },
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
    borderColor: '#333333',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  monthNumber: {
    color: '#00C851',
    fontSize: 10,
    fontWeight: 'bold',
  },
  monthTotal: {
    color: '#00C851',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  monthGastos: {
    color: '#999',
    fontSize: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#00C851',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalContentContainer: {
    paddingVertical: 20,
    paddingBottom: 50,
  },
  totalCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#00C851',
  },
  totalLabel: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 10,
  },
  totalValue: {
    color: '#00C851',
    fontSize: 32,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addExpenseButton: {
    backgroundColor: '#00C851',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addExpenseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  gastoItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  gastoInfo: {
    flex: 1,
  },
  gastoCategoria: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  gastoData: {
    color: '#999',
    fontSize: 12,
  },
  gastoValor: {
    color: '#00C851',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aiContainer: {
    flex: 1,
  },
  aiHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  aiTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  aiDescription: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  aiInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#333333',
  },
  aiButton: {
    backgroundColor: '#00C851',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  aiResponse: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#00C851',
  },
  aiResponseLabel: {
    color: '#00C851',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  aiResponseText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  addExpenseButton: {
    backgroundColor: '#00C851',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00C851',
  },
  addExpenseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  optionsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.6,
  },
  optionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a3a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 20,
  },
  manualFormGroup: {
    marginBottom: 20,
  },
  manualFormLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  manualFormInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    width: (width * 0.9 - 60) / 3,
    minHeight: 80,
    justifyContent: 'center',
  },
  categoryCardText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 5,
    textAlign: 'center',
  },
  manualFormActions: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
    marginBottom: 30,
  },
  manualCancelButton: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555555',
  },
  manualCancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  manualSubmitButton: {
    flex: 2,
    backgroundColor: '#00C851',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  manualSubmitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RELATORIO;