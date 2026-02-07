/**
 * Stock Event-Driven Investment Engine
 *
 * 整合Situation Monitor的所有功能，用于事件驱动的股票投资分析
 */

import type {
  NewsItem,
  CorrelationResults,
  NarrativeResults,
  MainCharacterResults,
  MarketsState,
  CustomMonitor,
  MonitorMatch
} from './types';

import { StockConfig, SectorMapping, TagMapping } from './config';

// ============================================================================
// 交易信号类型定义
// ============================================================================

export interface TradeSignal {
  id: string;
  timestamp: number;
  type: 'BUY' | 'SELL' | 'HEDGE' | 'REDUCE' | 'WATCH' | 'ROTATE' | 'MONITOR_ALERT' | 'MONITOR' | 'OVERWEIGHT' | 'UNDERWEIGHT' | 'REPOSITION';

  // 目标资产
  tickers?: string[];
  sectors?: string[];
  instruments?: string[];

  // 信号来源
  source: 'CORRELATION' | 'NARRATIVE' | 'CHARACTER' | 'MONITOR' | 'MARKET_DIVERGENCE';

  // 信号详情
  reason: string;
  confidence: number;  // 0-1
  timeHorizon?: string;

  // 触发数据
  triggerData: {
    newsItems?: NewsItem[];
    patterns?: string[];
    keywords?: string[];
    region?: string;
    topics?: string[];
  };

  // 建议
  recommendation?: string;
  notes?: string;
}

export interface InvestmentContext {
  // 当前持仓
  holdings: {
    ticker: string;
    shares: number;
    cost_basis: number;
  }[];

  // 风险偏好
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';

  // 投资组合目标
  targetSectors?: Record<string, number>;  // sector -> 目标权重%
}

// ============================================================================
// 事件驱动投资引擎
// ============================================================================

export class StockEventEngine {
  private config: StockConfig;
  private signals: TradeSignal[] = [];
  private signalHistory: TradeSignal[] = [];

  constructor(config: StockConfig) {
    this.config = config;
  }

  /**
   * 主分析函数 - 整合所有数据源生成交易信号
   */
  async analyze(data: {
    news: NewsItem[];
    correlations: CorrelationResults | null;
    narratives: NarrativeResults | null;
    mainCharacter: MainCharacterResults | null;
    markets: MarketsState;
    monitorMatches: MonitorMatch[];
    context?: InvestmentContext;
  }): Promise<TradeSignal[]> {
    this.signals = [];

    // 1. 分析关联模式
    if (data.correlations) {
      const correlationSignals = this.analyzeCorrelations(data.correlations, data.markets);
      this.signals.push(...correlationSignals);
    }

    // 2. 分析叙事传播
    if (data.narratives) {
      const narrativeSignals = this.analyzeNarratives(data.narratives);
      this.signals.push(...narrativeSignals);
    }

    // 3. 分析主角影响
    if (data.mainCharacter) {
      const characterSignals = this.analyzeMainCharacter(data.mainCharacter);
      this.signals.push(...characterSignals);
    }

    // 4. 分析自定义监控器匹配
    if (data.monitorMatches.length > 0) {
      const monitorSignals = this.analyzeMonitorMatches(data.monitorMatches);
      this.signals.push(...monitorSignals);
    }

    // 5. 分析新闻-市场分歧
    const divergenceSignals = this.analyzeMarketDivergence(data.news, data.markets);
    this.signals.push(...divergenceSignals);

    // 6. 根据投资组合上下文过滤和调整信号
    if (data.context) {
      this.signals = this.filterByContext(this.signals, data.context);
    }

    // 7. 按置信度排序
    this.signals.sort((a, b) => b.confidence - a.confidence);

    // 8. 保存到历史
    this.signalHistory.push(...this.signals);

    return this.signals;
  }

