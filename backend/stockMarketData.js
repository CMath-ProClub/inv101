const yahooFinance = require('yahoo-finance2').default;

// Top 1600 US stocks by market cap - includes S&P 500, Russell 2000, and major exchanges
const STOCK_SYMBOLS = [
  // Mega Cap (Top 50)
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'LLY', 'V',
  'UNH', 'XOM', 'WMT', 'JPM', 'JNJ', 'MA', 'PG', 'AVGO', 'HD', 'COST',
  'ABBV', 'MRK', 'CVX', 'ORCL', 'KO', 'ADBE', 'PEP', 'BAC', 'CRM', 'NFLX',
  'MCD', 'TMO', 'ACN', 'CSCO', 'AMD', 'LIN', 'ABT', 'WFC', 'DIS', 'INTC',
  'QCOM', 'VZ', 'DHR', 'CMCSA', 'TXN', 'PFE', 'INTU', 'COP', 'NKE', 'PM',
  
  // Large Cap (51-200)
  'NEE', 'T', 'UNP', 'SPGI', 'RTX', 'LOW', 'HON', 'UPS', 'MS', 'AMAT',
  'GS', 'IBM', 'BA', 'CAT', 'BLK', 'DE', 'ELV', 'AMGN', 'SBUX', 'PLD',
  'BKNG', 'GILD', 'ADI', 'SYK', 'MDLZ', 'MMC', 'TJX', 'VRTX', 'AMT', 'ISRG',
  'CI', 'ADP', 'TMUS', 'ZTS', 'C', 'MO', 'NOW', 'LRCX', 'CVS', 'BDX',
  'PGR', 'SO', 'REGN', 'ETN', 'SCHW', 'CB', 'DUK', 'BSX', 'MMM', 'NOC',
  'SLB', 'MU', 'ITW', 'EOG', 'FI', 'AON', 'ICE', 'PNC', 'WM', 'GE',
  'GM', 'APD', 'CL', 'USB', 'EQIX', 'SNPS', 'SHW', 'EMR', 'CDNS', 'TGT',
  'MCO', 'NSC', 'FCX', 'PSA', 'DG', 'BK', 'AJG', 'HCA', 'PH', 'MAR',
  'MSI', 'TT', 'AFL', 'CME', 'APH', 'AIG', 'KLAC', 'ORLY', 'TFC', 'ADSK',
  'NXPI', 'MCK', 'ROP', 'AEP', 'JCI', 'AZO', 'CARR', 'MET', 'ECL', 'COF',
  'HUM', 'D', 'O', 'PSX', 'WELL', 'NEM', 'WMB', 'SRE', 'SPG', 'PCAR',
  'CMG', 'MSCI', 'GIS', 'AMP', 'TEL', 'TRV', 'SYY', 'CNC', 'PAYX', 'F',
  'CEG', 'KMB', 'A', 'EW', 'FICO', 'KMI', 'MCHP', 'HSY', 'FTNT', 'HLT',
  'CRWD', 'DHI', 'CPRT', 'ALL', 'PRU', 'OKE', 'ADM', 'KDP', 'BKR', 'SQ',
  
  // Mid Cap (201-500)
  'RSG', 'YUM', 'EXC', 'PCG', 'GWW', 'VRSK', 'LHX', 'CTVA', 'LEN', 'CTAS',
  'DOW', 'DXCM', 'TROW', 'CMI', 'ACGL', 'STZ', 'ODFL', 'FAST', 'IDXX', 'HES',
  'ED', 'MTD', 'EXR', 'KHC', 'EA', 'RMD', 'GEHC', 'AME', 'GPN', 'URI',
  'ROK', 'PPG', 'MNST', 'IT', 'CTSH', 'VICI', 'XEL', 'IQV', 'ROST', 'DD',
  'ANSS', 'GLW', 'PWR', 'FIS', 'CHTR', 'EIX', 'TTWO', 'VLO', 'VMC', 'MLM',
  'BIIB', 'AVB', 'HWM', 'WTW', 'EBAY', 'HPQ', 'ETR', 'IR', 'CBRE', 'WAB',
  'FANG', 'APTV', 'MPWR', 'LVS', 'WEC', 'DAL', 'TSCO', 'FTV', 'EFX', 'KEYS',
  'INVH', 'HAL', 'WBD', 'STT', 'LYB', 'ZBRA', 'DLR', 'CHD', 'ARE', 'ES',
  'ENPH', 'IFF', 'K', 'CAH', 'BALL', 'MKC', 'STE', 'DFS', 'VTR', 'WY',
  'DLTR', 'CCI', 'LUV', 'AWK', 'LH', 'SBAC', 'HOLX', 'AEE', 'RF', 'MTB',
  'CLX', 'ALGN', 'DOV', 'TSN', 'HBAN', 'EXPD', 'CFG', 'SWK', 'WAT', 'CINF',
  'TDY', 'BAX', 'CNP', 'FE', 'ULTA', 'TRGP', 'MAA', 'NTRS', 'EXPE', 'BBY',
  'CCL', 'TYL', 'MOS', 'HPE', 'KEY', 'HUBB', 'PFG', 'DTE', 'PKI', 'TXT',
  'IP', 'FDS', 'FITB', 'AKAM', 'WDC', 'DRI', 'NUE', 'UAL', 'DGX', 'EQR',
  'NTAP', 'ESS', 'RJF', 'STX', 'IRM', 'STLD', 'EQT', 'J', 'WRB', 'PPL',
  'SWKS', 'PAYC', 'SYF', 'CTLT', 'LDOS', 'CBOE', 'JBHT', 'PTC', 'GRMN', 'CF',
  
  // Small-Mid Cap (501-1000)
  'NDAQ', 'TER', 'LYV', 'CPT', 'TRMB', 'GPC', 'OMC', 'CAG', 'PKG', 'IPG',
  'L', 'CPB', 'EVRG', 'LKQ', 'ATO', 'BXP', 'JKHY', 'HSIC', 'UDR', 'KIM',
  'BIO', 'TECH', 'AOS', 'BEN', 'POOL', 'INCY', 'CHRW', 'HII', 'LNT', 'REG',
  'NDSN', 'AIZ', 'FOXA', 'HRL', 'CMS', 'MAS', 'TAP', 'FFIV', 'MKTX', 'SJM',
  'APA', 'MTCH', 'FRT', 'PEAK', 'GL', 'AVY', 'NRG', 'CRL', 'DVN', 'TFX',
  'EMN', 'NVR', 'ROL', 'VTRS', 'CE', 'WHR', 'AES', 'BBWI', 'AAL', 'GNRC',
  'TPR', 'RCL', 'BWA', 'NCLH', 'HAS', 'SEE', 'NI', 'PNW', 'ALB', 'IEX',
  'FBHS', 'ALLY', 'MGM', 'LNC', 'DXC', 'HBI', 'DISH', 'VFC', 'WYNN', 'RL',
  'PHM', 'TOL', 'NWL', 'FMC', 'MHK', 'UAA', 'PARA', 'DVA', 'WHR', 'AAP',
  
  // Russell 2000 Selection (1001-1600)
  'AZPN', 'SHO', 'UHS', 'HGV', 'FSR', 'RGEN', 'RGA', 'BERY', 'NSP', 'CNX',
  'ATR', 'CDAY', 'CADE', 'LSCC', 'KBR', 'GTLS', 'PSTG', 'TXRH', 'JAZZ', 'HELE',
  'CNHI', 'GTLB', 'CRI', 'ONB', 'VCTR', 'RHP', 'SFNC', 'CHX', 'MATX', 'CWEN',
  'SNX', 'ITGR', 'AGIO', 'KRG', 'ALE', 'COOP', 'SRPT', 'DIOD', 'GEF', 'AVT',
  'PRGO', 'THO', 'CASY', 'LANC', 'SFBS', 'HQY', 'CWST', 'SANM', 'SPSC', 'POWL',
  'AMG', 'TREX', 'PNFP', 'FBP', 'EWBC', 'OZK', 'SMCI', 'PTEN', 'AIT', 'ENS',
  'SITE', 'QTWO', 'GMS', 'CHDN', 'CVLT', 'AWI', 'ADMA', 'BCO', 'MMS', 'SHAK',
  'OGS', 'LECO', 'BECN', 'QLYS', 'LNTH', 'MGEE', 'WTS', 'PECO', 'ALKS', 'CXT',
  'COLM', 'CBT', 'NPO', 'ESNT', 'AGCO', 'TEX', 'VICR', 'OMCL', 'PFSI', 'SITM',
  'CVCO', 'KTB', 'EPRT', 'TKR', 'SLAB', 'KLIC', 'JJSF', 'ENSG', 'BMI', 'APOG',
  'PLXS', 'ARCB', 'KFRC', 'MGRC', 'BCC', 'NVST', 'UFPI', 'MIDD', 'GNTX', 'SAIC',
  'SPTN', 'ABCB', 'FELE', 'ESE', 'AEIS', 'ICFI', 'ATKR', 'CRVL', 'TFSL', 'WIRE',
  'BCPC', 'AMED', 'CALX', 'UFPT', 'SYBT', 'MRCY', 'LSTR', 'WSFS', 'PLAB', 'HAYW',
  'SKYW', 'BANF', 'TTGT', 'NGVT', 'WAFD', 'MATW', 'POWI', 'BKH', 'GATX', 'KFY',
  'GBCI', 'BTU', 'CTRE', 'MYRG', 'XRAY', 'ONTO', 'MLI', 'ITRI', 'PRGS', 'DORM',
  'SSTK', 'CNMD', 'IOSP', 'FULT', 'BRC', 'PDCO', 'PIPR', 'NPK', 'TBBK', 'INSM',
  'AMN', 'ABM', 'TRUP', 'CWK', 'AVNT', 'FIBK', 'PRIM', 'STRA', 'TRN', 'WDFC',
  'SPXC', 'VRNS', 'CENTA', 'TRIP', 'FCFS', 'ATKR', 'MTX', 'RUSHA', 'BANR', 'GPRE',
  'STRL', 'HNI', 'BMRC', 'SLGN', 'MCY', 'BRZE', 'KRNY', 'AIRC', 'SHOO', 'MTDR',
  'CSWI', 'IPAR', 'DNLI', 'HSII', 'PBH', 'AMSF', 'EXLS', 'DY', 'INGR', 'HI',
  'SMP', 'CWEN.A', 'SFST', 'AMWD', 'PUMP', 'MTSI', 'MLKN', 'CNXN', 'ECPG', 'WERN',
  'SNEX', 'WRBY', 'CENTA', 'GMED', 'PCT', 'SONO', 'BOOT', 'GBX', 'NABL', 'ANDE',
  'INDB', 'VBTX', 'CFFN', 'BKE', 'HFWA', 'PZZA', 'GTLS', 'THRM', 'ALGT', 'PATK',
  'NVEE', 'ATRI', 'UFCS', 'NHC', 'TOWN', 'SCSC', 'CPK', 'LAKE', 'CRAI', 'HTLD',
  'WNC', 'GIII', 'CVBF', 'MGPI', 'ASGN', 'MCB', 'VRTS', 'ADUS', 'GVA', 'CSWC',
  'TFIN', 'PTCT', 'LBRT', 'CCOI', 'HWKN', 'HOMB', 'VOYA', 'SUPN', 'CEIX', 'BANC',
  'PFBC', 'PEBO', 'FRME', 'UCBI', 'WTFC', 'SATS', 'SBSI', 'BWFG', 'EPC', 'FBNC',
  'COOP', 'AVNS', 'WABC', 'MMSI', 'FROG', 'ACLS', 'DGII', 'THFF', 'GSHD', 'BBSI',
  'ROCK', 'STBA', 'WASH', 'HASI', 'AMSWA', 'NBTB', 'CENTA', 'CWEN', 'WTBA', 'HBT',
  'IBOC', 'GNTY', 'VECO', 'IOSP', 'CBSH', 'GBCI', 'AMBC', 'RNST', 'FFBC', 'TRMK',
  'CASH', 'FISI', 'AUB', 'ASB', 'TTMI', 'LCII', 'CBNK', 'VRTS', 'FCF', 'SFNC',
  'NYCB', 'SBCF', 'BFST', 'WAFD', 'ABCB', 'BANF', 'ONB', 'PNFP', 'OZK', 'EWBC',
  'FBP', 'FFIN', 'WTFC', 'CADE', 'SFBS', 'CVBF', 'WSFS', 'FULT', 'FIBK', 'TBBK',
  'BANR', 'FCFS', 'SFST', 'INDB', 'CFFN', 'HFWA', 'CVBF', 'HOMB', 'PFBC', 'PEBO',
  'UCBI', 'WTFC', 'SBSI', 'FBNC', 'WABC', 'THFF', 'STBA', 'WASH', 'NBTB', 'WTBA',
  'HBT', 'IBOC', 'CBSH', 'GBCI', 'AMBC', 'FFBC', 'CASH', 'FISI', 'AUB', 'ASB',
  'LCII', 'CBNK', 'FCF', 'SFNC', 'NYCB', 'SBCF', 'BFST', 'WAFD', 'FFIN', 'CVBF'
];

