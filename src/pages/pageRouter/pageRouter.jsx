import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import EnterPage from "../enter/page";
import GamePage from "../game/page";
import LobbyPage from "../lobby/page";
import EnteroomPage from "../enteroom/page";
import CreatePage from "../create/page";
import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";


export default function PageRouter() {
    const [lightMode, setLightMode] = useState(() => {
        return localStorage.getItem('theme') === 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', lightMode ? 'light' : 'dark');

        if (lightMode) {
            document.body.classList.add('light');
        } else {
            document.body.classList.remove('light');
        }
    }, [lightMode]);


    const toggleTheme = () => {
        setLightMode(prev => !prev)
    }

    return (
        <BrowserRouter>
            <div onClick={toggleTheme} className={`${lightMode ? 'text-black hover:bg-black/10' : 'text-white hover:bg-white/10'}  absolute top-5 z-200 rounded-lg right-5 p-3 cursor-pointer transition-all`}>
                {!lightMode ? (
                    <Sun />
                ) : (
                    <Moon />
                )}

            </div>
                
            <Routes>

                <Route
                    path="/"
                    element={<EnterPage />}
                />

                <Route
                    path="/enter"
                    element={<EnterPage />}
                />

                <Route
                    path="/lobby"
                    element={<LobbyPage />}
                />

                <Route
                    path="/game"
                    element={<GamePage />}
                />

                <Route
                    path="/create"
                    element={<CreatePage />}
                />


                <Route path="/enteroom/:code?" element={<EnteroomPage />} />

            </Routes>

        </BrowserRouter>
    );
}









