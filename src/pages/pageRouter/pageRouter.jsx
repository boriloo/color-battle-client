import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import EnterPage from "../enter/page";
import GamePage from "../game/page";
import LobbyPage from "../lobby/page";
import EnteroomPage from "../enteroom/page";


export default function PageRouter() {

    return (
        <BrowserRouter>
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


                <Route path="/enteroom/:code?" element={<EnteroomPage />} />

            </Routes>
        </BrowserRouter>
    );
}









