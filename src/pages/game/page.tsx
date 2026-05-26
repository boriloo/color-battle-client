import { useCallback, useEffect, useRef, useState } from 'react'
import ColorPicker from '../../components/colorPicker'
import { usePlayerContext } from '../../context/playerContext'
import { useGameContext } from '../../context/gameContext'
import { socket } from '../../lib/socket'
import { useNavigate } from 'react-router-dom'
import orcaImg from '../../assets/orca.png'
import crabImg from '../../assets/crab.png'

type Stages = 'picker' | 'anim'

type ColorHistory = {
    game: { h: number; s: number; v: number } | undefined;
    mystery: { h: number; s: number; v: number } | undefined;
    compare: number | undefined;
}

export default function GamePage() {
    const { colorSelected, currentStep, gameColors, mysteryColors, nextStep, changeColorSelected, colorCompare, changeInGame, inGame, } = useGameContext();
    const { me, ownerRoom, currentRoom } = usePlayerContext()
    const [stage, setStage] = useState<Stages>('picker')
    const [clockNumber, setClockNumber] = useState<number>(4)
    const [animCounter, setAnimCounter] = useState<number>(0)
    const [countdown, setCountdown] = useState<number>(500)
    const [confirmCount, setConfirmCount] = useState<number>(1000)
    const [localSelectedColor, setLocalSelectedColor] = useState<boolean>(false)
    const [orcaPoints, setOrcaPoints] = useState(0)
    const [siriPoints, setSiriPoints] = useState(0)
    const [finished, setFinished] = useState<boolean>(false)
    const [orcaHistory, setOrcaHistory] = useState<ColorHistory[]>([])
    const [siriHistory, setSiriHistory] = useState<ColorHistory[]>([])


    const currentPickerColor = useRef<{ h: number; s: number; v: number }>({ h: 150, s: 100, v: 100 })

    const localSelectedColorRef = useRef(false)
    const colorSelectedRef = useRef(colorSelected)

    const navigate = useNavigate()

    useEffect(() => { colorSelectedRef.current = colorSelected }, [colorSelected])

    useEffect(() => {
        if (!me) navigate('/enter')
    }, [])

    useEffect(() => {

        if (!inGame) return;
        setFinished(false)
        setLocalSelectedColor(false)
        setStage('picker')
        setClockNumber(4)
        setAnimCounter(0)
        setCountdown(500)

        setConfirmCount(1000)
        localSelectedColorRef.current = false


    }, [inGame])

    useEffect(() => {
        if (stage === 'picker') {
            clockAnimation()
            return;
        }
        playAnimation()
        if (ownerRoom === currentRoom) {
            setTimeout(() => {
                socket.emit('comparar_cor', { orcaA: getColor("orca"), orcaB: getMysteryColor('orca'), siriA: getColor('siri'), siriB: getMysteryColor('siri') })
            }, 1800)
        }

        setTimeout(() => {
            if (currentStep === 5) {
                changeInGame(false)
                setFinished(true);
                return;
            }
            setStage('picker')
            setLocalSelectedColor(false)
            changeColorSelected(false)
            setAnimCounter(0)
            localSelectedColorRef.current = false
            setTimeout(() => {
                nextStep()
            }, 3000)
        }, 10000)
    }, [stage])


    useEffect(() => {
        if (stage !== 'anim') return;

        const stepToRead = currentStep
        const orca = [colorCompare.orcaColorOne, colorCompare.orcaColorTwo, colorCompare.orcaColorThree, colorCompare.orcaColorFour, colorCompare.orcaColorFive]
        const siri = [colorCompare.siriColorOne, colorCompare.siriColorTwo, colorCompare.siriColorThree, colorCompare.siriColorFour, colorCompare.siriColorFive]

        setOrcaPoints(orca[stepToRead - 1] ?? 0)
        setSiriPoints(siri[stepToRead - 1] ?? 0)
    }, [colorCompare, stage])



    useEffect(() => {
        if (!colorSelected) return;
        const t = setTimeout(() => {
            setStage('anim')
        }, 10000)
        return () => clearTimeout(t)
    }, [colorSelected])


    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (stage === 'picker' && clockNumber === 0 && countdown > 0) {
            timer = setInterval(() => setCountdown((prev) => prev - 1), 7)
        }
        return () => clearInterval(timer)
    }, [stage, clockNumber, countdown])


    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (!colorSelected) return;
        if (confirmCount > 0) {
            timer = setInterval(() => setConfirmCount((prev) => prev - 1), 7)
        }
        return () => clearInterval(timer)
    }, [confirmCount, colorSelected])


    useEffect(() => {
        if (confirmCount !== 0) return;
        if (!colorSelectedRef.current) return;
        if (localSelectedColorRef.current) return;

        const color = currentPickerColor.current

        confirmColor(color.h, color.s, color.v)
        localSelectedColorRef.current = true
        setLocalSelectedColor(true)
    }, [confirmCount, me])


    const clockAnimation = () => {
        setTimeout(() => {
            setConfirmCount(1000)
            setCountdown(500)
        }, 600)

        setClockNumber(4)
        setTimeout(() => {
            setClockNumber(3)
            setTimeout(() => {
                setClockNumber(2)
                setTimeout(() => {
                    setClockNumber(1)
                    setTimeout(() => setClockNumber(0), 1000)
                }, 1000)
            }, 1000)
        }, 1000)
    }

    const playAnimation = () => {
        setTimeout(() => {
            setAnimCounter(1)
            setTimeout(() => {
                setAnimCounter(2)
                setTimeout(() => setAnimCounter(3), 2300)
            }, 1000)
        }, 1000)
    }


    const confirmColor = useCallback((h: number, s: number, v: number) => {
        if (localSelectedColorRef.current || me?.class === 'helper') return;

        localSelectedColorRef.current = true
        setLocalSelectedColor(true)

        if (colorSelectedRef.current) {
            socket.emit('selecionar_cor', { h, s, v, team: me?.team, first: false })
        } else {
            socket.emit('selecionar_cor', { h, s, v, team: me?.team, first: true })
        }
    }, [me])


    const getColor = useCallback((team: 'orca' | 'siri') => {
        const stepToRead = currentStep
        const colors = team === 'orca'
            ? [gameColors.orcaColorOne, gameColors.orcaColorTwo, gameColors.orcaColorThree, gameColors.orcaColorFour, gameColors.orcaColorFive]
            : [gameColors.siriColorOne, gameColors.siriColorTwo, gameColors.siriColorThree, gameColors.siriColorFour, gameColors.siriColorFive]
        return colors[stepToRead - 1] ?? null
    }, [gameColors, currentStep])

    const getMysteryColor = useCallback((team: 'orca' | 'siri') => {
        const stepToRead = currentStep
        const colors = team === 'orca'
            ? [mysteryColors?.orcaColorOne, mysteryColors?.orcaColorTwo, mysteryColors?.orcaColorThree, mysteryColors?.orcaColorFour, mysteryColors?.orcaColorFive]
            : [mysteryColors?.siriColorOne, mysteryColors?.siriColorTwo, mysteryColors?.siriColorThree, mysteryColors?.siriColorFour, mysteryColors?.siriColorFive]
        return colors[stepToRead - 1] ?? null
    }, [mysteryColors, currentStep])


    const hsvToRgbString = (h?: number, s?: number, v?: number): string => {
        if (h === undefined || s === undefined || v === undefined) return 'transparent';
        const _s = s / 100, _v = v / 100;
        const k = (n: number) => (n + h / 60) % 6;
        const f = (n: number) => _v * (1 - _s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
        return `rgb(${Math.round(255 * f(5))}, ${Math.round(255 * f(3))}, ${Math.round(255 * f(1))})`;
    };


    useEffect(() => {
        if (!finished) return;
        // garante que todos os 5 steps foram preenchidos antes de montar o histórico
        const orcaFilled = [
            colorCompare.orcaColorOne, colorCompare.orcaColorTwo, colorCompare.orcaColorThree,
            colorCompare.orcaColorFour, colorCompare.orcaColorFive
        ].every(v => v !== undefined);

        if (!orcaFilled) return; // ainda aguardando o último compare chegar

        const orca = [
            { game: gameColors.orcaColorOne, mystery: mysteryColors?.orcaColorOne, compare: colorCompare.orcaColorOne },
            { game: gameColors.orcaColorTwo, mystery: mysteryColors?.orcaColorTwo, compare: colorCompare.orcaColorTwo },
            { game: gameColors.orcaColorThree, mystery: mysteryColors?.orcaColorThree, compare: colorCompare.orcaColorThree },
            { game: gameColors.orcaColorFour, mystery: mysteryColors?.orcaColorFour, compare: colorCompare.orcaColorFour },
            { game: gameColors.orcaColorFive, mystery: mysteryColors?.orcaColorFive, compare: colorCompare.orcaColorFive },
        ];

        const siri = [
            { game: gameColors.siriColorOne, mystery: mysteryColors?.siriColorOne, compare: colorCompare.siriColorOne },
            { game: gameColors.siriColorTwo, mystery: mysteryColors?.siriColorTwo, compare: colorCompare.siriColorTwo },
            { game: gameColors.siriColorThree, mystery: mysteryColors?.siriColorThree, compare: colorCompare.siriColorThree },
            { game: gameColors.siriColorFour, mystery: mysteryColors?.siriColorFour, compare: colorCompare.siriColorFour },
            { game: gameColors.siriColorFive, mystery: mysteryColors?.siriColorFive, compare: colorCompare.siriColorFive },
        ];

        setOrcaHistory(orca as any);
        setSiriHistory(siri as any);
    }, [finished, colorCompare, gameColors, mysteryColors]);

    const whoWon = useCallback(() => {
        const orcaTotal = orcaHistory.reduce((sum, c) => sum + (c.compare ?? 0), 0)
        const siriTotal = siriHistory.reduce((sum, c) => sum + (c.compare ?? 0), 0)


        return orcaTotal > siriTotal ? 'Orca' : 'Siri'
    }, [orcaHistory, siriHistory])


    const mysteryBg = me?.team === 'orca'
        ? hsvToRgbString(getMysteryColor("orca")?.h, getMysteryColor("orca")?.s, getMysteryColor("orca")?.v)
        : hsvToRgbString(getMysteryColor("siri")?.h, getMysteryColor("siri")?.s, getMysteryColor("siri")?.v)

    return (
        <>

            <div className={`${finished ? '' : 'z-0 opacity-0 pointer-events-none select-none mt-10'} fixed flex justify-center z-30 items-center w-full h-screen transition-all duration-700`}
                style={{ backgroundColor: 'rgb(17, 16, 19)' }}>
                <div className='absolute slef-center blur-[100px] bg-amber-300 w-100 h-100 rounded-full mt-[-90px] z-20'></div>
                <div className='w-full max-w-[700px] p-4 py-6 bg-zinc-800 rounded-xl flex flex-col gap-3 items-center z-40'>
                    <div className={`${whoWon() === 'Orca' ? 'bg-blue-600' : 'bg-cyan-400'}  p-5 mt-[-100px] w-40 h-40 rounded-full flex justify-center items-center`}>
                        {whoWon() === 'Orca' ? (
                            <img src={orcaImg} />
                        ) : (
                            <img src={crabImg} />
                        )}
                    </div>
                    <p className='text-amber-300 text-[50px]'>VITÓRIA DO TIME {
                        whoWon()}</p>
                    <p className='text-white text-[35px]'>Resumo da partida</p>
                    <p className='text-white text-[25px]'>Time Orca</p>
                    <div className='w-full justify-center flex items-center mt-[-5px]'>
                        {orcaHistory.map((color) => {
                            return <div className={`${color.compare > 95 ? 'border-3 border-amber-300 drop-shadow-[0_0_15px_rgba(150,130,50,0.8)]' : ''} w-26 h-25 relative overflow-hidden`}
                                style={{ backgroundColor: hsvToRgbString(color.game.h, color.game.s, color.game.v) }}>
                                <p className='text-white text-[30px] absolute top-0.5 left-1.5'>{color.compare}%</p>
                                <div className='absolute right-[-70px] bottom-[-60px] rotate-130 w-30 h-30'
                                    style={{ backgroundColor: hsvToRgbString(color.mystery.h, color.mystery.s, color.mystery.v) }}></div>
                            </div>
                        })}
                    </div>
                    <p className='text-white text-[25px] mt-5'>Time Siri</p>
                    <div className='w-full justify-center flex items-center mt-[-5px]'>
                        {siriHistory.map((color) => {
                            return <div className={`${color.compare > 95 ? 'border-3 border-amber-300 drop-shadow-[0_0_15px_rgba(150,130,50,0.8)]' : ''} w-26 h-25 relative overflow-hidden`}
                                style={{ backgroundColor: hsvToRgbString(color.game.h, color.game.s, color.game.v) }}>
                                <p className='text-white text-[30px] absolute top-0.5 left-1.5'>{color.compare}%</p>
                                <div className='absolute right-[-70px] bottom-[-60px] rotate-130 w-30 h-30'
                                    style={{ backgroundColor: hsvToRgbString(color.mystery.h, color.mystery.s, color.mystery.v) }}></div>
                            </div>
                        })}
                    </div>
                    <button onClick={() => navigate('/lobby')} className='text-white p-3 px-5 bg-blue-500 rounded-full text-2xl cursor-pointer hover:bg-blue-300 hover:scale-105 transition-all mt-10'>Voltar ao lobby</button>
                </div>
            </div>


            <h1 className='text-white text-2xl absolute top-3 left-3 z-200 opacity-50'>{me?.class}</h1>


            <div className={`${(!colorSelected || stage !== 'picker') ? 'opacity-0 mt-10 z-[-1] select-none pointer-events-none' : ''} w-screen transition-all absolute flex justify-center top-7 z-100`}>
                <h1 className='text-white text-[90px]'>{confirmCount}</h1>
            </div>


            <div
                className={`${clockNumber !== 0 ? 'z-15' : 'opacity-0 mt-10 z-0 pointer-events-none'} fixed flex flex-col w-full h-screen justify-center transition-all duration-800 items-center`}
                style={{ backgroundColor: 'rgb(17, 16, 19)' }}
            >
                <h1 className={`${clockNumber === 1 ? '' : 'opacity-0 mt-5'} text-white text-[100px] absolute self-center transition-all duration-300`}>1</h1>
                <h1 className={`${clockNumber === 2 ? '' : 'opacity-0 mt-5'} text-white text-[100px] absolute self-center transition-all duration-300`}>2</h1>
                <h1 className={`${clockNumber === 3 ? '' : 'opacity-0 mt-5'} text-white text-[100px] absolute self-center transition-all duration-300`}>3</h1>
            </div>

            {me?.class === 'picker' ? (
                <div className={`${(stage === 'picker' && clockNumber === 0) ? 'z-10' : 'opacity-0 mt-10 z-0 pointer-events-none'} fixed flex w-full h-screen justify-center transition-all duration-500 items-center`}>
                    <ColorPicker
                        selected={localSelectedColor}
                        onConfirm={(h, s, v) => confirmColor(h, s, v)}
                        onChange={(h, s, v) => { currentPickerColor.current = { h, s, v } }}
                    />
                </div>
            ) : (
                <>

                    <div
                        className={`${(countdown === 0 && stage === 'picker' && clockNumber === 0) ? 'z-15' : 'opacity-0 mt-10 z-0 pointer-events-none'} fixed flex flex-col w-full h-screen justify-center transition-all duration-800 items-center`}
                        style={{ backgroundColor: 'rgb(17, 16, 19)' }}
                    >
                        <h1 className='text-white text-[90px]'>
                            {!colorSelected ? 'O picker esta escolhendo a cor...' : 'Um picker já fez sua escolha.'}
                        </h1>
                    </div>


                    <div className={`${(stage === 'picker' && countdown !== 0) ? 'z-10' : 'opacity-0 mt-10 z-0 pointer-events-none'} fixed flex w-full h-screen justify-center transition-all duration-500 items-center`}>
                        <div
                            className='w-150 h-90 rounded-2xl relative'
                            style={{ backgroundColor: mysteryBg }}
                        >
                            <h1 className='text-white text-[70px] absolute top-3 right-6'>{countdown}</h1>
                        </div>
                    </div>
                </>
            )}


            <div className={`${stage === 'anim' ? 'z-10' : 'opacity-0 mt-10 z-0 pointer-events-none'} fixed flex w-full flex-col h-screen justify-center transition-all duration-500 items-center`}>


                <div className={`${(animCounter >= 1 && !finished) ? 'mt-[-30px]' : 'opacity-0 z-0 pointer-events-none mt-0'} flex flex-col gap-4 items-center transition-all duration-1000`}>
                    <p className='text-white text-[40px]'>Cores escolhidas</p>
                    <div className='flex flex-row gap-3'>
                        <div
                            className='w-105 h-35 rounded-t-2xl relative'
                            style={{ backgroundColor: hsvToRgbString(getColor("orca")?.h, getColor("orca")?.s, getColor("orca")?.v) }}
                        >
                            <div className='absolute top-[-25px] left-[-25px] bg-blue-800 rounded-full p-3 w-15 h-15 z-20'>
                                <img src={orcaImg} alt="" />
                            </div>
                        </div>
                        <div
                            className='w-105 h-35 rounded-t-2xl relative'
                            style={{ backgroundColor: hsvToRgbString(getColor("siri")?.h, getColor("siri")?.s, getColor("siri")?.v) }}
                        >
                            <div className='absolute top-[-25px] right-[-25px] bg-cyan-400 rounded-full p-3 w-15 h-15 z-20'>
                                <img src={crabImg} alt="" />
                            </div>
                        </div>
                    </div>
                </div>


                <div className={`${(animCounter >= 2 && !finished) ? '' : 'opacity-0 z-0 pointer-events-none mt-10'} flex flex-col gap-4 items-center transition-all duration-1000`}>
                    <div className='flex flex-row gap-3'>
                        <div
                            className='w-105 h-35 rounded-b-2xl'
                            style={{ backgroundColor: hsvToRgbString(getMysteryColor("orca")?.h, getMysteryColor("orca")?.s, getMysteryColor("orca")?.v) }}
                        />
                        <div
                            className='w-105 h-35 rounded-b-2xl'
                            style={{ backgroundColor: hsvToRgbString(getMysteryColor("siri")?.h, getMysteryColor("siri")?.s, getMysteryColor("siri")?.v) }}
                        />
                    </div>
                    <p className='text-white text-[40px]'>Cores originais</p>
                </div>


                <div className={`${(animCounter >= 3 && !finished) ? '' : 'opacity-0 z-0 pointer-events-none'} flex flex-col gap-4 items-center transition-all duration-400 mt-[-356px]`}>
                    <div className='flex flex-row gap-3'>
                        <div className='w-105 h-70 rounded-2xl flex z-10 bg-black/25 justify-center items-center'>
                            <p className='z-10 text-white text-[100px] text-center'>{orcaPoints}%</p>
                        </div>
                        <div className='w-105 h-70 rounded-2xl flex z-10 bg-black/25 justify-center items-center'>
                            <p className='z-10 text-white text-[100px] text-center'>{siriPoints}%</p>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}