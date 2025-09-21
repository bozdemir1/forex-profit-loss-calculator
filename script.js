// Forex çiftleri ve enstrümanlar için pip değerleri ve özellikler
const currencyPairData = {
    'XAUUSD': { 
        pipDecimal: 1.0, 
        contractSize: 100, 
        name: 'Gold/USD (Altın)',
        pipPosition: 0 
    },
    'XAGUSD': { 
        pipDecimal: 0.01, 
        contractSize: 5000, 
        name: 'Silver/USD (Gümüş)',
        pipPosition: 2 
    },
    'UKOIL': { 
        pipDecimal: 0.01, 
        contractSize: 1000, 
        name: 'Brent Oil (Ukoil)',
        pipPosition: 2 
    },
    'UKO': { 
        pipDecimal: 0.01, 
        contractSize: 100, 
        name: 'Brent Oil (uko)',
        pipPosition: 2 
    },
    'GER30_10': { 
        pipDecimal: 1.0, 
        contractSize: 10, 
        name: 'GER30 (DAX) - 10 EUR',
        pipPosition: 0 
    },
    'DE40': { 
        pipDecimal: 1.0, 
        contractSize: 25, 
        name: 'DE40 (DAX) - 25 EUR',
        pipPosition: 0 
    },
    'US100_20': { 
        pipDecimal: 1.0, 
        contractSize: 20, 
        name: 'US100 (NASDAQ) - 20 USD',
        pipPosition: 0 
    },
    'NDX100': { 
        pipDecimal: 1.0, 
        contractSize: 10, 
        name: 'NDX100 (NASDAQ) - 10 USD',
        pipPosition: 0 
    },
    'SWI20': { 
        pipDecimal: 1.0, 
        contractSize: 10, 
        name: 'Swiss 20 (İsviçre)',
        pipPosition: 0 
    },
    'EURUSD': { 
        pipDecimal: 0.0001, 
        contractSize: 100000, 
        name: 'Euro/USD',
        pipPosition: 4 
    },
    'GBPUSD': { 
        pipDecimal: 0.0001, 
        contractSize: 100000, 
        name: 'Pound/USD',
        pipPosition: 4 
    },
    'USDJPY': { 
        pipDecimal: 0.01, 
        contractSize: 100000, 
        name: 'USD/Yen',
        pipPosition: 2 
    },
    'AUDUSD': { 
        pipDecimal: 0.0001, 
        contractSize: 100000, 
        name: 'Australian Dollar/USD',
        pipPosition: 4 
    },
    'USDCAD': { 
        pipDecimal: 0.0001, 
        contractSize: 100000, 
        name: 'USD/Canadian Dollar',
        pipPosition: 4 
    },
    'USDCHF': { 
        pipDecimal: 0.0001, 
        contractSize: 100000, 
        name: 'USD/Swiss Franc',
        pipPosition: 4 
    },
    'NZDUSD': { 
        pipDecimal: 0.0001, 
        contractSize: 100000, 
        name: 'New Zealand Dollar/USD',
        pipPosition: 4 
    },
    'EURGBP': { 
        pipDecimal: 0.0001, 
        contractSize: 100000, 
        name: 'Euro/Pound',
        pipPosition: 4 
    },
    'EURJPY': { 
        pipDecimal: 0.01, 
        contractSize: 100000, 
        name: 'Euro/Yen',
        pipPosition: 2 
    }
};

// Sayfa yüklendiğinde parite değişimini dinle
document.addEventListener('DOMContentLoaded', function() {
    const currencyPairSelect = document.getElementById('currencyPair');
    currencyPairSelect.addEventListener('change', updateContractSize);
    
    // İlk yüklemede sözleşme büyüklüğünü güncelle
    updateContractSize();
});

// Parite değiştiğinde sözleşme büyüklüğünü otomatik güncelle
function updateContractSize() {
    const currencyPair = document.getElementById('currencyPair').value;
    const contractSizeInput = document.getElementById('contractSize');
    
    if (currencyPairData[currencyPair]) {
        contractSizeInput.value = currencyPairData[currencyPair].contractSize;
    }
}

