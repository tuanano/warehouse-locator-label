import React from 'react';
import Barcode from 'react-barcode';
import { LabelConfig } from '../types';

interface BarcodeRendererProps {
  value: string;
  config: LabelConfig;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({ value, config, className }) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center border border-gray-300 bg-white overflow-hidden ${className || ''}`}
      style={{
        width: `${config.width}mm`,
        height: `${config.height}mm`,
        padding: '2mm',
        boxSizing: 'border-box' // Important for print layout
      }}
    >
      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        <Barcode 
          value={value}
          width={config.barWidth || 2} // Use config value or default
          height={config.barcodeHeight}
          fontSize={config.fontSize}
          displayValue={config.showText}
          margin={0}
          textMargin={4}
          background="transparent"
          fontOptions="bold" // Make the text bold
        />
      </div>
    </div>
  );
};