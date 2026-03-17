import React, { useState, useEffect } from "react";

interface VATCalculatorProps {
  company: any;
  onBack: () => void;
}

export const VATCalculator: React.FC<VATCalculatorProps> = ({ company, onBack }) => {
  const [amount, setAmount] = useState<number>(1000);
  const [vatRate, setVatRate] = useState<number>(15);
  const [calcType, setCalcType] = useState<"exclusive" | "inclusive">("exclusive");
  
  const [results, setResults] = useState({
    baseAmount: 0,
    vatAmount: 0,
    totalAmount: 0
  });

  const c = company.primaryColor;

  useEffect(() => {
    let base = 0;
    let vat = 0;
    let total = 0;

    if (calcType === "exclusive") {
      base = amount;
      vat = (amount * vatRate) / 100;
      total = base + vat;
    } else {
      total = amount;
      base = amount / (1 + vatRate / 100);
      vat = total - base;
    }

    setResults({
      baseAmount: base,
      vatAmount: vat,
      totalAmount: total
    });
  }, [amount, vatRate, calcType]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10" style={{ direction: "rtl" }}>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-center text-white" style={{ background: c }}>
          <button onClick={onBack} className="float-right bg-white/20 border-none text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/30 transition-colors">رجوع</button>
          <div className="text-4xl mb-2">🧾</div>
          <h2 className="m-0 text-lg md:text-xl font-bold">حاسبة ضريبة القيمة المضافة (VAT)</h2>
          <p className="mt-1 mb-0 text-[10px] md:text-xs opacity-80 uppercase tracking-wider">VAT Calculator (KSA 15%)</p>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-6">
            <label className="block text-xs font-bold mb-2 text-gray-700">نوع الحساب</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => setCalcType("exclusive")} 
                className={`flex-1 p-3 rounded-xl border-2 transition-all font-bold text-xs md:text-sm ${calcType === "exclusive" ? 'border-current bg-current/10' : 'border-gray-200 bg-white'}`}
                style={{ color: calcType === "exclusive" ? c : "#666" }}
              >
                المبلغ غير شامل الضريبة
              </button>
              <button 
                onClick={() => setCalcType("inclusive")} 
                className={`flex-1 p-3 rounded-xl border-2 transition-all font-bold text-xs md:text-sm ${calcType === "inclusive" ? 'border-current bg-current/10' : 'border-gray-200 bg-white'}`}
                style={{ color: calcType === "inclusive" ? c : "#666" }}
              >
                المبلغ شامل الضريبة
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold mb-2 text-gray-700">المبلغ (ريال)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(Number(e.target.value))} 
              className="w-full p-3 rounded-xl border border-gray-300 text-xl font-bold focus:ring-2 focus:outline-none transition-all"
              style={{ "--tw-ring-color": c + "44" } as any}
            />
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold mb-2 text-gray-700">نسبة الضريبة (%)</label>
            <select 
              value={vatRate} 
              onChange={e => setVatRate(Number(e.target.value))} 
              className="w-full p-3 rounded-xl border border-gray-300 text-sm md:text-base focus:ring-2 focus:outline-none transition-all"
              style={{ "--tw-ring-color": c + "44" } as any}
            >
              <option value={15}>15% (المملكة العربية السعودية)</option>
              <option value={5}>5%</option>
              <option value={0}>0%</option>
            </select>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <span className="text-xs md:text-sm text-gray-500">المبلغ الأساسي (قبل الضريبة)</span>
              <span className="font-bold text-sm md:text-base">{results.baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <span className="text-xs md:text-sm text-gray-500">قيمة الضريبة ({vatRate}%)</span>
              <span className="font-bold text-sm md:text-base text-orange-600">{results.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال</span>
            </div>
            <div className="text-center mt-4">
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1" style={{ color: c }}>الإجمالي النهائي</div>
              <div className="text-3xl md:text-4xl font-black text-gray-900">
                {results.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                <span className="text-sm md:text-base mr-1">ريال</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-[10px] md:text-xs text-gray-400 leading-relaxed bg-white p-4 rounded-xl border border-gray-100">
            <strong className="text-gray-600">ملاحظة:</strong> تُستخدم هذه الحاسبة للمطالبات المالية والمشتريات الإدارية. تأكد من مطابقة النتائج مع الفواتير الضريبية الرسمية الصادرة من الموردين.
          </div>
        </div>
      </div>
    </div>
  );
};
