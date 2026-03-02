import {ComponentInstance, markDirty} from "../my-react"

let activeInstance : ComponentInstance<any> | undefined = undefined;
let activeStateindex: number = 0;

export function _setActiveInstance(instance: ComponentInstance<any> | undefined) {
    activeInstance = instance;
}

export function _setActiveStateIndex(stateIndex: number) {
    activeStateindex = stateIndex;
}



export function useState<T>(initialState: T): [T, (newState: T)=>void]{
    if (activeInstance === undefined){
        throw new Error()
    }
    if (activeInstance.states.length <= activeStateindex){
        activeInstance.states.push(initialState)
    }
    const curInstance = activeInstance;
    const idx = activeStateindex;
    activeStateindex++;
    return [
        activeInstance.states[idx],
        (newState: T)=>{
            curInstance.states[idx] = newState;
            markDirty(curInstance);
        }
    ]
}

export function useEffect(effect: () => void | (() => void), deps?: any[]) {
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