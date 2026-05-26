import { use, useEffect, useState } from 'react'
import { socket } from '../../lib/socket';
import { usePlayerContext } from '../../context/playerContext';
import { useNavigate } from 'react-router-dom';

export default function EnterPage() {
    const { addNewPlayer, changeCurrentRoom, changeOwnerRoom, changeMe, clearPlayers } = usePlayerContext()
    const navigate = useNavigate();
    const [name, setName] = useState<string>('');

    useEffect(() => {
        clearPlayers()
    }, [])

    const criarSala = () => {
        if (!name.trim()) return;

        addNewPlayer(name);
        changeMe({ name: name, class: 'away', team: 'none' })
        const codigoSala = Math.floor(1000 + Math.random() * 9000).toString();
        changeCurrentRoom(codigoSala)
        changeOwnerRoom(codigoSala)

        navigate('/lobby')

    };

    const entrarSala = () => {
        changeOwnerRoom('null')
        navigate('/enteroom')
    };



    return (
        <div className='flex w-full h-screen justify-center items-center text-white'>

            <div className='flex flex-col gap-4 w-full max-w-[700px] items-center justify-center select-none'>
                <h1 className='text-[150px] font-medium z-20 text-center'
                    style={{
                        color: 'transparent',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        backgroundImage: 'linear-gradient(to right, #ff6666, #ff66ff, #6666ff, #66ffff, #66ff66, #ffff66, #ff6666)',

                        backgroundSize: '200% auto',

                        animation: 'gradient-x 4s linear infinite'
                    }}>Color Battle</h1>
                <h1 className='text-[150px] font-medium z-10 mt-[-240px] blur-2xl  text-center opacity-75'
                    style={{
                        color: 'transparent',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        backgroundImage: 'linear-gradient(to right, #ff0000, #ff00ff, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000)',

                        backgroundSize: '200% auto',

                        animation: 'gradient-x 4s linear infinite'
                    }}>Color Battle</h1>
                <div className='flex flex-col gap-2 w-full'>
                    <p className='text-[30px]'>seu Nome</p>
                    <input onChange={(e) => { setName(e.target.value) }} type="text" name="name" className='bg-white/10 hover:bg-white/15 transition-all 
          cursor-pointer focus:cursor-text p-2 w-full outline-none rounded-md text-[25px]' />
                </div>
                <div className='flex flex-row w-full justify-center items-center gap-3'>
                    <button onClick={criarSala} className='bg-blue-600 p-2 px-4 rounded-full font-medium text-[25px] hover:bg-blue-400 transition-all cursor-pointer w-40 mt-10'>Criar sala</button>
                    <button onClick={entrarSala} className='bg-blue-600 p-2 px-4 rounded-full font-medium text-[25px] hover:bg-blue-400 transition-all cursor-pointer w-40 mt-10'>Entrar em sala</button>
                </div>

            </div>
        </div>
    )
}