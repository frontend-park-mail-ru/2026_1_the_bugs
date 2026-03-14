import { useEffect, useState } from "@my-react/hooks"

interface IRouterProps{
    path: string
    children: any
    currentPath: string
}

export function Router({path, children, currentPath}: IRouterProps){
    console.log(`Router ${path}:`, { currentPath, matches: currentPath === path });

    return currentPath == path ? (<div>{children}</div>) : null
}