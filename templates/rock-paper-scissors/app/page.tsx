'use client'

import Image from 'next/image'
import {suiClient} from "@/config";
import {ConnectButton, useCurrentAccount, useSignAndExecuteTransaction} from "@mysten/dapp-kit";
import {MouseEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {sleep, next} from "@/utils"
import play from "@/lib/contracts/play";
import checkIsWinner from "@/lib/games/checkIsWinner";

export default function Home() {
    const account = useCurrentAccount();

    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const {mutateAsync: signAndExecuteTransaction} = useSignAndExecuteTransaction({
        execute: async ({bytes, signature}) =>
            await suiClient.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    showRawEffects: true,
                    showEvents: true
                },
            })
    });

    const playGame = () => {
        setIsPlaying(true);
    }

    const [clicked, setClicked] = useState<boolean>(false);
    const [isWinner, setIsWinner] = useState<boolean | null>(null);
    const [finalPic, setFinalPic] = useState<string | null>(null);
    const clickChoose = async (e: MouseEvent<HTMLImageElement>) => {
        setClicked(true);
        const my_chosen = e.currentTarget.alt;
        const chosen = await play(signAndExecuteTransaction);
        setIsWinner(checkIsWinner(my_chosen, chosen));
        const final = next(chosen - 2, array);
        setFinalPic(final[1]);
    }

    const gameAgain = () => {
        setFinalPic(null);
        setIsWinner(null);
        setIsPlaying(false);
        setClicked(false);
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
        <div className="flex flex-col h-screen mx-64 bg-gray-50 shadow-md select-none">
            <div className="flex justify-between items-center">
                <Image src="/logo/logo.jpeg" alt="HOH Logo" width={80} height={80} priority={true}/>
                <ConnectButton/>
            </div>
            <div className="relative flex-1">
                <div
                    className={"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-opacity " + (isPlaying ? "opacity-0 " : "opacity-100 ") + (account ? "cursor-pointer" : "")}
                    onClick={!isPlaying && account ? playGame : () => {
                    }}>
                    <Image src={`/game/${loopName}.png`} alt="start button" width={100} height={100} priority={true}
                           className="w-auto h-auto"/>
                </div>
                <div className={"transition-opacity " + (isPlaying ? "opacity-100" : "opacity-0")}>
                    <div className="absolute top-0 left-0 w-full h-1/2 flex justify-evenly items-center">
                        <Image src={finalPic === null ? `/game/${loopName}.png` : `/game/${finalPic}.png`} alt="enemy"
                               width={100} height={100} priority={true}
                               className="w-auto h-auto"/>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 flex justify-evenly items-center">
                        <Image src="/game/rock.png" alt="rock" width={100} height={100} priority={true}
                               className={"w-auto h-auto " + (isPlaying && !clicked ? "cursor-pointer" : "")}
                               onClick={isPlaying && !clicked ? clickChoose : () => {
                               }}/>
                        <Image src="/game/scissors.png" alt="scissors" width={100} height={100} priority={true}
                               className={"w-auto h-auto " + (isPlaying && !clicked ? "cursor-pointer" : "")}
                               onClick={isPlaying && !clicked ? clickChoose : () => {
                               }}/>
                        <Image src="/game/paper.png" alt="paper" width={100} height={100} priority={true}
                               className={"w-auto h-auto " + (isPlaying && !clicked ? "cursor-pointer" : "")}
                               onClick={isPlaying && !clicked ? clickChoose : () => {
                               }}/>
                    </div>
                </div>
                {
                    isWinner !== null
                    &&
                    <div
                        className="absolute w-full top-1/2 -translate-y-1/2 animate-bounce text-center">
                        <span className="cursor-pointer" onClick={gameAgain}>
                            {isWinner ? "Congratulations, you’ve got it all!" : "No! Everyone believes you will win next time!"}
                        </span>
                    </div>
                }
            </div>
        </div>
    );
}
