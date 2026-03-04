import { createApp } from '@my-react/my-react'
import {HomePage} from './pages/HomePage'
import "../index.css"

const root = document.getElementById("app") as Element
createApp(root, HomePage);