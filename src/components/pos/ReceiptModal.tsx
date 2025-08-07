import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, X, Receipt as ReceiptIcon } from 'lucide-react';
import { Sale } from '@/types/pos';
import { generateReceiptText } from '@/utils/pos';

interface ReceiptModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  businessSettings?: any;
}

export const ReceiptModal = ({ 
  sale, 
  isOpen, 
  onClose, 
  onPrint, 
  onDownload,
  businessSettings 
}: ReceiptModalProps) => {
  const [receiptText, setReceiptText] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (sale && businessSettings) {
      const text = generateReceiptText(sale, businessSettings);
      setReceiptText(text);
    }
  }, [sale, businessSettings]);

  const handlePrint = () => {
    setIsPrinting(true);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${sale?.receiptNumber}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                margin: 20px;
                max-width: 300px;
              }
              pre { 
                white-space: pre-wrap; 
                margin: 0;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <pre>${receiptText}</pre>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 1000);
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      setTimeout(() => {
        setIsPrinting(false);
        if (onPrint) onPrint();
      }, 2000);
    }
  };

  const handleDownload = () => {
    if (!sale) return;
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${sale.receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (onDownload) onDownload();
  };

  if (!sale) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5" />
            Receipt #{sale.receiptNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] p-4 bg-gray-50 rounded-lg">
          <pre className="font-mono text-sm whitespace-pre-wrap">
            {receiptText}
          </pre>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button 
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            {isPrinting ? 'Printing...' : 'Print'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
