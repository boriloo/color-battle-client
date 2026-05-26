import { useEffect, useState } from 'react'
import { usePlayerContext } from '../../context/playerContext';
import { useNavigate } from 'react-router-dom';

type typeOfRoom = '1v1' | 'normal'

export default function CreatePage() {
    const { addNewPlayer, changeCurrentRoom, changeOwnerRoom, changeMe, clearPlayers, changeTypaGame } = usePlayerContext()
    const navigate = useNavigate();
    const [name, setName] = useState<string>('');
    const [typaRoom, setTypaRoom] = useState<typeOfRoom>('normal')

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
        changeTypaGame(typaRoom)

        navigate('/lobby')

    };


    return (
        <div className='flex w-full min-h-screen justify-center items-center text-white p-5'>
            <div className={`
             min-h-screen w-full fixed bg-cover bg-center z-[-1] overflow-hidden scale-101 opacity-80 brightness-75 rotate-180`}>

                <div className="aurora-container">
                    <div className="aurora-sphere aurora-1"></div>
                    <div className="aurora-sphere aurora-2"></div>
                    <div className="aurora-sphere aurora-3"></div>
                    <div className="aurora-sphere aurora-4"></div>
                </div>

            </div>
            <div className='flex flex-col gap-4 w-full max-w-[700px] items-center justify-center select-none'>

                <h1 className='text-[150px] font-medium z-20 text-center'
                >Criar sala</h1>



                <div className='flex flex-col gap-2 w-full'>
                    <p className='text-[30px]'>seu Nome</p>
                    <input onChange={(e) => { setName(e.target.value) }} type="text" name="name" className='bg-white/10 hover:bg-white/15 transition-all 
          cursor-pointer focus:cursor-text p-2 w-full outline-none rounded-md text-[25px]' />
                    <p className='text-[30px] mt-10'>tipo de sala</p>
                    <div className='flex flex-row gap-3 justify-center items-center'>
                        <div onClick={() => setTypaRoom('normal')} className={`${typaRoom === 'normal' ? 'bg-white text-black' : 'hover:bg-white/10'} p-2 px-6 text-center flex-1 rounded-lg border-2 text-[30px] transition-all hover:scale-102 cursor-pointer`}>
                            Normal
                        </div>
                        <div onClick={() => setTypaRoom('1v1')} className={`${typaRoom === '1v1' ? 'bg-white text-black' : 'hover:bg-white/10'} p-2 px-6 text-center flex-1 rounded-lg border-2 text-[30px] transition-all hover:scale-102 cursor-pointer`}>
                            1v1
                        </div>
                    </div>
                </div>
                <div className='flex flex-row w-full justify-center items-center gap-3'>
                    <button onClick={criarSala} className='bg-blue-600 p-2 px-4 rounded-full font-medium text-[25px] hover:scale-105 hover:bg-blue-400 transition-all cursor-pointer w-40 mt-10'>Criar sala</button>

                </div>

            </div>
        </div>
    )
}