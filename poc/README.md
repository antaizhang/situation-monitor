# POC 目录

本目录包含基于 Situation Monitor 功能构建的概念验证（Proof of Concept）项目。

## 项目列表

### 1. event-driven-investment - 事件驱动股票投资系统

**位置**: `poc/event-driven-investment/`

**功能**: 整合 Situation Monitor 的所有核心功能，构建完整的事件驱动股票投资分析系统

**核心能力**:
- ✅ 实时新闻聚合与分析（GDELT + 30+ RSS源）
- ✅ 自动关键词/地区/话题检测
- ✅ 关联模式识别（跨来源重复主题）
- ✅ 叙事追踪（边缘→主流传播）
- ✅ 主角分析（人物影响力）
- ✅ 市场数据集成（12板块 + 6商品 + 加密货币）
- ✅ 自定义监控器
- ✅ 交易信号自动生成

**信号类型**:
- BUY/SELL: 买入/卖出
- HEDGE: 对冲
- REDUCE: 减仓
- WATCH: 监控
- ROTATE: 板块轮动
- MONITOR: 持续监控
- OVERWEIGHT/UNDERWEIGHT: 超配/低配
- REPOSITION: 重新定位

**配置系统**:
- 20+ 新闻模式 → 板块映射
- 15+ 叙事模式 → 交易策略
- 15+ 关键人物 → 相关资产
- 7+ 自定义监控器模板
- 100+ 股票标签系统
- 12+ 板块标签系统

**文档**:
- 📄 [FEATURES.md](./event-driven-investment/FEATURES.md) - 详细功能文档（8000+行）
- 📄 [README.md](./event-driven-investment/README.md) - 完整使用说明
- 💻 [example.ts](./event-driven-investment/example.ts) - 可运行示例

**代码统计**:
- 9 个文件
- 3500+ 行代码
- TypeScript 完整类型支持
- 零运行时错误

**快速开始**:
```bash
cd poc/event-driven-investment
npm install
npm run example
```

**集成到 dataAnalyse**:
```bash
# 复制到项目
cp -r poc/event-driven-investment /path/to/dataAnalyse/src/modules/

# 使用
import { StockEventEngine } from './modules/event-driven-investment/StockEventEngine';
import { defaultStockConfig } from './modules/event-driven-investment/config';

const engine = new StockEventEngine(defaultStockConfig);
const signals = await engine.analyze({ news, correlations, narratives, markets, ... });
```

**应用场景**:
1. **日内交易**: 高频监控，快速响应事件
2. **趋势跟随**: 叙事驱动的中长期投资
3. **风险管理**: 对冲和防御性配置
4. **板块轮动**: 基于关联模式的动态调整
5. **事件响应**: 自动化事件驱动交易

**技术特点**:
- ✅ Framework-agnostic（框架无关）
- ✅ TypeScript 严格类型
- ✅ 可配置映射系统
- ✅ 置信度评分
- ✅ 时间范围预测
- ✅ 多维度信号过滤
- ✅ 上下文感知（风险偏好、持仓等）

**示例输出**:
```
================================================================================
💡 交易建议总结
================================================================================

✅ 买入机会:
   • XLB, XLI - 关税新闻高涨，但材料和工业板块下跌 - 可能超卖

❌ 卖出/减仓建议:
   • XLB, XLI, XLF - Tariffs 模式 (high): 8篇报道来自5个来源
   • SMH, XLK - China Tensions 模式 (elevated): 5篇报道来自3个来源

🛡️ 对冲建议:
   • GLD, IAU, DXY_puts - Dollar Collapse 叙事跨越到主流 (37.5%主流报道)
   • VXX, UVXY, SQQQ - VIX飙升14.20% + 3条警报新闻

⚠️ 当前市场风险
   • 3 条警报级别新闻
   • VIX飙升 14.2%
   • 3 个板块跌幅超过2%
```

---

## 文件结构

```
poc/
├── README.md                           # 本文件
└── event-driven-investment/            # 事件驱动投资POC
    ├── FEATURES.md                     # 详细功能文档
    ├── README.md                       # 使用说明
    ├── StockEventEngine.ts             # 核心引擎（650行）
    ├── config.ts                       # 映射配置（500行）
    ├── types.ts                        # 类型定义（200行）
    ├── example.ts                      # 示例代码（420行）
    ├── package.json                    # 依赖配置
    ├── tsconfig.json                   # TypeScript配置
    └── node_modules/                   # 依赖包
```

---

## 开发状态

| POC | 状态 | 版本 | 最后更新 |
|-----|------|------|---------|
| event-driven-investment | ✅ 完成 | 1.0.0 | 2026-02-02 |

---

## 下一步计划

### 未来 POC 构想

1. **Real-time Crypto Sentiment Analyzer**
   - 整合加密货币新闻和社交媒体情绪
   - 实时情绪评分
   - 交易信号生成

2. **Geopolitical Risk Dashboard**
   - 地缘政治风险评估
   - 冲突预测模型
   - 资产配置建议

3. **Fed Policy Predictor**
   - 美联储政策预测
   - FOMC会议分析
   - 利率路径预测

4. **Supply Chain Risk Monitor**
   - 全球供应链中断监控
   - 运输延误预警
   - 库存优化建议

---

## 贡献指南

欢迎添加新的 POC！请遵循以下结构：

```
poc/your-poc-name/
├── README.md           # 使用说明
├── FEATURES.md         # 详细功能文档（可选）
├── package.json        # 依赖配置
├── src/                # 源代码
│   ├── index.ts        # 入口文件
│   ├── config.ts       # 配置
│   └── types.ts        # 类型定义
└── examples/           # 示例代码
    └── example.ts
```

---

## 许可

MIT License

所有 POC 仅供学习和研究使用，不构成投资建议。
