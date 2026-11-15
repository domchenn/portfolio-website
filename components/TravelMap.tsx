// Server component: the world map is projected at build time and shipped as plain SVG,
// so visitors download no map library or tiles.
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";

type Place = { name: string; lon: number; lat: number };

const regions: { region: string; places: Place[] }[] = [
  {
    region: "North America",
    places: [
      { name: "New York City", lon: -74.006, lat: 40.7128 },
      { name: "Washington, D.C.", lon: -77.0369, lat: 38.9072 },
      { name: "Philadelphia", lon: -75.1652, lat: 39.9526 },
      { name: "Portland, Maine", lon: -70.2553, lat: 43.6591 },
      { name: "Las Vegas", lon: -115.1398, lat: 36.1699 },
      { name: "Toronto", lon: -79.3832, lat: 43.6532 },
      { name: "Montreal", lon: -73.5673, lat: 45.5017 },
    ],
  },
  {
    region: "Europe",
    places: [
      { name: "Paris", lon: 2.3522, lat: 48.8566 },
      { name: "Turin", lon: 7.6869, lat: 45.0703 },
      { name: "Vienna", lon: 16.3738, lat: 48.2082 },
      { name: "Budapest", lon: 19.0402, lat: 47.4979 },
    ],
  },
  {
    region: "Asia",
    places: [
      { name: "Beijing", lon: 116.4074, lat: 39.9042 },
      { name: "Shanghai", lon: 121.4737, lat: 31.2304 },
      { name: "Fuzhou", lon: 119.2965, lat: 26.0745 },
      { name: "Hong Kong", lon: 114.1694, lat: 22.3193 },
    ],
  },
];

// ISO 3166-1 numeric codes of countries visited (lightly highlighted on the map).
const VISITED = new Set(["840", "124", "250", "380", "040", "348", "156"]);
const ANTARCTICA = "010";

const WIDTH = 960;

const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
const countries = feature(topo, topo.objects.countries) as FeatureCollection<Geometry, { name: string }>;
const shown: FeatureCollection<Geometry, { name: string }> = {
  type: "FeatureCollection",
  features: countries.features.filter((f) => String(f.id) !== ANTARCTICA),
};

const projection = geoEqualEarth().fitWidth(WIDTH, shown);
const path = geoPath(projection).digits(1);
const [[, y0], [, y1]] = path.bounds(shown);
const HEIGHT = Math.ceil(y1 - y0);
projection.translate([projection.translate()[0], projection.translate()[1] - y0]);

const countryPaths = shown.features.map((f) => ({
  id: String(f.id),
  name: f.properties.name,
  d: path(f) ?? "",
}));

const pins = regions.flatMap(({ places }) =>
  places.map((p) => {
    const [x, y] = projection([p.lon, p.lat]) ?? [0, 0];
    return { ...p, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  })
);

const allPlaces = regions.flatMap((r) => r.places.map((p) => p.name));

export default function TravelMap() {
  return (
    <div className="flex flex-col gap-6">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`World map with pins on places I've been: ${allPlaces.join(", ")}`}
        className="w-full h-auto"
      >
        <g strokeWidth={0.5} stroke="#161616">
          {countryPaths.map((c) => (
            <path key={c.id + c.name} d={c.d} fill={VISITED.has(c.id) ? "#3A3A3A" : "#242424"} />
          ))}
        </g>
        <g>
          {pins.map((p) => (
            <g key={p.name}>
              <title>{p.name}</title>
              <circle cx={p.x} cy={p.y} r={7} fill="#EDEDED" fillOpacity={0.12} />
              <circle cx={p.x} cy={p.y} r={3} fill="#EDEDED" stroke="#161616" strokeWidth={1} />
            </g>
          ))}
        </g>
      </svg>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-9 gap-y-6">
        {regions.map(({ region, places }) => (
          <div key={region} className="flex flex-col gap-1.5">
            <h3 className="m-0 text-[15px] font-normal text-label">{region}</h3>
            <ul className="m-0 p-0 list-none flex flex-col gap-0.5 text-muted">
              {places.map((p) => (
                <li key={p.name}>{p.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
