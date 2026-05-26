
import { createContext, useContext, ReactNode, useCallback, useState, useEffect, useRef } from "react";
import { socket } from "../lib/socket";
import { usePlayerContext } from "./playerContext";

export type Teams = 'orca' | 'siri' | 'none';
export type Class = 'picker' | 'helper' | 'away';

export type Game = {
    name: string,
    team: Teams,
    class: Class
};

interface ColorCompare {
    orcaColorOne?: number;
    orcaColorTwo?: number;
    orcaColorThree?: number;
    orcaColorFour?: number;
    orcaColorFive?: number;
    siriColorOne?: number;
    siriColorTwo?: number;
    siriColorThree?: number;
    siriColorFour?: number;
    siriColorFive?: number;
}

interface GameColors {
    orcaColorOne?: { h: number; s: number; v: number };
    orcaColorTwo?: { h: number; s: number; v: number };
    orcaColorThree?: { h: number; s: number; v: number };
    orcaColorFour?: { h: number; s: number; v: number };
    orcaColorFive?: { h: number; s: number; v: number };
    siriColorOne?: { h: number; s: number; v: number };
    siriColorTwo?: { h: number; s: number; v: number };
    siriColorThree?: { h: number; s: number; v: number };
    siriColorFour?: { h: number; s: number; v: number };
    siriColorFive?: { h: number; s: number; v: number };
}

interface MysteryColors {
    orcaColorOne: { h: number; s: number; v: number };
    orcaColorTwo: { h: number; s: number; v: number };
    orcaColorThree: { h: number; s: number; v: number };
    orcaColorFour: { h: number; s: number; v: number };
    orcaColorFive: { h: number; s: number; v: number };
    siriColorOne: { h: number; s: number; v: number };
    siriColorTwo: { h: number; s: number; v: number };
    siriColorThree: { h: number; s: number; v: number };
    siriColorFour: { h: number; s: number; v: number };
    siriColorFive: { h: number; s: number; v: number };
}

