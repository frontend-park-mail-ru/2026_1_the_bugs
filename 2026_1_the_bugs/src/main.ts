import { createApp } from './MyReact/my-react'
import LoginPage from './LoginPage/LoginPage.tsx'


const root = document.getElementById("app") as Element
createApp(root, LoginPage);