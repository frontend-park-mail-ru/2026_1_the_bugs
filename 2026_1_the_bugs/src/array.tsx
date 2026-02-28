// App.tsx (добавляем в тот же файл или в отдельный, если создаешь модульную структуру)

import { useState } from "./MyReact/hooks";
interface ListItem {
    id: number;
    text: string;
}


function ListItemComponent(props: { item: ListItem }) {
    // Простой компонент для одного элемента списка.
    // Можно добавить состояние, если нужно (например, кнопку удаления).
    return <li style="margin: 5px 0;">{props.item.text} (ID: {props.item.id.toString()})</li>;
}
function Input(props: {onClick: (e: any)=>void, val: string}){
    return<div>
        <input 
            type="text"
            value={props.val}
            on_input={props.onClick}
            placeholder="Новый элемент..."/>
        {props.val}
        </div>;
}

export function ListManager() {
    const [items, setItems] = useState<ListItem[]>([]);
    const [newItemText, setNewItemText] = useState("");
    const [nextId, setNextId] = useState(0);

    const addItem = () => {
        if (newItemText.trim()) { // Добавляем только если текст не пустой
            setItems([
                ...items, // Берем старые элементы
                { id: nextId, text: newItemText } // Добавляем новый
            ]);
            setNextId(nextId + 1); // Увеличиваем ID для следующего элемента
            setNewItemText("");     // Очищаем поле ввода
        }
    };

    const handleInputChange = (e: any) => {
        setNewItemText(e.target.value);
    };

    return (
        <div style="border: 1px solid green; padding: 15px; margin-top: 20px;">
            <h3>Список элементов</h3>
            
            <div>
                <Input key="input" onClick={handleInputChange} val={newItemText}> </Input> 
                <button on_click={addItem} style="margin-left: 10px;">Добавить</button>
            </div>

            <ul style="margin-top: 10px; padding-left: 20px;">
                {items.map((item) => (
                    // Ключи критичны для обновления списков
                    <ListItemComponent item={item} key={item.id.toString()} /> 
                ))}
            </ul>
        </div>
    );
}