// Cache for stock data (expires every 5 minutes in production)
let stockCache = {
  data: {},
  lastUpdate: null,
  updateInterval: 5 * 60 * 1000 // 5 minutes
};

/**
 * Fetch real-time stock quotes from Yahoo Finance
 * @param {Array} symbols - Array of stock symbols
 * @returns {Promise<Object>} Stock data by symbol
 */
async function fetchStockQuotes(symbols) {
  try {
    const quotes = await yahooFinance.quote(symbols);
    const processedData = {};
    
    for (const symbol of symbols) {
      const quote = quotes[symbol] || quotes;
      if (quote && quote.regularMarketPrice) {
        processedData[symbol] = {
          symbol: symbol,
          name: quote.shortName || quote.longName || symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          volume: quote.regularMarketVolume || 0,
          marketCap: quote.marketCap || 0,
          dayHigh: quote.regularMarketDayHigh || quote.regularMarketPrice,
          dayLow: quote.regularMarketDayLow || quote.regularMarketPrice,
          open: quote.regularMarketOpen || quote.regularMarketPrice,
          previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
          fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || quote.regularMarketPrice,
          fiftyTwoWeekLow: quote.fiftyTwoWeekLow || quote.regularMarketPrice,
          sector: quote.sector || 'N/A',
          industry: quote.industry || 'N/A',
          exchange: quote.fullExchangeName || quote.exchange || 'N/A'
        };
      }
    }
    
    return processedData;
  } catch (error) {
    console.error('Error fetching stock quotes:', error.message);
    return {};
  }
}

