import { createApp } from 'the-react'
import { App } from './App/App';
import "../index.css"

const root = document.getElementById("app") as Element
createApp(root, App);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/serviceWorker.js");
  })
}