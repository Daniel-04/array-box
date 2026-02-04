#### Test Formatting Programs
```
⍝ These are some combinators
_W    ← _{ ⍵ ⍶⍶ ⍵ }            ⍝ The Warbler
_C    ← _{ ⍵ ⍶⍶ ⍺ }            ⍝ The Cardinal
_B_   ← _{ ⍶⍶ ⍹⍹ ⍵ }_          ⍝ The BlueBird
_B1_  ← _{ ⍶⍶ ⍺ ⍹⍹ ⍵ }_        ⍝ The Blackbird
_Psi_ ← _{ (⍹⍹ ⍺) ⍶⍶ (⍹⍹ ⍵) }_ ⍝ The Psi Bird
Sq    ← ×_W                    ⍝ Square
Del   ← -_C⌺                   ⍝ Deltas

⎕ ← Del ⌽_B_⍳5             ⍝ Iota 5
⎕ ← +/⍳5                   ⍝ Plus reduce Iota 5
"cat" |_B1_-_Psi_≢ "mouse" ⍝ Length abs diff
```

`["hello⍘nworld!"‿⎕Unicode⋄⟨"a":"b"⋄"c":17⟩‿(⎕Import"std:math/polynomial")]`
