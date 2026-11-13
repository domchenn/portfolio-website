// Line-art Boston skyline pinned to the bottom of the viewport.
// Shapes are painted in order: "fill" shapes mask what's behind them with the
// page background, "line" shapes draw white strokes (the whole SVG is faded via opacity).

const BG = "#161616";

type Shape = { d: string; fill?: true; w?: number };

const fill = (d: string): Shape => ({ d, fill: true });
const line = (d: string, w = 0.6): Shape => ({ d, w });

const range = (from: number, to: number, step: number) => {
  const out: number[] = [];
  for (let v = from; v <= to; v += step) out.push(v);
  return out;
};
/** Horizontal floor lines across a building. */
const floors = (x1: number, x2: number, y1: number, y2: number, step: number) =>
  range(y1, y2, step).map((y) => `M${x1} ${y} H${x2}`).join(" ");
/** Vertical mullions at the given x positions. */
const mullions = (xs: number[], top: number, bottom = 250) =>
  xs.map((x) => `M${x} ${top} V${bottom}`).join(" ");

const ROWHOUSES =
  "M0 250 V226 H0 V222 H32 H32 V226 H58 H58 V218 H102 H102 V212 H128 H128 V226 H154 H154 V212 H192 H192 V230 H224 H224 V222 H262 H262 V212 H294 H294 V218 H332 H332 V222 H358 H358 V218 H396 H396 V222 H428 H428 V222 H466 H466 V230 H492 H492 V226 H530 H530 V218 H562 H562 V226 H594 H594 V212 H632 H632 V212 H670 H670 V230 H708 H708 V230 H746 H746 V226 H778 H778 V230 H822 H822 V226 H860 H860 V218 H904 H904 V222 H936 H936 V212 H974 H974 V212 H1000 H1000 V222 H1044 H1044 V222 H1088 H1088 V218 H1120 H1120 V226 H1146 H1146 V226 H1178 H1178 V218 H1216 H1216 V226 H1254 H1254 V230 H1292 H1292 V222 H1324 H1324 V212 H1350 H1350 V222 H1382 H1382 V212 H1414 H1414 V218 H1452 V250 Z";

const WAVES = range(230, 1430, 30)
  .map((x, i) => `Q${x + 15} ${i % 2 === 0 ? 230 : 226} ${x + 30} 238`)
  .join(" ");
const SHORE =
  "M0 250 V176 Q11 164 23 180 Q34 174 46 188 Q57 184 69 180 Q80 164 92 188 Q103 174 115 180 Q126 184 138 188 Q149 164 161 180 Q172 174 184 188 Q195 184 207 180 Q218 164 230 188 L230 236 " +
  WAVES +
  " V256 H0 Z";

const PIERS: [number, number][] = [
  [206, 214],
  [380, 394],
  [612, 624],
  [852, 922],
  [1156, 1238],
];
const TOWERS = [856, 892, 1160, 1202];
const BOATS = [262, 822, 1152];

