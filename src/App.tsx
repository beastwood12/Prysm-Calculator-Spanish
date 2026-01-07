import React, { useState, useEffect } from 'react';
import { Calculator, Users, TrendingUp, ArrowDown } from 'lucide-react';

export default function PrysmSalesCalculator() {
  const [data, setData] = useState({
    affiliates: '', 
    participationRate: '', 
    monthlyScans: '', 
    conversionRate: '', 
    monthlyPurchase: ''
  });
  
  const [selectedCurrency, setSelectedCurrency] = useState('MXN');
  const [exchangeRates, setExchangeRates] = useState({
    'USD': 1.0000, 'ARS': 1000.00, 'CLP': 950.00, 'COP': 4200.00, 'MXN': 20.15, 'PEN': 3.90
  });
  
  const [ratesLoading, setRatesLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      setRatesLoading(true);
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        if (data.rates) {
          setExchangeRates({
            'USD': 1.0000,
            'ARS': data.rates.ARS || 1000.00,
            'CLP': data.rates.CLP || 950.00,
            'COP': data.rates.COP || 4200.00,
            'MXN': data.rates.MXN || 20.15,
            'PEN': data.rates.PEN || 3.90
          });
          setLastUpdated(new Date().toLocaleString());
        }
      } catch (error) {
        console.log('Using fallback exchange rates');
      } finally {
        setRatesLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  const handleChange = (field, value) => {
    const cleaned = value.replace(/[\$,%]/g, '');
    setData(prev => ({ ...prev, [field]: cleaned === '' ? '' : (parseFloat(cleaned) || 0) }));
  };

  const format = (field, value) => {
    if (value === '' || value === null) return '';
    if (field.includes('Rate') && focusedField !== field) return value + '%';
    if (field === 'monthlyPurchase') return value;
    if (field.includes('Rate')) return value;
    return value.toLocaleString();
  };

  const prysmOwners = data.affiliates * (data.participationRate / 100);
  const prysmDeviceRevenue = prysmOwners * 150;
  const totalScanned = prysmOwners * data.monthlyScans;
  const buyers = totalScanned * (data.conversionRate / 100);
  const monthlySales = buyers * data.monthlyPurchase;
  const g15BreakawayBonus = Math.round(monthlySales * 0.05);
  const annualSales = monthlySales * 12;

  const usdAmountRaw = g15BreakawayBonus * 0.93506;
  const isCapped = usdAmountRaw > 10000;
  const usdAmount = Math.min(usdAmountRaw, 10000);
  const convertedAmount = usdAmount * exchangeRates[selectedCurrency];
  const exchangeRate = exchangeRates[selectedCurrency];

  const number = val => val.toLocaleString('en-US', { maximumFractionDigits: 0 });
  
  const formatCurrency = (val, currencyCode) => {
    const symbols = { 'USD': '$', 'ARS': '$', 'CLP': '$', 'COP': '$', 'MXN': '$', 'PEN': 'S/' };
    const symbol = symbols[currencyCode] || currencyCode + ' ';
    return symbol + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Calculator className="h-7 w-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Calculadora Básica de Ventas de Productos Prysm v2</h1>
          </div>
          <p className="text-xs text-gray-500 italic">Este calculador de ingresos es exclusivo para la región de Latinoamérica y no debe utilizarse para otros mercados de Nu Skin.</p>
        </div>

        <div className="grid grid-cols-2 gap-x-6">
          {/* Headers */}
          <div className="bg-white rounded-t-xl shadow-lg p-4 pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-600" />
              <h2 className="text-lg font-semibold text-gray-800">Entradas</h2>
            </div>
          </div>
          <div className="bg-white rounded-t-xl shadow-lg p-4 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">Resultados</h2>
            </div>
          </div>

          {/* Row 1: Affiliates + Spacer */}
          <div className="bg-white shadow-lg px-4 py-1">
            <div className="bg-slate-50 p-3 rounded-lg border-l-4 border-slate-400">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad mensual de Afiliados o Líderes de Ventas</label>
              <input
                type="text"
                value={format('affiliates', data.affiliates)}
                onChange={(e) => handleChange('affiliates', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Ej.: 100 afiliados o 20 líderes de ventas"
              />
            </div>
            <div className="flex justify-center my-1"><ArrowDown className="h-5 w-5 text-slate-500" /></div>
          </div>
          <div className="bg-white shadow-lg px-4 py-1 flex flex-col justify-end">
            <div className="flex justify-center my-1"><ArrowDown className="h-5 w-5 text-slate-500" /></div>
          </div>

          {/* Row 2: Participation Rate + Prysm Owners */}
          <div className="bg-white shadow-lg px-4 py-1">
            <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-400">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de Participación (%)</label>
              <div className="text-xs text-gray-600 mb-1 italic">
                Este es el porcentaje de las personas anteriores que crees que comprarán (o recibirán de alguna otra manera) un dispositivo Prysm. Como referencia, EE. UU. tuvo una participación BR+ del 50% para el lanzamiento previo de Collagen+ 2021. Para el lanzamiento completo hubo una tasa de participación del 25%.
              </div>
              <input
                type="text"
                value={format('participationRate', data.participationRate)}
                onChange={(e) => handleChange('participationRate', e.target.value)}
                onFocus={() => setFocusedField('participationRate')}
                onBlur={() => setFocusedField(null)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ej.: 25%–50%"
              />
            </div>
            <div className="flex justify-center my-1"><ArrowDown className="h-5 w-5 text-indigo-500" /></div>
          </div>
          <div className="bg-white shadow-lg px-4 py-1">
            <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-400">
              <span className="text-sm font-medium text-gray-700">Propietarios de Prysm</span>
              <div className="text-lg font-semibold text-indigo-600 my-1">{number(prysmOwners)}</div>
              <div className="text-xs text-gray-500 bg-white p-2 rounded mb-2">
                Fórmula: {number(data.affiliates)} × {data.participationRate}%
              </div>
              <div className="text-xs text-indigo-700 bg-indigo-100 p-2 rounded">
                Volumen de ventas de dispositivos: {number(prysmOwners)} × 150 = {number(prysmDeviceRevenue)}
              </div>
            </div>
            <div className="flex justify-center my-1"><ArrowDown className="h-5 w-5 text-indigo-500" /></div>
          </div>

          {/* Row 3: Monthly Scans + Total Scanned */}
          <div className="bg-white shadow-lg px-4 py-1">
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
              <label className="block text-sm font-medium text-gray-700 mb-1">Personas Escaneadas Mensualmente por Propietario de Prysm</label>
              <div className="text-xs text-gray-600 mb-1 italic">
                El número de personas que cada propietario de Prysm escaneará mensualmente. Como referencia, según conversaciones con operadores actuales de escáneres, esto probablemente esté entre 10 y 20 escaneos por mes.
              </div>
              <input
                type="text"
                value={format('monthlyScans', data.monthlyScans)}
                onChange={(e) => handleChange('monthlyScans', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej.: 10–20"
              />
            </div>
            <div className="flex justify-center my-1"><ArrowDown className="h-5 w-5 text-blue-500" /></div>
          </div>
          <div className="bg-white shadow-lg px-4 py-1">
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
              <span className="text-sm font-medium text-gray-700">Total de Personas Escaneadas</span>
              <div className="text-lg font-semibold text-blue-600 my-1">{number(totalScanned)}</div>
              <div className="text-xs text-gray-500 bg-white p-2 rounded">
                Fórmula: {number(prysmOwners)} × {data.monthlyScans}
              </div>
            </div>
            <div className="flex justify-center my-1"><ArrowDown className="h-5 w-5 text-blue-500" /></div>
          </div>

          {/* Row 4: Conversion Rate + Converted Buyers */}
          <div className="bg-white shadow-lg px-4 py-1">
            <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de Conversión a Suscripción (%)</label>
              <div className="text-xs text-gray-600 mb-1 italic">
                El porcentaje de personas que son escaneadas y que crees que comprarán algun producto (idealmente como suscripción). Como referencia, los operadores actuales de escáneres creen que esto es aproximadamente del 10%.
              </div>
              <input
                type="text"
                value={format('conversionRate', data.conversionRate)}
                onChange={(e) => handleChange('conversionRate', e.target.value)}
                onFocus={() => setFocusedField('conversionRate')}
                onBlur={() => setFocusedField(null)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej.: 10%"
              />
            </div>
            <div className="flex justify-center my-1"><ArrowDown className="h-5 w-5 text-purple-500" /></div>
          </div>
          <div className="bg-white shadow-lg px-4 py-1">
            <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
              <span className="text-sm font-medium text-gray-700">Compradores Convertidos</span>
              <div className="text-lg font-semibold text-purple-600 my-1">{number(buyers)}</div>
              <div className="text-xs text-gray-500 bg-white p-2 rounded">
                Fórmula: {number(totalScanned)} × {data.conversionRate}%
              </div>
            </div>
            <div className="flex justify-center my-1"><ArrowDown className="h-5 w-5 text-purple-500" /></div>
          </div>

          {/* Row 5: Sales Volume + Monthly Sales */}
          <div className="bg-white shadow-lg px-4 py-1">
            <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
              <label className="block text-sm font-medium text-gray-700 mb-1">Volumen Proyectado de Ventas por Suscriptor</label>
              <div className="text-xs text-gray-600 mb-1 italic">
                La cantidad que crees que cada nuevo suscriptor comprará en un mes determinado. En promedio, un nuevo suscriptor que compra productos SCS (productos certificados por el escaner) adquiere 139 puntos de volumen de producto.
              </div>
              <input
                type="text"
                value={format('monthlyPurchase', data.monthlyPurchase)}
                onChange={(e) => handleChange('monthlyPurchase', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej.: 139"
              />
            </div>
          </div>
          <div className="bg-white shadow-lg px-4 py-1">
            <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
              <span className="text-sm font-medium text-gray-700">Volumen Proyectado Mensual de Ventas de Producto</span>
              <div className="text-lg font-semibold text-green-600 my-1">{number(monthlySales)}</div>
              <div className="text-xs text-gray-500 bg-white p-2 rounded">
                Fórmula: {number(buyers)} × {data.monthlyPurchase}
              </div>
            </div>
          </div>

          {/* Row 6: Disclaimer + Bonus/Currency/Annual */}
          <div className="bg-white shadow-lg px-4 py-1 rounded-b-xl pb-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 my-2">
              <div className="text-xs text-amber-800">
                <strong>Aviso Legal:</strong> Este calculador debe utilizarse únicamente con fines de planificación y establecimiento de metas y no constituye una garantía de éxito ni una predicción de resultados futuros. Generar ventas y compensación como Brand Affiliate requiere tiempo, esfuerzo y dedicación. El éxito también depende de tus habilidades, talentos y capacidades de liderazgo. No existe garantía de éxito financiero, y los resultados pueden variar considerablemente entre los participantes.
                <br /><br />
                En 2024, el número promedio mensual de Brand Affiliates activos en Latinoamérica fue de 9,573. De manera mensual, un promedio aproximado de 4,110 Brand Affiliates —equivalente al 42.0% de los Brand Affiliates activos en Latinoamérica— recibió un pago de compensación por ventas. El pago promedio para los Brand Affiliates activos fue de $53**. Para un desglose más detallado de los ingresos de los Brand Affiliates activos en Latinoamérica, haz clic <a href="https://www.nuskin.com/content/dam/office/s_america/shared/es/business_materials/latam-distributor-compensation-summary.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">AQUÍ</a>.
              </div>
            </div>
          </div>
          <div className="bg-white shadow-lg px-4 py-1 rounded-b-xl pb-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 my-2">
              {isCapped && (
                <div className="text-xs text-red-600 font-medium mb-2">
                  Nota: Las ganancias están limitadas a $10,000 USD
                </div>
              )}
              
              <div className="p-2 bg-white rounded border">
                <div className="text-xs text-gray-700 mb-2">
                  <strong>Bono Potencial de Liderazgo G1–6 (5%):</strong>
                  {ratesLoading && <span className="text-blue-600 ml-2">Actualizando tasas...</span>}
                  {lastUpdated && !ratesLoading && <span className="text-gray-500 ml-2">Actualizado: {lastUpdated}</span>}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs text-gray-600">Moneda:</label>
                  <select 
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 focus:border-transparent w-full max-w-xs"
                  >
                    <option value="ARS">Argentina - Peso argentino (ARS)</option>
                    <option value="CLP">Chile - Peso chileno (CLP)</option>
                    <option value="COP">Colombia - Peso colombiano (COP)</option>
                    <option value="MXN">México - Peso mexicano (MXN)</option>
                    <option value="PEN">Perú - Sol peruano (PEN)</option>
                  </select>
                </div>
                <div className="text-sm font-semibold text-emerald-700">
                  {formatCurrency(convertedAmount, selectedCurrency)}
                </div>
              </div>
            </div>

            <div className="flex justify-center my-1"><ArrowDown className="h-5 w-5 text-green-500" /></div>

            <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
              <span className="text-sm font-medium text-gray-700">Volumen Proyectado Anualizado de Ventas de Producto</span>
              <div className="text-xl font-bold text-yellow-600 my-1">{number(annualSales)}</div>
              <div className="text-xs text-gray-500 bg-white p-2 rounded">
                Fórmula: {number(monthlySales)} × 12
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
