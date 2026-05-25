import React, { useRef } from 'react';

interface Props {
    type: 'hue' | 'saturation' | 'lightness'; // String literal para tipagem exata
    value: number;
    onChange: (number: number) => void;
    saturatedColor?: string;
    color?: string;
    gray?: string;
    min?: number;
    max?: number;
}

export default function VerticalSlider({
    type,
    value,
    onChange,
    saturatedColor,
    color,
    gray,
    min = 0,
    max = 100
}: Props) {
    const trackRef = useRef<HTMLDivElement>(null);

    const getBackgroundStyle = () => {
        switch (type) {
            case 'hue':
                return 'linear-gradient(to bottom, #ff0000, #ff00ff, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000)';
            case 'saturation':
                return `linear-gradient(to bottom, ${saturatedColor}, ${gray})`;
            case 'lightness':
                return `linear-gradient(to bottom, ${color}, #000000)`;
            default:
                return '#e0e0e0';
        }
    };

    const handlePosition = (clientY: number) => {
        if (!trackRef.current) return;

        const rect = trackRef.current.getBoundingClientRect();
        let pct = 1 - (clientY - rect.top) / rect.height;
        pct = Math.max(0, Math.min(1, pct));

        const newValue = Math.round(min + pct * (max - min));
        onChange(newValue);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        handlePosition(e.clientY);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            handlePosition(moveEvent.clientY);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        handlePosition(e.touches[0].clientY);

        const handleTouchMove = (moveEvent: TouchEvent) => {
            handlePosition(moveEvent.touches[0].clientY);
        };

        const handleTouchEnd = () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };

        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);
    };

    const percentage = ((value - min) / (max - min)) * 100;

    return (
        // Container externo limitando a largura exata de cada barra (como na imagem)
        <div className="flex justify-center items-center w-[65px] h-full select-none">
            <div
                ref={trackRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                style={{ background: getBackgroundStyle() }}
                className="group relative w-full h-full cursor-pointer overflow-hidden"
            >

                <div
                    style={{ bottom: `${percentage}%` }}
                    className="absolute left-0 right-0 translate-y-1/2 h-[6px] bg-white/90 shadow-md 
                    backdrop-blur-sm pointer-events-none"
                />
            </div>
        </div>
    );
}