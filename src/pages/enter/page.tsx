import { use, useEffect, useState } from 'react'
import { socket } from '../../lib/socket';
import { usePlayerContext } from '../../context/playerContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, SquarePlus } from 'lucide-react';

export default function EnterPage() {
    const { changeOwnerRoom, clearPlayers } = usePlayerContext()
    const navigate = useNavigate();

    useEffect(() => {
        clearPlayers()
    }, [])

    const criarSala = () => {
        navigate('/create')
    };

    const entrarSala = () => {
        changeOwnerRoom('null')
        navigate('/enteroom')
    };



    return (
        <div className='flex w-full min-h-screen justify-center items-center p-5'>
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
                <div className='relative flex flex-col w-full'>
                    <h1 className='text-[150px] font-medium text-center opacity-0'
                        style={{
                            lineHeight: 1,
                        }}
                    >HueMaster</h1>
                    <h1 className='text-[150px] colorText font-medium z-20 text-center absolute self-center'
                        style={{
                            color: 'transparent',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                           
                            lineHeight: 1,
                            backgroundSize: '200% auto',

                            animation: 'gradient-x 14s linear infinite'
                        }}>HueMaster</h1>
                    <h1 className='text-[150px] colorShadow font-medium z-10 blur-3xl text-center opacity-65 absolute self-center'
                        style={{
                            color: 'transparent',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            backgroundImage: 'linear-gradient(to right, #ff0000, #ff00ff, #0000ff,  #00ffff, #00ff00, #ffff00, #ff0000)',
                            lineHeight: 1,
                            backgroundSize: '200% auto',

                            animation: 'gradient-x 14s linear infinite'
                        }}>HueMaster</h1>
                </div>

                <p className='text-[25px] z-30'>Made by <a className='text-blue-500' href='https://boriloo.github.io/portfolio/'>@Borilo</a></p>
                <div className='flex flex-row w-full justify-center items-center gap-5'>
                    <button onClick={criarSala} className='bg-blue-600 p-2 px-4 rounded-full flex flex-row gap-2
                    font-medium text-[25px] hover:bg-blue-400 transition-all cursor-pointer w-full max-w-55 justify-center items-center hover:scale-105 mt-10'><SquarePlus color='white' />Create party</button>
                    <button onClick={entrarSala} className='bg-blue-600 p-2 px-4 rounded-full flex flex-row gap-2
                    font-medium text-[25px] hover:bg-blue-400 transition-all cursor-pointer w-full max-w-55 justify-center items-center hover:scale-105 mt-10'><LogIn color='white' />Join party</button>
                </div>

            </div>
        </div>
    )
}