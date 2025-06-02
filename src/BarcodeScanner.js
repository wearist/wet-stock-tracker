// BarcodeScanner.js
import React, { useEffect, useRef } from "react";
import Quagga from "quagga";

function BarcodeScanner({ onScanComplete, onClose }) {
  const videoRef = useRef(null);
  let scanned = false;

  useEffect(() => {
    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            facingMode: "environment",
          },
        },
        decoder: {
          readers: ["ean_reader", "upc_reader", "upc_e_reader"],
        },
      },
      (err) => {
        if (err) {
          console.error("Quagga init error:", err);
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected(handleDetected);

    return () => {
      Quagga.stop();
      Quagga.offDetected(handleDetected);
    };
  }, []);

  const handleDetected = (result) => {
    if (scanned) return;
    scanned = true;

    const code = result.codeResult.code;
    if (code) {
      Quagga.stop();
      Quagga.offDetected(handleDetected);
      const expiry = new Date().toISOString().split("T")[0]; // Default to today
      onScanComplete({ barcode: code, expiry });
      onClose(); // Close scanner UI immediately
    }
  };

  return (
    <div style={overlayStyle}>
      <div ref={videoRef} style={videoStyle} />
      <button style={closeStyle} onClick={onClose}>✖ Close</button>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const videoStyle = {
  width: "90%",
  maxWidth: "600px",
  height: "60vh",
  border: "2px solid #fff",
  borderRadius: "12px",
  overflow: "hidden",
};

const closeStyle = {
  marginTop: "20px",
  padding: "10px 20px",
  fontSize: "16px",
  backgroundColor: "#ff4d4d",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default BarcodeScanner;
