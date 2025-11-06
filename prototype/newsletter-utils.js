(function (globalScope, factory) {
  var target = typeof globalThis !== 'undefined' ? globalThis : globalScope;
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    target.NewsletterUtils = factory();
  }
})(this, function () {
  var currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  });

  var percentFormatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
    minimumFractionDigits: 1
  });

  var samplePerformers = [
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 456.18, changePercent: 4.2, volume: 18850000, sector: 'Technology' },
    { symbol: 'META', name: 'Meta Platforms', price: 338.44, changePercent: 3.7, volume: 15440000, sector: 'Communication Services' },
    { symbol: 'LULU', name: 'Lululemon Athletica', price: 406.12, changePercent: 3.4, volume: 2210000, sector: 'Consumer Discretionary' },
    { symbol: 'SMCI', name: 'Super Micro Computer', price: 299.07, changePercent: 3.1, volume: 4680000, sector: 'Technology' },
    { symbol: 'ON', name: 'ON Semiconductor', price: 89.63, changePercent: 2.9, volume: 9650000, sector: 'Technology' }
  ];

  var sampleRecommendations = [
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      quote: { price: 377.44 },
      performance: {
        oneWeek: { percent: 3.4 },
        oneMonth: { percent: 6.8 }
      },
      recommendation: {
        rating: 'bullish',
        score: 3,
        confidence: 0.7,
        rationale: ['Azure AI demand is accelerating alongside new Copilot seat launches.']
      }
    },
    {
      symbol: 'COST',
      name: 'Costco Wholesale',
      quote: { price: 568.32 },
      performance: {
        oneWeek: { percent: 2.6 },
        oneMonth: { percent: 5.4 }
      },
      recommendation: {
        rating: 'bullish',
        score: 2,
        confidence: 0.58,
        rationale: ['Renewal rates nudge higher while fuel margins widen into holiday travel.']
      }
    },
    {
      symbol: 'BKR',
      name: 'Baker Hughes',
      quote: { price: 38.64 },
      performance: {
        oneWeek: { percent: 3.9 },
        oneMonth: { percent: 4.5 }
      },
      recommendation: {
        rating: 'bullish',
        score: 2,
        confidence: 0.62,
        rationale: ['International LNG orders keep backlog momentum elevated.']
      }
    },
    {
      symbol: 'PANW',
      name: 'Palo Alto Networks',
      quote: { price: 261.12 },
      performance: {
        oneWeek: { percent: 4.1 },
        oneMonth: { percent: 7.2 }
      },
      recommendation: {
        rating: 'bullish',
        score: 3,
        confidence: 0.66,
        rationale: ['Platform consolidation continues to win big-ticket enterprise deals.']
      }
    },
    {
      symbol: 'ABNB',
      name: 'Airbnb Inc.',
      quote: { price: 141.27 },
      performance: {
        oneWeek: { percent: 3.2 },
        oneMonth: { percent: 6.0 }
      },
      recommendation: {
        rating: 'bullish',
        score: 2,
        confidence: 0.55,
        rationale: ['Cross-border bookings inflect while FX tailwinds lift RevPAR.']
      }
    }
  ];

  function coerceNumber(value) {
    var num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  function formatCurrency(value) {
    var num = coerceNumber(value);
    return num === null ? 'N/A' : currencyFormatter.format(num);
  }

  function formatPercent(value) {
    var num = coerceNumber(value);
    if (num === null) {
      return '—';
    }
    var sign = num >= 0 ? '+' : '';
    return sign + num.toFixed(2) + '%';
  }

  function formatVolume(value) {
    var num = coerceNumber(value);
    if (num === null || num <= 0) {
      return '—';
    }

    var units = ['', 'K', 'M', 'B', 'T'];
    var unitIndex = 0;
    var adjusted = num;

    while (adjusted >= 1000 && unitIndex < units.length - 1) {
      adjusted = adjusted / 1000;
      unitIndex += 1;
    }

    var precision = adjusted >= 100 || unitIndex === 0 ? 0 : 1;
    return adjusted.toFixed(precision) + units[unitIndex] + ' sh';
  }

  function buildPerformerDriver(raw, percentChange) {
    var direction = percentChange >= 0 ? 'advance' : 'pullback';
    var magnitude = percentChange === null ? 'steady action' : Math.abs(percentChange).toFixed(2) + '% ' + direction;
    var sector = raw && raw.sector && raw.sector !== 'N/A' ? raw.sector : 'broader market';
    var volume = formatVolume(raw && raw.volume);
    var volumeNote = volume === '—' ? '' : ', trading ' + volume.replace(' sh', ' shares');
    return (raw && raw.symbol ? raw.symbol : 'This name') + ' led the ' + sector.toLowerCase() + ' cohort with a ' + magnitude + volumeNote + '.';
  }

  function computeProjectedMove(score, performance) {
    var week = performance && performance.oneWeek ? coerceNumber(performance.oneWeek.percent) : null;
    var month = performance && performance.oneMonth ? coerceNumber(performance.oneMonth.percent) : null;
    var accumulator = 0;
    var weight = 0;

    if (week !== null) {
      accumulator += week * 0.6;
      weight += 0.6;
    }
    if (month !== null) {
      accumulator += month * 0.4;
      weight += 0.4;
    }

    var base = weight > 0 ? accumulator / weight : 0;
    if (score !== null) {
      base += score * 0.8;
    }

    if (base > 15) {
      return 15;
    }
    if (base < -15) {
      return -15;
    }
    return base;
  }

  function formatProjected(value) {
    var num = coerceNumber(value);
    if (num === null) {
      return '—';
    }
    var sign = num >= 0 ? '+' : '';
    return sign + num.toFixed(1) + '%';
  }

  function transformPerformers(movers, limit) {
    var items = Array.isArray(movers) ? movers.slice(0, limit || 5) : [];
    return items.map(function (item) {
      var percent = item ? coerceNumber(item.changePercent) : null;
      return {
        ticker: item && (item.symbol || item.ticker) ? (item.symbol || item.ticker) : 'N/A',
        name: item && item.name ? item.name : (item && item.symbol ? item.symbol : 'N/A'),
        price: coerceNumber(item && item.price),
        changePercent: percent,
        moveLabel: formatPercent(percent),
        moveClass: percent !== null && percent < 0 ? 'move--down' : 'move--up',
        priceLabel: formatCurrency(item && item.price),
        liquidityLabel: formatVolume(item && item.volume),
        driver: buildPerformerDriver(item, percent)
      };
    });
  }

  function transformRecommendations(recommendations, limit) {
    var items = Array.isArray(recommendations) ? recommendations.slice(0, limit || 5) : [];
    return items.map(function (item) {
      var score = item && item.recommendation ? coerceNumber(item.recommendation.score) : null;
      var confidence = item && item.recommendation ? coerceNumber(item.recommendation.confidence) : null;
      var expectedMove = computeProjectedMove(score, item && item.performance);
      var rationale = item && item.recommendation && Array.isArray(item.recommendation.rationale)
        ? item.recommendation.rationale.filter(Boolean)
        : [];

      return {
        ticker: item && item.symbol ? item.symbol : 'N/A',
        name: item && item.name ? item.name : (item && item.symbol ? item.symbol : 'N/A'),
        projectedValue: expectedMove,
        projectedLabel: formatProjected(expectedMove),
        priceLabel: formatCurrency(item && item.quote && item.quote.price),
        confidence: confidence,
        confidenceLabel: confidence === null ? 'Model watch' : Math.round(confidence * 100) + '% confidence',
        catalyst: rationale.length > 0 ? rationale[0] : 'Momentum + sentiment screen elevated this name.'
      };
    });
  }

  function averageChangePercent(performers) {
    if (!Array.isArray(performers) || performers.length === 0) {
      return null;
    }
    var sum = 0;
    var count = 0;
    performers.forEach(function (item) {
      if (item && item.changePercent !== null) {
        sum += item.changePercent;
        count += 1;
      }
    });
    return count === 0 ? null : sum / count;
  }

  function averageProjectedMove(projections) {
    if (!Array.isArray(projections) || projections.length === 0) {
      return null;
    }
    var sum = 0;
    var count = 0;
    projections.forEach(function (item) {
      if (item && item.projectedValue !== null) {
        sum += item.projectedValue;
        count += 1;
      }
    });
    return count === 0 ? null : sum / count;
  }

  function buildContextSummary(performers, projections) {
    var sections = [];

    if (Array.isArray(performers) && performers.length > 0) {
      var leaders = performers.slice(0, 3).map(function (item) { return item.ticker; });
      var performerSummary = leaders.length > 1 ? leaders.slice(0, 2).join(', ') + ' and ' + leaders.slice(2).join(', ') : leaders.join(', ');
      var avg = averageChangePercent(performers);
      var avgLabel = avg === null ? 'mixed action' : percentFormatter.format(avg / 100);
      sections.push('Session leadership came from ' + performerSummary + ' with the group averaging ' + avgLabel + ' on the day.');
    }

    if (Array.isArray(projections) && projections.length > 0) {
      var forwardHeadliner = projections[0];
      var supporting = projections.slice(1, 3).map(function (item) { return item.ticker; });
      var supportingText = supporting.length ? ' with ' + supporting.join(', ') + ' also screening well' : '';
      sections.push(forwardHeadliner.ticker + ' tops the forward screen ' + forwardHeadliner.confidenceLabel.toLowerCase() + supportingText + '.');
      if (forwardHeadliner.catalyst) {
        sections.push(forwardHeadliner.catalyst);
      }
    }

    if (sections.length === 0) {
      return 'Fresh market data is unavailable at the moment. Check back shortly for the latest pulse.';
    }

    sections.push('Use this brief to stay market-ready in under five minutes.');
    return sections.join(' ');
  }

  return {
    transformPerformers: transformPerformers,
    transformRecommendations: transformRecommendations,
    buildContextSummary: buildContextSummary,
    samples: {
      performers: samplePerformers,
      recommendations: sampleRecommendations
    }
  };
});