  /**
   * 1. 关联分析 → 交易信号
   */
  private analyzeCorrelations(
    correlations: CorrelationResults,
    markets: MarketsState
  ): TradeSignal[] {
    const signals: TradeSignal[] = [];

    // 新兴模式分析
    for (const pattern of correlations.emergingPatterns) {
      if (pattern.level === 'high' || pattern.level === 'elevated') {
        const mapping = this.config.patternToSectorMapping[pattern.id];
        if (mapping) {
          signals.push({
            id: `correlation-${pattern.id}-${Date.now()}`,
            timestamp: Date.now(),
            type: mapping.action,
            sectors: mapping.sectors,
            source: 'CORRELATION',
            reason: `${pattern.name} 模式 (${pattern.level}): ${pattern.count}篇报道来自${pattern.sources.length}个来源`,
            confidence: this.calculatePatternConfidence(pattern),
            timeHorizon: mapping.timeHorizon || '24-48小时',
            triggerData: {
              newsItems: pattern.headlines.map(h => ({
                id: `${h.link}`,
                title: h.title,
                link: h.link,
                source: h.source,
                timestamp: Date.now(),
                category: 'finance'
              })),
              patterns: [pattern.id]
            },
            recommendation: mapping.recommendation
          });
        }
      }
    }

    // 动量信号分析
    for (const momentum of correlations.momentumSignals) {
      if (momentum.momentum === 'surging' || momentum.momentum === 'rising') {
        const mapping = this.config.patternToSectorMapping[momentum.id];
        if (mapping) {
          signals.push({
            id: `momentum-${momentum.id}-${Date.now()}`,
            timestamp: Date.now(),
            type: mapping.action,
            sectors: mapping.sectors,
            source: 'CORRELATION',
            reason: `${momentum.name} 动量${momentum.momentum === 'surging' ? '激增' : '上升'}: 当前${momentum.current}次提及, 增长${momentum.delta}`,
            confidence: this.calculateMomentumConfidence(momentum),
            timeHorizon: '12-36小时',
            triggerData: {
              newsItems: momentum.headlines.map(h => ({
                id: `${h.link}`,
                title: h.title,
                link: h.link,
                source: h.source,
                timestamp: Date.now(),
                category: 'finance'
              })),
              patterns: [momentum.id]
            }
          });
        }
      }
    }

    // 跨来源关联分析
    for (const cross of correlations.crossSourceCorrelations) {
      if (cross.level === 'high' && cross.sourceCount >= 5) {
        signals.push({
          id: `cross-source-${cross.id}-${Date.now()}`,
          timestamp: Date.now(),
          type: 'WATCH',
          source: 'CORRELATION',
          reason: `${cross.name}: ${cross.sourceCount}个独立来源报道 - 主流共识形成`,
          confidence: Math.min(0.95, cross.sourceCount * 0.15),
          triggerData: {
            patterns: [cross.id]
          },
          notes: `来源: ${cross.sources.join(', ')}`
        });
      }
    }

    // 预测信号分析
    for (const prediction of correlations.predictiveSignals) {
      if (prediction.level === 'high' && prediction.confidence >= 70) {
        signals.push({
          id: `prediction-${prediction.id}-${Date.now()}`,
          timestamp: Date.now(),
          type: 'WATCH',
          source: 'CORRELATION',
          reason: `预测: ${prediction.prediction}`,
          confidence: prediction.confidence / 100,
          timeHorizon: '24-72小时',
          triggerData: {
            patterns: [prediction.id]
          },
          notes: `置信度: ${prediction.confidence}%, 评分: ${prediction.score}`
        });
      }
    }

    return signals;
  }

  /**
   * 2. 叙事分析 → 交易信号
   */
  private analyzeNarratives(narratives: NarrativeResults): TradeSignal[] {
    const signals: TradeSignal[] = [];

    // 边缘到主流的叙事
    for (const crossover of narratives.fringeToMainstream) {
      if (crossover.crossoverLevel >= 0.4) {
        const mapping = this.config.narrativeToSectorMapping[crossover.id];
        if (mapping) {
          signals.push({
            id: `narrative-crossover-${crossover.id}-${Date.now()}`,
            timestamp: Date.now(),
            type: mapping.action,
            sectors: mapping.sectors,
            tickers: mapping.tickers,
            source: 'NARRATIVE',
            reason: `${crossover.name} 叙事跨越到主流 (${Math.round(crossover.crossoverLevel * 100)}%主流报道)`,
            confidence: Math.min(0.90, crossover.crossoverLevel + 0.2),
            timeHorizon: mapping.timeHorizon || '1-4周',
            triggerData: {
              patterns: [crossover.id],
              keywords: crossover.keywords
            },
            recommendation: mapping.recommendation,
            notes: `边缘媒体: ${crossover.fringeCount}, 主流媒体: ${crossover.mainstreamCount}`
          });
        }
      }
    }

    // 新兴边缘叙事
    for (const emerging of narratives.emergingFringe) {
      if (emerging.status === 'spreading' || emerging.status === 'viral') {
        signals.push({
          id: `narrative-emerging-${emerging.id}-${Date.now()}`,
          timestamp: Date.now(),
          type: 'WATCH',
          source: 'NARRATIVE',
          reason: `${emerging.name} 叙事在另类媒体${emerging.status === 'viral' ? '病毒式传播' : '扩散中'}`,
          confidence: emerging.status === 'viral' ? 0.60 : 0.45,
          timeHorizon: '2-8周 (监控主流化)',
          triggerData: {
            patterns: [emerging.id],
            keywords: emerging.keywords
          },
          notes: `边缘报道: ${emerging.fringeCount}篇`
        });
      }
    }

    return signals;
  }

