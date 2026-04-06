import type { JSXElementType } from "@my-react/types/jsx"

interface IRouterProps {
    path: string
    children: JSXElementType
    currentPath: string
    currentSearch?: string
}

export function matchPath(pattern: string, path: string) {
    const names: string[] = []
    let regexStr = ''

    for (let i = 0; i < pattern.length;) {
        const ch = pattern[i]
        if (ch === '{') {
            const close = pattern.indexOf('}', i + 1)
            if (close === -1) {
                regexStr += '\\{'
                i++
                continue
            }
            const name = pattern.substring(i + 1, close)
            names.push(name)
            regexStr += '([^/]+)'
            i = close + 1
        } else {
            if ('^$\\.*+?()[]|/'.includes(ch)) {
                regexStr += '\\' + ch
            } else {
                regexStr += ch
            }
            i++
        }
    }

    const regex = new RegExp('^' + regexStr + '$')
    const m = regex.exec(path)
    if (!m) return { matches: false, params: {} as Record<string, string> }

    const params: Record<string, string> = {}
    for (let i = 0; i < names.length; i++) {
        params[names[i]] = decodeURIComponent(m[i + 1])
    }
    return { matches: true, params }
}

export function parseSearch(search: string): Record<string, string> {
    const params: Record<string, string> = {}
    if (!search) return params
    
    const queryString = search.startsWith('?') ? search.slice(1) : search
    const pairs = queryString.split('&')
    
    for (const pair of pairs) {
        const [key, value] = pair.split('=')
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '').replaceAll('+', ' ')
        }
    }
    return params
}

export function Router({path, children, currentPath, currentSearch}: IRouterProps){
    const { matches, params: pathParams } = matchPath(path, currentPath)
    
    
    console.log(`Router ${path}:`, { 
        currentPath, 
        currentSearch, 
        pathParams, 
        children,
    })

    if (!matches && path != "*") return null

    if (children.type === 'component') {
        children.props = { 
            ...children.props, 
            ...pathParams, 
        }
        if (currentSearch){
            const queryParams = parseSearch(currentSearch)
            children.props = {
                ...children.props,
                ...queryParams

            }
            console.log(currentSearch)
        }
        console.log(`render children ${path}`)
        return <div>{children}</div>
    }

    return <div>{children}</div>
}

interface ISwitchrProps {
    children: any[]
    currentPath: string
}

export function Switch({ currentPath, children }: ISwitchrProps) {
    const childrenArray = Array.isArray(children) ? children : [children];
    
    for (const child of childrenArray) {
        if (child && child.type === 'component' && child.props.path) {
            const { matches } = matchPath(child.props.path, currentPath);
            if (matches || child.props.path == "*") {
                return <div>{child}</div>;
            }
        }
    }
    return null;
}