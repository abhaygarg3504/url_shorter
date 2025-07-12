import React, { useState } from "react";
import { useSelector } from "react-redux";
import { createShortUrl } from "../api/shortUrl_api";
import type { RootState } from "../store/store";
import { createQRCode } from "../api/qr_api";
import type {QRCustomization} from "../api/qr_api"

const UrlForm: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState(""); 
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQROptions, setShowQROptions] = useState(false);
const [qrCodeData, setQrCodeData] = useState<string | null>(null);
const [qrCustomization, setQrCustomization] = useState<QRCustomization>({
  size: 200,
  foregroundColor: "#000000",
  backgroundColor: "#ffffff",
  quality: "M"
});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCopied(false);
    setShortUrl("");

    try {
      const result = await createShortUrl(url, isAuthenticated ? slug : undefined);
      setShortUrl(result);
    } catch (error) {
      console.error("Error shortening URL:", error);
      alert("Failed to shorten the URL. Please try again.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateQR = async () => {
  if (!shortUrl) return;
  
  try {
    const result = await createQRCode(shortUrl.split('/').pop() || '', qrCustomization);
    setQrCodeData(result.qrData);
    setShowQROptions(true);
  } catch (error) {
    console.error("Error generating QR code:", error);
    alert("Failed to generate QR code. Please try again.");
  }
};

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="url" className="font-semibold text-gray-700">
          Enter URL to shorten:
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://www.example.com"
          required
        />

        {isAuthenticated && (
          <>
            <label htmlFor="slug" className="font-semibold text-gray-700">
              Custom Slug (optional):
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. my-custom-url"
            />
          </>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Shorten URL
        </button>
      </form>

    {shortUrl && (
  <div className="mt-6 bg-green-100 border border-green-300 rounded p-4">
    <h2 className="text-lg font-semibold text-green-700 mb-2">Your Shortened URL:</h2>
    <div className="flex items-center gap-2 mb-4">
      <input
        type="text"
        readOnly
        value={shortUrl}
        className="flex-1 p-2 border border-gray-300 rounded bg-white text-gray-800"
      />
      <button
        onClick={handleCopy}
        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition duration-200"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
    
    {isAuthenticated && (
      <div className="border-t pt-4">
        <button
          onClick={handleGenerateQR}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-200 mb-4"
        >
          Generate QR Code
        </button>
        
        {showQROptions && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-3">QR Code Customization</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Size:</label>
                <input
                  type="range"
                  min="100"
                  max="400"
                  value={qrCustomization.size}
                  onChange={(e) => setQrCustomization({...qrCustomization, size: parseInt(e.target.value)})}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{qrCustomization.size}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Foreground Color:</label>
                <input
                  type="color"
                  value={qrCustomization.foregroundColor}
                  onChange={(e) => setQrCustomization({...qrCustomization, foregroundColor: e.target.value})}
                  className="w-full h-10 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Background Color:</label>
                <input
                  type="color"
                  value={qrCustomization.backgroundColor}
                  onChange={(e) => setQrCustomization({...qrCustomization, backgroundColor: e.target.value})}
                  className="w-full h-10 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quality:</label>
                <select
                  value={qrCustomization.quality}
                  onChange={(e) => setQrCustomization({...qrCustomization, quality: e.target.value as 'L' | 'M' | 'Q' | 'H'})}
                  className="w-full p-2 border rounded"
                >
                  <option value="L">Low</option>
                  <option value="M">Medium</option>
                  <option value="Q">Quartile</option>
                  <option value="H">High</option>
                </select>
              </div>
            </div>
            
            {qrCodeData && (
              <div className="text-center">
                <img 
                  src={qrCodeData} 
                  alt="QR Code" 
                  className="mx-auto mb-2 border rounded"
                  style={{width: qrCustomization.size, height: qrCustomization.size}}
                />
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `qr-code-${shortUrl.split('/').pop()}.png`;
                    link.href = qrCodeData;
                    link.click();
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                  Download QR Code
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )}
  </div>
)}
    </div>
  );
};

export default UrlForm;
