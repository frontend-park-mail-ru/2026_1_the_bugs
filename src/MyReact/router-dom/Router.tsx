import type { JSXElementType } from "@my-react/types/jsx"

interface IRouterProps{
    path: string
    children: JSXElementType
    currentPath: string
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

export function Router({path, children, currentPath}: IRouterProps){
    const { matches, params } = matchPath(path, currentPath)
    console.log(`Router ${path}:`, { currentPath, matches, params })

    if (!matches) return null

    if (children.type === 'component') {
        children.props = { ...children.props, ...params }
        return (<div>{children}</div>)
    }

    return (<div>{children}</div>)
}