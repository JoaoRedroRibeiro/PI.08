const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    paddingTop: 25, // Espaço para não conflitar com notificações
    paddingBottom: 15, // Espaço para não conflitar com botões do celular
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
});

export default StatisticsScreen;