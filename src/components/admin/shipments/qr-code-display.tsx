"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Props {
  url: string;
  trackingCode: string;
  size?: number;
}

export function QrCodeDisplay({ url, trackingCode, size = 180 }: Props) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: size * 2,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(console.error);
  }, [url, size]);

  function handleDownload() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${trackingCode}-qr.png`;
    a.click();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {dataUrl ? (
        <Image
          src={dataUrl}
          alt={`QR code for ${trackingCode}`}
          width={size}
          height={size}
          unoptimized
          className="rounded-lg border"
        />
      ) : (
        <div
          className="rounded-lg border bg-muted animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={!dataUrl}
        className="print:hidden"
      >
        <Download className="mr-2 h-4 w-4" /> Download QR
      </Button>
    </div>
  );
}
