import { useCallback, useEffect, useMemo, useState } from 'react'
import { Class, Player, Teams, usePlayerContext } from '../../context/playerContext'
import { socket } from '../../lib/socket';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../../context/gameContext';
import orcaImg from '../../assets/orca.png'
import crabImg from '../../assets/crab.png'
import { Check, Copy } from 'lucide-react';

const MAX_HELPERS = 4;

export default function LobbyPage() {
    const { inGame } = useGameContext();
    const { currentPlayers, currentRoom, me, changePlayer, ownerRoom, changeMe, typaGame } = usePlayerContext();
    const navigate = useNavigate()
    const [copied, setCopied] = useState(false)

    const copyInviteLink = () => {
        navigator.clipboard.writeText(`https://color-battle-client.vercel.app/enteroom/${currentRoom}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }


    useEffect(() => {
        if (inGame) navigate('/game')
    }, [inGame])


    useEffect(() => {
        if (!me) navigate('/enter')
    }, [me])

    const pickerOrca = useMemo(() =>
        currentPlayers.find(p => p.class === 'picker' && p.team === 'orca'),
        [currentPlayers]);

    const pickerSiri = useMemo(() =>
        currentPlayers.find(p => p.class === 'picker' && p.team === 'siri'),
        [currentPlayers]);

    const helpersOrca = useMemo(() =>
        currentPlayers.filter(p => p.class === 'helper' && p.team === 'orca'),
        [currentPlayers]);

    const helpersSiri = useMemo(() =>
        currentPlayers.filter(p => p.class === 'helper' && p.team === 'siri'),
        [currentPlayers]);

    const awayPlayers = useMemo(() =>
        currentPlayers.filter(p => p.class === 'away'),
        [currentPlayers]);

    const handleChangePlayer = useCallback((player: Player) => {
        console.log('fodase', currentRoom)
        if (player.name === me?.name) {
            changeMe(player)
        }
        changePlayer(player);
        socket.emit('mudar_player', { player, roomCode: currentRoom });
    }, [currentRoom])

    const handleEnterSlot = (team: Teams, cls: Class) => {
        console.log('fodase')
        if (!me) return;
        handleChangePlayer({ name: me.name, class: cls, team });
    };

    const SlotVazio = ({ team, cls }: { team: Teams, cls: Class }) => (
        <div
            onClick={() => handleEnterSlot(team, cls)}
            className='flex flex-row p-2 px-5 rounded-2xl hover:scale-105 bg-white/10 w-full group cursor-pointer transition-all hover:bg-white/20'
        >
            <p className='group-hover:opacity-100 opacity-0 text-[25px] transition-all'>➔ Entrar</p>
        </div>
    );

    const SlotOcupado = ({ player }: { player: Player }) => (
        <div className='slot-enter flex flex-row p-3 px-3 rounded-2xl bg-white/20 w-full items-center gap-3'>
            <div className='w-5 h-5 rounded-full bg-green-400'></div>
            <p className='text-[25px] h-7.5'>{player.name}</p>
        </div>
    );
    const renderHelperSlots = (helpers: Player[], team: Teams) => {
        if (typaGame === `1v1`) return;

        const slots = helpers.map(player =>
            <SlotOcupado key={player.name} player={player} />
        );

        if (helpers.length < MAX_HELPERS) {
            slots.push(<SlotVazio key='empty' team={team} cls='helper' />);
        }

        return slots;
    };

    const canStart = true

    const startGame = () => {
        if (ownerRoom != currentRoom) return;

        socket.emit('comecar_jogo', { roomCode: currentRoom });
    }

    return (
        <div className='flex w-full h-screen justify-center items-center text-white'>

            <h1 className='text-white text-2xl absolute top-3 left-3 z-200 opacity-50'>{typaGame}</h1>

            <h1 className='text-4xl absolute self-center top-5 text-white z-10 flex flex-row gap-2 items-center'>
                Código da sala:
                <p onClick={copyInviteLink} className='p-2 bg-white/20 flex flex-row gap-3 items-center rounded-md hover:bg-white/30 transition-all cursor-pointer'>
                    {currentRoom}
                    {copied ? <Check size={30} className='text-green-400' /> : <Copy size={30} />}
                </p>
            </h1>

            {/* pop-up */}
            <div className={`${copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'} fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-white px-5 py-3 rounded-full text-[20px] transition-all duration-300`}>
                Link copiado!
            </div>
            <div className='absolute left-0 top-40 w-full max-w-60 bg-white/15 backdrop-blur-md flex text-[25px] flex-col p-4 rounded-r-2xl overflow-hidden'>
                <p>Em espera:</p>
                {awayPlayers.map((player) => (
                    <p key={player.name}>{player.name}</p>
                ))}
            </div>

            <div className='flex flex-col gap-4 w-full max-w-[800px] items-center justify-center'>
                <div className='flex flex-row w-full gap-6'>

                    {/* Time Orca */}
                    <div className='flex flex-col gap-3 items-start flex-1'>
                        <div className='bg-blue-800 rounded-full p-5 w-25 h-25 z-20 self-center'>
                            <img src={orcaImg} alt="" />
                        </div>
                        <p className='text-[45px] text-blue-400 self-center'>time orca</p>

                        <p className='text-[30px]'>Picker</p>
                        {pickerOrca
                            ? <SlotOcupado player={pickerOrca} />
                            : <SlotVazio team='orca' cls='picker' />
                        }
                        {typaGame === 'normal' && (
                            <p className='text-[30px] mt-5'>Helpers</p>
                        )}

                        {renderHelperSlots(helpersOrca, 'orca')}
                    </div>

                    {/* Time Siri */}
                    <div className='flex flex-col gap-3 items-end flex-1'>
                        <div className='bg-cyan-400 rounded-full p-5 w-25 h-25 z-20 self-center'>
                            <img src={crabImg} alt="" />
                        </div>
                        <p className='text-[45px] text-cyan-300 self-center'>time siri</p>

                        <p className='text-[30px]'>Picker</p>
                        {pickerSiri
                            ? <SlotOcupado player={pickerSiri} />
                            : <SlotVazio team='siri' cls='picker' />
                        }

                        {typaGame === 'normal' && (
                            <p className='text-[30px] mt-5'>Helpers</p>
                        )}
                        {renderHelperSlots(helpersSiri, 'siri')}
                    </div>

                </div>
                {currentRoom === ownerRoom && (
                    <button disabled={!canStart} onClick={startGame} className={`${canStart ? 'cursor-pointer' : 'saturate-0 pointer-events-none'} bg-blue-600 p-2 px-4 rounded-full font-medium text-[25px] hover:bg-blue-400 transition-all w-40 mt-10`}>Começar</button>
                )}

            </div>
        </div>
    )
}