  /**
   * 3. 主角分析 → 交易信号
   */
  private analyzeMainCharacter(mainChar: MainCharacterResults): TradeSignal[] {
    const signals: TradeSignal[] = [];
    const topChar = mainChar.topCharacter;

    if (!topChar || topChar.count < 10) return signals;

    const mapping = this.config.characterToTickerMapping[topChar.name];
    if (mapping) {
      const dominance = this.calculateDominance(mainChar);

      signals.push({
        id: `character-${topChar.name.replace(/\s+/g, '-')}-${Date.now()}`,
        timestamp: Date.now(),
        type: dominance > 50 ? 'HEDGE' : 'MONITOR',
        tickers: mapping.tickers,
        sectors: mapping.sectors,
        source: 'CHARACTER',
        reason: `${topChar.name} 主导新闻周期 (${topChar.count}次提及, 主导度${dominance}%)`,
        confidence: Math.min(0.85, topChar.count * 0.05),
        timeHorizon: '24-72小时',
        triggerData: {
          patterns: [topChar.name]
        },
        recommendation: dominance > 50
          ? `${topChar.name}主导新闻 - 考虑对冲相关仓位波动风险`
          : `监控${topChar.name}相关消息对市场的影响`
      });
    }

    return signals;
  }

  /**
   * 4. 自定义监控器匹配 → 交易信号
   */
  private analyzeMonitorMatches(matches: MonitorMatch[]): TradeSignal[] {
    const signals: TradeSignal[] = [];

    // 按监控器分组
    const groupedMatches: Record<string, MonitorMatch[]> = {};
    for (const match of matches) {
      const monitorName = match.monitor.name;
      if (!groupedMatches[monitorName]) {
        groupedMatches[monitorName] = [];
      }
      groupedMatches[monitorName].push(match);
    }

    // 为每个监控器生成信号
    for (const [monitorName, monitorMatches] of Object.entries(groupedMatches)) {
      const alertMatches = monitorMatches.filter(m => m.item.isAlert);
      const hasAlerts = alertMatches.length > 0;

      // 查找配置映射
      const mapping = this.config.monitorToSectorMapping[monitorName];

      signals.push({
        id: `monitor-${monitorName.replace(/\s+/g, '-')}-${Date.now()}`,
        timestamp: Date.now(),
        type: hasAlerts ? (mapping?.action || 'WATCH') : 'WATCH',
        sectors: mapping?.sectors,
        tickers: mapping?.tickers,
        source: 'MONITOR',
        reason: `监控器"${monitorName}"触发: ${monitorMatches.length}条匹配${hasAlerts ? `, ${alertMatches.length}条警报` : ''}`,
        confidence: hasAlerts ? 0.80 : 0.60,
        timeHorizon: mapping?.timeHorizon || '立即-48小时',
        triggerData: {
          newsItems: monitorMatches.map(m => m.item),
          keywords: Array.from(new Set(monitorMatches.flatMap(m => m.matchedKeywords))),
          region: monitorMatches[0]?.item.region,
          topics: Array.from(new Set(monitorMatches.flatMap(m => m.item.topics || [])))
        },
        recommendation: mapping?.recommendation || '监控相关资产价格动向',
        notes: hasAlerts ? '包含警报关键词 - 高优先级' : undefined
      });
    }

    return signals;
  }

