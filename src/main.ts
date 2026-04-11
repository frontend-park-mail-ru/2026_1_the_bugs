import { createApp } from 'the-react'
import { App } from './App/App';
import {registerSW} from "virtual:pwa-register";
import "../index.css"

const root = document.getElementById("app") as Element
createApp(root, App);

if ("serviceWorker" in navigator) {
  registerSW()
}