interface GameContextType {
    inGame: boolean
    currentStep: number
    colorSelected: boolean
    changeColorSelected: (bool: boolean) => void
    changeInGame: (bool: boolean) => void
    gameColors: GameColors
    mysteryColors: MysteryColors | null
    nextStep: () => void
    updateGameColor: (team: 'orca' | 'siri', index: number, h: number, s: number, v: number) => void;
    colorCompare: ColorCompare;
    updateColorCompare: (team: 'orca' | 'siri', index: number, value: number) => void;
    compareHSV: (a: { h: number; s: number; v: number },
        b: { h: number; s: number; v: number }) => number;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const defaultGray = { h: 0, s: 0, v: 50 };

const initialGameColors: GameColors = {
    orcaColorOne: defaultGray,
    orcaColorTwo: defaultGray,
    orcaColorThree: defaultGray,
    orcaColorFour: defaultGray,
    orcaColorFive: defaultGray,
    siriColorOne: defaultGray,
    siriColorTwo: defaultGray,
    siriColorThree: defaultGray,
    siriColorFour: defaultGray,
    siriColorFive: defaultGray,
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const { ownerRoom, currentRoom } = usePlayerContext();
    const [inGame, setInGame] = useState<boolean>(false)
    const [colorSelected, setColorSelected] = useState<boolean>(false)
    const [gameColors, setGameColors] = useState<GameColors>(initialGameColors);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [mysteryColors, setMysteryColors] = useState<MysteryColors | null>(null);
    const [colorCompare, setColorCompare] = useState<ColorCompare>({});

    const currentStepRef = useRef(currentStep);
    const ownerRoomRef = useRef(ownerRoom);
    const currentRoomRef = useRef(currentRoom);
    const gameColorsRef = useRef<GameColors>({});
    const mysteryColorsRef = useRef<MysteryColors | null>(null);

    useEffect(() => { gameColorsRef.current = gameColors }, [gameColors]);
    useEffect(() => { mysteryColorsRef.current = mysteryColors }, [mysteryColors]);

    useEffect(() => {
        console.log('🔥🔥🔥', gameColors)
    }, [gameColors])

    const changeInGame = (bool: boolean) => {
        setInGame(bool)
    }

    function compareHSV(
        a: { h: number; s: number; v: number },
        b: { h: number; s: number; v: number }
    ): number {

        // Atalho: cores idênticas = 100% garantido
        if (a.h === b.h && a.s === b.s && a.v === b.v) return 100;

        const hsvToRgb = (h: number, s: number, v: number) => {
            s /= 100; v /= 100;
            const k = (n: number) => (n + h / 60) % 6;
            const f = (n: number) => v * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
            return [f(5), f(3), f(1)] as [number, number, number];
        };

        const rgbToXyz = (r: number, g: number, b: number) => {
            const lin = (c: number) => c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
            const [rl, gl, bl] = [lin(r), lin(g), lin(b)];
            return [
                rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375,
                rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750,
                rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041,
            ] as [number, number, number];
        };

        const xyzToLab = (x: number, y: number, z: number) => {
            const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
            const fy = f(y / 1.0);
            return [116 * fy - 16, 500 * (f(x / 0.95047) - fy), 200 * (fy - f(z / 1.08883))] as [number, number, number];
        };

        const hsvToLab = (hsv: { h: number; s: number; v: number }) => {
            return xyzToLab(...rgbToXyz(...hsvToRgb(hsv.h, hsv.s, hsv.v)));
        };

        const ciede2000 = (L1: number, a1: number, b1: number, L2: number, a2: number, b2: number): number => {
            const rad = (d: number) => d * Math.PI / 180;
            const deg = (r: number) => r * 180 / Math.PI;

            const C1 = Math.sqrt(a1 ** 2 + b1 ** 2);
            const C2 = Math.sqrt(a2 ** 2 + b2 ** 2);
            const Cb = (C1 + C2) / 2;
            const Cb7 = Cb ** 7;
            const G = 0.5 * (1 - Math.sqrt(Cb7 / (Cb7 + 25 ** 7)));
            const a1p = a1 * (1 + G), a2p = a2 * (1 + G);
            const C1p = Math.sqrt(a1p ** 2 + b1 ** 2);
            const C2p = Math.sqrt(a2p ** 2 + b2 ** 2);

            const h1p = C1p === 0 ? 0 : (deg(Math.atan2(b1, a1p)) + 360) % 360;
            const h2p = C2p === 0 ? 0 : (deg(Math.atan2(b2, a2p)) + 360) % 360;

            const dLp = L2 - L1;
            const dCp = C2p - C1p;

            let dhp = 0;
            if (C1p * C2p !== 0) {
                const diff = h2p - h1p;
                dhp = Math.abs(diff) <= 180 ? diff : diff > 180 ? diff - 360 : diff + 360;
            }
            const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp / 2));

            const Lbp = (L1 + L2) / 2;
            const Cbp = (C1p + C2p) / 2;

            let hbp = h1p + h2p;
            if (C1p * C2p !== 0) {
                hbp = Math.abs(h1p - h2p) <= 180
                    ? (h1p + h2p) / 2
                    : h1p + h2p < 360
                        ? (h1p + h2p + 360) / 2
                        : (h1p + h2p - 360) / 2;
            }

            const T = 1
                - 0.17 * Math.cos(rad(hbp - 30))
                + 0.24 * Math.cos(rad(2 * hbp))
                + 0.32 * Math.cos(rad(3 * hbp + 6))
                - 0.20 * Math.cos(rad(4 * hbp - 63));

            const SL = 1 + 0.015 * (Lbp - 50) ** 2 / Math.sqrt(20 + (Lbp - 50) ** 2);
            const SC = 1 + 0.045 * Cbp;
            const SH = 1 + 0.015 * Cbp * T;

            const Cbp7 = Cbp ** 7;
            const RC = 2 * Math.sqrt(Cbp7 / (Cbp7 + 25 ** 7));
            const dt = 30 * Math.exp(-((hbp - 275) / 25) ** 2);
            const RT = -RC * Math.sin(rad(2 * dt));

            return Math.sqrt(
                (dLp / SL) ** 2 +
                (dCp / SC) ** 2 +
                (dHp / SH) ** 2 +
                RT * (dCp / SC) * (dHp / SH)
            );
        };

        const [L1, a1, b1] = hsvToLab(a);
        const [L2, a2, b2] = hsvToLab(b);
        const de = ciede2000(L1, a1, b1, L2, a2, b2);

