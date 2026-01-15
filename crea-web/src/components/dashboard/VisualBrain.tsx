'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Mock Data for the Visual Brain (In prod, fetch from API)
const NODES = [
    { id: 'root', x: 400, y: 300, label: 'Central Command', type: 'core' },
    { id: 'proj-1', x: 250, y: 150, label: 'Website Redesign', type: 'project' },
    { id: 'proj-2', x: 550, y: 150, label: 'Q1 Marketing', type: 'project' },
    { id: 'task-1', x: 200, y: 50, label: 'Fix Colors', type: 'task' },
    { id: 'task-2', x: 300, y: 50, label: 'Typography', type: 'task' },
    { id: 'task-3', x: 500, y: 50, label: 'Ad Copy', type: 'task' },
];

const LINKS = [
    { source: 'root', target: 'proj-1' },
    { source: 'root', target: 'proj-2' },
    { source: 'proj-1', target: 'task-1' },
    { source: 'proj-1', target: 'task-2' },
    { source: 'proj-2', target: 'task-3' },
];

export default function VisualBrain() {
    return (
        <div className="w-full h-[600px] bg-white/5 rounded-xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-white font-serif text-lg">Hive Mind Visualization</h3>
                <p className="text-gray-500 text-xs font-mono">LIVE OPTIMIZATION</p>
            </div>

            <svg className="w-full h-full absolute top-0 left-0 pointer-events-none">
                {LINKS.map((link, i) => {
                    const src = NODES.find(n => n.id === link.source)!;
                    const tgt = NODES.find(n => n.id === link.target)!;
                    return (
                        <motion.line
                            key={i}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            x1={src.x} y1={src.y}
                            x2={tgt.x} y2={tgt.y}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="2"
                        />
                    );
                })}
            </svg>

            {NODES.map((node, i) => (
                <motion.div
                    key={node.id}
                    className="absolute cursor-pointer flex flex-col items-center justify-center pointer-events-auto"
                    style={{ left: node.x - 40, top: node.y - 40, width: 80, height: 80 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: i * 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    drag
                    dragConstraints={{ left: 0, right: 800, top: 0, bottom: 600 }}
                >
                    <div className={`
                        w-4 h-4 rounded-full border-2 
                        ${node.type === 'core' ? 'bg-brand-orange border-brand-orange blur-[2px]' : ''}
                        ${node.type === 'project' ? 'bg-brand-mint border-brand-mint' : ''}
                        ${node.type === 'task' ? 'bg-black border-white/50' : ''}
                    `} />
                    <span className="mt-2 text-[10px] text-gray-400 font-mono bg-black/50 px-1 rounded">
                        {node.label}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}
