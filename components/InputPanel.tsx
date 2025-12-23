import React, { useState } from 'react';
import { Plus, Trash2, Settings, List, Grid3X3, ArrowRight, Layers, AlertCircle, ScanLine, X, Eraser, ChevronDown, ChevronUp } from 'lucide-react';
import { LabelConfig, GeneratorType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface InputPanelProps {
  onAddLabels: (codes: string[]) => void;
  onClearLabels: () => void;
  config: LabelConfig;
  setConfig: (config: LabelConfig) => void;
  labelCount: number;
}

interface CustomRule {
  id: string;
  pos: number | null; // null implies ALL
  level: number | null; // null implies ALL
  suffix: string;
}

export const InputPanel: React.FC<InputPanelProps> = ({ 
  onAddLabels, 
  onClearLabels, 
  config, 
  setConfig,
  labelCount
}) => {
  const [activeTab, setActiveTab] = useState<GeneratorType>(GeneratorType.SERIES);
  const [manualInput, setManualInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Collapse state
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  
  // Series state
  const [aisle, setAisle] = useState('A'); // Dãy
  const [startPos, setStartPos] = useState(1); // Vị trí bắt đầu
  const [endPos, setEndPos] = useState(1); // Vị trí kết thúc
  const [levels, setLevels] = useState(6); // Số tầng

  // Custom Rules State
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);
  const [rulePos, setRulePos] = useState<string>('');
  const [ruleLevel, setRuleLevel] = useState<string>('');
  const [ruleSuffix, setRuleSuffix] = useState('');

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    const codes = manualInput.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    onAddLabels(codes);
    setManualInput('');
  };

  const handleSeriesSubmit = () => {
    const codes = [];
    // Loop through positions (Vị trí)
    for (let pos = startPos; pos <= endPos; pos++) {
      // Loop through levels (Tầng)
      for (let level = 1; level <= levels; level++) {
        // Check for custom rules
        // A rule matches if:
        // 1. rule.pos is null (ALL) OR rule.pos matches current pos
        // 2. AND rule.level is null (ALL) OR rule.level matches current level
        const rule = customRules.find(r => {
          const posMatch = r.pos === null || r.pos === pos;
          const levelMatch = r.level === null || r.level === level;
          return posMatch && levelMatch;
        });
        
        const suffix = rule ? rule.suffix : '';
        
        // Format: [Dãy].[Vị trí].[Tầng][Suffix] (e.g., A.1.1S)
        codes.push(`${aisle}.${pos}.${level}${suffix}`);
      }
    }
    onAddLabels(codes);
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onClearLabels();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      // Auto reset confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const addCustomRule = () => {
    // Empty string means Apply to All (null)
    const p = rulePos.trim() === '' ? null : parseInt(rulePos);
    const l = ruleLevel.trim() === '' ? null : parseInt(ruleLevel);
    
    // Validation: Check if numbers are valid when provided, and suffix is present
    const isPosValid = p === null || !isNaN(p);
    const isLevelValid = l === null || !isNaN(l);

    if (isPosValid && isLevelValid && ruleSuffix.trim()) {
      setCustomRules([...customRules, {
        id: uuidv4(),
        pos: p,
        level: l,
        suffix: ruleSuffix.trim()
      }]);
      setRulePos('');
      setRuleLevel('');
      setRuleSuffix('');
    }
  };

  const removeCustomRule = (id: string) => {
    setCustomRules(customRules.filter(r => r.id !== id));
  };

  return (
    <div className="bg-white shadow-lg rounded-xl h-full flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Cấu hình
        </h2>
        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          {labelCount} tem
        </span>
      </div>

      {/* Configuration Form - Scrollable */}
      <div className="border-b border-gray-100 overflow-y-auto custom-scrollbar flex-shrink-0" style={{ maxHeight: '50%' }}>
         {/* Layout Config */}
         <div className="border-b border-gray-100 last:border-0">
             <button 
                onClick={() => setIsLayoutOpen(!isLayoutOpen)}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors"
             >
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Settings className="w-3 h-3" /> Layout (Kích thước)
                </h3>
                {isLayoutOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
             </button>
             
             {isLayoutOpen && (
               <div className="p-3 bg-gray-50/50 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                   <div>
                      <label className="text-xs font-medium text-gray-600">Rộng (mm)</label>
                      <input 
                        type="number" 
                        value={config.width}
                        onChange={(e) => setConfig({...config, width: parseInt(e.target.value) || 0})}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm outline-none"
                      />
                   </div>
                   <div>
                      <label className="text-xs font-medium text-gray-600">Cao (mm)</label>
                      <input 
                        type="number" 
                        value={config.height}
                        onChange={(e) => setConfig({...config, height: parseInt(e.target.value) || 0})}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm outline-none"
                      />
                   </div>
                   <div>
                      <label className="text-xs font-medium text-gray-600">Số cột</label>
                      <input 
                        type="number" 
                        value={config.columns}
                        onChange={(e) => setConfig({...config, columns: parseInt(e.target.value) || 1})}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm outline-none"
                      />
                   </div>
                   <div>
                      <label className="text-xs font-medium text-gray-600">Khoảng cách</label>
                      <input 
                        type="number" 
                        value={config.gap}
                        onChange={(e) => setConfig({...config, gap: parseInt(e.target.value) || 0})}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm outline-none"
                      />
                   </div>
               </div>
             )}
         </div>

         {/* Style Config */}
         <div className="border-b border-gray-100 last:border-0">
             <button 
                onClick={() => setIsStyleOpen(!isStyleOpen)}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors"
             >
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                     <ScanLine className="w-3 h-3" /> Hiển thị
                 </h3>
                 {isStyleOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
             </button>

             {isStyleOpen && (
               <div className="p-3 bg-gray-50/50 animate-in slide-in-from-top-2 duration-200">
                   <div className="grid grid-cols-2 gap-3 mb-3">
                       <div>
                          <label className="text-xs font-medium text-gray-600">Size chữ</label>
                          <input 
                            type="number" 
                            value={config.fontSize}
                            onChange={(e) => setConfig({...config, fontSize: parseInt(e.target.value) || 12})}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm outline-none"
                          />
                       </div>
                       <div>
                          <label className="text-xs font-medium text-gray-600">Cao Barcode</label>
                          <input 
                            type="number" 
                            value={config.barcodeHeight}
                            onChange={(e) => setConfig({...config, barcodeHeight: parseInt(e.target.value) || 20})}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm outline-none"
                          />
                       </div>
                       <div>
                          <label className="text-xs font-medium text-gray-600">Độ dày vạch</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={config.barWidth || 2}
                            onChange={(e) => setConfig({...config, barWidth: parseFloat(e.target.value) || 1})}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm outline-none"
                          />
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                     <input 
                       type="checkbox"
                       id="showText"
                       checked={config.showText}
                       onChange={(e) => setConfig({...config, showText: e.target.checked})}
                       className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                     />
                     <label htmlFor="showText" className="text-sm text-gray-700">Hiển thị mã số</label>
                   </div>
               </div>
             )}
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <button 
          onClick={() => setActiveTab(GeneratorType.SERIES)}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === GeneratorType.SERIES ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Grid3X3 className="w-4 h-4" /> Dãy số
        </button>
        <button 
          onClick={() => setActiveTab(GeneratorType.MANUAL)}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === GeneratorType.MANUAL ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <List className="w-4 h-4" /> Nhập liệu
        </button>
      </div>

      {/* Input Content */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
        {activeTab === GeneratorType.MANUAL && (
          <div className="flex flex-col h-full">
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Nhập mã vị trí, mỗi mã một dòng...&#10;A.1.1&#10;A.1.2"
              className="flex-1 w-full p-3 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
            <button 
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Thêm vào danh sách
            </button>
          </div>
        )}

        {activeTab === GeneratorType.SERIES && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Tên Dãy</label>
              <input 
                type="text" 
                value={aisle} 
                onChange={e => setAisle(e.target.value)} 
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none uppercase" 
                placeholder="Ví dụ: A" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Vị trí (Start)</label>
                <input 
                  type="number" 
                  min="1"
                  value={startPos} 
                  onChange={e => setStartPos(parseInt(e.target.value) || 1)} 
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Vị trí (End)</label>
                <input 
                  type="number" 
                  min="1"
                  value={endPos} 
                  onChange={e => setEndPos(parseInt(e.target.value) || 1)} 
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Số tầng mỗi vị trí
              </label>
              <input 
                type="number" 
                min="1"
                value={levels} 
                onChange={e => setLevels(parseInt(e.target.value) || 1)} 
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Mặc định: 6" 
              />
            </div>

            {/* Custom Rules Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2">
                <Eraser className="w-3 h-3" /> Tùy chỉnh (Đặc biệt)
              </label>
              <p className="text-[10px] text-gray-400 mb-2 italic">
                *Để trống vị trí hoặc tầng để áp dụng cho tất cả.
              </p>
              
              <div className="flex gap-2 items-end mb-2">
                <div className="w-16">
                   <label className="text-[10px] text-gray-500">Vị trí</label>
                   <input 
                    type="number" 
                    placeholder="All"
                    value={rulePos}
                    onChange={(e) => setRulePos(e.target.value)}
                    className="w-full p-1 border rounded text-sm outline-none focus:border-blue-500 placeholder:text-gray-300"
                   />
                </div>
                <div className="w-16">
                   <label className="text-[10px] text-gray-500">Tầng</label>
                   <input 
                    type="number" 
                    placeholder="All"
                    value={ruleLevel}
                    onChange={(e) => setRuleLevel(e.target.value)}
                    className="w-full p-1 border rounded text-sm outline-none focus:border-blue-500 placeholder:text-gray-300"
                   />
                </div>
                <div className="flex-1">
                   <label className="text-[10px] text-gray-500">Ký tự thêm</label>
                   <input 
                    type="text" 
                    placeholder="Suffix (e.g. S)"
                    value={ruleSuffix}
                    onChange={(e) => setRuleSuffix(e.target.value)}
                    className="w-full p-1 border rounded text-sm outline-none focus:border-blue-500"
                   />
                </div>
                <button 
                  onClick={addCustomRule}
                  disabled={!ruleSuffix.trim()}
                  className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {customRules.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {customRules.map(rule => (
                    <div key={rule.id} className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded-full">
                      <span>
                        V:{rule.pos === null ? 'All' : rule.pos} 
                        . 
                        T:{rule.level === null ? 'All' : rule.level} 
                        &rarr; +"{rule.suffix}"
                      </span>
                      <button onClick={() => removeCustomRule(rule.id)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={handleSeriesSubmit}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <ArrowRight className="w-4 h-4" /> Tạo dãy ({ (endPos - startPos + 1) * levels } tem)
            </button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-white space-y-2 flex-shrink-0">
        <button 
          onClick={handleDeleteClick}
          disabled={labelCount === 0}
          className={`w-full py-2 border rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
            confirmDelete 
              ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
              : 'border-red-200 text-red-600 hover:bg-red-50'
          }`}
        >
          {confirmDelete ? (
            <>
              <AlertCircle className="w-4 h-4" />
              Xác nhận xóa tất cả?
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Xóa tất cả
            </>
          )}
        </button>
      </div>
    </div>
  );
};