  /**
   * 5. 新闻-市场分歧分析
   */
  private analyzeMarketDivergence(news: NewsItem[], markets: MarketsState): TradeSignal[] {
    const signals: TradeSignal[] = [];

    // 示例: 如果关税新闻很多，但材料/工业板块下跌 → 可能超卖
    const tariffNews = news.filter(n =>
      n.title.toLowerCase().includes('tariff') ||
      n.title.toLowerCase().includes('trade war')
    );

    if (tariffNews.length >= 5) {
      const materials = markets.sectors.items.find(s => s.symbol === 'XLB');
      const industrial = markets.sectors.items.find(s => s.symbol === 'XLI');

      if (materials && materials.changePercent < -2 && industrial && industrial.changePercent < -2) {
        signals.push({
          id: `divergence-tariff-${Date.now()}`,
          timestamp: Date.now(),
          type: 'BUY',
          sectors: ['XLB', 'XLI'],
          source: 'MARKET_DIVERGENCE',
          reason: `关税新闻高涨(${tariffNews.length}篇)，但材料(${materials.changePercent.toFixed(2)}%)和工业(${industrial.changePercent.toFixed(2)}%)板块下跌 - 可能超卖`,
          confidence: 0.70,
          timeHorizon: '反弹后1-2天',
          triggerData: {
            newsItems: tariffNews
          },
          recommendation: '等待板块反弹+1-2%时入场，设置止损'
        });
      }
    }

    // VIX分歧
    const vix = markets.commodities.items.find(i => i.symbol === '^VIX');
    const alertNews = news.filter(n => n.isAlert);

    if (vix && vix.changePercent > 10 && alertNews.length >= 3) {
      signals.push({
        id: `divergence-vix-${Date.now()}`,
        timestamp: Date.now(),
        type: 'HEDGE',
        instruments: ['VXX', 'UVXY', 'SQQQ'],
        source: 'MARKET_DIVERGENCE',
        reason: `VIX飙升${vix.changePercent.toFixed(2)}% + ${alertNews.length}条警报新闻 - 市场恐慌信号`,
        confidence: 0.85,
        timeHorizon: '24-72小时',
        triggerData: {
          newsItems: alertNews
        },
        recommendation: '考虑对冲工具或减少风险敞口'
      });
    }

    return signals;
  }

  /**
   * 根据投资组合上下文过滤信号
   */
  private filterByContext(signals: TradeSignal[], context: InvestmentContext): TradeSignal[] {
    // 示例逻辑: 保守型投资者只看WATCH和HEDGE信号
    if (context.riskTolerance === 'conservative') {
      return signals.filter(s => s.type === 'WATCH' || s.type === 'HEDGE');
    }

    // 示例逻辑: 激进型投资者优先BUY/SELL信号
    if (context.riskTolerance === 'aggressive') {
      return signals.filter(s => s.type === 'BUY' || s.type === 'SELL' || s.type === 'ROTATE');
    }

    return signals;
  }

  /**
   * 辅助函数: 计算模式置信度
   */
  private calculatePatternConfidence(pattern: any): number {
    let confidence = 0.5;
    confidence += pattern.count * 0.05;  // 每提及一次+5%
    confidence += pattern.sources.length * 0.08;  // 每个来源+8%

    if (pattern.level === 'high') confidence += 0.15;
    if (pattern.level === 'elevated') confidence += 0.10;

    return Math.min(0.95, confidence);
  }

  /**
   * 辅助函数: 计算动量置信度
   */
  private calculateMomentumConfidence(momentum: any): number {
    let confidence = 0.5;
    confidence += momentum.current * 0.04;
    confidence += momentum.delta * 0.08;

    if (momentum.momentum === 'surging') confidence += 0.20;
    if (momentum.momentum === 'rising') confidence += 0.10;

    return Math.min(0.95, confidence);
  }

  /**
   * 辅助函数: 计算主导度
   */
  private calculateDominance(results: MainCharacterResults): number {
    if (results.characters.length < 2) return 100;

    const top = results.characters[0];
    const second = results.characters[1];

    if (!top || top.count === 0) return 0;
    if (!second || second.count === 0) return 100;

    const ratio = top.count / second.count;
    return Math.min(100, Math.round((ratio - 1) * 100));
  }

  /**
   * 获取当前信号
   */
  getSignals(): TradeSignal[] {
    return this.signals;
  }

  /**
   * 获取信号历史
   */
  getSignalHistory(): TradeSignal[] {
    return this.signalHistory;
  }

  /**
   * 按类型过滤信号
   */
  getSignalsByType(type: TradeSignal['type']): TradeSignal[] {
    return this.signals.filter(s => s.type === type);
  }

  /**
   * 按板块过滤信号
   */
  getSignalsBySector(sector: string): TradeSignal[] {
    return this.signals.filter(s => s.sectors?.includes(sector));
  }

  /**
   * 获取高置信度信号 (>= 0.75)
   */
  getHighConfidenceSignals(): TradeSignal[] {
    return this.signals.filter(s => s.confidence >= 0.75);
  }
}
