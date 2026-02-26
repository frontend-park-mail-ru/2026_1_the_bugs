import { useState } from "./MyReact/hooks";

interface ButtonProps{
    name: string;
}

function Button(props: ButtonProps){
    const [clicks, setClicks] = useState(0);
    return <div>
        <button on_click={()=>{setClicks(clicks+1)}}> {clicks.toString()}</button>
    </div>
}

export function Test(){
    return <div>
        <form style="color: blue"> Введите текст</form>
        <Button name="df" key="1"></Button>
    </div>
}