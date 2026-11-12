import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import { Download, Gear, ArrowRepeat } from "react-bootstrap-icons";
import { QRCodeCanvas } from "qrcode.react";
import { usePetQr } from "../../../hooks/usePetQr";

const APP_URL = import.meta.env.VITE_APP_URL;

const QrCard = ({ petId, petName, role }) => {
  const navigate = useNavigate();

  const { qr, loading, enable, regenerate } = usePetQr(petId);
  const canvasRef = useRef(null);

  const isActive = qr?.qrEnabled && qr?.qrToken;
  const url = isActive ? `${APP_URL}/p/${qr.qrToken}` : null;

  const isOwner = role === "owner";
  const canDownload = isOwner || role === "editor";

  const showSettings = isOwner && isActive;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = `qr-${petName}.png`;
    link.click();
  };

  const handleRegenerate = async () => {
    const ok = window.confirm(
      "Il QR attuale smetterà di funzionare. Dovrai stampare di nuovo la targhetta. Continuare?",
    );
    if (ok) await regenerate();
  };

  if (loading) return null;

  return (
    <Card className="border-0 shadow-sm rounded-4 p-4 qr-card text-center text-white">
      <div
        className={`d-flex align-items-center mb-3 ${
          showSettings ? "justify-content-between" : "justify-content-center"
        }`}
      >
        <Card.Title className="fs-6 fw-semibold mb-0">Scheda rapida</Card.Title>

        {showSettings && (
          <Button
            variant="outline-light"
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            aria-label="Impostazioni QR"
            title="Impostazioni QR"
            onClick={() => navigate(`/pets/${petId}/qr-settings`)}
          >
            <Gear size={16} />
          </Button>
        )}
      </div>

      {isActive ? (
        <>
          <div className="qr-wrapper bg-white rounded-4 mx-auto mb-3 d-flex align-items-center justify-content-center">
            <QRCodeCanvas
              ref={canvasRef}
              value={url}
              size={1024}
              level="M"
              marginSize={4}
              style={{ width: 150, height: 150 }}
              role="img"
              aria-label="QR code della scheda rapida"
            />
          </div>

          <p className="qr-description mb-4">
            Scansiona per vedere allergie, terapie e contatti d'emergenza.
          </p>

          {canDownload && (
            <Button
              variant="light"
              className="btn-download w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
              onClick={handleDownload}
            >
              <Download size={16} />
              <span>Scarica QR</span>
            </Button>
          )}

          {isOwner && (
            <Button
              variant="outline-light"
              className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 py-2 mt-2"
              onClick={handleRegenerate}
            >
              <ArrowRepeat size={16} />
              <span>Rigenera QR</span>
            </Button>
          )}
        </>
      ) : (
        <>
          <p className="qr-description mb-4">
            {isOwner
              ? `Attiva il QR per creare la targhetta di ${petName}.`
              : "Il QR non è ancora stato attivato dal proprietario."}
          </p>
          {isOwner && (
            <Button variant="light" className="rounded-pill" onClick={enable}>
              Attiva QR
            </Button>
          )}
        </>
      )}
    </Card>
  );
};

export default QrCard;