// Ana hesaplama fonksiyonu
function calculate() {
    try {
        // Form değerlerini al
        const currencyPair = document.getElementById('currencyPair').value;
        const lotSize = parseFloat(document.getElementById('lotSize').value);
        const contractSize = parseFloat(document.getElementById('contractSize').value);
        const leverage = parseFloat(document.getElementById('leverage').value);
        const currentPrice = parseFloat(document.getElementById('currentPrice').value);
        const stopLoss = parseFloat(document.getElementById('stopLoss').value);
        const takeProfit = parseFloat(document.getElementById('takeProfit').value);

        // Input validasyonu
        if (isNaN(lotSize) || isNaN(contractSize) || isNaN(currentPrice) || 
            isNaN(stopLoss) || isNaN(takeProfit) || lotSize <= 0 || contractSize <= 0) {
            alert('Lütfen tüm alanları doğru bir şekilde doldurun!');
            return;
        }

        // Parite bilgilerini al
        const pairData = currencyPairData[currencyPair];
        if (!pairData) {
            alert('Seçilen parite için veri bulunamadı!');
            return;
        }

        // Temel hesaplamalar
        const positionSize = lotSize * contractSize;
        const pipValue = calculatePipValue(lotSize, contractSize, currentPrice, currencyPair);
        
        // Pip mesafelerini hesapla
        const slDistance = calculatePipDistance(currentPrice, stopLoss, pairData.pipDecimal);
        const tpDistance = calculatePipDistance(currentPrice, takeProfit, pairData.pipDecimal);
        
        // Kar/Zarar hesaplamaları
        const maxLoss = Math.abs(slDistance * pipValue);
        const maxProfit = Math.abs(tpDistance * pipValue);
        
        // Risk/Ödül oranı
        const riskRewardRatio = maxProfit / maxLoss;
        
        // Gerekli marj hesaplama
        const requiredMargin = (positionSize * currentPrice) / leverage;

        // Sonuçları göster
        displayResults({
            positionSize: positionSize,
            pipValue: pipValue,
            maxProfit: maxProfit,
            maxLoss: maxLoss,
            requiredMargin: requiredMargin,
            riskRewardRatio: riskRewardRatio,
            slDistance: Math.abs(slDistance),
            tpDistance: Math.abs(tpDistance)
        });

    } catch (error) {
        console.error('Hesaplama hatası:', error);
        alert('Hesaplama sırasında bir hata oluştu. Lütfen değerleri kontrol edin.');
    }
}

// Pip değeri hesaplama
function calculatePipValue(lotSize, contractSize, currentPrice, currencyPair) {
    const pairData = currencyPairData[currencyPair];
    
    if (currencyPair === 'XAUUSD' || currencyPair === 'GER30_10' || currencyPair === 'DE40' || currencyPair === 'US100_20' || currencyPair === 'NDX100' || currencyPair === 'SWI20') {
        // Emtialar ve endeksler için: lot * sözleşme büyüklüğü * 1.0
        // Bu enstrümanlarda 1 birim fiyat hareketi = lot * sözleşme * 1 dolar kar/zarar
        return lotSize * contractSize * 1.0;
    } else if (currencyPair === 'UKOIL' || currencyPair === 'UKO') {
        // Brent petrol için: lot * sözleşme büyüklüğü * 0.01 (cent bazında)
        return lotSize * contractSize * 0.01;
    } else if (currencyPair === 'XAGUSD') {
        // Gümüş için özel hesaplama: lot * sözleşme * 0.01 (cent bazlı)
        return lotSize * contractSize * 0.01;
    } else if (currencyPair.endsWith('USD')) {
        // USD base olan çiftler için
        return (lotSize * contractSize * pairData.pipDecimal);
    } else if (currencyPair.startsWith('USD')) {
        // USD quote olan çiftler için
        return (lotSize * contractSize * pairData.pipDecimal) / currentPrice;
    } else {
        // Cross currency çiftler için (basitleştirilmiş)
        return (lotSize * contractSize * pairData.pipDecimal);
    }
}

// Pip mesafesi hesaplama
function calculatePipDistance(currentPrice, targetPrice, pipDecimal) {
    const priceDifference = targetPrice - currentPrice;
    
    // Enstrümana göre pip mesafesi hesaplama
    const currencyPair = document.getElementById('currencyPair').value;
    let pipDistance;
    
    if (currencyPair === 'XAUUSD' || currencyPair === 'GER30_10' || currencyPair === 'DE40' || currencyPair === 'US100_20' || currencyPair === 'NDX100' || currencyPair === 'SWI20') {
        pipDistance = priceDifference; // Bu enstrümanlarda 1 birim = 1 pip
    } else if (currencyPair === 'UKOIL' || currencyPair === 'UKO') {
        pipDistance = priceDifference / 0.01; // Brent petrol için cent bazında
    } else if (currencyPair === 'XAGUSD') {
        pipDistance = priceDifference / 0.01; // Gümüş için cent bazlı
    } else {
        pipDistance = priceDifference / pipDecimal;
    }
    
    return pipDistance;
}

