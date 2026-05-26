// playerContext.tsx
import { createContext, useContext, ReactNode, useCallback, useState, useEffect, useRef } from "react";
import { socket } from "../lib/socket";

export type Teams = 'orca' | 'siri' | 'none';
export type Class = 'picker' | 'helper' | 'away';

export type Player = {
    name: string,
    team: Teams,
    class: Class
};

interface PlayerContextType {
    currentRoom: string,
    changeCurrentRoom: (roomCode: string) => void,
    changePlayer: (player: Player) => void,
    ownerRoom: string,
    me: Player | null,
    changeMe: (data: Player) => void,
    changeOwnerRoom: (roomCode: string) => void,
    currentPlayers: Player[],
    changePlayers: (players: Player[]) => void,
    addNewPlayer: (name: string) => void,
    removePlayer: (name: string) => void,
    clearPlayers: () => void
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    const [ownerRoom, setOwnerRoom] = useState<string>('null');
    const [currentRoom, setCurrentRoom] = useState<string>('');
    const [currentPlayers, setCurrentPlayers] = useState<Player[]>([]);
    const [me, setMe] = useState<Player | null>(null);
    const currentRoomRef = useRef(currentRoom);
    useEffect(() => { currentRoomRef.current = currentRoom; }, [currentRoom]);
    const currentPlayersRef = useRef(currentPlayers);
    const ownerRoomRef = useRef(ownerRoom);

    useEffect(() => { currentPlayersRef.current = currentPlayers; }, [currentPlayers]);
    useEffect(() => { ownerRoomRef.current = ownerRoom; }, [ownerRoom]);

    const changePlayers = useCallback((players: Player[]) => {
        setCurrentPlayers(players);
    }, []);

    const changeMe = useCallback((data: Player) => {
        setMe({
            name: data.name,
            team: data.team,
            class: data.class
        });
    }, []);

    const changePlayer = useCallback((changedPlayer: Player) => {
        setCurrentPlayers(prev => {
            const without = prev.filter(player => player.name !== changedPlayer.name);
            return [...without, changedPlayer];
        });
    }, []);


    const addNewPlayer = useCallback((playerName: string) => {
        setCurrentPlayers(prev => {
            const jaExiste = prev.some(player => player.name === playerName);
            if (jaExiste) return prev;

            const newPlayer: Player = {
                name: playerName,
                team: 'none',
                class: 'away'
            };
            return [...prev, newPlayer];
        });
    }, []);

    // Ajustado: Filtra comparando com a propriedade .name do objeto
    const removePlayer = useCallback((playerName: string) => {
        setCurrentPlayers(prev => prev.filter(player => player.name !== playerName));
    }, []);

    const clearPlayers = useCallback(() => {
        setCurrentPlayers([]);
    }, []);

    const changeCurrentRoom = useCallback((roomCode: string) => {
        setCurrentRoom(roomCode);
    }, []);

    const changeOwnerRoom = useCallback((roomCode: string) => {
        setOwnerRoom(roomCode);
    }, [ownerRoom]);


    useEffect(() => {
        socket.on('novo_player', (data) => {
            if (data?.name) {
                if (data.roomCode !== currentRoomRef.current) {  // ← ref, não estado
                    alert('player de outra sala');
                    return;
                }
                addNewPlayer(data.name);
            }
        });

        socket.on('entrar_sala', (data) => {
            if (ownerRoomRef.current === data.roomCode) {
                socket.emit('info', { players: currentPlayersRef.current, roomCode: data.roomCode });
            }
        });

        socket.on('info', (data: { players: Player[], roomCode: string }) => {
            if (!data?.players || !data?.roomCode) return;
            if (ownerRoomRef.current === data.roomCode) return;

            if (ownerRoomRef.current === 'null') {
                const meAsPlayer: Player = {
                    name: me!.name,
                    team: 'none',
                    class: 'away'
                };

                const jaEstou = data.players.some(p => p.name === me?.name);
                setCurrentPlayers(jaEstou ? data.players : [...data.players, meAsPlayer]);
                setCurrentRoom(data.roomCode);

                socket.emit('novo_player', { name: me?.name, roomCode: data.roomCode });
            }
        });

        socket.on('mudar_player', (data: { player: Player, roomCode: string }) => {
            if (data && data.player) {
                if (data.roomCode != currentRoom) {
                    alert('player de outra sala')
                    return
                }
                changePlayer(data.player);
            }
        });

        return () => {
            socket.off('novo_player');
            socket.off('entrar_sala');
            socket.off('info');
            socket.off('mudar_player');
        };
    }, [addNewPlayer, me]);

    return (
        <PlayerContext.Provider value={{ currentRoom, changeCurrentRoom, changePlayer, changeMe, me, ownerRoom, changeOwnerRoom, changePlayers, currentPlayers, addNewPlayer, removePlayer, clearPlayers }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayerContext = () => {
    const context = useContext(PlayerContext);
    if (!context) throw new Error("usePlayerContext must be used inside PlayerProvider");
    return context;
};