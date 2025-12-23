import React, { useState, useRef, useMemo } from 'react';
import { Printer, Download, Share2, ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import { InputPanel } from './components/InputPanel';
import { BarcodeRenderer } from './components/BarcodeRenderer';
import { LabelConfig, LabelItem } from './types';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC'); // Default Z-A
  const [config, setConfig] = useState<LabelConfig>({
    width: 60, // Default width as requested
    height: 40, // Default height as requested
    fontSize: 20, // Larger font size
    barcodeHeight: 60, // Taller barcode
    showText: true,
    columns: 3, // 3 columns layout
    gap: 4, // 4mm gap
    barWidth: 1.5 // 1.5 bar width density
  });

  // Sort labels based on order
  const sortedLabels = useMemo(() => {
    return [...labels].sort((a, b) => {
      // Use numeric: true for natural sorting (e.g., 2 comes before 10)
      const comparison = a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
      return sortOrder === 'ASC' ? comparison : -comparison;
    });
  }, [labels, sortOrder]);

  // Group labels into strips of 6 (Vertical Grouping)
  const STRIP_SIZE = 6;
  
  const labelStrips = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < sortedLabels.length; i += STRIP_SIZE) {
      chunks.push(sortedLabels.slice(i, i + STRIP_SIZE));
    }
    return chunks;
  }, [sortedLabels]);

  // Pagination for Printing
  // Since a strip of 6 labels (40mm each) is ~240mm tall, and A4 is 297mm tall,
  // we can only fit ONE row of strips vertically per page.
  // Therefore, items per page = number of columns.
  const pages = useMemo(() => {
    const stripsPerPage = config.columns; 
    const chunks = [];
    for (let i = 0; i < labelStrips.length; i += stripsPerPage) {
      chunks.push(labelStrips.slice(i, i + stripsPerPage));
    }
    return chunks;
  }, [labelStrips, config.columns]);

  const addLabels = (codes: string[]) => {
    const newLabels = codes.map(code => ({
      id: uuidv4(),
      code: code
    }));
    setLabels(prev => [...prev, ...newLabels]);
  };

  const clearLabels = () => {
    setLabels([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
  };

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
      {/* Navbar (No Print) */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 flex-shrink-0 no-print z-10 relative">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">KhoVach</h1>
            <p className="text-xs text-gray-500">Hệ thống in tem nhãn kho</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            disabled={labels.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" /> In Tem ({labels.length})
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative print:overflow-visible print:block print:h-auto">
        {/* Left Sidebar (No Print) */}
        <div className="w-96 p-4 h-full overflow-hidden no-print flex-shrink-0 bg-gray-50">
          <InputPanel 
            onAddLabels={addLabels} 
            onClearLabels={clearLabels}
            config={config}
            setConfig={setConfig}
            labelCount={labels.length}
          />
        </div>

        {/* Preview Area (Visible on Screen, handled differently for print) */}
        <div className="flex-1 bg-gray-100 p-8 overflow-y-auto no-print relative">
           {labels.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                 <Printer className="w-10 h-10 text-gray-400" />
               </div>
               <p className="text-lg font-medium">Chưa có tem nào được tạo</p>
               <p className="text-sm">Sử dụng công cụ bên trái để thêm mã vị trí</p>
             </div>
           ) : (
             <div className="max-w-5xl mx-auto">
               <div className="mb-4 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <h2 className="text-gray-700 font-semibold">Xem trước ({labelStrips.length} dây tem - {pages.length} trang in)</h2>
                   
                   {/* Sort Toggle Button */}
                   <button 
                    onClick={toggleSort}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                    title={sortOrder === 'DESC' ? "Đang xếp Z-A (Giảm dần)" : "Đang xếp A-Z (Tăng dần)"}
                   >
                     {sortOrder === 'ASC' ? (
                       <>
                        <ArrowDownAZ className="w-4 h-4 text-blue-600" />
                        <span>A-Z</span>
                       </>
                     ) : (
                       <>
                        <ArrowUpAZ className="w-4 h-4 text-orange-600" />
                        <span>Z-A</span>
                       </>
                     )}
                   </button>
                 </div>

                 <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                   Khổ giấy: A4 • {config.columns} cột dây
                 </span>
               </div>
               <div 
                  className="bg-white shadow-sm p-8 min-h-[500px]"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${config.columns}, max-content)`,
                    gap: `${config.gap}mm`,
                    justifyContent: 'center',
                    width: '210mm', // Approximate A4 width for preview
                    margin: '0 auto',
                    boxSizing: 'border-box'
                  }}
               >
                 {labelStrips.map((strip, idx) => (
                   <div 
                      key={idx} 
                      className="flex flex-col border-2 border-dashed border-blue-200 bg-blue-50/20"
                      style={{
                        padding: '1mm', // Padding inside the strip border
                      }}
                    >
                     {strip.map((label) => (
                       <BarcodeRenderer key={label.id} value={label.code} config={config} className="bg-white" />
                     ))}
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>

        {/* ACTUAL PRINT LAYOUT (Hidden on screen, Visible on Print) */}
        <div className="print-only print-container">
          {pages.map((pageStrips, pageIndex) => (
            <div 
              key={pageIndex}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${config.columns}, max-content)`,
                columnGap: `${config.gap}mm`,
                rowGap: `${config.gap}mm`,
                justifyContent: 'start',
                paddingTop: '5mm', // Safe top margin
                paddingLeft: '5mm', // Safe left margin (optional depending on printer)
                margin: '0',
                pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto',
                breakAfter: pageIndex < pages.length - 1 ? 'page' : 'auto',
                height: '290mm', // Force A4 height logic to trigger new pages if content overflows
                boxSizing: 'border-box'
              }}
            >
              {pageStrips.map((strip, stripIdx) => (
                <div 
                  key={stripIdx} 
                  className="flex flex-col break-inside-avoid"
                  style={{
                    border: '1px solid black',
                    padding: '1mm'
                  }}
                >
                  {strip.map((label) => (
                    <BarcodeRenderer 
                      key={label.id} 
                      value={label.code} 
                      config={config} 
                      className="border-b border-gray-300 last:border-b-0" 
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;