import { createApp } from '@my-react/my-react'
import {TestPage} from './hooks'


const root = document.getElementById("app") as Element
createApp(root, TestPage);