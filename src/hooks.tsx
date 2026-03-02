
import { useState, useEffect } from '@my-react/hooks';           // Подставьте свои пути                // или '@my-react'

// ---------- Вспомогательный компонент: инпут (если нет готового) ----------
function InputTest() {
  const [value, setValue] = useState('');
  return (
    <div>
      <input
        type="text"
        value={value}
        onInput={(e: any) => setValue(e.target.value)}
        placeholder="Введите текст..."
      />
      <p style="color: green">Вы ввели: {value}</p>
    </div>
  );
}

// ---------- Таймер с cleanup (интервал) ----------
function Timer() {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let counter = count
    if (!visible) return;
    console.log('Timer: интервал запущен');
    const interval = setInterval(() => {
        counter++;
        setCount(counter)
    }, 1000);
    return () => {
      console.log('Timer: интервал очищен');
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
        <div style="border:1px solid red; padding:10px; margin:10px 0">
      <h4>Таймер (cleanup интервала)</h4>
      <p>Счёт: {count.toString()}</p>
      <button onClick={() => setVisible(!visible)}>
        {visible ? 'Спрятать' : 'Показать'}
      </button>
      {visible && <p>🕒 Тик...</p>}
    </div>
    </div>
    
  );
}

// ---------- Подписка на resize с cleanup ----------
function WindowResizeLogger() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => {
      console.log('Resize: обработчик удалён');
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  return (
    <div style="border:1px solid blue; padding:10px; margin:10px 0">
      <h4>Отслеживание размера окна (cleanup событий)</h4>
      <p>Ширина: {size.width.toString()} px, Высота: {size.height.toString()} px</p>
      <button onClick={() => setEnabled(!enabled)}>
        {enabled ? 'Выключить' : 'Включить'}
      </button>
    </div>
  );
}

// ---------- useEffect с зависимостями ----------
function EffectDepsDemo() {
  const [text, setText] = useState('');

  useEffect(() => {
    console.log('Эффект с [text] выполнен, текст =', text);
    return () => console.log('Cleanup [text] для текста =', text);
  }, [text]);

  return (
    <div style="border:1px solid green; padding:10px; margin:10px 0">
      <h4>useEffect с зависимостью [text]</h4>
      <input value={text} onInput={(e: any) => setText(e.target.value)} />
      <p><i>Смотрите консоль: при каждом изменении вызывается cleanup предыдущего эффекта, затем новый.</i></p>
    </div>
  );
}

// ---------- Список с ключами ----------
function ListManager() {
  const [items, setItems] = useState([
    { id: 1, name: 'Элемент A' },
    { id: 2, name: 'Элемент B' },
    { id: 3, name: 'Элемент C' },
  ]);

  const addItem = () => {
    const newId = items.length + 1;
    setItems([...items, { id: newId, name: `Элемент ${String.fromCharCode(64 + newId)}` }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div style="border:1px solid purple; padding:10px; margin:10px 0">
      <h4>Список с ключами (проверка обновлений)</h4>
      <button onClick={addItem}>Добавить</button>
      <ul>
        {items.map(item => (
          <li key={item.id.toString()}>
            {item.name} <button onClick={() => removeItem(item.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Простой счётчик ----------
function Counter({ initial = 0, label }: { initial?: number; label: string }) {
  const [count, setCount] = useState(initial);
  return (
    <div style="margin:5px 0">
      <span>{label}: {count.toString()} </span>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}

// ---------- Эффект с пустыми зависимостями (монтирование) ----------
function MountEffectDemo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('Эффект с []: компонент смонтирован');
    setMounted(true);
    return () => console.log('Cleanup с []: компонент будет размонтирован');
  }, []);

  return (
    <div style="border:1px solid orange; padding:10px; margin:10px 0">
      <h4>Эффект на монтирование ([])</h4>
      <p>Статус: {mounted ? '✅ Монтирован' : '⏳ Ожидание...'}</p>
    </div>
  );
}

// ---------- Главная тестовая страница ----------
export function TestPage() {
  const [showTimer, setShowTimer] = useState(true);
  const [showResize, setShowResize] = useState(true);
  const [showMount, setShowMount] = useState(true);

  return (
    <div style="font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px">
      <h1 style="color:#333">🧪 MyReact Test Page</h1>
      <p>Проверка useState, useEffect, событий, ключей и cleanup.</p>
      <hr />

      <section>
        <h2>useState (независимость)</h2>
        <Counter key="counter1" label="Счётчик 1" initial={5} />
        <Counter key="counter2" label="Счётчик 2" />
      </section>
      <hr />

      <section>
        <h2>Инпут (двусторонняя привязка)</h2>
        <InputTest key="input1"/>
      </section>
      <hr />

      <section>
        <h2>useEffect с зависимостями</h2>
        <EffectDepsDemo  key="EffectDepsDemo"/>
      </section>
      <hr />

      <section>
        <h2>Cleanup интервала</h2>
        <button onClick={() => setShowTimer(!showTimer)}>
          {showTimer ? 'Спрятать таймер' : 'Показать таймер'}
        </button>
        {showTimer && <Timer key="timer"/>}
      </section>
      <hr />

      <section>
        <h2>Cleanup событий window</h2>
        <button onClick={() => setShowResize(!showResize)}>
          {showResize ? 'Спрятать' : 'Показать'}
        </button>
        {showResize && <WindowResizeLogger key="WindowResizeLogger"/>}
      </section>
      <hr />

      <section>
        <h2>Список с ключами</h2>
        <ListManager key="ListManager"/>
      </section>
      <hr />

      <section>
        <h2>Эффект с [] (монтирование/размонтирование)</h2>
        <button onClick={() => setShowMount(!showMount)}>
          {showMount ? 'Спрятать' : 'Показать'}
        </button>
        {showMount && <MountEffectDemo key="MountEffectDemo" />}
      </section>
    </div>
  );
}
