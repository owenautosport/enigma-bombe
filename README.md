# Hut 6 Workbench

**[Play it in your browser →](https://owenautosport.github.io/enigma-bombe/)**

A working Enigma machine and Turing–Welchman Bombe in your browser. Encrypt your own messages, or break intercepted German traffic the way Bletchley Park did: crib, menu, Bombe, checking machine, daily key.

![The 3D Enigma](docs/img/enigma-3d.png)

## What's in it

| Tab | What you do there |
|---|---|
| **1 · Enigma** | A 3D Enigma I, M3 or M4 with every setting the real machines had: rotor order, ring settings, reflectors A/B/C and the thin M4 reflectors, thumbwheels, and a plugboard you cable up by clicking sockets. The lamp stays lit while the key is held, and a trace shows the current's path through each part. |
| **2 · Intercepts** | Five messages to break: three period-style reconstructions (easy, medium, hard) and two genuine wartime messages. |
| **3 · Crib & menu** | Slide the crib along the ciphertext to rule out impossible positions, then choose which letters go into the menu. The menu graph highlights its loops. |
| **4 · Bombe** | A 3D Bombe: 36 drum stacks set by the menu, 26-wire logic, Welchman's diagonal board, and a test register. Run all 60 wheel orders in seconds, or step at 1940 speed. Turn the machine round to see your menu cabled up at the back. |
| **5 · Checking machine** | Load a stop, find the ring setting, fill in missing plug pairs from garbled letters, and recover the full daily key from the message indicator. |

**New to Enigma?** Press **Guided tour**. It walks you through breaking the weather report from your first key press to the German daily key, and every step has a "Do it for me" button.

![The guided tour](docs/img/tour.png)

![The 3D Bombe](docs/img/bombe-3d.png)

There is also a companion explainer, [Inside the Bombe](docs/explainer.html), which covers how the attack works with diagrams built from real simulated data.

## Run it

It's a static site with nothing to install.

```bash
python3 tools/build.py                        # writes docs/index.html and docs/explainer.html
python3 -m http.server 8000 --directory docs  # then open http://localhost:8000
```

Opening `docs/index.html` straight from disk also works. The 3D view needs WebGL and falls back to flat panels without it.

Deep links: `#enigma`, `#intercepts`, `#menu`, `#bombe`, `#check`, and `#tour` to start the guided tour.

## How accurate is it?

The engine is checked by `node tests/test_engine.mjs` against:

- the standard reference vector (rotors I-II-III, reflector B, all at A: `AAAAA → BDZGO`) and the middle rotor's double step (`ADU → ADV AEW BFX`)
- **Operation Barbarossa, 7 July 1941** (Enigma I): the indicator `WXC KCH` decrypts to message key `BLA`, and part 1 decrypts letter for letter
- **The U-534 "von Looks" signal** (Enigma M4)
- **The Dönitz succession signal, 1 May 1945** (Enigma M4, reflector C thin): the indicator `QEOB` gives `CDSZ`, and all 372 letters decrypt
- a Bombe run on the weather-report crib: exactly one stop in the true wheel order, and every stecker it deduces is correct

Rotor and reflector wirings match [Crypto Museum's tables](https://www.cryptomuseum.com/crypto/enigma/wiring.htm).

**Simplifications**

- Like the real machine, the Bombe assumes the middle rotor doesn't step inside the menu. You trim long cribs instead.
- The rear cabling uses one junction per letter. Bletchley's actual menu wiring was more involved.
- The 3D models are laid out like the real machines, but their proportions and colours are approximate, not taken from measured drawings.
- The British three-rotor Bombe couldn't attack the four-rotor M4, so M4 messages are decoded, not cracked.

## Project layout

```
src/workbench.html   the app: Enigma, Bombe, UI, 3D models (three.js r128) and guided tour
src/explainer.html   the "Inside the Bombe" explainer page
tools/build.py       wraps src/ pages into standalone documents in docs/
tests/               engine tests (Node 18+)
docs/                built site (GitHub Pages) and screenshots
```

The files in `src/` have no `<html>`/`<head>` wrapper so they can also be published as Claude artifacts. Run `tools/build.py` after editing them.

## Sources

- Genuine messages: [Crypto Museum, Enigma M4 message P1030681](https://www.cryptomuseum.com/crypto/enigma/msg/p1030681.htm); [Franklin Heath, Enigma sample messages](https://wiki.franklinheath.co.uk/index.php/Enigma/Sample_Messages), from Geoff Sullivan and Frode Weierud
- Wiring: [Crypto Museum, Enigma wiring](https://www.cryptomuseum.com/crypto/enigma/wiring.htm)

## Licence

MIT. See [LICENSE](LICENSE).
