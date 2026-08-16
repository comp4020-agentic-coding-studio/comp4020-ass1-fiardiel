# Process overview

A reading-guide to how the work came together, a map to my process, not an
essay about it.

## What I built

I built a single-page site that explains chords, the backbone of most
songs. It walks through what each chord in a key feels like and what
it's actually doing, whether that's home, tension, or somewhere in
between. You can change the key, and for each of that key's seven
chords, hear it and see what it's for.

## The moments that mattered

**The chord algorithm.** The obvious way to generate the seven chords for a
key would be to write them all out by hand, for every key, that's 84 chords
total. Instead I built one formula: the major scale's interval pattern
combined with a fixed sequence of chord qualities (major, minor, minor,
major, major, minor, diminished) that holds true no matter which note you
start on. About ten lines of code generate a musically correct set of
chords for any of the 12 keys, instead of a hardcoded table. To check it
was actually right, I didn't just trust that the tests passed, I hand
verified the generated chords for two different keys, including one with
a sharp in it, against real music theory, note by note.
([`94836ce`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-fiardiel/commit/94836ce))

**Note voicing.** A chord like A minor is really just three notes with no
octave attached, A, C, and E. Playing them naively in the same octave
would put C below A, which is backwards, and the chord would sound muddy
instead of like an actual triad. Instead of ignoring that, I wrote logic
that stacks each note upward properly, bumping to the next octave
whenever a note would otherwise land below the one before it, so it
always plays as a real ascending chord. I tested this against chords that
specifically wrap around an octave boundary, like A minor and B
diminished, and checked the output note by note against what a real
voicing should sound like.
([`61c0f72`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-fiardiel/commit/61c0f72))

**The keyboard-focus bug.** The key selector was rebuilding all 12
buttons from scratch every time you clicked one, which looked identical
with a mouse but silently broke keyboard navigation: whichever button had
focus got deleted and replaced, so focus reset to the very top of the
page. This only surfaces if you never touch a mouse, which is exactly the
kind of use the spec asks the site to hold up under. The fix was to build
the buttons once and just toggle which one looks selected, instead of
destroying and recreating them. When I went to verify the fix actually
worked live, the browser automation tool I usually use couldn't connect,
it turned out it only works with Chrome and I use Arc. Rather than skip
verification, I read through the whole codebase looking for anything that
intercepts keyboard events or hijacks scrolling, and found nothing, which
confirmed the fix held.
([`70756dc`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-fiardiel/commit/70756dc))

**The circle-of-fifths selection bug.** When I switched the key selector
from a straight row to a circle of fifths, the order the buttons appear
in changed too. The original selection code assumed a button's position
in that order matched its pitch, so once the layout changed, clicking a
key could have silently selected the wrong one, the core interaction the
whole site depends on. I caught this before it shipped, not after, by
tracing through what the refactor actually changed rather than just
checking the page still looked right. The fix was to key selection off
each button's own pitch data instead of its position.
([`3927e17`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-fiardiel/commit/3927e17))