const SHAPES: Shape[] = [
  // Hancock-style tower with crown + antennas
  fill("M1168 250 V66 H1264 V250 Z"),
  line(floors(1168, 1264, 73, 241, 7)),
  fill("M1176 66 V54 H1256 V66 Z"),
  line("M1216 54 V18 M1206 54 V36 M1226 54 V40", 1),
  fill("M1266 250 V80 L1290 72 L1322 80 V250 Z"),
  line(floors(1266, 1322, 92, 245, 9)),
  // Tallest slab
  fill("M348 250 V22 H506 V250 Z"),
  fill("M482 250 V22 H506 V250 Z"),
  line("M372 22 V250 M398 22 V250 M424 22 V250 M450 22 V250 M432 22 V8 M444 22 V12"),
  // Pitched-roof building with spire
  fill("M123 250 V138 H226 V250 Z"),
  line(floors(123, 226, 147, 237, 9)),
  fill("M128 138 L140 118 H210 L222 138 Z"),
  fill("M158 118 L175 98 L192 118 Z"),
  line("M175 98 V72", 1),
  line("M140 118 V138 M210 118 V138"),
  fill("M226 250 V143 H262 V250 Z"),
  line(floors(226, 262, 151, 239, 8)),
  // Domed building
  fill("M266 250 V150 H386 V250 Z"),
  line(floors(266, 386, 159, 240, 9) + " " + mullions([290, 314, 338, 362], 150)),
  fill("M300 150 V136 Q324 120 348 136 V150 Z"),
  // Mid-rise blocks
  fill("M678 250 V138 H755 V250 Z"),
  line(floors(678, 755, 145, 243, 7) + " " + mullions(range(689, 744, 11), 138)),
  fill("M774 250 V145 H875 V250 Z"),
  line(floors(774, 875, 153, 241, 8) + " " + mullions(range(794, 874, 20), 145)),
  fill("M897 250 V157 H982 V250 Z"),
  line(floors(897, 982, 164, 241, 7)),
  fill("M986 250 V152 H1078 V250 Z"),
  line(floors(986, 1078, 160, 240, 8) + " " + mullions([1009, 1032, 1055], 152)),
  // Rounded-top tower
  fill("M1046 250 V140 Q1048 112 1082 108 Q1116 112 1118 140 V250 Z"),
  line("M1058 250 V124 M1070 250 V112 M1082 250 V108 M1094 250 V112 M1106 250 V124 M1046 140 H1118"),
  line("M1082 108 V96", 1),
  fill("M1323 250 V169 H1380 V250 Z"),
  line(floors(1323, 1380, 177, 241, 8)),
  fill("M1380 250 V180 H1437 V250 Z"),
  line(floors(1380, 1437, 188, 244, 8)),
  fill("M490 250 V193 H560 V250 Z"),
  line(floors(490, 560, 201, 241, 8) + " " + mullions(range(504, 546, 14), 193)),
  fill("M560 250 V186 H620 V250 Z"),
  line(floors(560, 620, 194, 242, 8)),
  fill("M612 250 V196 L620 182 L628 196 V250 Z"),
  fill("M628 250 V198 H674 V250 Z"),
  line(floors(628, 674, 206, 238, 8)),
  // Rowhouses
  fill(ROWHOUSES),
  line(ROWHOUSES, 0.8),
  line(range(40, 1398, 97).map((x) => `M${x} 214 v-6 h4 v6`).join(" ")),
  line(range(8, 1436, 14).map((x) => `M${x} 236 h5`).join(" ")),
  // Shoreline trees + river
  fill(SHORE),
  line(SHORE, 0.9),
  fill("M282 244 A28 22 0 0 1 338 244 Z"),
  line("M296 244 A14 14 0 0 1 324 244"),
  // Bridge deck, cables, piers, towers
  fill("M206 240 H1440 V248 H206 Z"),
  line("M206 240 H1440 M206 248 H1440 M206 243.5 H1440"),
  line(
    "M214 274 Q297 244 380 274 M394 274 Q503 244 612 274 M624 274 Q738 244 852 274 M922 274 Q1039 244 1156 274 M1238 274 Q1340 244 1440 262",
    1
  ),
  ...PIERS.flatMap(([a, b]) => [
    fill(`M${a} 248 V276 H${b} V248 Z`),
    line(`M${a} 248 V276 H${b} V248`, 0.9),
  ]),
  ...TOWERS.flatMap((x) => [
    fill(`M${x} 248 V206 A14 12 0 0 1 ${x + 28} 206 V248 Z`),
    line(`M${x} 248 V206 A14 12 0 0 1 ${x + 28} 206 V248 M${x + 14} 194 V188 M${x} 218 H${x + 28}`, 0.9),
  ]),
  // Water ripples + boats
  line(
    "M0 262 Q100 258 206 262 M20 284 H90 M180 292 H300 M420 282 H540 M650 296 H760 M880 284 H1010 M1100 294 H1220 M1300 284 H1420 M60 306 H160 M520 308 H620 M980 308 H1090"
  ),
  ...BOATS.map((x) =>
    line(
      `M${x} 300 H${x + 76} L${x + 70} 308 H${x + 6} Z M${x + 8} 300 V292 H${x + 64} V300 M${x + 16} 296 H${x + 56}`,
      0.9
    )
  ),
];

export default function Skyline({ opacity = 0.28 }: { opacity?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      stroke="#FFFFFF"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="fixed inset-x-0 bottom-0 z-0 pointer-events-none w-full h-[300px]"
      style={{ opacity }}
    >
      {SHAPES.map((s, i) =>
        s.fill ? (
          <path key={i} d={s.d} fill={BG} />
        ) : (
          <path key={i} d={s.d} fill="none" strokeWidth={s.w} />
        )
      )}
    </svg>
  );
}
