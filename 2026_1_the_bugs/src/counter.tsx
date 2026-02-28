import { ListManager } from "./array";
import { useState } from "./MyReact/hooks";

interface ButtonProps {
    name: string;
}

function Button(props: ButtonProps) {
    // Проверяем инициализацию и обновление состояния
    const [clicks, setClicks] = useState(0);
    const [text, setText] = useState("Нажми меня");

    return (
        <div style="border: 1px solid black; padding: 10px; margin: 5px">
            <p>Кнопка: {props.name}</p>
            <button 
                on_click={() => {
                    setClicks(clicks + 1);
                    if (clicks + 1 >= 5) setText("Ого, уже много!");
                }}
            > 
                {text}: {clicks.toString()}
            </button>
        </div>
    );
}

function InputTest() {
    // Проверяем работу useState со строками
    const [value, setValue] = useState("");

    return (
        <div style="margin-top: 20px">
            <input 
                type="text" 
                placeholder="Пиши тут..."
                on_input={(e: any) => {setValue(e.target.value);}} 
            />
            <p style="color: green">Вы ввели: {value}</p>
        </div>
    );
}

export function Test() {
    return (
        <div style="font-family: sans-serif; padding: 20px">
            <h1 style="color: blue">MyReact Test App</h1>
            <div>
                <h3>Счетчики (проверка независимости state)</h3>
                {/* Два разных ключа - два разных инстанса */}
                <Button name="Первый" key="btn-1" />
                <Button name="Второй" key="btn-2" />
            </div>
            <div>
                <h3>Инпуты</h3>
                <InputTest key="inpuths" />
            </div>
            <div>
                <ListManager key="listmanager"></ListManager>
            </div>
        </div>
    );
}
