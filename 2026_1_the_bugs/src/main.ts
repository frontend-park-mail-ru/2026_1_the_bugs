import { createApp } from './MyReact/jsx-runtime'
import { Test } from './tets'


const root = document.getElementById("app") as Element
createApp(root, Test);