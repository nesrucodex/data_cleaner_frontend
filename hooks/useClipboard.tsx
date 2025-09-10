import { useEffect, useState } from "react"

const useClipboard = () => {
    const [copied, setCopied] = useState(false)
    const copy = (text: string) => {
        window.navigator.clipboard.writeText(text)
        setCopied(true)
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCopied(false)
        }, 2000)

        return () => {
            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }, [])

    return { copy, copied }
}

export default useClipboard