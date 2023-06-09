export function copyElementUseEffect(event, setCopied) {
  if (event) {
    const timer = setTimeout(() => {
      setCopied(false)
    }, 1500)
    return () => clearTimeout(timer)
  }
}

