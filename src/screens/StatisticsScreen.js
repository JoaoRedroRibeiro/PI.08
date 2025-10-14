import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  Vibration,
  Modal,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const StatisticsScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedBarIndex, setSelectedBarIndex] = useState(null);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Dados mock para os gráficos
  const monthlyData = [
    { month: 'Jan', amount: 1200, status: 'good' },
    { month: 'Fev', amount: 1850, status: 'warning' },
    { month: 'Mar', amount: 2500, status: 'danger' },
    { month: 'Abr', amount: 1150, status: 'good' },
    { month: 'Mai', amount: 1650, status: 'warning' },
    { month: 'Jun', amount: 1320, status: 'good' },
  ];

  const categoryData = [
    { name: 'Alimentação', amount: 450, percentage: 35, color: '#ff6384' },
    { name: 'Transporte', amount: 320, percentage: 25, color: '#36a2eb' },
    { name: 'Lazer', amount: 180, percentage: 15, color: '#ffce56' },
    { name: 'Saúde', amount: 150, percentage: 12, color: '#4bc0c0' },
    { name: 'Outros', amount: 150, percentage: 13, color: '#9966ff' },
  ];
  
  // Animações
  const barAnimations = useRef(monthlyData.map(() => new Animated.Value(0))).current;
  const categoryAnimations = useRef(categoryData.map(() => new Animated.Value(1))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Animar barras quando componente carrega
    Animated.stagger(100, 
      barAnimations.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        })
      )
    ).start();
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
    setSelectedDetail({
      type: 'month',
      title: `Gastos de ${item.month}`,
      value: `R$ ${item.amount}`,
      status: item.status,
      details: [
        `Status: ${getStatusText(item.status)}`,
        `Diferença mês anterior: ${index > 0 ? (item.amount - monthlyData[index-1].amount > 0 ? '+' : '') + (item.amount - monthlyData[index-1].amount) : 'N/A'}`,
        `Meta mensal: R$ 1.200`,
        `Economia possível: R$ ${Math.max(0, item.amount - 1200)}`,
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

    setSelectedDetail({
      type: 'category',
      title: item.name,
      value: `R$ ${item.amount} (${item.percentage}%)`,
      color: item.color,
      details: [
        `Gasto médio por dia: R$ ${(item.amount / 30).toFixed(2)}`,
        `Comparado ao mês passado: +5%`,
        `Meta categoria: R$ ${(item.amount * 0.9).toFixed(0)}`,
        `Transações este mês: 12`,
      ]
    });
    setIsDetailModalVisible(true);
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

  const maxAmount = Math.max(...monthlyData.map(item => item.amount));

  const BarChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Gastos por Mês</Text>
      <View style={styles.chart}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>R$ {maxAmount}</Text>
          <Text style={styles.axisLabel}>R$ {(maxAmount * 0.75).toFixed(0)}</Text>
          <Text style={styles.axisLabel}>R$ {(maxAmount * 0.5).toFixed(0)}</Text>
          <Text style={styles.axisLabel}>R$ {(maxAmount * 0.25).toFixed(0)}</Text>
          <Text style={styles.axisLabel}>R$ 0</Text>
        </View>
        <View style={styles.chartArea}>
          <View style={styles.bars}>
            {monthlyData.map((item, index) => {
              const animatedHeight = barAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0, (item.amount / maxAmount) * 150],
              });
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.barContainer}
                  activeOpacity={0.7}
                  onPress={() => handleBarPress(item, index)}
                >
                  <Animated.View
                    style={[
                      styles.bar,
                      {
                        height: animatedHeight,
                        backgroundColor: getStatusColor(item.status),
                        transform: [{ 
                          scale: selectedBarIndex === index ? 1.1 : 1 
                        }],
                        shadowColor: selectedBarIndex === index ? '#00C851' : 'transparent',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.5,
                        shadowRadius: 4,
                        elevation: selectedBarIndex === index ? 5 : 0,
                      },
                    ]}
                  />
                  <Text style={[
                    styles.barLabel,
                    selectedBarIndex === index && styles.barLabelSelected
                  ]}>
                    {item.month}
                  </Text>
                  <Text style={[
                    styles.barValue,
                    selectedBarIndex === index && styles.barValueSelected
                  ]}>
                    R$ {item.amount}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#28a745' }]} />
          <Text style={styles.legendText}>Bom Resultado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ffc107' }]} />
          <Text style={styles.legendText}>Controlado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#dc3545' }]} />
          <Text style={styles.legendText}>Gastos Extremos</Text>
        </View>
      </View>
    </View>
  );

  const PieChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Gastos por Categoria (Agosto)</Text>
      <View style={styles.pieContainer}>
        <TouchableOpacity 
          style={styles.pieChart}
          activeOpacity={0.8}
          onPress={() => {
            Vibration.vibrate(50);
            setSelectedDetail({
              type: 'total',
              title: 'Gasto Total Agosto',
              value: 'R$ 1.250',
              details: [
                'Total de transações: 47',
                'Média por transação: R$ 26,60',
                'Maior gasto: R$ 89 (Alimentação)',
                'Menor gasto: R$ 5 (Transporte)',
              ]
            });
            setIsDetailModalVisible(true);
          }}
        >
          {/* Simulação visual de pizza */}
          <View style={styles.pieSlice1} />
          <View style={styles.pieSlice2} />
          <View style={styles.pieSlice3} />
          <View style={styles.pieSlice4} />
          <View style={styles.pieSlice5} />
          <Animated.View style={[
            styles.pieCenter,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <Text style={styles.pieCenterText}>Total</Text>
            <Text style={styles.pieCenterAmount}>R$ 1.250</Text>
          </Animated.View>
        </TouchableOpacity>
        <View style={styles.categoryList}>
          {categoryData.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryItem}
              activeOpacity={0.7}
              onPress={() => handleCategoryPress(item, index)}
            >
              <Animated.View 
                style={[
                  styles.categoryColor, 
                  { 
                    backgroundColor: item.color,
                    transform: [{ scale: categoryAnimations[index] }],
                    shadowColor: selectedCategoryIndex === index ? item.color : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                    elevation: selectedCategoryIndex === index ? 3 : 0,
                  }
                ]} 
              />
              <View style={styles.categoryInfo}>
                <Text style={[
                  styles.categoryName,
                  selectedCategoryIndex === index && styles.categoryNameSelected
                ]}>
                  {item.name}
                </Text>
                <Text style={[
                  styles.categoryAmount,
                  selectedCategoryIndex === index && styles.categoryAmountSelected
                ]}>
                  R$ {item.amount} ({item.percentage}%)
                </Text>
              </View>
              {selectedCategoryIndex === index && (
                <Ionicons name="chevron-forward" size={16} color="#00C851" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const TrendChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Tendência de Gastos</Text>
      <View style={styles.trendContainer}>
        <View style={styles.trendStats}>
          <TouchableOpacity 
            style={styles.statCard}
            activeOpacity={0.7}
            onPress={() => {
              Vibration.vibrate(50);
              setSelectedDetail({
                type: 'trend',
                title: 'Tendência Mensal',
                value: '-12%',
                details: [
                  'Comparação: Agosto vs Julho',
                  'Economia: R$ 180',
                  'Maior redução: Alimentação (-15%)',
                  'Tendência: Decrescente (positivo)',
                ]
              });
              setIsDetailModalVisible(true);
            }}
          >
            <Text style={styles.statValue}>-12%</Text>
            <Text style={styles.statLabel}>vs mês anterior</Text>
            <Ionicons name="trending-down" size={24} color="#28a745" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            activeOpacity={0.7}
            onPress={() => {
              Vibration.vibrate(50);
              setSelectedDetail({
                type: 'average',
                title: 'Média Mensal',
                value: 'R$ 1.450',
                details: [
                  'Baseado em 6 meses',
                  'Meta mensal: R$ 1.200',
                  'Acima da meta: R$ 250',
                  'Melhor mês: Abril (R$ 1.150)',
                ]
              });
              setIsDetailModalVisible(true);
            }}
          >
            <Text style={styles.statValue}>R$ 1.450</Text>
            <Text style={styles.statLabel}>Média mensal</Text>
            <Ionicons name="analytics" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.trendLine}>
          {/* Simulação de linha de tendência */}
          <View style={styles.lineChart}>
            {monthlyData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.linePoint}
                activeOpacity={0.7}
                onPress={() => handleBarPress(item, index)}
              >
                <Animated.View
                  style={[
                    styles.point,
                    {
                      backgroundColor: getStatusColor(item.status),
                      bottom: (item.amount / maxAmount) * 80,
                      transform: [{ 
                        scale: selectedBarIndex === index ? 1.3 : 1 
                      }],
                      shadowColor: selectedBarIndex === index ? '#00C851' : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.7,
                      shadowRadius: 3,
                      elevation: selectedBarIndex === index ? 4 : 0,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Modal de Detalhes */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDetailModalVisible}
        onRequestClose={() => {
          setIsDetailModalVisible(false);
          setSelectedBarIndex(null);
          setSelectedCategoryIndex(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContent,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDetail?.title}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsDetailModalVisible(false);
                  setSelectedBarIndex(null);
                  setSelectedCategoryIndex(null);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={[
                styles.modalValueContainer,
                selectedDetail?.color && { borderLeftColor: selectedDetail.color }
              ]}>
                <Text style={styles.modalValue}>{selectedDetail?.value}</Text>
                {selectedDetail?.status && (
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(selectedDetail.status) }
                  ]}>
                    <Text style={styles.statusText}>
                      {getStatusText(selectedDetail.status)}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.modalDetails}>
                {selectedDetail?.details?.map((detail, index) => (
                  <View key={index} style={styles.detailRow}>
                    <Ionicons name="information-circle" size={16} color="#00C851" />
                    <Text style={styles.detailText}>{detail}</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setIsDetailModalVisible(false);
                  setSelectedBarIndex(null);
                  setSelectedCategoryIndex(null);
                }}
              >
                <Text style={styles.modalButtonText}>Entendi</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estatísticas</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filtros de período */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedPeriod === 'month' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text
            style={[
              styles.filterText,
              selectedPeriod === 'month' && styles.filterTextActive,
            ]}
          >
            Este Mês
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedPeriod === 'quarter' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedPeriod('quarter')}
        >
          <Text
            style={[
              styles.filterText,
              selectedPeriod === 'quarter' && styles.filterTextActive,
            ]}
          >
            Trimestre
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedPeriod === 'year' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedPeriod('year')}
        >
          <Text
            style={[
              styles.filterText,
              selectedPeriod === 'year' && styles.filterTextActive,
            ]}
          >
            Ano
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <BarChart />
        <PieChart />
        <TrendChart />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Preto principal
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a', // Preto mais claro
    borderBottomWidth: 2,
    borderBottomColor: '#00C851', // Verde para detalhes
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterButtonActive: {
    backgroundColor: '#00C851',
    borderColor: '#00C851',
  },
  filterText: {
    fontSize: 14,
    color: '#cccccc',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  chartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#333333',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    height: 180,
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  axisLabel: {
    fontSize: 10,
    color: '#cccccc',
  },
  chartArea: {
    flex: 1,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    justifyContent: 'space-around',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 2,
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
    marginTop: 5,
  },
  barLabelSelected: {
    color: '#00C851',
    fontWeight: 'bold',
  },
  barValue: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
    marginTop: 2,
  },
  barValueSelected: {
    color: '#00C851',
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#cccccc',
  },
  pieContainer: {
    alignItems: 'center',
  },
  pieChart: {
    width: 150,
    height: 150,
    borderRadius: 75,
    position: 'relative',
    marginBottom: 20,
    backgroundColor: '#ff6384',
    overflow: 'hidden',
  },
  pieSlice1: {
    position: 'absolute',
    width: 75,
    height: 150,
    backgroundColor: '#36a2eb',
    right: 0,
  },
  pieSlice2: {
    position: 'absolute',
    width: 150,
    height: 75,
    backgroundColor: '#ffce56',
    bottom: 0,
  },
  pieSlice3: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: '#4bc0c0',
    bottom: 0,
    right: 0,
  },
  pieSlice4: {
    position: 'absolute',
    width: 75,
    height: 75,
    backgroundColor: '#9966ff',
    top: 0,
    right: 0,
  },
  pieSlice5: {
    position: 'absolute',
    width: 75,
    height: 75,
    backgroundColor: '#ff6384',
    top: 0,
    left: 0,
  },
  pieCenter: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    top: 45,
    left: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieCenterText: {
    fontSize: 10,
    color: '#000000',
  },
  pieCenterAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  categoryList: {
    width: '100%',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryName: {
    fontSize: 14,
    color: '#fff',
  },
  categoryNameSelected: {
    color: '#00C851',
    fontWeight: 'bold',
  },
  categoryAmount: {
    fontSize: 14,
    color: '#cccccc',
    fontWeight: '500',
  },
  categoryAmountSelected: {
    color: '#00C851',
    fontWeight: 'bold',
  },
  trendContainer: {
    alignItems: 'center',
  },
  trendStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#333333',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00C851',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 8,
  },
  trendLine: {
    width: '100%',
    height: 100,
  },
  lineChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 100,
    position: 'relative',
  },
  linePoint: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    width: '100%',
    maxWidth: 350,
    borderWidth: 2,
    borderColor: '#00C851',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalValueContainer: {
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#00C851',
  },
  modalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C851',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#cccccc',
    marginLeft: 10,
    flex: 1,
  },
  modalButton: {
    backgroundColor: '#00C851',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default StatisticsScreen;
