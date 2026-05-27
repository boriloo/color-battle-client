import { useState } from "react";
import VerticalSlider from "./colorInput";

interface ColorPickerProps {
    selected: boolean;
    onConfirm?: (h: number, s: number, v: number) => void;
    onChange?: (h: number, s: number, v: number) => void; // ← novo
}

export default function ColorPicker({ onConfirm, onChange, selected }: ColorPickerProps) {
    const [h, setH] = useState(150);
    const [s, setS] = useState(100);
    const [v, setV] = useState(100);

    const handleChange = (newH: number, newS: number, newV: number) => {
        onChange?.(newH, newS, newV)
    }

    // Wraps dos setters para disparar onChange junto
    const handleHChange = (val: number) => { setH(val); handleChange(val, s, v) }
    const handleSChange = (val: number) => { setS(val); handleChange(h, val, v) }
    const handleVChange = (val: number) => { setV(val); handleChange(h, s, val) }

    const getFinalCsslColor = (hue, sat, bright) => {
        const lAns = (bright / 100) * (1 - (sat / 100) / 2);
        const sAns = (lAns === 0 || lAns === 1) ? 0 : ((bright / 100) - lAns) / Math.min(lAns, 1 - lAns);
        return `hsl(${hue}, ${Math.round(sAns * 100)}%, ${Math.round(lAns * 100)}%)`;
    };

    const colorString = getFinalCsslColor(h, s, v);

    const getPerceivedLuminance = (hue, sat, bright) => {
        const lVal = (bright / 100) * (1 - (sat / 100) / 2);
        const sVal = (lVal === 0 || lVal === 1) ? 0 : ((bright / 100) - lVal) / Math.min(lVal, 1 - lVal);
        const hVal = hue / 360;
        const q = lVal < 0.5 ? lVal * (1 + sVal) : lVal + sVal - lVal * sVal;
        const p = 2 * lVal - q;
        const hue2rgb = (t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const r = hue2rgb(hVal + 1 / 3);
        const g = hue2rgb(hVal);
        const b = hue2rgb(hVal - 1 / 3);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const textColor = getPerceivedLuminance(h, s, v) > 0.179 ? '#000000' : '#ffffff';
    const saturatedColorProp = getFinalCsslColor(h, 100, v);
    const grayColorProp = getFinalCsslColor(h, 0, v);
    const brightnessColorProp = getFinalCsslColor(h, s, 100);

    return (
        <div className={`${selected ? 'saturate-30 opacity-65 scale-90 pointer-events-none' : ''} flex flex-row transition-all justify-center h-[400px] overflow-hidden rounded-2xl`}>
            <VerticalSlider type="hue" min={0} max={360} value={h} onChange={handleHChange} />
            <VerticalSlider
                type="saturation"
                saturatedColor={saturatedColorProp}
                gray={grayColorProp}
                value={s}
                onChange={handleSChange}
            />
            <VerticalSlider
                type="lightness"
                color={brightnessColorProp}
                value={v}
                onChange={handleVChange}
            />

            <div
                className="w-full min-w-[350px] h-full relative"
                style={{ backgroundColor: colorString, transition: 'background-color 0.2s' }}
            >
                <p className="absolute top-3 right-3 text-lg opacity-60 font-medium select-none transition-all"
                    style={{ color: textColor }}>
                    {colorString}
                </p>

                {/* 2. Executa a função passando os valores do estado do componente */}
                <button
                    onClick={() => onConfirm?.(h, s, v)}
                    className={`${selected ? 'opacity-0 pointer-events-none' : ''} absolute right-5 bottom-5 p-2 px-5 bg-white text-black shadow-md text-xl
                    font-medium rounded-full hover:scale-105 transition-all cursor-pointer`}
                    style={{
                        color: 'black'
                    }}
                >
                    Confirmar
                </button>
            </div>

            <div className="absolute self-center w-140 h-90 z-[-1] blur-[100px] opacity-55"
                style={{ backgroundColor: colorString, transition: 'background-color 1.5s' }}>
            </div>
        </div>
    );
}