// Sonuçları ekranda göster
function displayResults(results) {
    document.getElementById('positionSize').textContent = formatCurrency(results.positionSize, 'units');
    document.getElementById('pipValue').textContent = formatCurrency(results.pipValue, 'USD');
    document.getElementById('maxProfit').textContent = formatCurrency(results.maxProfit, 'USD');
    document.getElementById('maxLoss').textContent = formatCurrency(results.maxLoss, 'USD');
    document.getElementById('requiredMargin').textContent = formatCurrency(results.requiredMargin, 'USD');
    document.getElementById('riskRewardRatio').textContent = '1:' + results.riskRewardRatio.toFixed(2);
    document.getElementById('slDistance').textContent = results.slDistance.toFixed(1) + ' pip';
    document.getElementById('tpDistance').textContent = results.tpDistance.toFixed(1) + ' pip';

    // Renk kodlaması
    const profitElement = document.getElementById('maxProfit').parentElement;
    const lossElement = document.getElementById('maxLoss').parentElement;
    
    profitElement.classList.remove('loss');
    profitElement.classList.add('profit');
    
    lossElement.classList.remove('profit');
    lossElement.classList.add('loss');

    // Risk/Ödül oranı rengi
    const rrElement = document.getElementById('riskRewardRatio');
    if (results.riskRewardRatio >= 2) {
        rrElement.style.color = '#28a745'; // Yeşil - iyi oran
    } else if (results.riskRewardRatio >= 1) {
        rrElement.style.color = '#ffc107'; // Sarı - kabul edilebilir
    } else {
        rrElement.style.color = '#dc3545'; // Kırmızı - riskli
    }
}

// Sayı formatlama fonksiyonu
function formatCurrency(amount, currency = 'USD') {
    if (currency === 'USD') {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } else if (currency === 'units') {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' birim';
    }
    return amount.toString();
}

// Klavye kısayolları
document.addEventListener('keydown', function(event) {
    // Enter tuşu ile hesaplama
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        calculate();
    }
    
    // Ctrl+R ile sayfayı yenileme yerine formu temizle
    if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        resetForm();
    }
});

// Formu sıfırla
function resetForm() {
    document.getElementById('lotSize').value = '0.1';
    document.getElementById('currentPrice').value = '';
    document.getElementById('stopLoss').value = '';
    document.getElementById('takeProfit').value = '';
    document.getElementById('leverage').value = '100';
    
    // Sonuçları temizle
    const resultElements = ['positionSize', 'pipValue', 'maxProfit', 'maxLoss', 
                           'requiredMargin', 'riskRewardRatio', 'slDistance', 'tpDistance'];
    
    resultElements.forEach(id => {
        document.getElementById(id).textContent = '-';
    });
}

// Gerçek zamanlı hesaplama (opsiyonel)
function enableRealTimeCalculation() {
    const inputs = ['lotSize', 'currentPrice', 'stopLoss', 'takeProfit', 'leverage', 'contractSize'];
    
    inputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        element.addEventListener('input', debounce(calculate, 500));
    });
}

// Debounce fonksiyonu - çok fazla hesaplama yapmamak için
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Risk uyarıları
function checkRiskWarnings(riskRewardRatio, maxLoss, requiredMargin) {
    const warnings = [];
    
    if (riskRewardRatio < 1) {
        warnings.push('Dikkat: Risk/Ödül oranınız 1:1\'in altında. Bu riskli bir işlem olabilir.');
    }
    
    if (maxLoss > requiredMargin * 0.5) {
        warnings.push('Dikkat: Maksimum zararınız marjınızın yarısından fazla.');
    }
    
    return warnings;
}

// Sayfa yüklendiğinde gerçek zamanlı hesaplamayı etkinleştir (opsiyonel)
// document.addEventListener('DOMContentLoaded', enableRealTimeCalculation);