function R(){
    return <div> <div class="dfdf"> dff</div></div>
}

interface ButtonProps{
    name: string;
}

function Button(props: ButtonProps){
    let {name} = props;
    return <div>
        <button on_click={()=>{console.log(1212)}}> {name}</button>
        <button on_click={()=>{console.log(1212)}}> {name}</button>
    </div>
}

export function Test(){
    return <div>
        <form style="color: blue"> Введите текст</form>
        <Button name="df" key="1"></Button>
    </div>
}