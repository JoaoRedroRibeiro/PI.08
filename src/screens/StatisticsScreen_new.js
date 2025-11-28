import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
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
  ActivityIndicator, // Adicionado
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-gifted-charts'

// Importa funções da API (assumindo que 'api.js' está no diretório anterior)
import { createGoal, getGoals, updateGoal, getGoalProgress } from '../core/util/goals';
import { getAnalysis } from '../core/util/analysis';
import { getEntries } from '../core/util/entries';
import { useFocusEffect } from '@react-navigation/native'
import { AuthContext } from '../core/context/auth'

const { width, height } = Dimensions.get('window');

// Definições de ID de usuário e data atual simuladas para a API
const CURRENT_MONTH = new Date().getMonth() + 1; // Mês atual (Novembro, 1-12)
const CURRENT_YEAR = new Date().getFullYear(); // Ano atual
const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const StatisticsScreen = ({ navigation }) => {
  const [selectedBarIndex, setSelectedBarIndex] = useState(null);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [monthlyGoal, setMonthlyGoal] = useState(1200);
  const [currentGoalId, setCurrentGoalId] = useState(null); // ID da meta atual
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState('1200');
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState([])
  const [rawEntries, setRawEntries] = useState([]) // adicionada: guarda entries brutas para o Donut
  const [currentMonthExp, setCurrentMonthExp] = useState(0)
  const [goals, setGoals] = useState([])

  const { user } = useContext(AuthContext)
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
    // Mês simulado para acompanhar a meta definida no CURRENT_MONTH
    { month: 'Nov', amount: 1450, status: 'danger', transactions: 35, prediction: 1320 },
  ];

  const categoryData = [
    { name: 'Alimentação', amount: 450, percentage: 33, color: '#FF6B6B', trend: '+5%', lastMonth: 428 },
    { name: 'Transporte', amount: 300, percentage: 22, color: '#4ECDC4', trend: '+2%', lastMonth: 294 },
    { name: 'Entretenimento', amount: 250, percentage: 19, color: '#45B7D1', trend: '-8%', lastMonth: 272 },
    { name: 'Saúde', amount: 200, percentage: 15, color: '#96CEB4', trend: '+12%', lastMonth: 178 },
    { name: 'Outros', amount: 150, percentage: 11, color: '#FECA57', trend: '-3%', lastMonth: 155 },
  ];

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
    { period: 'Este Mês', amount: 1450, color: '#FF6B6B' }, // Usando o valor simulado do "Novembro"
    { period: 'Mês Anterior', amount: 1180, color: '#FFC107' },
    { period: 'Mesmo Mês Ano Anterior', amount: 1420, color: '#FF5722' },
  ];

  // Animações
  const barAnimations = useRef(monthlyData.map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // --- Lógica de Integração da API ---

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await getGoals({
        user_id: user,
        initial_month: 1,
        initial_year: CURRENT_YEAR,
        final_month: 12,
        final_year: CURRENT_YEAR
      });

      if (data) {

        for (let g of data) {
          if (g.month == CURRENT_MONTH) {
            setMonthlyGoal(g.value)
          }
        }

        const gs = data.map((g) => {
          return {
            value: g.value,
            month: g.month
          }
        })

        setGoals(gs)

        // Recalcula entradas usando as metas recém-buscadas
        fetchEntries(gs);

      } else {
        // Se não houver meta, usa a padrão de R$1200
        const defaultValue = 1200;
        setMonthlyGoal(defaultValue);
        setTempGoal(defaultValue.toString());
        setCurrentGoalId(null);
        // Ainda tenta recalcular entradas sem metas
        fetchEntries([]);
      }

      console.log(goals)
    } catch {
      // Mantém a meta padrão
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExpendidures = useCallback(async () => {

    try {

      const { data } = await getAnalysis({ year: CURRENT_YEAR, month: CURRENT_MONTH })
      setCurrentMonthExp(data.totalDespesas)
    } catch {

    }
  }, [fetchGoals])

  // Função utilitária para parsear datas sem depender do parsing automático (evita deslocamento de timezone)
  const parseDateSafe = (dateStr) => {
    if (!dateStr) return new Date();
    // Se for string no formato "YYYY-MM-DD" ou "YYYY-MM-DDTHH:MM:SS..."
    const onlyDateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
    if (onlyDateMatch) {
      const y = parseInt(onlyDateMatch[1], 10);
      const m = parseInt(onlyDateMatch[2], 10) - 1; // monthIndex
      const d = parseInt(onlyDateMatch[3], 10);
      return new Date(y, m, d);
    }
    // fallback
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date();
    return d;
  };

  // reorganiza mapEntries para calcular cores com base na meta do mês (se existir)
  const mapEntries = (entriesList = [], goalsList = []) => {

    // inicializa estrutura de meses com valores 0 e lista de entradas
    const months = MONTHS_PT.map((m, idx) => ({
      monthIndex: idx,
      value: 0,
      label: m.slice(0, 3),
      rawEntries: [], // guarda as entradas originais do mês
    }));

    // acumula valores por mês e armazena entradas por mês
    for (let entry of entriesList || []) {
      const date = parseDateSafe(entry.entry_date); // evita deslocamento por timezone
      const monthIdx = date.getMonth();
      months[monthIdx].value += entry.value;
      months[monthIdx].rawEntries.push(entry);
    }

    // transforma em formato esperado pelo BarChart, definindo cor baseada na meta do mês
    const result = months.map((m) => {
      const goalObj = goalsList.find(g => g.month === m.monthIndex + 1);
      const goalValue = goalObj ? goalObj.value : null;

      let frontColor = '#4ECDC4'; // cor padrão quando não há meta
      if (goalValue || goalValue === 0) {
        const ratio = goalValue === 0 ? 0 : (m.value / goalValue);
        if (ratio >= 1) frontColor = '#FF6B6B';       // acima da meta
        else if (ratio >= 0.9) frontColor = '#FFC107';// próximo da meta
        else frontColor = '#00C851';                  // dentro da meta
      }

      // onPress será chamado pelo BarChart quando o usuário tocar na barra (gifted-charts aceita onPress por item)
      const onPress = () => {
        // prepara detalhes a partir das entradas reais do mês
        const entriesDetails = m.rawEntries.map((e) => {
          const d = new Date(e.entry_date);
          const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
          const desc = e.description ? ` - ${e.description}` : '';
          return `${dateStr} — R$ ${e.value.toFixed(2)}${desc}`;
        });

        // Se não houver entradas individuais, inclui uma linha com total
        const details = entriesDetails.length > 0 ? entriesDetails : [`Total: R$ ${m.value.toFixed(2)} (sem transações detalhadas)`];

        // Atualiza estado para abrir modal com os dados do mês clicado
        setSelectedDetail({
          type: 'month',
          title: `Gastos de ${MONTHS_PT[m.monthIndex]}`,
          value: `R$ ${m.value.toFixed(2)}`,
          color: frontColor,
          details,
          entries: m.rawEntries, // passa também o array original caso queira mais manipulação
          monthIndex: m.monthIndex + 1,
          goal: goalValue,
        });
        setIsDetailModalVisible(true);
        animatePulse(); // comentário: animação ao abrir modal
      };

      return {
        value: m.value,
        label: m.label,
        frontColor,
        onPress, // giftet-charts usa onPress por item para detectar cliques
        topLabelComponent: () => (
          <Text style={{ color: frontColor, fontSize: 10, marginBottom: 1 }}>{`R$ ${m.value}`}</Text>
        ),
        labelTextStyle: {
          color: '#ffffff',
          fontSize: 10
        }
      };
    });

    return result;
  };

  const fetchEntries = useCallback(async (goalsParam = goals) => {

    try {

      const { data } = await getEntries({
        user_id: user,
        // Corrige índices de mês (0-11). antes usava 1 e 12 causando intervalo errado.
        start_date: new Date(CURRENT_YEAR, 0, 1).toISOString().split('T')[0],
        end_date: new Date(CURRENT_YEAR, 11, 31).toISOString().split('T')[0],
        entry_type_id: 2
      })
      // salva raw (para agregar por categoria no Donut) e prepara dados do BarChart
      setRawEntries(data || []);
      setEntries(mapEntries(data, goalsParam))
    } catch {

    }
  }, [goals])

  // Atualiza os dados sempre que a tela ganha foco (navegação)
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const load = async () => {
        try {
          await fetchGoals();
          await fetchExpendidures();

          // animação das barras e fade-in
          const barStagger = Animated.stagger(
            100,
            barAnimations.map((anim) =>
              Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: false })
            )
          );
          const fadeIn = Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true });
          Animated.parallel([barStagger, fadeIn]).start();
        } catch (e) {
          // silencioso — erros já tratados nas funções chamadas
        }
      };

      load();

      return () => {
        mounted = false;
        // reset das animações para próxima entrada na tela (opcional)
        barAnimations.forEach(anim => anim.setValue(0));
        fadeAnim.setValue(0);
      };
    }, [fetchGoals, fetchExpendidures, barAnimations, fadeAnim])
  );


  const handleGoalUpdate = async () => {
    const newGoal = parseFloat(tempGoal);
    if (isNaN(newGoal) || newGoal <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido para a meta');
      return;
    }

    setShowGoalModal(false);
    setIsLoading(true);

    try {
      if (currentGoalId) {
        // Atualiza a meta existente (updateGoal)
        await updateGoal({
          month: CURRENT_MONTH,
          year: CURRENT_YEAR,
          value: newGoal,
          user_id: user,
          category_id: null,
        }, currentGoalId);
        Alert.alert('Sucesso', `Meta mensal atualizada para R$ ${newGoal.toFixed(2)}.`);
      } else {
        // Cria uma nova meta (createGoal)
        const newGoalResponse = await createGoal({
          month: CURRENT_MONTH,
          year: CURRENT_YEAR,
          value: newGoal,
          user_id: user,
          category_id: null,
        });
        setCurrentGoalId(newGoalResponse.id);
        Alert.alert('Sucesso', `Nova meta mensal criada: R$ ${newGoal.toFixed(2)}.`);
      }

      setMonthlyGoal(newGoal);
      // Rebusca metas e entradas para atualizar cores das barras
      await fetchGoals();

    } catch (error) {
      console.error('Erro ao atualizar/criar meta:', error);
      Alert.alert('Erro', 'Não foi possível salvar a meta no servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Funções Auxiliares (Mantidas) ---

  const animatePulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const getStatusText = (status) => {
    switch (status) {
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
        `Meta mensal: R$ ${monthlyGoal.toFixed(2)}`,
        `${goalDifference >= 0 ? 'Economia' : 'Excesso'}: R$ ${Math.abs(goalDifference).toFixed(2)}`,
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

    // Animação de escala rápida (Mantida)
    Animated.timing(pulseAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }).start(() => {
      Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }).start();
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

  // --- Componentes de Visualização (Usando goalProgressData) ---

  const SummaryCards = () => {
    // calcula totais mensais a partir das entries brutas (rawEntries)
    const monthlyTotals = new Array(12).fill(0);
    for (const e of rawEntries || []) {
      const d = parseDateSafe(e.entry_date);
      if (isNaN(d.getTime())) continue;
      const idx = d.getMonth(); // 0..11
      const val = Number(parseFloat(e.value ?? e.amount ?? 0) || 0);
      monthlyTotals[idx] += val;
    }

    const totalSpent = monthlyTotals.reduce((sum, v) => sum + v, 0);
    const monthsWithData = monthlyTotals.filter(v => v > 0).length;
    const averageSpent = monthsWithData > 0 ? (totalSpent / monthsWithData) : 0;
    const currentMonthTotal = monthlyTotals[CURRENT_MONTH - 1] || 0;
    const goalProgress = monthlyGoal ? ((currentMonthTotal / monthlyGoal) * 100).toFixed(1) : '0.0';
    // console.log(rawEntries)

    return (
      <View style={styles.summaryContainer}>
        <TouchableOpacity
          style={styles.summaryCard}
          onPress={() => setShowGoalModal(true)}
        >
          <Text style={styles.summaryLabel}>Meta Mensal</Text>
          <Text style={styles.summaryValue}>R$ {monthlyGoal.toFixed(0)}</Text>
          <Text style={styles.summarySubtext}>Toque para alterar</Text>
        </TouchableOpacity>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Mês Atual</Text>
          <Text style={[styles.summaryValue, { color: currentMonthTotal > monthlyGoal ? '#FF6B6B' : '#00C851' }]}>
            R$ {currentMonthTotal.toFixed(2)}
          </Text>
          <Text style={styles.summarySubtext}>{goalProgress}% da meta</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Média Mensal</Text>
          <Text style={styles.summaryValue}>R$ {averageSpent.toFixed(0)}</Text>
          <Text style={styles.summarySubtext}>{monthsWithData} meses com dados</Text>
        </View>
      </View>
    );
  };

  const maxWeekly = Math.max(...weeklyData.map(item => item.amount));
  const maxComparison = Math.max(...comparisonData.map((item) => item.amount));
  const maxAmount = Math.max(...monthlyData.map(item => item.amount));

  const MonthlyBarChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Gastos Mensais {CURRENT_YEAR}</Text>

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
      <Text style={styles.chartTitle}>Meta Mensal (R$ {monthlyGoal})</Text>
      <View style={styles.goalContainer}>
        <View style={styles.goalInfo}>
          <Text style={styles.goalTarget}>Gasto: R$ {currentMonthExp.toFixed(0)}</Text>
          <Text style={[
            styles.goalStatus,
            { color: ((currentMonthExp / monthlyGoal) * 100).toFixed(2) > 100 ? '#FF6B6B' : '#00C851' }
          ]}>
            {((currentMonthExp / monthlyGoal) * 100).toFixed(2) > 100
              ? `R$ ${(currentMonthExp - monthlyGoal).toFixed(0)} acima da meta`
              : `R$ ${(monthlyGoal - currentMonthExp).toFixed(0)} restante`
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
    // Agrupa entries brutas do mês atual por category_name
    const monthEntries = (rawEntries || []).filter(e => {
      try {
        return parseDateSafe(e.entry_date).getMonth() + 1 === CURRENT_MONTH;
      } catch {
        return false;
      }
    });

    // inicializa mapa das categorias conhecidas
    const catMap = {};
    categoryData.forEach(cat => {
      catMap[cat.name] = { name: cat.name, color: cat.color, total: 0, entries: [] };
    });
    // "Outros" bucket (caso alguma entry tenha categoria diferente)
    if (!catMap['Outros']) {
      catMap['Outros'] = { name: 'Outros', color: '#FECA57', total: 0, entries: [] };
    }

    for (const e of monthEntries) {
      const cname = e.category_name || 'Outros';
      if (catMap[cname]) {
        catMap[cname].total += parseFloat(e.value || 0);
        catMap[cname].entries.push(e);
      } else {
        catMap['Outros'].total += parseFloat(e.value || 0);
        catMap['Outros'].entries.push(e);
      }
    }

    const segments = Object.values(catMap).filter(s => s.total > 0);
    const total = segments.reduce((s, seg) => s + seg.total, 0);

    const pieData = segments.map((seg) => ({
      name: seg.name,
      population: Number(parseFloat(seg.total) || 0),
      color: seg.color,
      legendFontColor: '#ffffff',
      legendFontSize: 12,
    }));

    const openCategoryModal = (seg) => {
      // prepara detalhes e abre modal (usa o modal já existente)
      const details = (seg.entries || []).map(en => {
        const d = parseDateSafe(en.entry_date);
        const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        const desc = en.description ? ` - ${en.description}` : '';
        return `• ${dateStr} — R$ ${parseFloat(en.value).toFixed(2)}${desc}`;
      });

      setSelectedDetail({
        type: 'category',
        title: seg.name,
        value: `R$ ${seg.total.toFixed(2)}`,
        color: seg.color,
        details: details.length > 0 ? details : [`Total: R$ ${seg.total.toFixed(2)} (sem transações detalhadas)`],
        entries: seg.entries,
      });
      setIsDetailModalVisible(true);
      animatePulse();
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Categorias - {MONTHS_PT ? MONTHS_PT[CURRENT_MONTH - 1] : 'Mês Atual'}</Text>
        <View style={styles.categoryLegend}>
          {categoryData.map((item, index) => {
            const seg = segments.find(s => s.name === item.name);
            return (
              <TouchableOpacity
                key={index}
                style={styles.legendRow}
                onPress={() => seg && openCategoryModal(seg)}
              >
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendCategory}>{item.name}</Text>
                <Text style={styles.legendAmount}>R$ {seg ? seg.total.toFixed(0) : '0'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // --- Renderização Principal ---

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C851" />
        <Text style={styles.loadingText}>Carregando estatísticas e metas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea}>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <SummaryCards />
          <View style={{
            width: width * 0.95,
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5
          }}>
            <Text style={{ color: 'white', fontSize: 20 }}>Gastos Mensais {CURRENT_YEAR}</Text>
            <BarChart
              data={entries}
              width={width * 0.9}       // garante que o gráfico ocupe só a tela
              barWidth={20}             // ajuste conforme necessário
              spacing={9}              // distância entre barras
              barBorderTopLeftRadius={7}
              barBorderTopRightRadius={7}
              hideRules
              backgroundColor="#2a2a2a"
              hideYAxisText
              yAxisThickness={0}
              yAxisLabelWidth={0}
            />
          </View>
          <GoalProgressChart />
          <CategoryDonutChart />
        </ScrollView>

        {/* Modal de Detalhes (Mantido) */}
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
                <TouchableOpacity onPress={() => { setIsDetailModalVisible(false); setSelectedDetail(null); }}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <ScrollView style={styles.modalBodyScroll} contentContainerStyle={styles.modalBodyContent}>
                  {/* Cabeçalho do detalhe (mostra total/valor já preparado) */}
                  <Text style={styles.modalValue}>{selectedDetail?.value}</Text>
                  {selectedDetail?.status && (
                    <Text style={[styles.modalStatus, { color: selectedDetail.color }]}>
                      {selectedDetail.status}
                    </Text>
                  )}

                  {/* Se houver entries brutas, renderiza lista rolável detalhada */}
                  {selectedDetail?.entries && selectedDetail.entries.length > 0 ? (
                    selectedDetail.entries.map((en, idx) => {
                      const d = parseDateSafe(en.entry_date);
                      const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                      const title = en.title || en.titulo || en.description || en.category_name || 'Sem título';
                      const val = Number(parseFloat(en.value ?? en.amount ?? 0) || 0);
                      const isDespesa = Number(en.entry_type_id ?? en.type ?? 2) === 2;
                      const valueColor = isDespesa ? '#FF6B6B' : '#00C851';

                      return (
                        <View key={`entry-${idx}`} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                          <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={{ color: '#fff', fontWeight: '600' }}>{title}</Text>
                            <Text style={{ color: '#999', fontSize: 12 }}>{isDespesa ? 'Despesa' : 'Receita'} • {dateStr}</Text>
                          </View>
                          <Text style={{ color: valueColor, fontWeight: '700' }}>R$ {val.toFixed(2)}</Text>
                        </View>
                      );
                    })
                  ) : (
                    // fallback para detalhes em texto
                    selectedDetail?.details?.map((detail, index) => (
                      <Text key={index} style={styles.modalDetail}>• {detail}</Text>
                    ))
                  )}
                </ScrollView>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Modal de Definir Meta (Integrado) */}
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
                <Text style={styles.goalLabel}>Meta atual: R$ {monthlyGoal.toFixed(2)}</Text>

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

// --- Estilos (Styles) ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    paddingBottom: 0,
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
    fontSize: 20,
    color: '#cccccc',
    marginBottom: 5,
    fontWeight: 'bold'
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
  modalBodyScroll: {
    maxHeight: height * 0.55, // limita altura para permitir scroll dentro do modal
    paddingTop: 10,
  },
  modalBodyContent: {
    paddingBottom: 20,
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
    paddingHorizontal: 0,
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
    color: '#ccc9c9ff',
  },
  // Modal da Meta
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00C851',
    marginTop: 10,
    fontSize: 16,
  },
});

export default StatisticsScreen;