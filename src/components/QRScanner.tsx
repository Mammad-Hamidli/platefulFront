import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
  fps?: number;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanFailure,
  fps = 10,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader';

  useEffect(() => {
    const startScanning = async () => {
      try {
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScanSuccess(decodedText);
            stopScanning();
          },
          (errorMessage) => {
            if (onScanFailure) {
              onScanFailure(errorMessage);
            }
          }
        );
        setIsScanning(true);
      } catch (err) {
        console.error('Failed to start QR scanner:', err);
        if (onScanFailure) {
          onScanFailure('Failed to start camera');
        }
      }
    };

    startScanning();

    return () => {
      stopScanning();
    };
  }, []);

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div id={containerId} className="w-full"></div>
      {isScanning && (
        <button
          onClick={stopScanning}
          className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
        >
          Stop Scanning
        </button>
      )}
    </div>
  );
};

