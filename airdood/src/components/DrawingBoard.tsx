import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brush, 
  Eraser, 
  Download, 
  HelpCircle, 
  Circle, 
  Square, 
  Sparkles,
  X,
  Check,
  MousePointer2,
  Hand,
  Trash2
} from 'lucide-react';
import { useHandTracking } from '../hooks/useHandTracking';
import { detectGesture } from '../lib/gestures';
import { 
  COLORS, 
  BRUSH_SIZES, 
  Point, 
  Stroke, 
  BrushSize, 
  EraserMode, 
  GestureType,
  Color
} from '../types';

const INITIAL_STROKES: Stroke[] = [];

export default function DrawingBoard() {
  // State
  const [activeColor, setActiveColor] = useState<Color>(COLORS[0]);
  const [brushSize, setBrushSize] = useState<BrushSize>('medium');
  const [isNeon, setIsNeon] = useState(false);
  const [eraserMode, setEraserMode] = useState<EraserMode>('normal');
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser'>('brush');
  const [showGuide, setShowGuide] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [gesturesEnabled, setGesturesEnabled] = useState(true);
  const [mouseModeOnly, setMouseModeOnly] = useState(false);
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const lastClickTimeRef = useRef(0);
  
  // Hand tracking state
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [gestureInfo, setGestureInfo] = useState<{ type: GestureType; pos: Point }>({ type: 'NONE', pos: { x: 0, y: 0 } });
  const landmarksRef = useRef<any>(null);
  const lastPosRef = useRef<Point | null>(null);
  const lastWorldPosRef = useRef<Point | null>(null);
  const selectedStrokeIndexRef = useRef<number | null>(null);
  const hoverStartTimeRef = useRef<number | null>(null);
  const lastHoveredIdRef = useRef<string | null>(null);
  const [dwellProgress, setDwellProgress] = useState(0);
  
  // Drawing state
  const strokesRef = useRef<Stroke[]>(INITIAL_STROKES);
  const activeStrokeRef = useRef<Stroke | null>(null);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uiRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Drawing Logic
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    strokesRef.current.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      const colorObj = COLORS.find(c => c.value === stroke.color);
      const glowColor = colorObj?.glow || stroke.color;

      if (stroke.isNeon) {
        // Ultra High Intensity Double-Layered Glow
        // Layer 1: Wide Atmosphere
        ctx.beginPath();
        ctx.lineWidth = stroke.size;
        ctx.strokeStyle = stroke.color;
        ctx.shadowBlur = 80; 
        ctx.shadowColor = glowColor;
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();

        // Layer 2: Core Brightness (Still same color, no white)
        ctx.beginPath();
        ctx.shadowBlur = 25;
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      } else {
        // Normal Non-Neon Stroke
        ctx.beginPath();
        ctx.lineWidth = stroke.size;
        ctx.strokeStyle = stroke.color;
        ctx.shadowBlur = 0;
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    });

    // 5. Draw Hand Skeleton Tracking (Webcam style tracker) - Only when webcam is OFF
    if (landmarksRef.current && isStarted && !mouseModeOnly && !isWebcamOn) {
        ctx.save();
        const landmarks = landmarksRef.current;
        
        const drawLandmark = (point: any, color: string, radius: number = 2) => {
            ctx.beginPath();
            // Mirror X for skeleton to match cursor
            ctx.arc((1 - point.x) * canvas.width, point.y * canvas.height, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            // Subtle glow
            ctx.shadowBlur = 3;
            ctx.shadowColor = color;
        };

        const drawSegment = (p1: any, p2: any, color: string, width: number = 0.8) => {
            ctx.beginPath();
            // Mirror X for segments
            ctx.moveTo((1 - p1.x) * canvas.width, p1.y * canvas.height);
            ctx.lineTo((1 - p2.x) * canvas.width, p2.y * canvas.height);
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.stroke();
        };

        const connections = [
            [0,1], [1,2], [2,3], [3,4], // Thumb
            [0,5], [5,6], [6,7], [7,8], // Index
            [0,9], [9,10], [10,11], [11,12], // Middle
            [0,13], [13,14], [14,15], [15,16], // Ring
            [0,17], [17,18], [18,19], [19,20], // Pinky
            [5,9], [9,13], [13,17] // Palm
        ];

        // Soft, lighter colors for ghost hand
        const ghostColor = 'rgba(255, 255, 255, 0.15)';
        const jointColor = 'rgba(255, 255, 255, 0.3)';

        connections.forEach(([i, j]) => {
            drawSegment(landmarks[i], landmarks[j], ghostColor, 1.5);
        });

        landmarks.forEach((lm: any, idx: number) => {
            drawLandmark(lm, idx % 4 === 0 ? jointColor : ghostColor, idx % 4 === 0 ? 2 : 1);
        });

        ctx.restore();
    }
  }, [isNeon, isWebcamOn, isStarted, mouseModeOnly]);

  // Handle Hand Results
  const onResults = useCallback((results: any) => {
    // Store landmarks for skeleton drawing
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        landmarksRef.current = results.multiHandLandmarks[0];
    } else {
        landmarksRef.current = null;
    }

    const info = detectGesture(results);
    setGestureInfo(info);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const x = info.pos.x * canvas.width;
    const y = info.pos.y * canvas.height;
    const currentPoint = { x, y };
    const worldPoint = currentPoint;

    // Handle hover and Dwell Selection detection
    const x_px = info.pos.x * window.innerWidth;
    const y_px = info.pos.y * window.innerHeight;
    const rawHovered = document.elementFromPoint(x_px, y_px);
    const interactiveElement = rawHovered?.closest('button, [onClick], a, input') as HTMLElement | null;
    const elementId = interactiveElement ? (interactiveElement.id || interactiveElement.tagName) : null;
    
    const now = Date.now();
    if (elementId && elementId !== 'canvas-gestures' && interactiveElement) {
        setHoveredId(interactiveElement.id || elementId);
        
        // Start or continue dwell timer
        if (elementId !== lastHoveredIdRef.current) {
            hoverStartTimeRef.current = now;
            lastHoveredIdRef.current = elementId;
            setDwellProgress(0);
        } else if (hoverStartTimeRef.current) {
            const duration = now - hoverStartTimeRef.current;
            const progress = Math.min(duration / 1500, 1);
            setDwellProgress(progress);
            
            // Trigger auto-click after 1.5 seconds
            if (duration >= 1500 && now - lastClickTimeRef.current > 1000) {
                interactiveElement.click();
                lastClickTimeRef.current = now;
                hoverStartTimeRef.current = null; // Clear to prevent double triggers
                setDwellProgress(0);
            }
        }
    } else {
        setHoveredId(null);
        hoverStartTimeRef.current = null;
        lastHoveredIdRef.current = null;
        setDwellProgress(0);
    }

    // 1. NAVIGATION AND INTERACTION (PINCH, SELECT)
    if (info.type === 'PINCH' || info.type === 'SELECT') {
      const interactiveAtPoint = document.elementFromPoint(x_px, y_px)?.closest('button, [onClick], a, input') as HTMLElement | null;

      if (interactiveAtPoint) {
        // Selection Logic via Gesture (kept as backup/active method)
        if (now - lastClickTimeRef.current > 500) { 
            interactiveAtPoint.click();
            lastClickTimeRef.current = now;
            hoverStartTimeRef.current = null;
            setDwellProgress(0);
        }
        selectedStrokeIndexRef.current = null;
      } else if (info.type === 'PINCH') {
        // MOVE INDIVIDUAL STROKE logic
        if (selectedStrokeIndexRef.current === null) {
            // Find closest stroke to pinch point
            let closestDist = 100;
            let closestIndex = -1;
            
            strokesRef.current.forEach((stroke, sIdx) => {
                stroke.points.forEach(p => {
                    const d = Math.sqrt(Math.pow(p.x - worldPoint.x, 2) + Math.pow(p.y - worldPoint.y, 2));
                    if (d < closestDist) {
                        closestDist = d;
                        closestIndex = sIdx;
                    }
                });
            });
            
            if (closestIndex !== -1 && closestDist < 60) {
                selectedStrokeIndexRef.current = closestIndex;
                lastPosRef.current = currentPoint; // RESET REF ON START OF PINCH
            }
        }

        if (selectedStrokeIndexRef.current !== null && lastPosRef.current) {
            const dx = currentPoint.x - lastPosRef.current.x;
            const dy = currentPoint.y - lastPosRef.current.y;
            
            // JUMP PROTECTION - Ignore wild camera glitches
            if (Math.abs(dx) < 200 && Math.abs(dy) < 200) {
                const stroke = strokesRef.current[selectedStrokeIndexRef.current];
                if (stroke) {
                    stroke.points = stroke.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
                }
            }
        }
      }
      lastPosRef.current = currentPoint;
    } else {
      lastPosRef.current = null;
      selectedStrokeIndexRef.current = null;
    }

    // 2. DRAW AND ERASE LOGIC
    if (activeTool === 'brush' && info.type === 'DRAW') {
      if (!activeStrokeRef.current) {
        activeStrokeRef.current = {
          points: [worldPoint],
          color: activeColor.value,
          size: BRUSH_SIZES[brushSize],
          isNeon: isNeon
        };
        strokesRef.current.push(activeStrokeRef.current);
      } else {
        const lastPoint = activeStrokeRef.current.points[activeStrokeRef.current.points.length - 1];
        const dist = Math.sqrt(Math.pow(worldPoint.x - lastPoint.x, 2) + Math.pow(worldPoint.y - lastPoint.y, 2));
        if (dist > 1.2) { // Ultra high sensitivity
          activeStrokeRef.current.points.push(worldPoint);
        }
      }
    } else if (activeTool === 'eraser' && (info.type === 'DRAW' || info.type === 'PINCH' || info.type === 'SELECT')) {
         // Advanced Path-Tracing Eraser for ultra-smooth results
         const radius = eraserMode === 'normal' ? 30 : 80;
         const newStrokes: Stroke[] = [];
         let changed = false;
         
         strokesRef.current.forEach(stroke => {
             let currentNewPoints: Point[] = [];
             
             for (let i = 0; i < stroke.points.length; i++) {
                 const p = stroke.points[i];
                 const distToCurrent = Math.sqrt(Math.pow(p.x - worldPoint.x, 2) + Math.pow(p.y - worldPoint.y, 2));
                 let isErased = distToCurrent < radius;

                 // Interpolate between positions to prevent "dots" during fast movement
                 if (!isErased && lastWorldPosRef.current) {
                    const x1 = lastWorldPosRef.current.x;
                    const y1 = lastWorldPosRef.current.y;
                    const x2 = worldPoint.x;
                    const y2 = worldPoint.y;
                    
                    const A = p.x - x1;
                    const B = p.y - y1;
                    const C = x2 - x1;
                    const D = y2 - y1;

                    const dot = A * C + B * D;
                    const lenSq = C * C + D * D;
                    let param = -1;
                    if (lenSq !== 0) param = dot / lenSq;

                    let xx, yy;
                    if (param < 0) { xx = x1; yy = y1; }
                    else if (param > 1) { xx = x2; yy = y2; }
                    else { xx = x1 + param * C; yy = y1 + param * D; }

                    const dx = p.x - xx;
                    const dy = p.y - yy;
                    isErased = Math.sqrt(dx * dx + dy * dy) < radius;
                 }

                 if (!isErased) {
                     currentNewPoints.push(p);
                 } else {
                     changed = true;
                     if (currentNewPoints.length > 1) {
                         newStrokes.push({ ...stroke, points: currentNewPoints });
                     }
                     currentNewPoints = [];
                 }
             }
             
             if (currentNewPoints.length > 1) {
                 newStrokes.push({ ...stroke, points: currentNewPoints });
             }
         });
         
         if (changed) {
            strokesRef.current = newStrokes;
         }
         activeStrokeRef.current = null;
    } else {
      activeStrokeRef.current = null;
    }

    drawCanvas();
    lastPosRef.current = currentPoint;
    lastWorldPosRef.current = worldPoint;
  }, [activeColor, brushSize, isNeon, eraserMode, activeTool, drawCanvas]);

  const { videoRef, isLoaded, loadingMessage, error, retry } = useHandTracking(onResults, isStarted, isWebcamOn);

  // Adjust canvas size
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleDownload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Create a temporary canvas with white background if needed, or just transparent
      const link = document.createElement('a');
      link.download = `airdraw-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
  };

  // Mouse Interaction
  const [isMouseDown, setIsMouseDown] = useState(false);
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (activeTool === 'brush') {
      activeStrokeRef.current = {
        points: [{ x, y }],
        color: activeColor.value,
        size: BRUSH_SIZES[brushSize],
        isNeon: isNeon
      };
      strokesRef.current.push(activeStrokeRef.current);
    }
    drawCanvas();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !activeStrokeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    activeStrokeRef.current.points.push({ x, y });
    drawCanvas();
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    activeStrokeRef.current = null;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505] text-white cursor-default">
      <AnimatePresence>
        {!isStarted && (
            <motion.div 
                exit={{ opacity: 0, scale: 1.1 }}
                className="absolute inset-0 z-[300] bg-black flex flex-col items-center justify-center p-8 select-none"
            >
                {/* Visual Elements from Image */}
                <div className="relative mb-12">
                     <motion.div 
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="absolute inset-0 bg-cyan-500/30 blur-[60px] rounded-full" 
                     />
                     <div className="relative w-32 h-32 bg-[#1a1b1e] rounded-[40px] flex items-center justify-center shadow-2xl border border-white/5">
                        <Sparkles size={64} className="text-cyan-400" />
                     </div>
                </div>

                <div className="text-center mb-8 sm:mb-16 px-4">
                    <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter text-white mb-4 uppercase">AirDood</h1>
                    <p className="text-[10px] sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.4em] uppercase text-white/40">Neural Hand Tracking & Air Drawing System</p>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        console.log("System Initializing...");
                        setIsStarted(true);
                    }}
                    className="px-12 sm:px-20 py-4 sm:py-6 bg-cyan-500 rounded-2xl text-black font-black uppercase tracking-[0.2em] italic text-lg sm:text-xl shadow-[0_0_50px_rgba(6,182,212,0.4)] hover:bg-cyan-400 transition-all"
                >
                    Initialize System
                </motion.button>

                <p className="absolute bottom-12 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                    Requires Camera Access for AI Vision
                </p>
            </motion.div>
        )}
      </AnimatePresence>
      {/* Video Feed (Mirrored) */}
      <video
        ref={videoRef}
        autoPlay
        className="absolute inset-0 w-full h-full object-cover opacity-60 scale-x-[-1] pointer-events-none"
        playsInline
        muted
      />

      {/* Drawing Canvas */}
      <canvas
        ref={canvasRef}
        id="canvas-main"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
      />

      {/* Floating UI Panel (Left Side) */}
      <div className="absolute left-2 sm:left-6 top-4 sm:top-8 bottom-4 sm:bottom-8 flex flex-col gap-4 z-30 pointer-events-none w-[180px] sm:w-52">
        <div className="flex flex-col gap-2 sm:gap-3 pointer-events-auto overflow-y-auto no-scrollbar max-h-full pr-2">
          {/* Brush Panel */}
          <motion.div 
            id="tool-brush"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`p-2 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 transition-all cursor-pointer ${activeTool === 'brush' ? 'bg-white/10 ring-2 ring-blue-500/50' : 'bg-black/40 opacity-90'} ${hoveredId === 'tool-brush' ? 'ring-2 ring-white/30 scale-[1.02]' : ''}`}
            onClick={() => setActiveTool('brush')}
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-white/50">Brush</span>
              <Brush className={`w-5 h-5 sm:w-7 sm:h-7 ${activeTool === 'brush' ? 'text-blue-400' : 'text-white'}`} />
              
              {/* 10 Standard Colors - Vertical Layout */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-3 w-full justify-items-center text-center">
                {COLORS.map(c => (
                  <button
                    key={c.name}
                    id={`color-${c.name}`}
                    onClick={(e) => { e.stopPropagation(); setActiveColor(c); setActiveTool('brush'); }}
                    className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl border-2 transition-all hover:scale-110 active:scale-95 ${activeColor.value === c.value ? 'ring-2 ring-white border-white scale-110 shadow-lg' : 'border-white/20 opacity-70'} ${hoveredId === `color-${c.name}` ? 'ring-2 ring-white border-white opacity-100 scale-110' : ''}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>

              {/* Brush Sizes - Bigger Options */}
              <div className="flex gap-1 sm:gap-2 mt-2 w-full">
                {(['small', 'medium', 'large'] as BrushSize[]).map(size => (
                    <button 
                      key={size}
                      id={`size-${size}`}
                      onClick={(e) => { e.stopPropagation(); setBrushSize(size); }}
                      className={`h-8 sm:h-12 flex-1 flex items-center justify-center rounded-lg sm:rounded-xl border border-white/10 transition-all ${brushSize === size ? 'bg-blue-600 border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)] scale-105' : 'bg-white/5'} ${hoveredId === `size-${size}` ? 'ring-2 ring-white scale-105 bg-white/20' : ''}`}
                    >
                        <div 
                          className="bg-white rounded-full"
                          style={{ 
                            width: size === 'small' ? (window.innerWidth < 640 ? 3 : 4) : size === 'medium' ? (window.innerWidth < 640 ? 6 : 8) : (window.innerWidth < 640 ? 10 : 14), 
                            height: size === 'small' ? (window.innerWidth < 640 ? 3 : 4) : size === 'medium' ? (window.innerWidth < 640 ? 6 : 8) : (window.innerWidth < 640 ? 10 : 14)
                          }} 
                        />
                    </button>
                ))}
              </div>
              
              <button 
                  onClick={(e) => { e.stopPropagation(); setIsNeon(!isNeon); }}
                  className={`mt-2 w-full h-8 sm:h-10 rounded-lg sm:rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all ${isNeon ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/40'}`}
              >
                  <Sparkles size={14} />
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase">Neon Glow</span>
              </button>
            </div>
          </motion.div>

          {/* Eraser Panel */}
          <motion.div 
             id="tool-eraser"
             initial={{ x: -100, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className={`p-2 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 transition-all cursor-pointer ${activeTool === 'eraser' ? 'bg-white/10 ring-2 ring-red-500/50' : 'bg-black/40 opacity-90'} ${hoveredId === 'tool-eraser' ? 'ring-2 ring-white/30 scale-[1.02]' : ''}`}
             onClick={() => setActiveTool('eraser')}
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-white/50">Eraser</span>
              <div className="flex flex-col gap-1 sm:gap-2 w-full">
                  <button 
                      id="erase-normal"
                      onClick={(e) => { e.stopPropagation(); setActiveTool('eraser'); setEraserMode('normal'); }}
                      className={`flex items-center justify-center gap-2 h-10 sm:h-12 rounded-lg sm:rounded-xl border border-white/10 transition-all ${eraserMode === 'normal' && activeTool === 'eraser' ? 'bg-red-500 border-red-400 text-white' : 'bg-white/5 text-white/50'} ${hoveredId === 'erase-normal' ? 'ring-2 ring-white scale-[1.02]' : ''}`}
                  >
                      <Eraser size={12} /> <span className="text-[8px] sm:text-[10px] font-bold uppercase">Small</span>
                  </button>
                  <button 
                      id="erase-large"
                      onClick={(e) => { e.stopPropagation(); setActiveTool('eraser'); setEraserMode('large'); }}
                      className={`flex items-center justify-center gap-2 h-10 sm:h-12 rounded-lg sm:rounded-xl border border-white/10 transition-all ${eraserMode === 'large' && activeTool === 'eraser' ? 'bg-red-500 border-red-400 text-white' : 'bg-white/5 text-white/50'} ${hoveredId === 'erase-large' ? 'ring-2 ring-white scale-[1.02]' : ''}`}
                  >
                      <Eraser size={14} /> <span className="text-[8px] sm:text-[10px] font-bold uppercase">Large</span>
                  </button>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pointer-events-auto">
              <button 
                  id="erase-clear-init-btn"
                  onClick={(e) => { 
                      e.stopPropagation(); 
                      setShowClearConfirm(true);
                  }}
                  className={`flex items-center justify-center gap-3 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-red-500/50 bg-red-600/20 text-red-500 transition-all hover:bg-red-600 hover:text-white shadow-[0_10px_20px_rgba(239,68,68,0.1)] font-black uppercase italic tracking-widest text-[10px] sm:text-xs ${hoveredId === 'erase-clear-init-btn' ? 'bg-red-600 text-white scale-[1.02] ring-2 ring-red-500/50' : ''}`}
              >
                  <Trash2 size={20} /> <span>Clear All</span>
              </button>

              <div className="flex gap-2">
                <button 
                    id="action-download"
                    onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 text-white transition-all ${hoveredId === 'action-download' ? 'bg-white/20 scale-105 ring-2 ring-white/20' : ''}`}
                >
                    <Download size={18} /> <span className="text-[8px] sm:text-[10px] font-bold uppercase">Save</span>
                </button>
                <button 
                    id="action-help"
                    onClick={(e) => { e.stopPropagation(); setShowGuide(true); }}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 text-white transition-all ${hoveredId === 'action-help' ? 'bg-white/20 scale-105 ring-2 ring-white/20' : ''}`}
                >
                    <HelpCircle size={18} /> <span className="text-[8px] sm:text-[10px] font-bold uppercase">Guide</span>
                </button>
              </div>
          </div>
        </div>
      </div>

      {/* Top Center Status and Webcam Toggle */}
      <div className="absolute top-4 sm:top-8 left-0 right-0 px-4 sm:px-8 flex justify-between items-start z-[60] pointer-events-none">
        <div className="w-24 sm:w-32 hidden sm:block" /> {/* Spacer */}
        
        <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2 sm:gap-3 pointer-events-auto">
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${gestureInfo.type !== 'NONE' ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-white/20'}`} />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-white/80">
                {gestureInfo.type === 'NONE' ? 'Ready' : gestureInfo.type}
            </span>
        </div>

        <button 
            id="toggle-webcam"
            onClick={(e) => { e.stopPropagation(); setIsWebcamOn(!isWebcamOn); }}
            className={`pointer-events-auto px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl backdrop-blur-md border border-white/20 flex items-center gap-2 sm:gap-4 transition-all shadow-2xl ${isWebcamOn ? 'bg-white/10 text-white' : 'bg-red-500/40 text-white border-red-500/50 ring-2 ring-red-500/30'} ${hoveredId === 'toggle-webcam' ? 'scale-105 sm:scale-110 ring-2 sm:ring-4 ring-white/30 bg-white/20' : ''}`}
        >
            <Circle className={`w-4 h-4 sm:w-5 sm:h-5 fill-current ${isWebcamOn ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest italic">
                {isWebcamOn ? 'Cam: ON' : 'Cam: OFF'}
            </span>
        </button>
      </div>

      {/* Cursor Feedback */}
      <AnimatePresence>
        {gestureInfo.pos.x !== 0 && gestureInfo.pos.y !== 0 && (
             <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                    scale: 1, 
                    opacity: 1,
                    x: gestureInfo.pos.x * window.innerWidth,
                    y: gestureInfo.pos.y * window.innerHeight
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                    x: { duration: 0 }, 
                    y: { duration: 0 },
                    scale: { type: 'spring', damping: 20, stiffness: 300 },
                    opacity: { duration: 0.1 }
                }}
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-[500] flex flex-col items-center gap-4"
             >
                <div className={`p-4 rounded-full border-2 transition-all ${
                    (gestureInfo.type === 'PINCH' || gestureInfo.type === 'SELECT') ? 'bg-orange-500/20 border-orange-400 rotate-45 scale-75' : 
                    gestureInfo.type === 'DRAW' ? 'bg-green-500/20 border-green-400 scale-110' :
                    'border-white/40'
                }`}>
                    {(gestureInfo.type === 'PINCH' || gestureInfo.type === 'SELECT') ? <MousePointer2 size={24} /> : 
                     gestureInfo.type === 'DRAW' ? <Brush size={24} /> :
                     <div className="w-6 h-6" />}
                     
                    {/* Dwell Selection Progress Ring */}
                    {dwellProgress > 0 && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                fill="none"
                                stroke="white"
                                strokeWidth="4"
                                strokeDasharray="100"
                                strokeDashoffset={100 - (dwellProgress * 100)}
                                className="transition-all duration-100"
                            />
                        </svg>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Gesture Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-md bg-black/60"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-[#151619] border border-white/20 rounded-3xl sm:rounded-[40px] p-6 sm:p-10 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full" />
              
              <button 
                onClick={() => setShowGuide(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                id="close-guide-btn"
              >
                <X />
              </button>

              <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter text-blue-400 mb-6 sm:mb-8 uppercase">Gesture Guide</h2>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-orange-500/20 flex items-center justify-center text-xl sm:text-2xl">🤏</div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight text-orange-400">Pinch to Select</h3>
                        <p className="text-white/60 text-[10px] sm:text-xs leading-relaxed">
                            Pinch your thumb and index finger together to click any UI button or select colors.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-cyan-500/20 flex items-center justify-center text-xl sm:text-2xl">✌️</div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight text-cyan-400">Join Fingers to Select</h3>
                        <p className="text-white/60 text-[10px] sm:text-xs leading-relaxed">
                            Join your index and middle fingers (peace sign) to click UI elements or select tools.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-green-500/20 flex items-center justify-center text-xl sm:text-2xl">☝️</div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight text-green-400">Index up to Draw</h3>
                        <p className="text-white/60 text-[10px] sm:text-xs leading-relaxed">Keep only your index finger up to draw smooth neon strokes in the air.</p>
                    </div>
                </div>
              </div>

              <motion.button 
                id="lets-draw-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowGuide(false)}
                className={`w-full mt-6 sm:mt-10 p-4 sm:p-5 bg-blue-600 rounded-2xl font-black uppercase italic tracking-widest text-base sm:text-lg transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(37,99,235,0.4)] ${hoveredId === 'lets-draw-btn' ? 'bg-blue-400 scale-105' : ''}`}
              >
                Let's Draw <Check />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] flex items-center justify-center p-8 backdrop-blur-md bg-black/60"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm bg-[#1a1b1e] border border-red-500/30 rounded-3xl sm:rounded-[40px] p-6 sm:p-10 relative overflow-hidden"
            >
              {/* background glow */}
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-red-500/20 blur-[100px] rounded-full" />
              
              <div className="flex flex-col items-center text-center gap-4 sm:gap-6 relative z-10">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                    <Trash2 size={32} />
                </div>
                
                <div>
                    <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white uppercase">Clear Canvas?</h2>
                    <p className="text-white/50 text-[10px] sm:text-sm mt-1 uppercase tracking-widest font-bold">This cannot be undone</p>
                </div>

                <div className="flex flex-col w-full gap-2 sm:gap-3 mt-2 sm:mt-4">
                    <button 
                        id="erase-clear-ok-btn"
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            strokesRef.current = []; 
                            drawCanvas();
                            setShowClearConfirm(false);
                        }}
                        className={`w-full py-4 sm:py-5 bg-red-600 rounded-xl sm:rounded-2xl font-black uppercase italic tracking-widest text-base sm:text-lg transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(220,38,38,0.4)] ${hoveredId === 'erase-clear-ok-btn' ? 'bg-red-500 scale-105' : ''}`}
                    >
                        Clear Everything <Check size={20} />
                    </button>
                    
                    <button 
                        id="erase-clear-cancel-btn"
                        onClick={(e) => { e.stopPropagation(); setShowClearConfirm(false); }}
                        className={`w-full py-3 sm:py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase tracking-[0.2em] text-[8px] sm:text-[10px] text-white/40 transition-all ${hoveredId === 'erase-clear-cancel-btn' ? 'text-white scale-105 bg-white/10' : ''}`}
                    >
                        Back to Drawing
                    </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {isStarted && !isLoaded && !error && !mouseModeOnly && (
            <motion.div 
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-6"
            >
                <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase animate-pulse">{loadingMessage}</h1>
                <p className="text-white/40 text-xs font-medium uppercase tracking-[0.2em]">Checking permissions and downloading models</p>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-[210] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
            >
                <div className="max-w-md w-full bg-[#1c1c1e] border border-red-500/30 rounded-3xl p-10 flex flex-col items-center text-center gap-6 shadow-[0_20px_50px_rgba(239,68,68,0.2)]">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                        <Circle size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight text-white">Camera Access Required</h2>
                    <p className="text-white/60 leading-relaxed text-sm">
                        To use **Spatial Air Drawing**, your browser needs camera access to track your hand movements. 
                    </p>
                    <div className="text-left w-full bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3">
                        <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Troubleshooting Steps:</p>
                        <ol className="text-[11px] text-white/70 space-y-2 list-decimal ml-4">
                            <li>Check the **Address Bar** for a blocked camera icon 🎥.</li>
                            <li>Click it and select **"Always allow..."** for this site.</li>
                            <li>Ensure no other app (Zoom, Teams) is using your camera.</li>
                            <li>**Refresh the page** if the "Retry" button doesn't work.</li>
                        </ol>
                    </div>
                    <div className="flex flex-col w-full gap-3">
                        <button 
                            onClick={() => retry()}
                            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-cyan-600/20"
                        >
                            Retry Camera
                        </button>
                        <button 
                            onClick={() => setMouseModeOnly(true)}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95"
                        >
                            Continue with Mouse
                        </button>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2">
                            Mouse drawing is always available as a secondary option.
                        </p>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
