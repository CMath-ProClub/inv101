/**
 * Stock Data Cache Service  
 * Caches top 1500 stocks by market cap + major index funds
 * Provides S&P 500 comparison functionality
 */

const yahooFinance = require('yahoo-finance2').default;
const { recordQuoteBatch, recordHistoricalQuotes } = require('./stockQuoteStore');

// Suppress Yahoo Finance validation errors and notices
const queryOptions = { validateResult: false };
yahooFinance.setGlobalConfig({
  validation: {
    logErrors: false,
    logOptionsErrors: false
  },
  queue: {
    timeout: 20000
  }
});

if (typeof yahooFinance.suppressNotices === 'function') {
  yahooFinance.suppressNotices(['ripHistorical', 'yahooSurvey']);
}

function parseTickerList(value, fallback) {
  const input = typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  return input
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

const DEFAULT_INTRADAY_TICKERS = parseTickerList(
  process.env.STOCK_INTRADAY_TICKERS,
  'SPY,QQQ,DIA,IWM,AAPL,MSFT,GOOGL,AMZN,NVDA,TSLA,META,AMD'
);

const DEFAULT_HISTORICAL_TICKERS = parseTickerList(
  process.env.STOCK_HISTORICAL_TICKERS,
  process.env.STOCK_INTRADAY_TICKERS || 'SPY,QQQ,DIA,IWM,AAPL,MSFT,GOOGL,AMZN,NVDA,TSLA,META,AMD'
);

const HISTORICAL_LOOKBACK_DAYS = parseInt(process.env.STOCK_HISTORICAL_LOOKBACK_DAYS || '365', 10);
const HISTORICAL_INTERVAL = process.env.STOCK_HISTORICAL_INTERVAL || '1d';
const HISTORICAL_BUCKET_MINUTES = parseInt(process.env.STOCK_HISTORICAL_BUCKET_MINUTES || '1440', 10);
const HISTORICAL_BATCH_DELAY_MS = parseInt(process.env.STOCK_HISTORICAL_BATCH_DELAY_MS || '1000', 10);

// Top 1500 stocks by market cap (S&P 500 + Russell 1000 + mid-caps)
const TOP_1500_TICKERS = [
  // S&P 500 - Top 500
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'LLY', 'V', 'BRK-B',
  'UNH', 'JPM', 'XOM', 'JNJ', 'WMT', 'MA', 'PG', 'AVGO', 'HD', 'ORCL',
  'CVX', 'ABBV', 'MRK', 'KO', 'COST', 'PEP', 'BAC', 'ADBE', 'CRM', 'TMO',
  'NFLX', 'MCD', 'ACN', 'CSCO', 'LIN', 'AMD', 'CMCSA', 'ABT', 'NKE', 'DHR',
  'WFC', 'TXN', 'INTC', 'DIS', 'VZ', 'PM', 'NEE', 'INTU', 'UPS', 'RTX',
  'QCOM', 'HON', 'IBM', 'T', 'SPGI', 'COP', 'AMGN', 'LOW', 'GE', 'CAT',
  'UNP', 'SBUX', 'AXP', 'BLK', 'BA', 'DE', 'ELV', 'BKNG', 'LMT', 'MDT',
  'GS', 'AMAT', 'PLD', 'ADI', 'GILD', 'MMC', 'SYK', 'VRTX', 'TJX', 'ADP',
  'MDLZ', 'CVS', 'ISRG', 'C', 'CI', 'BDX', 'PGR', 'REGN', 'SO', 'CB',
  'ZTS', 'MO', 'MMM', 'DUK', 'EOG', 'BSX', 'SCHW', 'TGT', 'ETN', 'LRCX',
  'MS', 'USB', 'PNC', 'FI', 'MU', 'NSC', 'ITW', 'CL', 'AON', 'HCA',
  'BMY', 'SLB', 'ICE', 'GM', 'APD', 'SHW', 'PYPL', 'MCO', 'NOC', 'EQIX',
  'WM', 'ECL', 'MAR', 'GD', 'CME', 'EMR', 'PH', 'PSA', 'KLAC', 'CSX',
  'TT', 'TFC', 'AJG', 'APH', 'SNPS', 'MSI', 'NXPI', 'HUM', 'CDNS', 'AIG',
  'AFL', 'MCK', 'ORLY', 'ADSK', 'ROP', 'CCI', 'PCAR', 'SPG', 'WELL', 'MET',
  'D', 'SRE', 'KMB', 'EW', 'AZO', 'TRV', 'FTNT', 'CARR', 'O', 'CMG',
  'MSCI', 'PSX', 'PAYX', 'HLT', 'AMP', 'ALL', 'JCI', 'GIS', 'TEL', 'KMI',
  'DXCM', 'ROST', 'PRU', 'DLR', 'F', 'NEM', 'MCHP', 'MNST', 'AEP', 'HSY',
  'KHC', 'SYY', 'FDX', 'OKE', 'YUM', 'PCG', 'RSG', 'CTVA', 'AMT', 'CHTR',
  'IDXX', 'KR', 'IQV', 'BK', 'EA', 'FAST', 'EXC', 'BIIB', 'DHI', 'CTAS',
  'A', 'OTIS', 'GPN', 'CPRT', 'VLO', 'DD', 'VRSK', 'TROW', 'XEL', 'GLW',
  'FANG', 'WMB', 'PPG', 'ACGL', 'URI', 'ROK', 'HPQ', 'IR', 'ANSS', 'DOV',
  'STZ', 'EXR', 'VICI', 'EIX', 'WAB', 'ED', 'LYB', 'VMC', 'MTB', 'ALGN',
  'AWK', 'FITB', 'TSN', 'WY', 'MLM', 'KEYS', 'CHD', 'RMD', 'DVN', 'CBRE',
  'MTD', 'DFS', 'ETR', 'HBAN', 'APTV', 'EBAY', 'IT', 'SBAC', 'FTV', 'NDAQ',
  'PPL', 'IFF', 'MPWR', 'WST', 'EFX', 'ADM', 'HAL', 'LH', 'LVS', 'DTE',
  'CLX', 'STT', 'WEC', 'HUBB', 'FE', 'ZBH', 'CBOE', 'AVB', 'CAH', 'TDY',
  'PEG', 'AEE', 'LDOS', 'BR', 'BAX', 'EQR', 'TER', 'TSCO', 'CDW', 'STE',
  'INVH', 'VTR', 'DPZ', 'CNP', 'TTWO', 'PWR', 'CMS', 'DAL', 'CINF', 'TYL',
  'HOLX', 'MOH', 'ARE', 'DLTR', 'ZBRA', 'HPE', 'COF', 'ULTA', 'NVR', 'MKC',
  'GWW', 'BLDR', 'FRC', 'WBD', 'UAL', 'SWKS', 'EXPD', 'CAG', 'WBA', 'MAA',
  'EXPE', 'NTRS', 'DRI', 'LUV', 'POOL', 'DOW', 'SYF', 'SWK', 'BALL', 'K',
  'OMC', 'BBY', 'JBHT', 'IP', 'RF', 'LKQ', 'AMCR', 'JKHY', 'CFG', 'IEX',
  'TRMB', 'KIM', 'DGX', 'PKI', 'ALB', 'LNT', 'UDR', 'KEY', 'PEAK', 'AKAM',
  'EVRG', 'ESS', 'VTRS', 'RJF', 'CPT', 'BXP', 'CDAY', 'J', 'PAYC', 'ATO',
  'CE', 'WAT', 'CRL', 'TECH', 'BRO', 'EMN', 'CHRW', 'TXT', 'HIG', 'BF-B',
  'LYV', 'MKTX', 'AAL', 'REG', 'MAS', 'INCY', 'HWM', 'PFG', 'NI', 'HRL',
  'NDSN', 'AIZ', 'IPG', 'PNW', 'CMA', 'MTCH', 'AOS', 'BBWI', 'FFIV', 'GL',
  'SNA', 'HST', 'GNRC', 'CCL', 'TPR', 'HSIC', 'IVZ', 'TAP', 'ALLE', 'LW',
  'FMC', 'PNR', 'WHR', 'NCLH', 'SEE', 'UHS', 'ZION', 'NRG', 'BEN', 'JNPR',
  'REV', 'BWA', 'AAP', 'CPB', 'ALK', 'NLSN', 'DVA', 'RL', 'VNO', 'WYNN',
  'AIV', 'HII', 'MHK', 'PARA', 'MGM', 'HAS', 'IRM', 'FRT', 'NWL', 'OGN',
  'DISCA', 'UAA', 'UA', 'APA', 'KMX', 'LEG', 'NWSA', 'NWS', 'FOX', 'FOXA',
  'DISH', 'MOS', 'SLG', 'VFC', 'XRAY', 'NOV', 'DXC', 'PENN', 'LNC', 'RHI',
  
  // Russell 1000 extension - 501-1000
  'PANW', 'NOW', 'TEAM', 'WDAY', 'VEEV', 'HUBS', 'ZM', 'BILL', 'DOCU', 'CRWD',
  'NET', 'DDOG', 'SNOW', 'PLTR', 'RBLX', 'U', 'DASH', 'COIN', 'HOOD', 'SOFI',
  'UPST', 'AFRM', 'ZS', 'MDB', 'OKTA', 'TWLO', 'DKNG', 'FSLR', 'ENPH', 'SEDG',
  'RUN', 'PINS', 'SNAP', 'LYFT', 'UBER', 'ROKU', 'SPOT', 'ZI', 'PATH', 'S',
  'RIVN', 'LCID', 'ABNB', 'SQ', 'SHOP', 'ETSY', 'XYL', 'JAZZ', 'NBIX', 'ALKS',
  'EXEL', 'UTHR', 'RARE', 'BMRN', 'FOLD', 'SRPT', 'IONS', 'ARWR', 'RGNX', 'ALNY',
  'BLUE', 'CRSP', 'NTLA', 'EDIT', 'BEAM', 'VCYT', 'PACB', 'ILMN', 'QGEN', 'BIO',
  'HOLX', 'WAT', 'TFX', 'PODD', 'TNDM', 'NVST', 'OMCL', 'GMED', 'LMAT', 'ATRC',
  'ATEC', 'NARI', 'IRTC', 'OFIX', 'UFPT', 'STRL', 'ITRI', 'AXON', 'GWRE', 'APPF',
  'SMAR', 'PD', 'NCNO', 'CWAN', 'COUP', 'NEWR', 'DOMO', 'EVBG', 'INST', 'ESTC',
  'AI', 'FROG', 'BIGC', 'BLKB', 'QLYS', 'TENB', 'RPD', 'VRNS', 'RAMP', 'DOCN',
  'FSLY', 'CFLT', 'GTLB', 'DBX', 'BOX', 'RNG', 'PCOR', 'SLAB', 'MRVL', 'QRVO',
  'CRUS', 'LITE', 'AMBA', 'POWI', 'AOSL', 'OLED', 'KLIC', 'LSCC', 'MTSI', 'SITM',
  'FORM', 'COHU', 'ACLS', 'UCTT', 'AEIS', 'UEIC', 'BRKS', 'PLXS', 'PLAB', 'RMBS',
  'MKSI', 'ENTG', 'ICHR', 'ONTO', 'ACMR', 'CAMT', 'OUST', 'INVZ', 'LAZR', 'LIDR',
  'VLDR', 'MVIS', 'KOPN', 'VUZX', 'EMAN', 'WKHS', 'FSR', 'GOEV', 'ARVL', 'RIDE',
  'BLNK', 'CHPT', 'EVGO', 'WBX', 'STEM', 'BE', 'PLUG', 'FCEL', 'BLDP', 'NEL',
  'HYLN', 'NKLA', 'GP', 'TM', 'HMC', 'NSANY', 'BMWYY', 'VLKAF', 'DDAIF', 'FUJHY',
  'HYMTF', 'POAHY', 'RACE', 'GELYF', 'LI', 'NIO', 'XPEV', 'BYDDY', 'KNDI', 'SOLO',
  'AYRO', 'GEV', 'MULN', 'ELMS', 'XOS', 'PSNY', 'NU', 'PAGS', 'STNE', 'LC',
  'OPFI', 'TPGY', 'PL', 'EEFT', 'FIS', 'FISV', 'ACI', 'AUB', 'BANR', 'BBSI',
  'BCBP', 'BFC', 'BFST', 'BHLB', 'BKU', 'BMRC', 'BOH', 'BOKF', 'BPOP', 'BPRN',
  'BRKL', 'BSRR', 'BSVN', 'BWB', 'BY', 'CADE', 'CASH', 'CASS', 'CATY', 'CBSH',
  'CFFN', 'CFR', 'CHCO', 'CIT', 'CNOB', 'COLB', 'COWN', 'CSTR', 'CTBI', 'CVBF',
  'CWBC', 'DCOM', 'EBSB', 'EGBN', 'ESXB', 'EWBC', 'FBNC', 'FBIZ', 'FCBC', 'FCCO',
  'FCNCA', 'FIBK', 'FNB', 'FRAF', 'FRBK', 'FRME', 'FULT', 'FUNC', 'GABC', 'GBCI',
  'GLBZ', 'GSHD', 'HAFC', 'HBT', 'HFWA', 'HMST', 'HOMB', 'HOPE', 'HTBI', 'HTBK',
  'HTLF', 'HWBK', 'IBCP', 'IBOC', 'IBTX', 'INDB', 'ISTR', 'LARK', 'LKFN', 'MBFI',
  'MBWM', 'MCB', 'MCBC', 'MFNC', 'MSBF', 'MSBI', 'MYFW', 'NBTB', 'NBN', 'NFBK',
  'NRIM', 'NWBI', 'NYCB', 'OBK', 'OCFC', 'ONB', 'OPBK', 'OPHC', 'ORRF', 'OSBC',
  'OVLY', 'OZRK', 'PBCT', 'PBHC', 'PBIP', 'PEBO', 'PFS', 'PNFP', 'PPBI', 'PRK',
  'PROV', 'PVBC', 'QCRH', 'RBNC', 'RNST', 'SASR', 'SBCF', 'SBNY', 'SBSI', 'SEBC',
  'SI', 'SIVB', 'SMBC', 'SMBK', 'SRCE', 'SSB', 'SSNC', 'STBA', 'STL', 'SYBT',
  'SYPR', 'TCBI', 'TCBK', 'THFF', 'TRCB', 'TRMK', 'TRST', 'TSBK', 'UBCP', 'UBSI',
  'UCBA', 'UCBI', 'UFCS', 'UFPI', 'UMBF', 'UNB', 'UNTY', 'UVSP', 'VBTX', 'VLY',
  'WABC', 'WAFD', 'WAL', 'WASH', 'WBK', 'WBST', 'WBS', 'WTFC', 'WVFC', 'AAN',
  'AAON', 'AAWW', 'ABCB', 'ABCM', 'ABG', 'ABM', 'ABR', 'ACIW', 'ACM', 'ACRE',
  'ADNT', 'AEL', 'AEO', 'AFG', 'AFIN', 'AG', 'AGCO', 'AGM', 'AGO', 'AGR',
  'AGNC', 'AGS', 'AIOT', 'AIR', 'AIT', 'AJRD', 'AKR', 'AL', 'ALE', 'ALEX',
  'ALG', 'ALGM', 'ALSN', 'ALT', 'ALTG', 'ALTO', 'ALX', 'AM', 'AMAL', 'AMBC',
  'AMC', 'AMCX', 'AME', 'AMED', 'AMG', 'AMH', 'AMK', 'AMKR', 'AMN', 'AMNB',
  'AMPH', 'AMRC', 'AMRK', 'AMRN', 'AMRS', 'AMRX', 'AMTB', 'AMTD', 'AMTI', 'AMTX',
  'AMWD', 'AMWL', 'AN', 'ANAT', 'ANCN', 'ANDE', 'ANEB', 'ANF', 'ANGI', 'ANGO',
  'ANIK', 'ANIP', 'ANIX', 'ANTE', 'APAM', 'APEI', 'APG', 'APLE', 'APLS', 'APLT',
  'APO', 'APOG', 'APP', 'APPN', 'APPS', 'APRE', 'APT', 'APTM', 'APTO', 'APVO',
  'APWC', 'APYX', 'AQB', 'AQMS', 'AQN', 'AQST', 'AQUA', 'AR', 'ARAY', 'ARC',
  
  // Russell 2000 mid-caps - 1001-1500
  'ARCB', 'ARCH', 'ARCO', 'ARCT', 'ARD', 'ARDC', 'ARDS', 'AREC', 'ARES', 'ARGX',
  'ARI', 'ARKR', 'ARL', 'ARLP', 'ARMN', 'AROC', 'AROW', 'ARR', 'ARRY', 'ARTL',
  'ARTNA', 'ARTW', 'ARVN', 'ARW', 'ASB', 'ASC', 'ASGI', 'ASGN', 'ASH', 'ASIX',
  'ASLE', 'ASM', 'ASMB', 'ASND', 'ASPS', 'ASPN', 'ASPU', 'ASR', 'ASRT', 'ASRV',
  'ASTC', 'ASTE', 'ASTS', 'ASUR', 'ASX', 'ASXC', 'ATAI', 'ATAX', 'ATCX', 'ATEK',
  'ATEN', 'ATER', 'ATEX', 'ATHA', 'ATHE', 'ATHM', 'ATHX', 'ATI', 'ATIF', 'ATIP',
  'ATKR', 'ATLC', 'ATLO', 'ATMP', 'ATMU', 'ATNF', 'ATNI', 'ATNM', 'ATNX', 'ATOM',
  'ATOS', 'ATR', 'ATRA', 'ATRI', 'ATRO', 'ATRS', 'ATSG', 'ATTO', 'ATUS', 'ATV',
  'ATVI', 'ATXI', 'ATXS', 'ATY', 'AU', 'AUBN', 'AUDC', 'AUG', 'AUID', 'AULT',
  'AUPH', 'AUR', 'AURA', 'AURC', 'AUSF', 'AUTL', 'AUTO', 'AUUD', 'AUVI', 'AVA',
  'AVAC', 'AVAH', 'AVAL', 'AVAN', 'AVAV', 'AVCO', 'AVCT', 'AVD', 'AVDL', 'AVDX',
  'AVEO', 'AVGR', 'AVID', 'AVIR', 'AVK', 'AVLR', 'AVNS', 'AVNT', 'AVNW', 'AVO',
  'AVPT', 'AVRO', 'AVT', 'AVTE', 'AVTR', 'AVXL', 'AVY', 'AVYA', 'AWH', 'AWI',
  'AWR', 'AWRE', 'AWX', 'AX', 'AXDX', 'AXE', 'AXGN', 'AXL', 'AXLA', 'AXNX',
  'AXR', 'AXS', 'AXSM', 'AXTA', 'AXTI', 'AY', 'AYI', 'AYTU', 'AYX', 'AZN',
  'AZPN', 'AZRE', 'AZRX', 'AZZ', 'B', 'BABA', 'BACK', 'BAER', 'BAFN', 'BAH',
  'BAK', 'BALY', 'BAM', 'BANC', 'BAND', 'BANF', 'BANX', 'BAOS', 'BAP', 'BARK',
  'BASE', 'BATL', 'BATRA', 'BATRK', 'BB', 'BBAI', 'BBAR', 'BBBY', 'BBCP', 'BBD',
  'BBDC', 'BBDO', 'BBGI', 'BBI', 'BBIO', 'BBL', 'BBLG', 'BBLN', 'BBN', 'BBQ',
  'BBU', 'BBUC', 'BBVA', 'BBW', 'BC', 'BCAB', 'BCAL', 'BCAN', 'BCAT', 'BCC',
  'BCDA', 'BCE', 'BCEL', 'BCH', 'BCLI', 'BCML', 'BCO', 'BCOR', 'BCOV', 'BCOW',
  'BCPC', 'BCRX', 'BCS', 'BCSA', 'BCSF', 'BCTX', 'BCV', 'BCX', 'BCYC', 'BDC',
  'BDGE', 'BDJ', 'BDL', 'BDN', 'BDSX', 'BDTX', 'BDXB', 'BEAT', 'BECN', 'BEDU',
  'BEEM', 'BEEP', 'BEKE', 'BELFA', 'BELFB', 'BENF', 'BEP', 'BEPC', 'BERY', 'BEST',
  'BETZ', 'BF-A', 'BFAC', 'BFAM', 'BFEB', 'BFH', 'BFI', 'BFIN', 'BFIT', 'BFLY',
  'BFRA', 'BFRI', 'BFS', 'BGB', 'BGCP', 'BGFV', 'BGG', 'BGH', 'BGI', 'BGLC',
  'BGNE', 'BGR', 'BGRY', 'BGS', 'BGSF', 'BGT', 'BGX', 'BGXX', 'BGY', 'BH',
  'BHAC', 'BHAT', 'BHB', 'BHC', 'BHE', 'BHF', 'BHFAL', 'BHFAP', 'BHG', 'BHIL',
  'BHK', 'BHM', 'BHP', 'BHRB', 'BHV', 'BHVN', 'BIAF', 'BIDU', 'BIG', 'BIGZ',
  'BILI', 'BIMI', 'BIOC', 'BIOL', 'BIOR', 'BIOS', 'BIOX', 'BIPC', 'BIRD', 'BIRK',
  'BIT', 'BITF', 'BIVI', 'BJ', 'BJDX', 'BJRI', 'BKCC', 'BKD', 'BKE', 'BKEP',
  'BKEPP', 'BKH', 'BKI', 'BKKT', 'BKSC', 'BKSY', 'BKT', 'BKTI', 'BKYI', 'BL',
  'BLAC', 'BLBD', 'BLBX', 'BLCM', 'BLCO', 'BLD', 'BLDE', 'BLEU', 'BLFS', 'BLFY',
  'BLGG', 'BLGO', 'BLI', 'BLIN', 'BLMN', 'BLNG', 'BLPH', 'BLRX', 'BLSA', 'BLTE',
  'BLTS', 'BLU', 'BLW', 'BLX', 'BLZE', 'BMA', 'BMBL', 'BME', 'BMEA', 'BMEZ',
  'BMI', 'BMO', 'BMR', 'BMRA', 'BMTX', 'BMYMP', 'BNAI', 'BNED', 'BNGO', 'BNIX',
  'BNRE', 'BNSO', 'BNTC', 'BNTX', 'BOCN', 'BODY', 'BODI', 'BOLT', 'BOOM', 'BOOT',
  'BORR', 'BOSC', 'BOTJ', 'BOWX', 'BPMC', 'BPRN', 'BPTH', 'BPTS', 'BPYPM', 'BPYPN',
  'BPYPO', 'BPYPP', 'BRAC', 'BRBR', 'BRFS', 'BRID', 'BRKH', 'BRKR', 'BRLI', 'BRMK',
  'BRN', 'BRNS', 'BROG', 'BRON', 'BRTX', 'BRX', 'BRY', 'BRZE', 'BSAC', 'BSAQ',
  'BSBK', 'BSBR', 'BSCK', 'BSET', 'BSGM', 'BSIG', 'BSL', 'BSM', 'BSMX', 'BSPE',
  'BSY', 'BTAI', 'BTAQ', 'BTBT', 'BTCM', 'BTCS', 'BTCT', 'BTCY', 'BTE', 'BTEC',
  'BTMD', 'BTO', 'BTOG', 'BTRS', 'BTSG', 'BTTX', 'BTU', 'BTWN', 'BUSE', 'BV',
  'BVH', 'BVN', 'BVS', 'BWAC', 'BWAY', 'BWEN', 'BWFG', 'BWIN', 'BWLP', 'BWMX',
  'BWXT', 'BXC', 'BXMT', 'BXMX', 'BXRX', 'BXS', 'BYFC', 'BYND', 'BYNO', 'BYSI',
  'BYU', 'BZ', 'BZFD', 'BZH', 'BZUN', 'CAAP', 'CAAS', 'CABA', 'CABO', 'CAC',
  'CACC', 'CACI', 'CACO', 'CADL', 'CAKE', 'CAL', 'CALA', 'CALB', 'CALC', 'CALM',
  'CALT', 'CALX', 'CAMP', 'CAN', 'CANC', 'CANG', 'CAPL', 'CAPR', 'CARA', 'CARE',
  'CARR', 'CARS', 'CARV', 'CASY', 'CATC', 'CATO', 'CATX', 'CATY', 'CAVA', 'CAVL',
  'CBAN', 'CBAY', 'CBFV', 'CBIO', 'CBNK', 'CBRL', 'CBSH', 'CBST', 'CBTX', 'CCAP',
  'CCBG', 'CCCC', 'CCCS', 'CCEL', 'CCEP', 'CCLP', 'CCMP', 'CCNE', 'CCOI', 'CCOR',
  'CCRD', 'CCSI', 'CCTS', 'CCU', 'CCXI', 'CDC', 'CDLX', 'CDMO', 'CDNA', 'CDNS',
  'CDRE', 'CDTX', 'CDXC', 'CDXS', 'CDZI', 'CECO', 'CEG', 'CEIX', 'CELC', 'CELH',
  'CELU', 'CELZ', 'CENT', 'CENTA', 'CENX', 'CEPU', 'CERE', 'CERN', 'CERT', 'CERS',
  'CETX', 'CETY', 'CEVA', 'CFFN', 'CFFS', 'CFLT', 'CFR', 'CFSB', 'CG', 'CGA',
  'CGAU', 'CGBD', 'CGBS', 'CGC', 'CGEM', 'CGEN', 'CGNT', 'CGNX', 'CGRO', 'CGTX',
  'CHCI', 'CHCT', 'CHD', 'CHDN', 'CHE', 'CHEF', 'CHEK', 'CHGG', 'CHH', 'CHK',
  'CHKP', 'CHMI', 'CHMG', 'CHNG', 'CHNR', 'CHPT', 'CHR', 'CHRD', 'CHRS', 'CHRW',
  'CHS', 'CHSN', 'CHT', 'CHTR', 'CHUY', 'CHW', 'CHWY', 'CHX', 'CI', 'CIA',
  'CIB', 'CIEN', 'CIG', 'CIGI', 'CIM', 'CINF', 'CING', 'CINT', 'CIO', 'CIR',
  'CISO', 'CISS', 'CITE', 'CIVB', 'CIX', 'CIZN', 'CJJD', 'CKPT', 'CKX', 'CL',
  'CLAR', 'CLAY', 'CLB', 'CLBK', 'CLBT', 'CLCO', 'CLCT', 'CLDT', 'CLDX', 'CLEU',
  'CLF', 'CLFD', 'CLGN', 'CLH', 'CLIR', 'CLLS', 'CLM', 'CLMT', 'CLNE', 'CLNN',
  'CLOE', 'CLOV', 'CLPT', 'CLPS', 'CLRB', 'CLRC', 'CLRO', 'CLS', 'CLSD', 'CLSK',
  'CLSN', 'CLST', 'CLTL', 'CLUB', 'CLVR', 'CLVS', 'CLVT', 'CLW', 'CLWT', 'CLX',
  'CLYM', 'CM', 'CMA', 'CMAX', 'CMBM', 'CMBN', 'CMC', 'CMCA', 'CMCL', 'CMCM',
  'CMCO', 'CMCSA', 'CMCT', 'CME', 'CMG', 'CMI', 'CMMB', 'CMND', 'CMNR', 'CMPO',
  'CMPR', 'CMPS', 'CMRA', 'CMRE', 'CMRX', 'CMS', 'CMSA', 'CMSC', 'CMSD', 'CMSS'
];

// Major Index Funds & ETFs
const INDEX_FUNDS = [
  // S&P 500 Trackers
  'SPY', 'VOO', 'IVV', 'SPLG',
  
  // Total Market
  'VTI', 'ITOT', 'SPTM',
  
  // NASDAQ/Tech
  'QQQ', 'QQQM', 'VGT', 'XLK',
  
  // Dow Jones
  'DIA', 'DJIA',
  
  // International
  'VXUS', 'IXUS', 'VEA', 'IEMG', 'VWO', 'EFA', 'EEM',
  
  // Sector ETFs
  'XLE', 'XLF', 'XLV', 'XLI', 'XLP', 'XLY', 'XLB', 'XLRE', 'XLU',
  
  // Bond ETFs
  'BND', 'AGG', 'TLT', 'IEF', 'SHY', 'LQD', 'HYG',
  
  // Growth/Value
  'VUG', 'VTV', 'IWF', 'IWD',
  
  // Small/Mid Cap
  'VB', 'IJR', 'IWM', 'VO', 'IJH', 'MDY',
  
  // Dividend
  'VYM', 'SDY', 'DVY', 'SCHD', 'VIG',
  
  // Real Estate
  'VNQ', 'XLRE', 'IYR',
  
  // Commodities
  'GLD', 'SLV', 'DBC', 'GSG', 'USO'
];

// Combine all tickers
const ALL_TICKERS = [...new Set([...TOP_1500_TICKERS, ...INDEX_FUNDS])];

class StockDataCache {
  constructor() {
  this.cache = new Map();
  this.lastRefresh = null;
  this.refreshInterval = 6 * 60 * 60 * 1000; // 6 hours
  this.sp500Data = null;
  this.intradayTickers = Array.from(DEFAULT_INTRADAY_TICKERS);
  this.intradayBatchSize = parseInt(process.env.STOCK_INTRADAY_BATCH_SIZE || '12', 10);
  this.persistQuotes = String(process.env.STOCK_QUOTE_PERSIST || 'true').toLowerCase() !== 'false';
  this.historicalTickers = Array.from(DEFAULT_HISTORICAL_TICKERS);
  this.historicalLookbackDays = HISTORICAL_LOOKBACK_DAYS;
  this.historicalInterval = HISTORICAL_INTERVAL;
  this.historicalBucketMinutes = HISTORICAL_BUCKET_MINUTES;
  this.historicalBatchDelayMs = HISTORICAL_BATCH_DELAY_MS;
  this.historicalBackfillRunning = false;
  this.historicalBackfillStatus = { lastRun: null, lastSummary: null };
  }

  /**
   * Fetch and cache stock data for all tickers
   */
  async refreshTickers(tickers = ALL_TICKERS, batchSize = 10, options = {}) {
    const { persist = this.persistQuotes } = options;
    const totalTickers = tickers.length;
    console.log(`\n🔄 Starting stock data refresh for ${totalTickers} tickers...`);
    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    const refreshed = [];

    for (let i = 0; i < totalTickers; i += batchSize) {
      const batch = tickers.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalTickers / batchSize)}: ${batch.length} tickers`);

      const promises = batch.map((ticker) => this.fetchStockData(ticker));
      const results = await Promise.allSettled(promises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
          refreshed.push(result.value);
        } else {
          errorCount++;
          if (errorCount <= 10) {
            console.warn(`   ⚠️  Failed: ${batch[index]} - ${result.reason?.message || 'Unknown error'}`);
          }
        }
      });

      if (i + batchSize < totalTickers) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    await this.refreshSP500Data();

    this.lastRefresh = new Date();
    const durationSeconds = (Date.now() - startTime) / 1000;

    if (persist && refreshed.length > 0) {
      const persistResult = await recordQuoteBatch(refreshed);
      console.log(`💾 Persisted quotes: inserted ${persistResult.inserted}, matched ${persistResult.matched}`);
    }

    const duration = durationSeconds.toFixed(1);

    console.log(`\n✅ Stock data refresh complete!`);
    console.log(`   ✅ Success: ${successCount} stocks`);
    console.log(`   ❌ Failed: ${errorCount} stocks`);
    console.log(`   ⏱️  Duration: ${duration}s`);
    console.log(`   📊 Cache size: ${this.cache.size} stocks\n`);

    return {
      success: true,
      successCount,
      errorCount,
      duration,
      cacheSize: this.cache.size,
      lastRefresh: this.lastRefresh
    };
  }

  async refreshAll(batchSize = 10) {
    return this.refreshTickers(ALL_TICKERS, batchSize);
  }

  async refreshIntraday(batchSize = this.intradayBatchSize) {
    const tickers = this.intradayTickers.length > 0 ? this.intradayTickers : DEFAULT_INTRADAY_TICKERS;
    return this.refreshTickers(tickers, batchSize, { persist: this.persistQuotes });
  }

  async backfillHistoricalQuotes(options = {}) {
    if (this.historicalBackfillRunning) {
      console.log('⏭️  Historical backfill already in progress');
      return { running: true, lastSummary: this.historicalBackfillStatus.lastSummary };
    }

    const {
      tickers = this.historicalTickers,
      lookbackDays = this.historicalLookbackDays,
      interval = this.historicalInterval,
      bucketMinutes = this.historicalBucketMinutes,
      delayMs = this.historicalBatchDelayMs
    } = options;

    const targetTickers = Array.isArray(tickers)
      ? tickers
      : parseTickerList(String(tickers || ''), this.historicalTickers.join(','));

    const uniqueTickers = [...new Set(targetTickers.map((symbol) => symbol.toUpperCase()).filter(Boolean))];

    if (uniqueTickers.length === 0) {
      return { success: false, error: 'No tickers configured for historical backfill' };
    }

    this.historicalBackfillRunning = true;
    this.historicalBackfillStatus.lastRun = new Date();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - lookbackDays * 24 * 60 * 60 * 1000);
    let inserted = 0;
    let matched = 0;
    const failures = [];

  console.log(`📚 Starting historical backfill for ${uniqueTickers.length} tickers (${lookbackDays} days @ ${interval})`);

  for (const symbol of uniqueTickers) {
      try {
        console.log(`   🔄 Fetching historical candles for ${symbol}`);
        const candles = await yahooFinance.historical(symbol, {
          period1: startDate,
          period2: endDate,
          interval,
          events: 'history'
        }, queryOptions);

        if (!Array.isArray(candles) || candles.length === 0) {
          console.warn(`   ⚠️  No historical data returned for ${symbol}`);
          continue;
        }

        const normalized = candles
          .filter((candle) => candle && typeof candle.close === 'number')
          .map((candle) => {
            const bucket = new Date(candle.date);
            const open = typeof candle.open === 'number' ? candle.open : undefined;
            const close = candle.close;
            const change = typeof open === 'number' ? close - open : undefined;
            const changePercent = typeof open === 'number' && open !== 0 ? ((close - open) / open) * 100 : undefined;

            return {
              symbol,
              price: close,
              change,
              changePercent,
              volume: candle.volume,
              previousClose: candle.adjClose ?? close,
              open,
              dayHigh: candle.high,
              dayLow: candle.low,
              currency: candle.currency || 'USD',
              exchange: candle.exchange,
              bucket,
              fetchedAt: new Date(bucket)
            };
          });

        if (normalized.length === 0) {
          console.warn(`   ⚠️  Unable to normalize historical data for ${symbol}`);
          continue;
        }

        const result = await recordHistoricalQuotes(symbol, normalized, {
          source: 'yahoo-finance-historical',
          intervalMinutes: bucketMinutes
        });

        inserted += result.inserted || 0;
        matched += (result.matched || 0) + (result.modified || 0);
      } catch (error) {
        console.error(`   ❌ Historical backfill failed for ${symbol}:`, error.message);
        failures.push({ symbol, error: error.message });
      }

      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    const summary = {
      success: failures.length === 0,
  tickersProcessed: uniqueTickers.length,
      lookbackDays,
      interval,
      bucketMinutes,
      inserted,
      matched,
      failures
    };

    this.historicalBackfillRunning = false;
    this.historicalBackfillStatus.lastSummary = summary;
    this.historicalBackfillStatus.lastRun = new Date();

    console.log('📚 Historical backfill summary:', summary);

    return summary;
  }

  /**
   * Fetch data for a single stock
   */
  async fetchStockData(ticker) {
    try {
      // Fetch quote data
      const quote = await yahooFinance.quote(ticker, { 
        validateResult: false
      }).catch(err => {
        // Silently skip validation errors
        if (err.message && err.message.includes('validation')) {
          return null;
        }
        throw err;
      });
      
      if (!quote || typeof quote.regularMarketPrice === 'undefined') {
        throw new Error('No price data available');
      }

      const stockData = {
        ticker: ticker,
        name: quote.longName || quote.shortName || ticker,
        price: quote.regularMarketPrice,
        previousClose: quote.regularMarketPreviousClose,
        open: quote.regularMarketOpen,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        peRatio: quote.trailingPE,
        dividendYield: quote.dividendYield,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
        averageVolume: quote.averageVolume,
        beta: quote.beta,
        sector: quote.sector,
        industry: quote.industry,
        currency: quote.currency || 'USD',
        exchange: quote.fullExchangeName,
        lastUpdated: new Date(),
        raw: quote
      };

      this.cache.set(ticker, stockData);
      return stockData;
    } catch (error) {
      throw new Error(`Failed to fetch ${ticker}: ${error.message}`);
    }
  }

  /**
   * Fetch S&P 500 benchmark data
   */
  async refreshSP500Data() {
    try {
      console.log('📊 Fetching S&P 500 benchmark data...');
      const sp500 = await yahooFinance.quote('SPY', { validateResult: false });
      
      this.sp500Data = {
        ticker: 'SPY',
        price: sp500.regularMarketPrice,
        change: sp500.regularMarketChange,
        changePercent: sp500.regularMarketChangePercent,
        lastUpdated: new Date()
      };

      console.log(`   ✅ S&P 500: $${sp500.regularMarketPrice.toFixed(2)} (${sp500.regularMarketChangePercent > 0 ? '+' : ''}${sp500.regularMarketChangePercent?.toFixed(2)}%)`);
    } catch (error) {
      console.warn('   ⚠️  Failed to fetch S&P 500 data:', error.message);
    }
  }

  /**
   * Get stock data from cache
   */
  getStock(ticker) {
    return this.cache.get(ticker.toUpperCase());
  }

  /**
   * Get multiple stocks from cache
   */
  getStocks(tickers) {
    return tickers.map(t => this.getStock(t)).filter(Boolean);
  }

  /**
   * Compare stock to S&P 500
   */
  compareToSP500(ticker) {
    const stock = this.getStock(ticker);
    if (!stock || !this.sp500Data) {
      return null;
    }

    const outperformance = stock.changePercent - this.sp500Data.changePercent;
    
    return {
      stock: {
        ticker: stock.ticker,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent
      },
      sp500: {
        ticker: this.sp500Data.ticker,
        price: this.sp500Data.price,
        changePercent: this.sp500Data.changePercent
      },
      comparison: {
        outperformance,
        outperforming: outperformance > 0,
        relativeStrength: ((stock.changePercent / this.sp500Data.changePercent) * 100).toFixed(2)
      }
    };
  }

  /**
   * Get top performers
   */
  getTopPerformers(limit = 50) {
    const stocks = Array.from(this.cache.values());
    return stocks
      .filter(s => s.changePercent !== undefined)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, limit);
  }

  /**
   * Get worst performers
   */
  getWorstPerformers(limit = 50) {
    const stocks = Array.from(this.cache.values());
    return stocks
      .filter(s => s.changePercent !== undefined)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, limit);
  }

  /**
   * Search stocks by name or ticker
   */
  searchStocks(query, limit = 20) {
    const lowerQuery = query.toLowerCase();
    const stocks = Array.from(this.cache.values());
    
    return stocks
      .filter(s => 
        s.ticker.toLowerCase().includes(lowerQuery) ||
        s.name.toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit);
  }

  /**
   * Get stocks by sector
   */
  getStocksBySector(sector) {
    const stocks = Array.from(this.cache.values());
    return stocks.filter(s => s.sector === sector);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stocks = Array.from(this.cache.values());
    const gainers = stocks.filter(s => s.changePercent > 0).length;
    const losers = stocks.filter(s => s.changePercent < 0).length;
    const unchanged = stocks.filter(s => s.changePercent === 0).length;

    return {
      totalStocks: this.cache.size,
      gainers,
      losers,
      unchanged,
      lastRefresh: this.lastRefresh,
      sp500: this.sp500Data,
      cacheAge: this.lastRefresh ? Date.now() - this.lastRefresh.getTime() : null
    };
  }

  /**
   * Check if cache needs refresh
   */
  needsRefresh() {
    if (!this.lastRefresh) return true;
    return (Date.now() - this.lastRefresh.getTime()) > this.refreshInterval;
  }
}

// Export singleton instance
const stockCache = new StockDataCache();
module.exports = stockCache;
