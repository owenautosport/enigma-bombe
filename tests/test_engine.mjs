// Checks the Enigma and Bombe engine embedded in src/workbench.html.
// Run: node tests/test_engine.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../src/workbench.html", import.meta.url), "utf8");
const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
if (!m) throw new Error("engine script not found");
const ctx = {};
vm.createContext(ctx);
vm.runInContext(m[1] + ";globalThis.E={Enigma,idx,chr,mod,scramblerTable,flood,edgesByLetter,popc,deduce,plugMap};", ctx);
const { Enigma, idx, mod, scramblerTable, flood, edgesByLetter, popc, deduce, plugMap } = ctx.E;

let failed = 0;
const check = (name, got, want) => {
  const ok = got === want;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n      got  ${got}\n      want ${want}`}`);
};
const run = (cfg, text) => new Enigma(cfg).run(text);
const L = s => [...s];

// 1. Standard reference vector
check("Enigma I, I-II-III, UKW B, AAA: AAAAA -> BDZGO",
  run({ reflector: "B", rotors: ["I", "II", "III"], rings: L("AAA"), pos: L("AAA"), plugs: "" }, "AAAAA"), "BDZGO");

// 2. Double stepping of the middle rotor
{
  const e = new Enigma({ reflector: "B", rotors: ["I", "II", "III"], rings: [0, 0, 0], pos: L("ADU"), plugs: "" });
  const seen = [];
  for (let i = 0; i < 3; i++) { e.press("A"); seen.push(e.windows()); }
  check("double step ADU -> ADV AEW BFX", seen.join(" "), "ADV AEW BFX");
}

// 3. Genuine message: Operation Barbarossa, 7 July 1941 (Sullivan & Weierud)
{
  const cfg = { reflector: "B", rotors: ["II", "IV", "V"], rings: L("BUL"), plugs: "AV BS CG DL FU HZ IN KM OW RX" };
  check("Barbarossa indicator WXC: KCH -> BLA", run({ ...cfg, pos: L("WXC") }, "KCH"), "BLA");
  const ct = "EDPUDNRGYSZRCXNUYTPOMRMBOFKTBZREZKMLXLVEFGUEYSIOZVEQMIKUBPMMYLKLTTDEISMDICAGYKUACTCDOMOHWXMUUIAUBSTSLRNBZSZWNRFXWFYSSXJZVIJHIDISHPRKLKAYUPADTXQSPINQMATLPIFSVKDASCTACDPBOPVHJK";
  check("Barbarossa part 1 plaintext", run({ ...cfg, pos: L("BLA") }, ct),
    "AUFKLXABTEILUNGXVONXKURTINOWAXKURTINOWAXNORDWESTLXSEBEZXSEBEZXUAFFLIEGERSTRASZERIQTUNGXDUBROWKIXDUBROWKIXOPOTSCHKAXOPOTSCHKAXUMXEINSAQTDREINULLXUHRANGETRETENXANGRIFFXINFXRGTX");
}

// 4. Genuine message: U-534 "von Looks" signal (Enigma M4)
{
  const ct = "NCZWVUSXPNYMINHZXMQXSFWXWLKJAHSHNMCOCCAKUQPMKCSMHKSEINJUSBLKIOSXCKUBHMLLXCSJUSRRDVKOHULXWCCBGVLIYXEOAHXRHKKFVDREWEZLXOBAFGYUJQUKGRTVUKAMEURBVEKSUHHVOYHABCJWMAKLFKLMYFVNRIZRVVRTKOFDANJMOLBGFFLEOPRGTFLVRHOWOPBEKVWMUQFMPWPARMFHAGKXIIBG";
  check("U-534 von Looks (M4, Beta II IV I, UKW B thin)",
    run({ reflector: "B-thin", rotors: ["Beta", "II", "IV", "I"], rings: L("AAAV"), pos: L("VJNA"), plugs: "AT BL DF GJ HM NW OP QY RZ VX" }, ct),
    "VONVONJLOOKSJHFFTTTEINSEINSDREIZWOYYQNNSNEUNINHALTXXBEIANGRIFFUNTERWASSERGEDRUECKTYWABOSXLETZTERGEGNERSTANDNULACHTDREINULUHRMARQUANTONJOTANEUNACHTSEYHSDREIYZWOZWONULGRADYACHTSMYSTOSSENACHXEKNSVIERMBFAELLTYNNNNNNOOOVIERYSICHTEINSNULL");
}

