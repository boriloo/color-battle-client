import { useEffect, useState } from 'react'
import { socket } from '../../lib/socket';
import { usePlayerContext } from '../../context/playerContext';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export default function EnteroomPage() {
    const { changeMe, addNewPlayer, changeCurrentRoom, clearPlayers } = usePlayerContext()
    const navigate = useNavigate();
    const { code: codeParam } = useParams<{ code: string }>();
    const [code, setCode] = useState<string>(codeParam ?? '');
    const [name, setName] = useState<string>('');



    useEffect(() => {
        clearPlayers()
    }, [])

    const entrarSala = () => {
        if (!code.trim()) return;
        changeMe({ name: name, class: 'away', team: 'none' })
        socket.emit('entrar_sala', { roomCode: code });
        navigate('/lobby');
    };


    return (
        <div className='flex w-full h-screen justify-center items-center text-white'>


            <div className='flex flex-col gap-4 w-full max-w-[500px] items-center justify-center'>
                <h1 className='text-[100px] font-medium text-center'>INSIRA O CÓDIGO DA SALA</h1>
                <div className='flex flex-col gap-2 w-full  max-w-150 justify-center'>
                    <div className='flex flex-col gap-2 w-full'>
                        <p className='text-[30px]'>seu Nome</p>
                        <input onChange={(e) => { setName(e.target.value) }} type="text" name="name" className='bg-white/10 hover:bg-white/15 transition-all 
          cursor-pointer focus:cursor-text p-2 w-full outline-none rounded-md text-[25px]' />
                    </div>
                    <div className='flex flex-col gap-2 w-full mt-5'>
                        <p className='text-[30px]'>Código da sala</p>
                        <input value={code}
                            onChange={(e) => setCode(e.target.value)}
                            type="text"
                            name="code" className='bg-white/10 hover:bg-white/15 transition-all 
          cursor-pointer focus:cursor-text p-2 w-full outline-none rounded-md text-[25px]' />
                    </div>
                </div>
                <div className='flex flex-row w-full justify-center items-center gap-3'>
                    <button onClick={entrarSala} className='bg-blue-600 p-2 px-4 rounded-full font-medium text-[25px] hover:bg-blue-400 transition-all cursor-pointer w-40 mt-10'>Entrar em sala</button>
                </div>

            </div>
        </div>
    )
}