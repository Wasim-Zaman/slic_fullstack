import React from "react";
import QRCode from "qrcode.react";

const QRCodePopup = ({ qrCode, onClose }) => {
  // Function to handle successful QR scan
  const handleScanSuccess = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-sm mx-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Scan the QR Code</h2>
        <p className="mb-4 text-gray-600">
          Please scan this QR code with your WhatsApp-linked device.
        </p>
        {qrCode ? (
          <div className="flex justify-center mb-4">
            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
          </div>
        ) : (
          <p className="text-gray-500">Generating QR Code...</p>
        )}
        {/* Assuming some logic to detect successful scan */}
        <button
          onClick={handleScanSuccess}
          className="mt-4 w-full bg-green-500 text-white py-2 rounded"
        >
          I have scanned the QR Code
        </button>
      </div>
    </div>
  );
};

export default QRCodePopup;
