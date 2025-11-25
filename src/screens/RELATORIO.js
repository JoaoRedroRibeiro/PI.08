import React, { useState, useEffect, useCallback } from 'react';
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
import { getEntries, createEntry } from '../core/util/entries';
import { getCategories } from '../core/util/categories';

const { width, height } = Dimensions.get('window');
const CURRENT_USER = 1

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
    category_id: null, // id da categoria selecionada
    entry_type_id: 2, // 2 = despesa (default)
    date: new Date().toLocaleDateString('pt-BR'),
  });

  // Gerar anos dinamicamente baseado no ano atual
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // financialData agora é carregado dinamicamente via getEntries
  const [financialData, setFinancialData] = useState({});
  const [categories, setCategories] = useState([]); // categorias da API
  const CURRENT_USER_ID = 1; // ajustar conforme autenticação real

  // Mapeamento local de nomes de categoria -> ícone Ionicons
  // Ajuste os nomes conforme suas categorias reais
  const ICON_BY_CATEGORY = {
    'Alimentação': 'fast-food',
    'Transporte': 'car',
    'Lazer': 'game-controller',
    'Saúde': 'medkit',
    'Saude': 'medkit',
    'Casa': 'home',
    'Contas': 'receipt',
    'Receita': 'cash',
    'Outros': 'pricetag',
    'Educação': 'school',
    'Entretenimento': 'film',
    'Roupas': 'shirt',
  };

  // Helpers para cor e contraste
  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) hex = '#00C851';
    let h = String(hex).replace('#', '').trim();
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (h.length !== 6) return `rgba(0,200,81,${alpha})`;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const hexToRgbObj = (hex) => {
    if (!hex) hex = '#000000';
    let h = String(hex).replace('#', '').trim();
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (h.length !== 6) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  };

  const getContrastingTextColor = (hex) => {
    const { r, g, b } = hexToRgbObj(hex);
    // luminance aproximada
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.65 ? '#000' : '#fff';
  };

  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  const buildEmptyYear = useCallback(() => {
    const monthsTemplate = {};
    months.forEach((m) => {
      // total = despesas (mantido para somatório anual)
      // receitasTotal = soma de receitas do mês
      monthsTemplate[m] = { total: 0, receitasTotal: 0, gastos: [] };
    });
    return monthsTemplate;
  }, []);

  // Função utilitária para parse seguro de datas (evita problemas com timezone / formatos)
  const parseDateSafe = (dateStr) => {
    if (!dateStr) return new Date();
    const onlyDateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
    if (onlyDateMatch) {
      const y = parseInt(onlyDateMatch[1], 10);
      const m = parseInt(onlyDateMatch[2], 10) - 1;
      const d = parseInt(onlyDateMatch[3], 10);
      return new Date(y, m, d);
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date();
    return d;
  };

  const fetchFinancialData = useCallback(async (year) => {
    try {
      const start_date = new Date(year, 0, 1).toISOString().split('T')[0];
      const end_date = new Date(year, 11, 31).toISOString().split('T')[0];

      // getEntries pode retornar diretamente um array ou um objeto { data: [...] } (ou mesmo com aninhamento)
      const resp = await getEntries({
        user_id: CURRENT_USER_ID,
        start_date,
        end_date,
        // entry_type_id: 2 // pedimos despesas, mas garantimos filtro abaixo
      });

      let entries = resp;
      if (!Array.isArray(entries)) {
        entries = entries?.data ?? entries;
        if (!Array.isArray(entries) && entries?.data) entries = entries.data;
      }
      entries = Array.isArray(entries) ? entries : [];

      // Agora trazemos todos os tipos (receitas e despesas).
      // entry_type_id: 1 = receita, 2 = despesa

      const yearData = buildEmptyYear();

      entries.forEach((e) => {
        const d = parseDateSafe(e.entry_date);
        if (isNaN(d.getTime())) return;
        const monthKey = months[d.getMonth()];
        const value = Number(parseFloat(e.value ?? e.amount ?? 0) || 0);
        const category = e.category_name || e.category || 'Outros';
        const title = e.title || category || 'Sem título';
        const day = String(d.getDate()).padStart(2, '0');
        const description = e.description || ''
        // armazena a entry com title (solicitado) e tipo
        const entryObj = {
          titulo: title,
          categoria: category,
          valor: value,
          data: `${day}/${String(d.getMonth() + 1).padStart(2, '0')}`,
          type: Number(e.entry_type_id),
          descricao: description
        };
        yearData[monthKey].gastos.push(entryObj);

        if (Number(e.entry_type_id) === 2) {
          // despesa
          yearData[monthKey].total += value;
        } else if (Number(e.entry_type_id) === 1) {
          // receita
          yearData[monthKey].receitasTotal += value;
        }
      });

      setFinancialData((prev) => ({ ...prev, [year]: yearData }));
    } catch (err) {
      // Se a API retornar 404 (nenhuma entry no intervalo), tratar como vazio sem exibir erro.
      const status = err?.response?.status;
      if (status === 404) {
        setFinancialData((prev) => ({ ...prev, [year]: buildEmptyYear() }));
        return;
      }
      // Para outros erros, logue para debug e também popula com estrutura vazia
      console.error('Erro ao buscar entries:', err);
      setFinancialData((prev) => ({ ...prev, [year]: buildEmptyYear() }));
    }
  }, [buildEmptyYear]);

  useEffect(() => {
    // carrega dados do ano inicial e mantém ao trocar selectedYear
    fetchFinancialData(selectedYear);
  }, [selectedYear, fetchFinancialData]);

  const getMonthData = (month) => {
    return (financialData[selectedYear] && financialData[selectedYear][month]) || { total: 0, gastos: [] };
  };

  const getTotalYear = () => {
    const yearData = financialData[selectedYear] || {};
    return Object.values(yearData).reduce((sum, month) => sum + (month.total || 0), 0);
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

  // carrega categorias da API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getCategories();
        if (!mounted) return;
        // espera-se que cada item tenha id, name/title e eventualmente color
        setCategories(Array.isArray(data) ? data : (data?.data ?? []));
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setCategories([]); // fallback
      }
    })();
    return () => { mounted = false; };
  }, []);

  // helper: converte "DD/MM/YYYY" -> "YYYY-MM-DD"
  const formatDateForApi = (ddmmyyyy) => {
    if (!ddmmyyyy) return new Date().toISOString().split('T')[0];
    const parts = ddmmyyyy.split('/');
    if (parts.length !== 3) return new Date().toISOString().split('T')[0];
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
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

    // valida categoria selecionada
    if (!manualExpense.category_id) {
      Alert.alert('Erro', 'Selecione uma categoria');
      return;
    }

    (async () => {
      try {
        // utiliza data completa (DD/MM/YYYY) do campo date
        const entryDate = formatDateForApi(manualExpense.date);
        const cat = categories.find(c => c.id === manualExpense.category_id);
        const categoryName = cat?.name ?? cat?.title ?? 'Categoria';
        const tipo = Number(manualExpense.entry_type_id) === 2 ? 'despesa' : 'receita';
        const title = `Lançamento manual de ${tipo}`;

        await createEntry({
          title,
          entry_date: entryDate,
          description: manualExpense.description || '',
          value: amount,
          entry_type_id: Number(manualExpense.entry_type_id),
          category_id: manualExpense.category_id,
          user_id: CURRENT_USER_ID
        }, CURRENT_USER_ID);

        // atualiza dados do relatório para o ano selecionado
        await fetchFinancialData(selectedYear);

        Alert.alert('Sucesso', `Lançamento salvo: R$ ${amount.toFixed(2)}`);
        // reset form e fecha modal
        setShowManualEntry(false);
        setManualExpense({
          description: '',
          amount: '',
          category_id: null,
          entry_type_id: 2,
          date: new Date().toLocaleDateString('pt-BR'),
        });
      } catch (err) {
        console.error('Erro ao criar entry:', err);
        Alert.alert('Erro', 'Não foi possível salvar o lançamento. Tente novamente.');
      }
    })();
  };

  const resetManualForm = () => {
    setManualExpense({
      description: '',
      amount: '',
      category_id: null,
      entry_type_id: 2,
      date: new Date().toLocaleDateString('pt-BR'),
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
        <Text style={styles.monthTotal}>Despesas: {'\n'}R$ {monthData.total.toFixed(2)}</Text>
        <Text style={[styles.monthGastos, { marginTop: 4 }]}>Receitas: R$ {(monthData.receitasTotal || 0).toFixed(2)}</Text>
        <Text style={styles.monthGastos}>{monthData.gastos.length} lançamentos</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

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
      <View
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowAIModal(!showAIModal)}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#00C851",
            justifyContent: "center",
            alignItems: "center",
            elevation: 5, // Android sombra
            shadowColor: "#000", // iOS sombra
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
          }}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
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

            {getMonthData(selectedMonth).gastos.map((gasto, index) => {
              const isDespesa = Number(gasto.type) === 2;
              const valueColor = isDespesa ? '#FF6B6B' : '#00C851';
              return (
                <View key={index} style={styles.gastoItem}>
                  <View style={styles.gastoInfo}>
                    {/* mostra o título e abaixo se é Despesa/Receita */}
                    <Text style={styles.gastoCategoria}>{gasto.titulo || gasto.categoria}</Text>
                    <Text style={{ color: 'white' }}>Categoria: {gasto.categoria}</Text>
                    <Text style={[styles.gastoTipo, { color: valueColor }]}>{isDespesa ? 'Despesa' : 'Receita'}</Text>
                    <Text style={styles.gastoData}>{gasto.data}/{selectedYear}</Text>
                    <Text style={{ color: 'white' }}>{gasto.descricao}</Text>
                  </View>
                  <Text style={[styles.gastoValor, { color: valueColor }]}>R$ {gasto.valor.toFixed(2)}</Text>
                </View>
              )
            })}
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
                  navigation.navigate('Câmera');
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
                onChangeText={(text) => setManualExpense({ ...manualExpense, description: text })}
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
                onChangeText={(text) => setManualExpense({ ...manualExpense, amount: text })}
                placeholder="0,00"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.manualFormGroup}>
              <Text style={styles.manualFormLabel}>Data</Text>
              <TextInput
                style={styles.manualFormInput}
                value={manualExpense.date}
                onChangeText={(text) => setManualExpense({ ...manualExpense, date: text })}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#666"
                maxLength={10}
              />
            </View>

            {/* seleção de tipo (Despesa / Receita) */}
            <View style={styles.manualFormGroup}>
              <Text style={styles.manualFormLabel}>Tipo de lançamento</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    manualExpense.entry_type_id === 2 && styles.typeButtonActiveExpense
                  ]}
                  onPress={() => setManualExpense({ ...manualExpense, entry_type_id: 2 })}
                >
                  <Text style={manualExpense.entry_type_id === 2 ? styles.typeTextActive : styles.typeText}>Despesa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    manualExpense.entry_type_id === 1 && styles.typeButtonActiveIncome
                  ]}
                  onPress={() => setManualExpense({ ...manualExpense, entry_type_id: 1 })}
                >
                  <Text style={manualExpense.entry_type_id === 1 ? styles.typeTextActive : styles.typeText}>Receita</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.manualFormGroup}>
              <Text style={styles.manualFormLabel}>Categoria</Text>
              <View style={styles.categoryGrid}>
                {(categories.length > 0 ? categories : [
                  { id: 'alimentacao', name: 'Alimentação', color: '#FF6B6B' },
                  { id: 'transporte', name: 'Transporte', color: '#4ECDC4' },
                  { id: 'outros', name: 'Outros', color: '#5F27CD' },
                  { id: 'entretenimento', name: 'Entretenimento', color: '#5F27CD' },
                  { id: 'roupas', name: 'Roupas', color: '#5F27CD' },
                  { id: 'educacao', name: 'Educação', color: '#5F27CD' }
                ]).map((cat) => {
                  // garante string e fallback de cor
                  const rawColor = (cat.color ?? cat.hex ?? cat.color_code ?? '#00C851').toString();
                  const catColor = rawColor.startsWith('#') ? rawColor : (`#${rawColor.replace(/^#*/, '')}`);
                  const selected = String(manualExpense.category_id) === String(cat.id);
                  const bgColor = selected ? hexToRgba(catColor, 0.12) : '#2a2a2a';
                  const borderColor = selected ? catColor : '#333333';
                  const textColor = selected ? getContrastingTextColor(catColor) : '#666';
                  const iconName = ICON_BY_CATEGORY[cat.name] || ICON_BY_CATEGORY[cat.title] || 'pricetag';

                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryCard,
                        { borderColor: borderColor, backgroundColor: bgColor }
                      ]}
                      onPress={() => setManualExpense({ ...manualExpense, category_id: cat.id })}
                    >
                      <Ionicons name={iconName} size={28} color={catColor} />
                      <Text style={[styles.categoryCardText, { color: textColor }]}>
                        {cat.name ?? cat.title ?? cat.key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
    borderWidth: 1,
    borderColor: '#00C851',
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
  gastoTipo: {
    color: '#999',
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'capitalize'
  },
  gastoData: {
    color: '#999',
    fontSize: 12,
  },
  gastoValor: {
    color: '#00C851', // default, sobrescrito inline para despesa/receita
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
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10, // se sua versão RN não suportar 'gap', pode usar marginRight nos botões
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#2a2a2a',
  },
  typeButtonActiveExpense: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  typeButtonActiveIncome: {
    backgroundColor: '#00C851',
    borderColor: '#00C851',
  },
  typeText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default RELATORIO;