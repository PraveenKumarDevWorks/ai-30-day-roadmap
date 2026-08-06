import { useCallback, useEffect, useRef, useState } from 'react'

// Feeds text into a queue as it arrives from the network, then "types" it
// onto the screen at a steady speed, one character at a time — no matter
// whether the network delivered a whole sentence in one chunk or a single
// letter. This decouples "when text arrives" from "when text is shown."
//
// Why not just setState every time a network chunk arrives? Because chunks
// arrive at random, bursty times (network-dependent, not human-reading-
// speed-dependent), and calling setState very rapidly triggers a lot of
// re-renders for no visual benefit. Here we only ever call setState once
// per animation frame (at most ~60 times a second), driven by
// requestAnimationFrame — not by the network. Received-but-not-yet-shown
// text sits in a plain ref (queueRef) in the meantime, which does NOT
// trigger a re-render just by changing.
export function useTypewriter(charsPerSecond = 40) {
  const [displayed, setDisplayed] = useState('')
  const queueRef = useRef('') // received but not yet shown
  const shownRef = useRef('') // already shown on screen
  const frameRef = useRef<number>()

  const push = useCallback((chunk: string) => {
    queueRef.current += chunk
  }, [])

  const reset = useCallback(() => {
    queueRef.current = ''
    shownRef.current = ''
    setDisplayed('')
  }, [])

  useEffect(() => {
    let lastTime = performance.now()
    let charBudget = 0

    function tick(now: number) {
      const dt = now - lastTime
      lastTime = now
      charBudget += (dt / 1000) * charsPerSecond

      const charsToShow = Math.min(Math.floor(charBudget), queueRef.current.length)
      if (charsToShow > 0) {
        const next = queueRef.current.slice(0, charsToShow)
        queueRef.current = queueRef.current.slice(charsToShow)
        shownRef.current += next
        charBudget -= charsToShow
        setDisplayed(shownRef.current)
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [charsPerSecond])

  return { displayed, push, reset }
}
