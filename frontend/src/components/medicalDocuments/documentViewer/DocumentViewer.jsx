import { useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, } from "react-bootstrap-icons";
import "./pdfConfig.js";
import "./DocumentViewer.css";

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.5;

const getTouchDistance = (touches) => {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;

  return Math.hypot(dx, dy);
};

const DocumentViewer = ({ file }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState(false);

  const contentRef = useRef(null);

  const touchState = useRef({
    startDistance: 0,
    startScale: 1,
  });

  useEffect(() => {
    const content = contentRef.current;

    if (!content) return;

    const handleTouchStart = (event) => {
      if (event.touches.length === 2) {
        touchState.current = {
          startDistance: getTouchDistance(event.touches),
          startScale: scale,
        };
      }
    };

    const handleTouchMove = (event) => {
      if (
        event.touches.length !== 2 ||
        !touchState.current.startDistance
      ) {
        return;
      }

      event.preventDefault();

      const currentDistance = getTouchDistance(event.touches);

      const zoomRatio =
        currentDistance / touchState.current.startDistance;

      const newScale = Math.min(
        MAX_SCALE,
        Math.max(
          MIN_SCALE,
          touchState.current.startScale * zoomRatio,
        ),
      );

      setScale(newScale);
    };

    const handleTouchEnd = (event) => {
      if (event.touches.length < 2) {
        touchState.current.startDistance = 0;
      }
    };

    content.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    content.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    content.addEventListener("touchend", handleTouchEnd);
    content.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      content.removeEventListener("touchstart", handleTouchStart);
      content.removeEventListener("touchmove", handleTouchMove);
      content.removeEventListener("touchend", handleTouchEnd);
      content.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [scale]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setError(false);
  };

  const changeZoom = (value) => {
    setScale((current) =>
      Math.min(MAX_SCALE, Math.max(MIN_SCALE, current + value)),
    );
  };

  return (
    <div className="document-viewer">
      <div className="document-viewer-toolbar">
        <div className="document-viewer-navigation">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((page) => page - 1)}
            aria-label="Pagina precedente"
          >
            <ChevronLeft />
          </button>

          <span>
            {pageNumber} / {numPages || "—"}
          </span>

          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((page) => page + 1)}
            aria-label="Pagina successiva"
          >
            <ChevronRight />
          </button>
        </div>

        <div className="document-viewer-zoom">
          <button
            type="button"
            onClick={() => changeZoom(-0.2)}
            disabled={scale <= MIN_SCALE}
            aria-label="Riduci zoom"
          >
            <ZoomOut />
          </button>

          <span>{Math.round(scale * 100)}%</span>

          <button
            type="button"
            onClick={() => changeZoom(0.2)}
            disabled={scale >= MAX_SCALE}
            aria-label="Aumenta zoom"
          >
            <ZoomIn />
          </button>
        </div>
      </div>

      <div className="document-viewer-content" ref={contentRef}>
        {error ? (
          <p className="document-viewer-error">
            Impossibile caricare il documento.
          </p>
        ) : (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={() => setError(true)}
            loading={<p>Caricamento documento...</p>}
            error={<p>Errore durante il caricamento del PDF.</p>}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
