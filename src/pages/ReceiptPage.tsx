import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Printer, Download, ArrowLeft, Home } from 'lucide-react';
import { Sale } from '@/types/pos';
import { generateReceiptText } from '@/utils/pos';
import { formatPeso } from '@/utils/pos';

export const ReceiptPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [receiptText, setReceiptText] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  
  const sale = location.state?.sale as Sale;
  const businessSettings = location.state?.businessSettings;

  useEffect(() => {
    if (!sale) {
      navigate('/pos');
      return;
    }

    if (businessSettings) {
      const text = generateReceiptText(sale, businessSettings);
      setReceiptText(text);
    }
  }, [sale, businessSettings, navigate]);

  const handlePrint = () => {
    setIsPrinting(true);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${sale.receiptNumber}</title>
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
  };

  if (!sale) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-[hsl(var(--primary))] text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Printer className="w-6 h-6" />
                  Receipt #{sale.receiptNumber}
                </h1>
                <p className="text-sm opacity-90 mt-1">
                  Transaction completed successfully
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">{new Date(sale.timestamp).toLocaleDateString()}</p>
                <p className="text-sm">{new Date(sale.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Receipt Details */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {receiptText}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Actions</h3>
                  <div className="space-y-2">
                    <Button 
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className="w-full flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      {isPrinting ? 'Printing...' : 'Print Receipt'}
                    </Button>
                    
                    <Button 
                      onClick={handleDownload}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Receipt
                    </Button>
                    
                    <Button 
                      onClick={() => navigate('/pos')}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      Back to POS
                    </Button>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatPeso(sale.subtotal)}</span>
                    </div>
                    {sale.discount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{formatPeso(sale.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-bold">{formatPeso(sale.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment:</span>
                      <span className="capitalize">{sale.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cashier:</span>
                      <span>{sale.cashierName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
