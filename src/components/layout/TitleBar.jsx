import React from 'react';
import { Minus, Square, X } from 'lucide-react';

export default function TitleBar() {
    const handleMinimize = () => {
        window.electronAPI?.window?.minimize();
    };

    const handleMaximize = () => {
        window.electronAPI?.window?.maximize();
    };

    const handleClose = () => {
        window.electronAPI?.window?.close();
    };

    return (
        <div
            className="h-8 bg-transparent flex items-center justify-center relative select-none"
            style={{ WebkitAppRegion: 'drag' }}
        >
            {/* Centered Title */}
            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 dark:text-white/20">EvidEx Management</span>
            </div>

            {/* Window Controls */}
            <div className="flex items-center h-full ml-auto" style={{ WebkitAppRegion: 'no-drag' }}>
                <button
                    onClick={handleMinimize}
                    className="h-full w-12 flex items-center justify-center hover:bg-accent/80 active:bg-accent transition-colors duration-150"
                    aria-label="Minimize"
                    type="button"
                >
                    <Minus className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                    onClick={handleMaximize}
                    className="h-full w-12 flex items-center justify-center hover:bg-accent/80 active:bg-accent transition-colors duration-150"
                    aria-label="Maximize"
                    type="button"
                >
                    <Square className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
                <button
                    onClick={handleClose}
                    className="h-full w-12 flex items-center justify-center hover:bg-red-600 hover:text-white active:bg-red-700 transition-colors duration-150"
                    aria-label="Close"
                    type="button"
                >
                    <X className="w-4 h-4" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
