import { useState, useRef, useCallback, useEffect } from 'react';

export default function LightboxMedia({ type, src, onClose, closing }) {
    const [zoom, setZoom] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [showZoomHint, setShowZoomHint] = useState(false);
    const containerRef = useRef(null);
    const mediaRef = useRef(null);
    const zoomRef = useRef(1);
    const panRef = useRef({ x: 0, y: 0 });
    const lastTouchDist = useRef(null);
    const isMobile = typeof window !== 'undefined' && 'ontouchstart' in window;

    const clampPan = useCallback((x, y, currentZoom) => {
        const z = currentZoom || zoomRef.current;
        const maxPan = z > 1 ? (z - 1) * 150 : 0;
        return {
            x: Math.max(-maxPan, Math.min(maxPan, x)),
            y: Math.max(-maxPan, Math.min(maxPan, y)),
        };
    }, []);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.15 : 0.15;
        const newZoom = Math.max(1, Math.min(5, zoomRef.current + delta));
        zoomRef.current = newZoom;
        setZoom(newZoom);
        if (newZoom > 1) {
            setShowZoomHint(true);
            clearTimeout(window.zoomHintTimer);
            window.zoomHintTimer = setTimeout(() => setShowZoomHint(false), 1500);
        }
        if (newZoom === 1) {
            setPan({ x: 0, y: 0 });
            panRef.current = { x: 0, y: 0 };
        } else {
            setPan(prev => {
                const clamped = clampPan(prev.x, prev.y, newZoom);
                panRef.current = clamped;
                return clamped;
            });
        }
    }, [clampPan]);

    const handleDoubleClick = useCallback((e) => {
        const currentZoom = zoomRef.current;
        if (currentZoom > 1) {
            zoomRef.current = 1;
            setZoom(1);
            panRef.current = { x: 0, y: 0 };
            setPan({ x: 0, y: 0 });
        } else {
            const newZoom = 2.5;
            zoomRef.current = newZoom;
            setZoom(newZoom);
            setShowZoomHint(true);
            clearTimeout(window.zoomHintTimer);
            window.zoomHintTimer = setTimeout(() => setShowZoomHint(false), 1500);

            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const clamped = clampPan(-x * 200, -y * 200, newZoom);
            panRef.current = clamped;
            setPan(clamped);
        }
    }, [clampPan]);

    // Mouse drag to pan
    const handleMouseDown = useCallback((e) => {
        if (zoomRef.current <= 1) return;
        setIsPanning(true);
        const p = panRef.current;
        setDragStart({ x: e.clientX - p.x, y: e.clientY - p.y });
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isPanning) return;
        const newPan = {
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        };
        const clamped = clampPan(newPan.x, newPan.y);
        panRef.current = clamped;
        setPan(clamped);
    }, [isPanning, dragStart, clampPan]);

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    // Touch support
    const [touchStart, setTouchStart] = useState(null);

    const handleTouchStart = useCallback((e) => {
        const touches = e.touches;
        if (touches.length === 1) {
            if (zoomRef.current > 1) {
                setIsPanning(true);
                const p = panRef.current;
                setDragStart({ x: touches[0].clientX - p.x, y: touches[0].clientY - p.y });
            }
            setTouchStart({ x: touches[0].clientX, y: touches[0].clientY, time: Date.now() });
        } else if (touches.length === 2) {
            const dist = Math.hypot(
                touches[0].clientX - touches[1].clientX,
                touches[0].clientY - touches[1].clientY
            );
            lastTouchDist.current = dist;
            setIsPanning(false);
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        const touches = e.touches;
        if (touches.length === 2 && lastTouchDist.current !== null) {
            e.preventDefault();
            const dist = Math.hypot(
                touches[0].clientX - touches[1].clientX,
                touches[0].clientY - touches[1].clientY
            );
            const newZoom = Math.max(1, Math.min(5, zoomRef.current * (dist / lastTouchDist.current)));
            lastTouchDist.current = dist;
            zoomRef.current = newZoom;
            setZoom(newZoom);
        } else if (touches.length === 1 && isPanning) {
            const newPan = {
                x: touches[0].clientX - dragStart.x,
                y: touches[0].clientY - dragStart.y,
            };
            const clamped = clampPan(newPan.x, newPan.y);
            panRef.current = clamped;
            setPan(clamped);
        }
    }, [isPanning, dragStart, clampPan]);

    const handleTouchEnd = useCallback((e) => {
        if (e.changedTouches.length === 1 && !lastTouchDist.current && touchStart) {
            const diffY = e.changedTouches[0].clientY - touchStart.y;
            const diffX = e.changedTouches[0].clientX - touchStart.x;

            if (diffY > 80 && Math.abs(diffX) < Math.abs(diffY) && zoomRef.current <= 1) {
                onClose();
            }
        }
        setIsPanning(false);
        lastTouchDist.current = null;
        setTouchStart(null);
    }, [touchStart, onClose]);

    // Sync refs with state
    useEffect(() => {
        zoomRef.current = zoom;
    }, [zoom]);

    useEffect(() => {
        panRef.current = pan;
    }, [pan]);

    return (
        <div
            ref={containerRef}
            className={`lightbox-media lightbox-media-container relative flex items-center justify-center w-full h-full select-none overflow-hidden ${closing ? 'closing' : ''}`}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'pointer' }}
        >
            {type === 'image' ? (
                <img
                    ref={mediaRef}
                    src={src}
                    alt="Full size"
                    className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out rounded-lg shadow-2xl"
                    style={{
                        transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                        willChange: 'transform',
                    }}
                    draggable={false}
                />
            ) : (
                <video
                    ref={mediaRef}
                    controls
                    autoPlay
                    className="max-w-full max-h-full rounded-lg shadow-2xl"
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <source src={src} />
                </video>
            )}

            {/* Zoom hint */}
            {type === 'image' && showZoomHint && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 zoom-badge text-white/70 text-xs">
                    {zoom > 1 ? `Zoom: ${Math.round(zoom * 100)}%` : 'Klik 2x untuk zoom'}
                </div>
            )}

            {/* Zoom level indicator */}
            {type === 'image' && zoom > 1 && (
                <div className="zoom-badge absolute bottom-4 right-4">
                    {Math.round(zoom * 100)}%
                </div>
            )}

            {/* Mobile swipe hint */}
            {isMobile && zoom <= 1 && !closing && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 transition-opacity duration-300"
                     style={{ animation: 'fadeInOut 3s ease-out forwards' }}>
                    <div className="flex flex-col items-center gap-1 text-white/40">
                        <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span className="text-xs">Geser ke bawah untuk tutup</span>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; }
                    20% { opacity: 1; }
                    70% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
}