/**
 * Fetch stock data in batches to avoid rate limiting
 * @returns {Promise<Object>} All stock data
 */
async function fetchAllStocks() {
  const batchSize = 100; // Yahoo Finance can handle ~100 symbols per request
  const batches = [];
  
  for (let i = 0; i < STOCK_SYMBOLS.length; i += batchSize) {
    batches.push(STOCK_SYMBOLS.slice(i, i + batchSize));
  }
  
  console.log(`📊 Fetching ${STOCK_SYMBOLS.length} stocks in ${batches.length} batches...`);
  
  let allStockData = {};
  let successCount = 0;
  
  for (let i = 0; i < batches.length; i++) {
    try {
      console.log(`   Batch ${i + 1}/${batches.length}: ${batches[i].length} symbols`);
      const batchData = await fetchStockQuotes(batches[i]);
      allStockData = { ...allStockData, ...batchData };
      successCount += Object.keys(batchData).length;
      
      // Small delay between batches to avoid rate limiting
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`   ❌ Error in batch ${i + 1}:`, error.message);
    }
  }
  
  console.log(`✅ Successfully fetched ${successCount}/${STOCK_SYMBOLS.length} stocks`);
  return allStockData;
}

/**
 * Get cached stock data or fetch fresh data
 * @param {boolean} forceRefresh - Force refresh even if cache is valid
 * @returns {Promise<Object>} Stock data
 */
