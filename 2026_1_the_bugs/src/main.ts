import { createApp } from './MyReact/my-react'
import { ListManager } from './array'
import LoginPage from './auth'


const root = document.getElementById("app") as Element
createApp(root, LoginPage);