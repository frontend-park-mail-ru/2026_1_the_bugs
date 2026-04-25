import { createApp } from 'the-react'
import "../../index.css"
import "../../support.css"
import { App } from './App/App';

const root = document.getElementById("app-support") as Element
createApp(root, App);
