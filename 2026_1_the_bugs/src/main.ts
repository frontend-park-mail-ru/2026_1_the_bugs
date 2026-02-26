import { createApp } from './MyReact/my-react'
import { Test } from './counter'


const root = document.getElementById("app") as Element
createApp(root, Test);