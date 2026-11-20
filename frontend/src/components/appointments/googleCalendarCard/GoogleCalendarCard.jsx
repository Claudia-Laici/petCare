import { useFetch } from "../../../hooks/useFetch";
import { apiFetch } from "../../../utils/apiFetch";
import { useState } from "react";
import { Alert, Card, Spinner } from "react-bootstrap";
import "./GoogleCalendarCard.css"

const GoogleCalendarCard = () => {
  const {
    data: calendar,
    isLoading,
    error,
    refetch,
  } = useFetch("/auth/google/calendar/status");

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [syncResult, setSyncResult] = useState(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [disconnectError, setDisconnectError] = useState("");

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectError("");

    try {
      const { url } = await apiFetch("/auth/google/calendar/connect");
      window.location.assign(url);
    } catch (error) {
      setConnectError(
        error.message || "Errore durante il collegamento a Google Calendar.",
      );
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncError("");
    setSyncResult(null);

    try {
      const result = await apiFetch("/auth/google/calendar/sync", {
        method: "POST",
      });

      setSyncResult(result);
    } catch (error) {
      setSyncError(error.message || "Errore durante la sincronizzazione.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    const confirmed = window.confirm(
      "Vuoi scollegare Google Calendar? Gli appuntamenti rimarranno salvati in PetCare.",
    );

    if (!confirmed) return;

    setIsDisconnecting(true);
    setDisconnectError("");

    try {
      await apiFetch("/auth/google/calendar/disconnect", {
        method: "DELETE",
      });

      setSyncResult(null);
      setSyncError("");
      refetch();
    } catch (error) {
      setDisconnectError(
        error.message || "Errore durante la disconnessione da Google Calendar.",
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="google-calendar-card">
        <Card.Body>
          <Spinner animation="border" size="sm" />
          <span className="ms-2">Verifica Google Calendar...</span>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error.message || "Impossibile verificare Google Calendar."}
      </Alert>
    );
  }

  return (
    <Card className="google-calendar-card">
      <Card.Body>
        <h5>Google Calendar</h5>

        {calendar?.connected ? (
          <>
            <p>
              Collegato a <strong>{calendar.accountEmail}</strong>
            </p>

            {syncError && (
              <Alert variant="danger" className="mb-3">
                {syncError}
              </Alert>
            )}

            {syncResult && (
              <Alert
                variant={syncResult.failed > 0 ? "warning" : "success"}
                className="mb-3"
              >
                <strong>Sincronizzazione completata</strong>

                <ul className="mb-0 mt-2">
                  <li>Appuntamenti controllati: {syncResult.total}</li>
                  <li>Sincronizzati: {syncResult.synced}</li>
                  <li>Non riusciti: {syncResult.failed}</li>
                  <li>Saltati: {syncResult.skipped}</li>
                </ul>
              </Alert>
            )}

            {disconnectError && (
              <Alert variant="danger" className="mt-3 mb-0">
                {disconnectError}
              </Alert>
            )}

            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleDisconnect}
              disabled={isDisconnecting || isSyncing}
            >
              {isDisconnecting
                ? "Disconnessione in corso..."
                : "Scollega Google Calendar"}
            </button>

            <button
              type="button"
              className="btn btn-success"
              onClick={handleSync}
              disabled={isSyncing || isDisconnecting}
            >
              {isSyncing
                ? "Sincronizzazione in corso..."
                : "Sincronizza appuntamenti"}
            </button>
          </>
        ) : (
          <>
            <p>
              Collega il tuo account Google per sincronizzare gli appuntamenti.
            </p>
            {connectError && (
              <Alert variant="danger" className="mb-3">
                {connectError}
              </Alert>
            )}
            <button
              type="button"
              className="btn btn-success"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting
                ? "Collegamento in corso..."
                : "Collega Google Calendar"}
            </button>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default GoogleCalendarCard;
