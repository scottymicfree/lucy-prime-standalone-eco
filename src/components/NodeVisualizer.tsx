import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { LucyNode, NodeCategory } from '../core/types';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORY_COLORS: Record<string, string> = {
  'Root / Refiner': 'border-purple-500/50 bg-purple-500/10 text-purple-400 glow-purple',
  'Classical Core': 'border-blue-500/50 bg-blue-500/10 text-blue-400',
  'Oracle / Quantum Gate': 'border-teal-500/50 bg-teal-500/10 text-teal-400 glow-teal',
  'Stem Cell Pool': 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
  'Planetary Sensor': 'border-amber-500/50 bg-amber-500/10 text-amber-400',
  'Intelligence / Control': 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
  'Builder / GameDev': 'border-orange-500/50 bg-orange-500/10 text-orange-400',
  'Reserved Evolution Pool': 'border-slate-500/50 bg-slate-500/10 text-slate-400 opacity-50',
};

const CATEGORY_NAMES: Record<string, string> = {
  'Root / Refiner': 'Root / Refiner (1)',
  'Classical Core': 'Classical Core (119)',
  'Oracle / Quantum Gate': 'Oracle / Quantum Gate (18)',
  'Stem Cell Pool': 'Stem Cell Pool (13)',
  'Planetary Sensor': 'Planetary Sensor Layer (50)',
  'Intelligence / Control': 'Intelligence & Control (50)',
  'Builder / GameDev': 'v8 Builder & GameDev (75)',
  'Reserved Evolution Pool': 'Reserved Evolution Pool (25)',
};

const CATEGORY_ORDER = [
  'Root / Refiner',
  'Classical Core',
  'Oracle / Quantum Gate',
  'Stem Cell Pool',
  'Planetary Sensor',
  'Intelligence / Control',
  'Builder / GameDev',
  'Reserved Evolution Pool'
];

interface Edge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive: boolean;
}

export const NodeVisualizer: React.FC<{ nodes: Record<string, LucyNode> }> = ({ nodes }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [edges, setEdges] = useState<Edge[]>([]);

  const groupedNodes = Object.values(nodes).reduce((acc, node: LucyNode) => {
    if (!acc[node.category]) acc[node.category] = [];
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, LucyNode[]>);

  useLayoutEffect(() => {
    // Only draw explicit edges if a node is hovered or clicked. Alternatively draw some global active ones.
    const container = containerRef.current;
    if (!container) return;

    let newEdges: Edge[] = [];
    const containerRect = container.getBoundingClientRect();

    const addEdgesForNode = (nodeId: string, isActiveDep = false) => {
      const node = nodes[nodeId];
      if (!node || !node.dependencies) return;

      const el1 = nodeRefs.current[nodeId];
      if (!el1) return;

      const rect1 = el1.getBoundingClientRect();
      const x1 = rect1.left - containerRect.left + rect1.width / 2;
      const y1 = rect1.top - containerRect.top + rect1.height / 2;

      node.dependencies.forEach(depId => {
        const el2 = nodeRefs.current[depId];
        if (!el2) return;
        const rect2 = el2.getBoundingClientRect();
        const x2 = rect2.left - containerRect.left + rect2.width / 2;
        const y2 = rect2.top - containerRect.top + rect2.height / 2;

        newEdges.push({
          id: `${nodeId}-${depId}`,
          x1, y1, x2, y2,
          isActive: isActiveDep || node.status === 'processing'
        });
      });
    };

    if (hoveredNodeId) {
      // Draw path just for hovered
      addEdgesForNode(hoveredNodeId, true);
    } else {
      // Draw paths for all currently processing nodes to show activity
      Object.values(nodes).forEach((node: LucyNode) => {
        if (node.status === 'processing') {
          addEdgesForNode(node.id, true);
        }
      });
    }

    setEdges(newEdges);

    // Add a resize listener or handle scrolling if the component size changes
    const observer = new ResizeObserver(() => {
       // Force re-render would require a state variable (like tick), but we'll let normal updates handle it for now
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [nodes, hoveredNodeId]);

  return (
    <div className="relative flex flex-col gap-6 pb-20" ref={containerRef}>
      {/* SVG Overlay for Connections */}
      <svg 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" 
        style={{ minHeight: '100%' }}
      >
        <AnimatePresence>
          {edges.map((edge) => (
            <motion.line
              key={edge.id}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: edge.isActive ? 0.6 : 0.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke={edge.isActive ? '#06b6d4' : '#475569'}
              strokeWidth={edge.isActive ? 1.5 : 1}
              strokeDasharray={edge.isActive ? "4 4" : "none"}
            />
          ))}
        </AnimatePresence>
      </svg>

      {CATEGORY_ORDER.map((categoryKey) => {
        const catNodes = groupedNodes[categoryKey];
        if (!catNodes || catNodes.length === 0) return null;

        return (
          <div key={categoryKey} className="flex flex-col gap-2 relative z-10">
            <h3 className="text-[10px] font-mono tracking-widest text-slate-500 uppercase border-b border-slate-800 pb-1">
              {CATEGORY_NAMES[categoryKey]}
            </h3>
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {catNodes.map((node) => {
                const isActive = node.status === 'processing';
                const isSuccess = node.status === 'success';
                const isHoveredOrDep = hoveredNodeId === node.id || nodes[hoveredNodeId || '']?.dependencies?.includes(node.id);
                
                let baseColor = CATEGORY_COLORS[node.category] || 'bg-slate-800 border-slate-700';
                
                if (isActive) {
                   baseColor = 'bg-white text-black glow-blue scale-110 z-20';
                } else if (isSuccess) {
                   baseColor = 'bg-lucy-success text-white glow-green scale-105 z-20';
                }

                return (
                  <motion.div
                    key={node.id}
                    ref={el => nodeRefs.current[node.id] = el}
                    layoutId={`node-${node.id}`}
                    initial={false}
                    animate={{
                        scale: isActive ? 1.15 : isSuccess ? 1.05 : isHoveredOrDep ? 1.1 : 1,
                        opacity: isActive || isSuccess || isHoveredOrDep ? 1 : hoveredNodeId ? 0.3 : 0.6
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    title={`${node.id}: ${node.name}`}
                    className={`
                      h-6 rounded-[3px] border border-transparent shadow-sm flex items-center justify-center text-[8px] font-mono font-bold transition-all duration-300 cursor-pointer
                      ${baseColor}
                    `}
                  >
                    {node.id}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
