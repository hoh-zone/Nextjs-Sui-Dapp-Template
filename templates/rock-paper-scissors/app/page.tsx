'use client'

import Image from 'next/image'
import {ConnectButton} from "@mysten/dapp-kit";
import {MouseEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {sleep, next} from "@/utils"

export default function Home() {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const playGame = () => {
        setIsPlaying(true);
    }

    const clickChoose = (e: MouseEvent<HTMLImageElement>) => {
        console.log(e.currentTarget.alt);
    }

    const [loopName, setLoopName] = useState<string>("rock");
    const index = useRef<number>(0);
    const array = useMemo(() => ["rock", "scissors", "paper"], []);
    const waitToDispatch = useCallback(async () => {
        await sleep(222);
        const [ne_idx, name] = next(index.current, array);
        index.current = ne_idx;
        setLoopName(name);
    }, [index, array]);
    useEffect(() => {
        waitToDispatch().then();
    }, [loopName, waitToDispatch]);

    return (
        <div className="flex flex-col h-screen mx-64 bg-gray-50 shadow-md">
            <div className="flex justify-between items-center">
                <Image src="/logo/logo.jpeg" alt="HOH Logo" width={80} height={80} priority={true}/>
                <ConnectButton/>
            </div>
            <div className="relative flex-1">
                <div
                    className={"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-opacity " + (isPlaying ? "opacity-0" : "cursor-pointer opacity-100")}
                    onClick={!isPlaying ? playGame : () => {
                    }}>
                    <Image src={`/game/${loopName}.png`} alt="start button" width={100} height={100} priority={true}
                           className="w-auto h-auto"/>
                </div>
                <div className={"transition-opacity " + (isPlaying ? "opacity-100" : "opacity-0")}>
                    <div className="absolute top-0 left-0 w-full h-1/2 flex justify-evenly items-center">
                        <Image src={`/game/${loopName}.png`} alt="enemy" width={100} height={100} priority={true}
                               className="w-auto h-auto"/>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 flex justify-evenly items-center">
                        <Image src="/game/rock.png" alt="rock" width={100} height={100} priority={true}
                               className={"w-auto h-auto " + (isPlaying ? "cursor-pointer" : "")}
                               onClick={isPlaying ? clickChoose : () => {
                               }}/>
                        <Image src="/game/scissors.png" alt="scissors" width={100} height={100} priority={true}
                               className={"w-auto h-auto " + (isPlaying ? "cursor-pointer" : "")}
                               onClick={isPlaying ? clickChoose : () => {
                               }}/>
                        <Image src="/game/paper.png" alt="paper" width={100} height={100} priority={true}
                               className={"w-auto h-auto " + (isPlaying ? "cursor-pointer" : "")}
                               onClick={isPlaying ? clickChoose : () => {
                               }}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
