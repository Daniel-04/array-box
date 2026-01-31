# TODO

🎯: before launch

## Leetgolf
- make your own shareable problem
- Solver mode (although maybe just add a problem to LeetGolf.com)
- contest

## ArrayBox
- Add k6
- 🎯 word prefix complete
- 🎯 Set up a statistics aggregator (one public website is up)
  - number of submissions by language
  - % of correct submissions by language
- 🎯 short permalinks

### Later
- Multi lang solve (get multiple bars)
- 🎯 Match on names across languages
- add non-keyboard character set for APL, BQN, Kap
- more syntax highlighting
  - BQN / TinyAPL modifiers / functions
- 🎯 add to the combo list idioms / common inverse operations (uiua done)
- rip apl cart / bqn crate
- train tacit view

- test out pink as 2-modifier color
- program combinators in array langauges to test the color

### Fix 
- jumpiness of logo in top left of keyboard
- cursor skips to begining after ENTER
- syntax highlighting is a little slow on larger inputs

```
⍝ These are some combinators
_W   ← _{ ⍵ ⍹⍹ ⍵ }     ⍝ The Warbler
_C   ← _{ ⍺ ⍹⍹ ⍵ }     ⍝ The Cardinal
_B_  ← _{ ⍶⍶ ⍹⍹ ⍵ }_   ⍝ The BlueBird
_B1_ ← _{ ⍶⍶ ⍺ ⍹⍹ ⍵ }_ ⍝ The Blackbird
Sq   ← ×_W             ⍝ Square
Del  ← -_C⌺            ⍝ Deltas
Del ⍳5
+/⍳5
```