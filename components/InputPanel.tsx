import React, { useState } from 'react';
import { Plus, Trash2, Wand2, Settings, Printer, List, FileSpreadsheet, Grid3X3, ArrowRight, Layers, AlertCircle, Type, ScanLine } from 'lucide-react';
import { LabelConfig, GeneratorType } from '../types';
import { generateLocationsWithAI } from '../services/geminiService';

interface InputPanelProps {
  onAddLabels: (codes: string[]) => void;
  onClearLabels: () => void;
  config: LabelConfig;
  setConfig: (config: LabelConfig) => void;
  labelCount: number;
}

export const InputPanel: React.FC<InputPanelProps> = ({ 
  onAddLabels, 
  onClearLabels, 
  config, 
  setConfig,
  labelCount
}) => {
  const [activeTab, setActiveTab] = useState<GeneratorType>(GeneratorType.SERIES); // Default to Series as requested
  const [manualInput, setManualInput] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Series state matching specific requirements
  const [aisle, setAisle] = useState('A'); // Dãy
  const [startPos, setStartPos] = useState(1); // Vị trí bắt đầu
  const [endPos, setEndPos] = useState(1); // Vị trí kết thúc
  const [levels, setLevels] = useState(6); // Số tầng (default 6 as per request)

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    const codes = manualInput.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    onAddLabels(codes);
    setManualInput('');
  };

  const handleAiSubmit = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const codes = await generateLocationsWithAI(aiPrompt);
      onAddLabels(codes);
      setAiPrompt('');
    } catch (error) {
      alert('Lỗi khi tạo mã: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSeriesSubmit = () => {
    const codes = [];
    // Loop through positions (Vị trí)
    for (let pos = startPos; pos <= endPos; pos++) {
      // Loop through levels (Tầng) - Fixed logic as requested
      for (let level = 1; level <= levels; level++) {
        // Format: [Dãy].[Vị trí].[Tầng] (e.g., A.1.1)
        codes.push(`${aisle}.${pos}.${level}`);
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

  return (
    <div className="bg-white shadow-lg rounded-xl h-full flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Cấu hình Tem
        </h2>
        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          {labelCount} tem đã tạo
        </span>
      </div>

      {/* Configuration Form - Scrollable */}
      <div className="p-4 border-b border-gray-100 max-h-[40%] overflow-y-auto custom-scrollbar">
         {/* Layout Config */}
         <div className="mb-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                 <Settings className="w-3 h-3" /> Layout
             </h3>
             <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-xs font-medium text-gray-600">Rộng (mm)</label>
                    <input 
                      type="number" 
                      value={config.width}
                      onChange={(e) => setConfig({...config, width: parseInt(e.target.value) || 0})}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-medium text-gray-600">Cao (mm)</label>
                    <input 
                      type="number" 
                      value={config.height}
                      onChange={(e) => setConfig({...config, height: parseInt(e.target.value) || 0})}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-medium text-gray-600">Số cột</label>
                    <input 
                      type="number" 
                      value={config.columns}
                      onChange={(e) => setConfig({...config, columns: parseInt(e.target.value) || 1})}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-medium text-gray-600">Khoảng cách</label>
                    <input 
                      type="number" 
                      value={config.gap}
                      onChange={(e) => setConfig({...config, gap: parseInt(e.target.value) || 0})}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                 </div>
             </div>
         </div>

         {/* Style Config */}
         <div>
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                 <ScanLine className="w-3 h-3" /> Hiển thị
             </h3>
             <div className="grid grid-cols-2 gap-3 mb-3">
                 <div>
                    <label className="text-xs font-medium text-gray-600">Size chữ</label>
                    <input 
                      type="number" 
                      value={config.fontSize}
                      onChange={(e) => setConfig({...config, fontSize: parseInt(e.target.value) || 12})}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-medium text-gray-600">Cao Barcode</label>
                    <input 
                      type="number" 
                      value={config.barcodeHeight}
                      onChange={(e) => setConfig({...config, barcodeHeight: parseInt(e.target.value) || 20})}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-medium text-gray-600">Độ dày vạch</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={config.barWidth || 2}
                      onChange={(e) => setConfig({...config, barWidth: parseFloat(e.target.value) || 1})}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
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
               <label htmlFor="showText" className="text-sm text-gray-700">Hiển thị mã số dưới barcode</label>
             </div>
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
        <button 
          onClick={() => setActiveTab(GeneratorType.AI)}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === GeneratorType.AI ? 'bg-white text-purple-600 border-t-2 border-t-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Wand2 className="w-4 h-4" /> AI Gen
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
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
                <p className="text-xs text-blue-800">
                    Hệ thống sẽ tự động tạo mã theo format: <strong>[Dãy].[Vị Trí].[Tầng]</strong>
                </p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700">Tên Dãy (Kho có 16 dãy)</label>
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
                <label className="text-sm font-semibold text-gray-700">Vị trí bắt đầu</label>
                <input 
                  type="number" 
                  min="1"
                  value={startPos} 
                  onChange={e => setStartPos(parseInt(e.target.value) || 1)} 
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Vị trí kết thúc</label>
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
              <p className="text-xs text-gray-500 mt-1">Mặc định 6 tầng (1 &rarr; {levels})</p>
            </div>

            <button 
              onClick={handleSeriesSubmit}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <ArrowRight className="w-4 h-4" /> Tạo dãy ({ (endPos - startPos + 1) * levels } tem)
            </button>
          </div>
        )}

        {activeTab === GeneratorType.AI && (
          <div className="flex flex-col h-full">
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 mb-3 text-xs text-purple-800">
              <strong className="block mb-1">Mẹo AI:</strong> 
              Hãy mô tả cấu trúc kho của bạn tự nhiên. Ví dụ: "Khu B từ vị trí 1 đến 5, mỗi vị trí 6 tầng."
            </div>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Mô tả cấu trúc kho của bạn..."
              className="flex-1 w-full p-3 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
            />
            <button 
              onClick={handleAiSubmit}
              disabled={!aiPrompt.trim() || isGenerating}
              className="mt-3 w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              {isGenerating ? 'Đang suy nghĩ...' : 'Tạo Tự Động'}
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