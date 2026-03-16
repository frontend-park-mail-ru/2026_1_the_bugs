import { createApp } from '@my-react/my-react'
import {App} from './App/App'
import "../index.css"

const root = document.getElementById("app") as Element
createApp(root, App);