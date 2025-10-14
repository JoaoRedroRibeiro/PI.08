import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Animated,
  Dimensions,
  Vibration,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context'
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const StatisticsScreen = ({ navigation }) => {
  const [selectedBarIndex, setSelectedBarIndex] = useState(null);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [currentYear, setCurrentYear] = useState(2024);
  const [monthlyGoal, setMonthlyGoal] = useState(1200);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState('1200');

  // Dados dos gráficos - apenas visualização
  const monthlyData = [
    { month: 'Jan', amount: 850, status: 'good', transactions: 28, prediction: 820 },
    { month: 'Fev', amount: 1200, status: 'warning', transactions: 32, prediction: 1180 },
    { month: 'Mar', amount: 920, status: 'good', transactions: 25, prediction: 940 },
    { month: 'Abr', amount: 1450, status: 'danger', transactions: 38, prediction: 1420 },
    { month: 'Mai', amount: 980, status: 'good', transactions: 29, prediction: 1000 },
    { month: 'Jun', amount: 1100, status: 'warning', transactions: 31, prediction: 1080 },
    { month: 'Jul', amount: 890, status: 'good', transactions: 27, prediction: 910 },
    { month: 'Ago', amount: 1350, status: 'warning', transactions: 35, prediction: 1320 },
    { month: 'Set', amount: 1180, status: 'warning', transactions: 33, prediction: 1200 },
    { month: 'Out', amount: 950, status: 'good', transactions: 30, prediction: 970 },
  ];

  const categoryData = [
    { name: 'Alimentação', amount: 450, percentage: 33, color: '#FF6B6B', trend: '+5%', lastMonth: 428 },
    { name: 'Transporte', amount: 300, percentage: 22, color: '#4ECDC4', trend: '+2%', lastMonth: 294 },
    { name: 'Entretenimento', amount: 250, percentage: 19, color: '#45B7D1', trend: '-8%', lastMonth: 272 },
    { name: 'Saúde', amount: 200, percentage: 15, color: '#96CEB4', trend: '+12%', lastMonth: 178 },
    { name: 'Outros', amount: 150, percentage: 11, color: '#FECA57', trend: '-3%', lastMonth: 155 },
  ];

  // Novos dados para gráficos adicionais
  const weeklyData = [
    { day: 'Seg', amount: 85 },
    { day: 'Ter', amount: 120 },
    { day: 'Qua', amount: 95 },
    { day: 'Qui', amount: 140 },
    { day: 'Sex', amount: 110 },
    { day: 'Sáb', amount: 180 },
    { day: 'Dom', amount: 75 },
  ];

  const comparisonData = [
    { period: 'Este Mês', amount: 1350, color: '#00C851' },
    { period: 'Mês Anterior', amount: 1180, color: '#FFC107' },
    { period: 'Mesmo Mês Ano Anterior', amount: 1420, color: '#FF5722' },
  ];

  const goalData = {
    target: 1200,
    current: 1350,
    percentage: (1350 / 1200) * 100
  };

  // Animações
  const barAnimations = useRef(monthlyData.map(() => new Animated.Value(0))).current;
  const categoryAnimations = useRef(categoryData.map(() => new Animated.Value(1))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animar barras
    const barStagger = Animated.stagger(100, 
      barAnimations.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        })
      )
    );

    // Animar fade-in geral
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });

    Animated.parallel([barStagger, fadeIn]).start();
  }, []);

  const animatePulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBarPress = (item, index) => {
    Vibration.vibrate(50);
    setSelectedBarIndex(index);
    const goalDifference = monthlyGoal - item.amount;
    const percentageOfGoal = ((item.amount / monthlyGoal) * 100).toFixed(1);
    
    setSelectedDetail({
      type: 'month',
      title: `Gastos de ${item.month}`,
      value: `R$ ${item.amount}`,
      color: getStatusColor(item.status),
      status: getStatusText(item.status),
      details: [
        `Status: ${getStatusText(item.status)}`,
        `Meta mensal: R$ ${monthlyGoal}`,
        `${goalDifference >= 0 ? 'Economia' : 'Excesso'}: R$ ${Math.abs(goalDifference)}`,
        `${percentageOfGoal}% da meta atingida`,
        `Total de transações: ${item.transactions}`,
        `Previsão vs Real: R$ ${item.prediction} vs R$ ${item.amount}`,
      ]
    });
    setIsDetailModalVisible(true);
    animatePulse();
  };

  const handleCategoryPress = (item, index) => {
    Vibration.vibrate(50);
    setSelectedCategoryIndex(index);
    
    // Animar categoria selecionada
    Animated.timing(categoryAnimations[index], {
      toValue: 1.1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(categoryAnimations[index], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    const monthlyAverage = (item.amount / 30).toFixed(2);
    const trendDirection = item.trend.includes('+') ? 'Aumento' : 'Redução';
    const trendValue = item.trend.replace(/[+-]/, '');
    
    setSelectedDetail({
      type: 'category',
      title: item.name,
      value: `R$ ${item.amount} (${item.percentage}%)`,
      color: item.color,
      details: [
        `Gasto médio diário: R$ ${monthlyAverage}`,
        `${trendDirection} de ${trendValue} vs mês anterior`,
        `Mês anterior: R$ ${item.lastMonth}`,
        `Diferença: R$ ${(item.amount - item.lastMonth).toFixed(2)}`,
        `Projeção próximo mês: R$ ${(item.amount * 1.05).toFixed(2)}`,
      ]
    });
    setIsDetailModalVisible(true);
  };

  const handleGoalUpdate = () => {
    const newGoal = parseFloat(tempGoal);
    if (isNaN(newGoal) || newGoal <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido para a meta');
      return;
    }
    
    setMonthlyGoal(newGoal);
    setShowGoalModal(false);
    Alert.alert('Sucesso', `Meta mensal atualizada para R$ ${newGoal.toFixed(2)}`);
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'good': return 'Bom Resultado';
      case 'warning': return 'Controlado';
      case 'danger': return 'Gastos Extremos';
      default: return 'Normal';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#28a745';
      case 'warning': return '#ffc107';
      case 'danger': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const SummaryCards = () => {
    const currentMonth = monthlyData[monthlyData.length - 1];
    const totalSpent = monthlyData.reduce((sum, item) => sum + item.amount, 0);
    const averageSpent = totalSpent / monthlyData.length;
    const goalProgress = ((currentMonth.amount / monthlyGoal) * 100).toFixed(1);
    
    return (
      <View style={styles.summaryContainer}>
        <TouchableOpacity 
          style={styles.summaryCard}
          onPress={() => setShowGoalModal(true)}
        >
          <Text style={styles.summaryLabel}>Meta Mensal</Text>
          <Text style={styles.summaryValue}>R$ {monthlyGoal}</Text>
          <Text style={styles.summarySubtext}>Toque para alterar</Text>
        </TouchableOpacity>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Mês Atual</Text>
          <Text style={[styles.summaryValue, { color: getStatusColor(currentMonth.status) }]}>
            R$ {currentMonth.amount}
          </Text>
          <Text style={styles.summarySubtext}>{goalProgress}% da meta</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Média Mensal</Text>
          <Text style={styles.summaryValue}>R$ {averageSpent.toFixed(0)}</Text>
          <Text style={styles.summarySubtext}>{monthlyData.length} meses</Text>
        </View>
      </View>
    );
  };
  const maxWeekly = Math.max(...weeklyData.map(item => item.amount));
  const maxComparison = Math.max(...comparisonData.map(item => item.amount));
  const maxAmount = Math.max(...monthlyData.map(item => item.amount));

  const MonthlyBarChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Gastos Mensais {currentYear}</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.horizontalChart}>
          {monthlyData.map((item, index) => {
            const animatedHeight = barAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, (item.amount / maxAmount) * 120],
            });
            
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.monthlyBarContainer}
                onPress={() => handleBarPress(item, index)}
              >
                <Animated.View
                  style={[
                    styles.monthlyBar,
                    {
                      height: animatedHeight,
                      backgroundColor: getStatusColor(item.status),
                    },
                  ]}
                />
                <Text style={styles.monthlyBarLabel}>{item.month}</Text>
                <Text style={styles.monthlyBarValue}>R${item.amount}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  const WeeklySpendingChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Gastos da Semana</Text>
      <View style={styles.weeklyChart}>
        {weeklyData.map((item, index) => {
          const height = (item.amount / maxWeekly) * 80;
          return (
            <View key={index} style={styles.weeklyBarContainer}>
              <View 
                style={[
                  styles.weeklyBar,
                  { 
                    height,
                    backgroundColor: index === 5 || index === 6 ? '#FF6B6B' : '#00C851'
                  }
                ]}
              />
              <Text style={styles.weeklyLabel}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const GoalProgressChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Meta Mensal</Text>
      <View style={styles.goalContainer}>
        <View style={styles.goalCircle}>
          <View style={[
            styles.goalProgress,
            {
              transform: [{ 
                rotate: `${Math.min(goalData.percentage, 100) * 3.6}deg` 
              }]
            }
          ]} />
          <View style={styles.goalCenter}>
            <Text style={styles.goalPercentage}>
              {Math.round(goalData.percentage)}%
            </Text>
            <Text style={styles.goalLabel}>da meta</Text>
          </View>
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalCurrent}>R$ {goalData.current}</Text>
          <Text style={styles.goalTarget}>Meta: R$ {goalData.target}</Text>
          <Text style={[
            styles.goalStatus,
            { color: goalData.percentage > 100 ? '#FF6B6B' : '#00C851' }
          ]}>
            {goalData.percentage > 100 
              ? `R$ ${(goalData.current - goalData.target).toFixed(0)} acima da meta`
              : `R$ ${(goalData.target - goalData.current).toFixed(0)} restante`
            }
          </Text>
        </View>
      </View>
    </View>
  );

  const ComparisonChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Comparação de Períodos</Text>
      <View style={styles.comparisonChart}>
        {comparisonData.map((item, index) => {
          const width = (item.amount / maxComparison) * 200;
          return (
            <View key={index} style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>{item.period}</Text>
              <View style={styles.comparisonBarContainer}>
                <View 
                  style={[
                    styles.comparisonBar,
                    {
                      width,
                      backgroundColor: item.color
                    }
                  ]}
                />
                <Text style={styles.comparisonValue}>R$ {item.amount}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const CategoryDonutChart = () => {
    const total = categoryData.reduce((sum, item) => sum + item.amount, 0);
    let cumulativePercentage = 0;
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Categorias - Outubro</Text>
        <View style={styles.donutContainer}>
          <View style={styles.donutChart}>
            {categoryData.map((item, index) => {
              const percentage = (item.amount / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -cumulativePercentage;
              cumulativePercentage += percentage;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.donutSegment,
                    {
                      borderColor: item.color,
                      borderWidth: 8,
                      transform: [{ rotate: `${strokeDashoffset * 3.6}deg` }]
                    }
                  ]}
                  onPress={() => handleCategoryPress(item, index)}
                />
              );
            })}
            <View style={styles.donutCenter}>
              <Text style={styles.donutTotal}>R$ {total}</Text>
              <Text style={styles.donutLabel}>Total</Text>
            </View>
          </View>
          
          <View style={styles.categoryLegend}>
            {categoryData.map((item, index) => (
              <View key={index} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendCategory}>{item.name}</Text>
                <Text style={styles.legendAmount}>R$ {item.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SummaryCards />
          <MonthlyBarChart />
          <WeeklySpendingChart />
          <GoalProgressChart />
          <ComparisonChart />
          <CategoryDonutChart />
        </ScrollView>

        {/* Modal de Detalhes */}
        <Modal
          visible={isDetailModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.modalContent,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <View style={styles.modalHeader}>
                <View style={[styles.modalColorIndicator, { backgroundColor: selectedDetail?.color }]} />
                <Text style={styles.modalTitle}>{selectedDetail?.title}</Text>
                <TouchableOpacity onPress={() => setIsDetailModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <Text style={styles.modalValue}>{selectedDetail?.value}</Text>
                {selectedDetail?.status && (
                  <Text style={[styles.modalStatus, { color: selectedDetail.color }]}>
                    {selectedDetail.status}
                  </Text>
                )}
                
                {selectedDetail?.details?.map((detail, index) => (
                  <Text key={index} style={styles.modalDetail}>• {detail}</Text>
                ))}
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Modal de Definir Meta */}
        <Modal
          visible={showGoalModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.goalModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Definir Meta Mensal</Text>
                <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.goalContent}>
                <Text style={styles.goalLabel}>Meta atual: R$ {monthlyGoal}</Text>
                
                <View style={styles.goalInputContainer}>
                  <Text style={styles.goalInputLabel}>Nova meta (R$):</Text>
                  <TextInput
                    style={styles.goalInput}
                    value={tempGoal}
                    onChangeText={setTempGoal}
                    placeholder="1200"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.goalSuggestions}>
                  <Text style={styles.goalSuggestionsTitle}>Sugestões baseadas no seu histórico:</Text>
                  {[1000, 1200, 1500, 2000].map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion}
                      style={styles.goalSuggestion}
                      onPress={() => setTempGoal(suggestion.toString())}
                    >
                      <Text style={styles.goalSuggestionText}>R$ {suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.goalActions}>
                  <TouchableOpacity 
                    style={styles.goalCancelButton}
                    onPress={() => setShowGoalModal(false)}
                  >
                    <Text style={styles.goalCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.goalSaveButton}
                    onPress={handleGoalUpdate}
                  >
                    <Text style={styles.goalSaveText}>Salvar Meta</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    paddingBottom: 15, // Espaço para não conflitar com botões do celular
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    paddingBottom: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 2,
    borderBottomColor: '#00C851',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333333',
  },
  navButtonText: {
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 6,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: 30,
  },
  chartContainer: {
    backgroundColor: '#1a1a1a',
    marginVertical: 8,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  // Gráfico mensal horizontal
  horizontalChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  monthlyBarContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  monthlyBar: {
    width: 20,
    borderRadius: 3,
    marginBottom: 5,
  },
  monthlyBarLabel: {
    fontSize: 10,
    color: '#ffffff',
    marginTop: 5,
  },
  monthlyBarValue: {
    fontSize: 9,
    color: '#00C851',
    marginTop: 2,
  },

  // Gráfico semanal
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    paddingVertical: 10,
  },
  weeklyBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  weeklyBar: {
    width: 18,
    borderRadius: 2,
    marginBottom: 5,
  },
  weeklyLabel: {
    fontSize: 10,
    color: '#ffffff',
    marginTop: 5,
  },

  // Meta circular
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  goalCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'relative',
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalProgress: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: '#00C851',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  goalCenter: {
    alignItems: 'center',
  },
  goalPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00C851',
  },
  goalLabel: {
    fontSize: 10,
    color: '#ffffff',
  },
  goalInfo: {
    flex: 1,
    paddingLeft: 20,
  },
  goalCurrent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  goalTarget: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 5,
  },
  goalStatus: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Gráfico de comparação
  comparisonChart: {
    paddingVertical: 10,
  },
  comparisonRow: {
    marginBottom: 15,
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 5,
  },
  comparisonBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonBar: {
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  comparisonValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },

  // Donut chart de categorias
  donutContainer: {
    alignItems: 'center',
  },
  donutChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    marginBottom: 20,
    backgroundColor: '#2a2a2a',
  },
  donutSegment: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  donutCenter: {
    position: 'absolute',
    top: 35,
    left: 35,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00C851',
  },
  donutLabel: {
    fontSize: 8,
    color: '#ffffff',
  },
  categoryLegend: {
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  legendCategory: {
    flex: 1,
    fontSize: 12,
    color: '#ffffff',
  },
  legendAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00C851',
  },

  // Modal de detalhes
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginLeft: 10,
  },
  modalBody: {
    paddingTop: 10,
  },
  modalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C851',
    marginBottom: 10,
  },
  modalStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  modalDetail: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
    lineHeight: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00C851',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 10,
    color: '#666666',
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00C851',
    opacity: 0.8,
  },
  goalLineLabel: {
    position: 'absolute',
    right: 5,
    fontSize: 10,
    color: '#00C851',
    fontWeight: 'bold',
  },
  exceedIndicator: {
    position: 'absolute',
    top: -15,
    right: 5,
  },
  goalModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.7,
  },
  goalContent: {
    paddingTop: 20,
  },
  goalLabel: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  goalInputContainer: {
    marginBottom: 20,
  },
  goalInputLabel: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
  },
  goalInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#00C851',
  },
  goalSuggestions: {
    marginBottom: 30,
  },
  goalSuggestionsTitle: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 10,
  },
  goalSuggestion: {
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  goalSuggestionText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  goalCancelButton: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  goalCancelText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  goalSaveButton: {
    flex: 1,
    backgroundColor: '#00C851',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  goalSaveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StatisticsScreen;