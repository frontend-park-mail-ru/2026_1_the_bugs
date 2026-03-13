import { ComponentInstance, markDirty } from "../my-react";

/**
 * Глобальный контекст активного компонента для хуков.
 * Устанавливается во время рендера компонента функцией _setActiveInstance.
 */
let activeInstance: ComponentInstance<any> | undefined = undefined;

/** Индекс текущего состояния useState в массиве состояний компонента */
let activeStateIndex: number = 0;

/**
 * Устанавливает активный экземпляр компонента для хуков.
 * Вызывается автоматически в начале и конце updateVTree().
 * @param instance - Текущий компонент или undefined (сброс).
 * @internal
 */
export function _setActiveInstance(instance: ComponentInstance<any> | undefined) {
    activeInstance = instance;
}

/**
 * Устанавливает индекс следующего состояния useState.
 * Инкрементируется для каждого вызова useState в компоненте.
 * @param stateIndex - Индекс состояния.
 * @internal
 */
export function _setActiveStateIndex(stateIndex: number) {
    activeStateIndex = stateIndex;
}

/**
 * Хук useState - управляет локальным состоянием компонента.
 * Состояние сохраняется в массиве states компонента по индексу вызова.
 * 
 * @param initialState - Начальное значение состояния.
 * @returns Массив [текущее_состояние, setter_функция].
 * 
 * @example
 * ```ts
 * const [count, setCount] = useState(0);
 * setCount(count + 1); // Обновит компонент через markDirty
 * ```
 */
export function useState<T>(
    initialState: T
): [T, (newState: T) => void] {
    if (activeInstance === undefined) {
        throw new Error("useState must be called inside a component");
    }
    
    if (activeInstance.states.length <= activeStateIndex) {
        activeInstance.states.push(initialState);
    }
    
    const curInstance = activeInstance;
    const idx = activeStateIndex;
    activeStateIndex++;
    
    return [
        activeInstance.states[idx] as T,
        (newState: T) => {
            curInstance.states[idx] = newState;
            markDirty(curInstance);
        }
    ];
}

/**
 * Хук useEffect - выполняет побочные эффекты после рендера.
 * Поддерживает cleanup функции и зависимости для оптимизации.
 * 
 * @param effect - Функция эффекта. Может вернуть cleanup функцию.
 * @param deps - Массив зависимостей. Если undefined - выполняется каждый рендер.
 * 
 * @example
 * ```ts
 * useEffect(() => {
 *   const timer = setInterval(() => console.log('tick'), 1000);
 *   return () => clearInterval(timer); // cleanup
 * }, []);
 * ```
 */
export function useEffect(
    effect: () => void | (() => void), 
    deps?: any[]
) {
    if (activeInstance === undefined) {
        throw new Error('useEffect must be called inside a component');
    }

    const idx = activeInstance.effectIndex++;
    let eff = activeInstance.effects[idx];

    if (!eff) {
        eff = { execute: effect, deps };
        activeInstance.effects[idx] = eff;
    } else {
        eff.execute = effect;
        eff.deps = deps;
    }
}