// 5. Genuine message: Doenitz succession signal, 1 May 1945 (Crypto Museum P1030681)
{
  const cfg = { reflector: "C-thin", rotors: ["Beta", "V", "VI", "VIII"], rings: L("EPEL"), plugs: "AE BF CM DQ HU JN LX PR SZ VW" };
  check("Doenitz indicator NAEM: QEOB -> CDSZ", run({ ...cfg, pos: L("NAEM") }, "QEOB"), "CDSZ");
  const ct = "LANOTCTOUARBBFPMHPHGCZXTDYGAHGUFXGEWKBLKGJWLQXXTGPJJAVTOCKZFSLPPQIHZFXOEBWIIEKFZLCLOAQJULJOYHSSMBBGWHZANVOIIPYRBRTDJQDJJOQKCXWDNBBTYVXLYTAPGVEATXSONPNYNQFUDBBHHVWEPYEYDOHNLXKZDNWRHDUWUJUMWWVIIWZXIVIUQDRHYMNCYEFUAPNHOTKHKGDNPSAKNUAGHJZSMJBMHVTREQEDGXHLZWIFUSKDQVELNMIMITHBHDBWVHDFYHJOQIHORTDJDBWXEMEAYXGYQXOHFDMYUXXNOJAZRSGHPLWMLRECWWUTLRTTVLBHYOORGLGOWUXNXHMHYFAACQEKTHSJW";
  const out = run({ ...cfg, pos: L("CDSZ") }, ct);
  check("Doenitz message opening", out.slice(0, 44), "KRKRALLEXXFOLGENDESISTSOFORTBEKANNTZUGEBENXX");
  check("Doenitz message length", String(out.length), "372");
}

// 6. Bombe: the weather-report crib finds the true setting with the right plug pairs
{
  const day = { rotors: ["III", "I", "V"], rings: [5, 10, 22], plugs: "AK BZ CV EL FS GP HQ IX JU MR" };
  const plain = "WETTERVORHERSAGEXFUERXRAUMXBISKAYAXXBEWOELKUNGXSIEBENXZEHNTELXWINDXNORDWESTXSTAERKEXVIERXSIQTXGUTXXLUFTDRUQKXFALLENDX";
  const cfg = { reflector: "B", rotors: day.rotors, rings: day.rings, pos: L("NDH"), plugs: day.plugs };
  const ct = run(cfg, plain);
  const crib = "WETTERVORHERSAGE";
  const menu = [...crib].map((c, k) => ({ k, a: idx(c), b: idx(ct[k]) }));
  const e = new Enigma(cfg); e.step();
  const core = e.pos.map((p, j) => mod(p - e.rings[j]));
  const tbl = scramblerTable(day.rotors, "B"), eb = edgesByLetter(menu);
  const test = idx("E");
  const mask = flood(tbl, core[0], core[1], core[2], menu, true, test, idx("A"), eb);
  const lit = popc(mask[test]);
  check("Bombe stops at the true position (fewer than 26 wires live)", String(lit < 26), "true");
  const d = deduce(tbl, { l: core[0], m: core[1], r: core[2], testMask: mask[test] }, menu, true, test);
  const pm = plugMap(day.plugs);
  const allRight = Object.entries(d.pairs).every(([a, b]) => pm[a] === b);
  check("stop is consistent and every deduced stecker is correct", String(d.ok && allRight), "true");
  let stops = 0;
  for (let l = 0; l < 26; l++) for (let mm = 0; mm < 26; mm++) for (let r = 0; r < 26; r++)
    if (popc(flood(tbl, l, mm, r, menu, true, test, idx("A"), eb)[test]) < 26) stops++;
  check("only one stop in the whole wheel order III-I-V", String(stops), "1");
}

console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exit(failed ? 1 : 0);
