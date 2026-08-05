Drop your looping track in this folder as:

    background.mp3

That's the only thing this folder needs. The cave already generates its own
waterfall, cave tone and drips procedurally, so it runs fine with nothing here
— your track layers on top of them.

Notes
  * Any length works; it loops seamlessly via the Web Audio API, not the
    <audio> element, so there is no gap at the loop point.
  * If the file has a hard start or end, the loop seam will be audible. A track
    that fades in and out to silence, or one that is already seamless, is best.
  * Volume is set in src/config.js -> audio.backgroundGain (currently 0.55).
    It sits deliberately under the water so the water stays the foreground.
  * You can hot-swap it while the page is open without reloading:
    open the browser console and run   CAVE.reloadBackground()
  * mp3, m4a/aac, ogg and wav all decode; mp3 is the safest on Quest Browser.