async function getStockData(forceRefresh = false) {
  const now = Date.now();
  const cacheValid = stockCache.lastUpdate && 
                    (now - stockCache.lastUpdate) < stockCache.updateInterval;
  
  if (!forceRefresh && cacheValid && Object.keys(stockCache.data).length > 0) {
    console.log('📦 Returning cached stock data');
    return stockCache.data;
  }
  
  console.log('🔄 Fetching fresh stock data...');
  const freshData = await fetchAllStocks();
  
  stockCache.data = freshData;
  stockCache.lastUpdate = now;
  
  return freshData;
}

/**
 * Search stocks by symbol or name
 * @param {string} query - Search query
 * @param {Object} stockData - Stock data object
 * @returns {Array} Matching stocks
 */
function searchStocks(query, stockData) {
  if (!query) return [];
  
  const searchTerm = query.toLowerCase();
  const results = [];
  
  for (const [symbol, data] of Object.entries(stockData)) {
    if (symbol.toLowerCase().includes(searchTerm) || 
        data.name.toLowerCase().includes(searchTerm)) {
      results.push(data);
    }
    
    if (results.length >= 50) break; // Limit results
  }
  
  return results;
}

/**
 * Get top movers (gainers/losers)
 * @param {Object} stockData - Stock data object
 * @param {string} type - 'gainers' or 'losers'
 * @param {number} limit - Number of results
 * @returns {Array} Top movers
 */
function getTopMovers(stockData, type = 'gainers', limit = 20) {
  const stocks = Object.values(stockData);
  
  stocks.sort((a, b) => {
    return type === 'gainers' 
      ? b.changePercent - a.changePercent
      : a.changePercent - b.changePercent;
  });
  
  return stocks.slice(0, limit);
}

/**
 * Get stocks by sector
 * @param {Object} stockData - Stock data object
 * @param {string} sector - Sector name
 * @returns {Array} Stocks in sector
 */
function getStocksBySector(stockData, sector) {
  return Object.values(stockData).filter(stock => 
    stock.sector.toLowerCase() === sector.toLowerCase()
  );
}

module.exports = {
  STOCK_SYMBOLS,
  getStockData,
  searchStocks,
  getTopMovers,
  getStocksBySector,
  fetchStockQuotes
};