        // ΔE₀₀ reference: ~1 = limiar perceptível, ~10 = similar, ~30 = diferente, ~60 = extremo
        const maxDelta = 60;
        const raw = Math.max(0, 1 - de / maxDelta);

        // Expoente 1.6: estica a escala p/ baixo no meio, sem falsificar os extremos
        return Math.round(Math.pow(raw, 1.6) * 100);
    }


    useEffect(() => { currentStepRef.current = currentStep }, [currentStep]);
    useEffect(() => { ownerRoomRef.current = ownerRoom }, [ownerRoom]);
    useEffect(() => { currentRoomRef.current = currentRoom }, [currentRoom]);

    const generateMysteryColors = useCallback((): MysteryColors => {
        const randomRange = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min

        const randomHSV = () => ({
            h: randomRange(0, 360),
            s: randomRange(15, 95),
            v: randomRange(6, 85),
        })
        return {
            orcaColorOne: randomHSV(),
            orcaColorTwo: randomHSV(),
            orcaColorThree: randomHSV(),
            orcaColorFour: randomHSV(),
            orcaColorFive: randomHSV(),
            siriColorOne: randomHSV(),
            siriColorTwo: randomHSV(),
            siriColorThree: randomHSV(),
            siriColorFour: randomHSV(),
            siriColorFive: randomHSV(),
        };
    }, []);

    const changeColorSelected = useCallback((bool: boolean) => {
        setColorSelected(bool)
    }, [])

    const nextStep = useCallback(() => {
        // if (currentStep === 5) return;
        setCurrentStep(prev => prev + 1)
    }, [currentStep])

    const updateGameColor = useCallback((
        team: 'orca' | 'siri',
        index: number,
        h: number,
        s: number,
        v: number
    ) => {
        const numberWords: Record<number, string> = {
            1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five'
        };
        const key = `${team}Color${numberWords[index]}` as keyof GameColors;
        setGameColors((prev) => ({ ...prev, [key]: { h, s, v } }));
    }, []);




    const updateColorCompare = useCallback((
        team: 'orca' | 'siri',
        index: number,
        value: number          // ← era (h, s, v) errado
    ) => {
        const numberWords: Record<number, string> = {
            1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five'
        };
        const key = `${team}Color${numberWords[index]}` as keyof ColorCompare;
        setColorCompare((prev) => ({ ...prev, [key]: value }));  // ← setColorCompare, não setGameColors
    }, []);





    useEffect(() => {
        socket.on('comecar_jogo', (data: { roomCode: string }) => {
            if (!data?.roomCode) return;

            setInGame(true)
            setGameColors(initialGameColors);
            setCurrentStep(1)
            setMysteryColors(null)
            setColorCompare({})
            setColorSelected(false)

            if (ownerRoomRef.current === currentRoomRef.current) {
                const colours = generateMysteryColors()
                socket.emit('cores_misterio', {
                    cores: colours,
                    roomCode: data.roomCode
                });
            }
        });

        socket.on('cores_misterio', (data: { cores: MysteryColors, roomCode?: string }) => {
            if (!data?.cores) return;

            setMysteryColors(data.cores)
        });

        socket.on('selecionar_cor', (data) => {
            if (!data) return;
            const step = currentStepRef.current;

            if (data.first) {
                setColorSelected(true);
            }
            updateGameColor(data.team as any, step, data.h, data.s, data.v);
        });

        socket.on('comparar_cor', (data) => {
            if (!data) return;

            const step = currentStepRef.current  // captura o step atual antes de qualquer mudança

            const orcaPoints = compareHSV(data.orcaA, data.orcaB)
            const siriPoints = compareHSV(data.siriA, data.siriB)

            updateColorCompare('orca', step, orcaPoints)
            updateColorCompare('siri', step, siriPoints)
        });

        return () => {
            socket.off('comecar_jogo');
            socket.off('cores_misterio');
            socket.off('selecionar_cor');
            socket.off('comparar_cor');
        };
    }, []);

    return (
        <GameContext.Provider value={{
            inGame, colorSelected, gameColors, mysteryColors,
            currentStep, updateGameColor, changeColorSelected, nextStep, colorCompare, updateColorCompare, compareHSV, changeInGame
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGameContext must be used inside GameProvider");
    return context;
};