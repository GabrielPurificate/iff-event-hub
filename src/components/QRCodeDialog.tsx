import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, Download } from 'lucide-react';

interface QRCodeDialogProps {
  url: string;
  eventName: string;
}

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({ url, eventName }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      const canvas = qrCodeRef.current.querySelector('canvas');
      if (canvas) {
        const pngUrl = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream');
        let downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${eventName}-qrcode.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="w-4 h-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code para {eventName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4" ref={qrCodeRef}>
          <QRCodeCanvas value={url} size={256} />
          <p className="text-sm text-muted-foreground mt-4 break-all">{url}</p>
        </div>
        <Button onClick={downloadQRCode} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Baixar QR Code
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
