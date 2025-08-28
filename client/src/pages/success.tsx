import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download, Printer, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConfettiOverlay from "@/components/confetti-overlay";

export default function Success() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [surpriseData, setSurpriseData] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // In a real app, this would come from the location state or API call
    // For now, we'll construct the data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const qrCode = urlParams.get('qrCode');
    
    if (slug) {
      const baseUrl = window.location.origin;
      setSurpriseData({
        slug,
        shareUrl: `${baseUrl}/surprise/${slug}`,
        qrCode: qrCode || null,
      });
    }

    setTimeout(() => setShowConfetti(false), 5000);
  }, []);

  const handleCopyLink = () => {
    if (surpriseData?.shareUrl) {
      navigator.clipboard.writeText(surpriseData.shareUrl);
      toast({
        title: "Link copied!",
        description: "Share it with your special someone 💝",
      });
    }
  };

  const handleDownloadQR = () => {
    if (surpriseData?.qrCode) {
      const link = document.createElement('a');
      link.href = surpriseData.qrCode;
      link.download = 'surprise-qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrintQR = () => {
    if (surpriseData?.qrCode) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>QR Code</title></head>
            <body style="text-align: center; padding: 20px;">
              <h2>Digital Surprise QR Code</h2>
              <img src="${surpriseData.qrCode}" style="max-width: 400px;" />
              <p>Scan to reveal the surprise!</p>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleCreateAnother = () => {
    setLocation('/');
  };

  if (!surpriseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-gentle">🎁</div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfettiOverlay show={showConfetti} />
      
      <div className="container mx-auto px-4 pb-16 pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="celebration-card rounded-2xl p-8 text-center">
            <div className="mb-8">
              <div className="text-8xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold gradient-text mb-4">Surprise Created!</h2>
              <p className="text-lg text-muted-foreground">Your magical surprise is ready to share!</p>
            </div>

            {/* Share Link */}
            <div className="bg-muted rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                🔗 Share Your Surprise
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <Input
                  type="text"
                  value={surpriseData.shareUrl}
                  readOnly
                  className="flex-1 font-mono text-sm"
                  data-testid="share-url"
                />
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  data-testid="copy-link-button"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                💡 Copy this link to share your surprise!
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-muted rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                📱 QR Code
              </h3>
              <div className="bg-white p-6 rounded-lg inline-block mb-4" data-testid="qr-code-container">
                {surpriseData.qrCode ? (
                  <img
                    src={surpriseData.qrCode}
                    alt="QR Code"
                    className="w-48 h-48"
                    data-testid="qr-code-image"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    <span className="text-6xl">📱</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleDownloadQR}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  data-testid="download-qr-button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handlePrintQR}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  data-testid="print-qr-button"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Printer
                </Button>
              </div>
            </div>

            {/* Create Another */}
            <Button
              onClick={handleCreateAnother}
              variant="outline"
              className="bg-muted hover:bg-muted/80 text-muted-foreground"
              data-testid="create-another-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Another Surprise
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
