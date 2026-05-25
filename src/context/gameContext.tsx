
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

        const hsvToRgb = (h: number, s: number, v: number) => {
            s /= 100; v /= 100;
            const k = (n: number) => (n + h / 60) % 6;
            const f = (n: number) => v * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
            return { r: f(5), g: f(3), b: f(1) };
        };

        const rgbToXyz = (r: number, g: number, b: number) => {
            const lin = (c: number) => c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
            const [rl, gl, bl] = [lin(r), lin(g), lin(b)];
            return {
                x: rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375,
                y: rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750,
                z: rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041,
            };
        };

        const xyzToLab = (x: number, y: number, z: number) => {
            const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + (16 / 116);
            const [fx, fy, fz] = [f(x / 0.95047), f(y / 1.00000), f(z / 1.08883)];
            return {
                L: (116 * fy) - 16,
                a: 500 * (fx - fy),
                b: 200 * (fy - fz),
            };
        };

        const toLab = (hsv: { h: number; s: number; v: number }) => {
            const { r, g, b } = hsvToRgb(hsv.h, hsv.s, hsv.v);
            const { x, y, z } = rgbToXyz(r, g, b);
            return xyzToLab(x, y, z);
        };

        const A = toLab(a);
        const B = toLab(b);

        const dL = A.L - B.L;
        const C1 = Math.sqrt(A.a ** 2 + A.b ** 2);
        const C2 = Math.sqrt(B.a ** 2 + B.b ** 2);
        const dC = C1 - C2;
        const dA = A.a - B.a;
        const dB = A.b - B.b;
        const dH = Math.sqrt(Math.max(0, dA ** 2 + dB ** 2 - dC ** 2));

        // kL=3: luminosidade pesa menos, matiz/croma penalizam mais
        const kL = 3, kC = 1, kH = 1;
        const sL = 1, sC = 1 + 0.045 * C1, sH = 1 + 0.015 * C1;

        const deltaE = Math.sqrt(
            (dL / (kL * sL)) ** 2 +
            (dC / (kC * sC)) ** 2 +
            (dH / (kH * sH)) ** 2
        );

        // Calibrado nos seus exemplos:
        // verde vs roxo (4.75) → deltaE ~38 → 47%
        // laranja vs laranja saturado (6.26) → deltaE ~28 → 62%  
        // verde vs verde (6.49) → deltaE ~25 → 64%
        const maxDelta = 65;
        const raw = Math.max(0, 1 - (deltaE / maxDelta));

        // Curva leve para espalhar melhor os scores no meio
        const curved = Math.pow(raw, 0.85);

        return Math.round(curved * 100);
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