import {
  CalculationFlag,
  HouseSystem,
  LunarPoint,
  Planet,
  SiderealMode,
  SwissEphemeris,
} from "@swisseph/browser";
import ephemerisWasmUrl from "@swisseph/browser/dist/swisseph.wasm?url";

export type AstrologySystem = "vedic" | "western";
export type RequestedSystem = AstrologySystem | "both";

export type BirthLocation = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type ChartInput = {
  name: string;
  birthDate: string;
  birthTime: string;
  timeAccuracy: "exact" | "close" | "approximate" | "unknown";
  location: BirthLocation;
  houseSystem: "placidus" | "whole-sign";
};

export type Placement = {
  name: string;
  symbol: string;
  longitude: number;
  latitude: number;
  speed: number;
  retrograde: boolean;
  sign: string;
  signIndex: number;
  degree: number;
  minute: number;
  house: number | null;
};

export type Aspect = {
  between: string;
  type: string;
  orb: number;
};

export type ReadingSection = {
  title: string;
  eyebrow: string;
  body: string;
  evidence: string;
  practice: string;
};

export type DashaInfo = {
  lord: string;
  start: string;
  end: string;
  nextLord: string;
  subLord: string;
  subStart: string;
  subEnd: string;
};

export type ChartResult = {
  system: AstrologySystem;
  calculatedAt: string;
  utcBirthTime: string;
  timezoneOffset: string;
  julianDay: number;
  engineVersion: string;
  ayanamsa: number | null;
  ascendant: Placement | null;
  midheaven: Placement | null;
  cusps: number[];
  placements: Placement[];
  aspects: Aspect[];
  nakshatra: { name: string; pada: number; lord: string } | null;
  dasha: DashaInfo | null;
  panchanga: { tithi: string; vara: string; yoga: string } | null;
  readings: ReadingSection[];
  timingNote: string;
  settingsNote: string;
};

const signs = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const signQualities = [
  "direct, initiating, and willing to meet life through action",
  "steady, sensory, and motivated to build lasting value",
  "curious, adaptable, and energized by exchanging ideas",
  "protective, receptive, and attentive to emotional belonging",
  "expressive, warm, and drawn toward wholehearted participation",
  "discerning, practical, and motivated to improve what matters",
  "relational, balancing, and attentive to fairness and beauty",
  "intense, perceptive, and oriented toward depth and transformation",
  "searching, candid, and motivated by meaning and possibility",
  "disciplined, patient, and focused on durable achievement",
  "independent, systems-minded, and concerned with the wider whole",
  "imaginative, compassionate, and sensitive to subtle experience",
];

const signGrowth = [
  "pair courage with patience",
  "stay rooted without becoming stuck",
  "turn many ideas into one clear direction",
  "care deeply without carrying every feeling alone",
  "share your light without making approval its fuel",
  "let improvement coexist with self-acceptance",
  "make a choice even when perfect balance is impossible",
  "use intensity for honesty rather than control",
  "leave room for detail while pursuing the larger truth",
  "let tenderness support your discipline",
  "connect vision with human warmth",
  "protect sensitivity with clear boundaries",
];

const planetSymbols: Record<string, string> = {
  Sun: "☉",
  Moon: "☾",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
  Rahu: "☊",
  Ketu: "☋",
};

const planetBodies = [
  ["Sun", Planet.Sun],
  ["Moon", Planet.Moon],
  ["Mercury", Planet.Mercury],
  ["Venus", Planet.Venus],
  ["Mars", Planet.Mars],
  ["Jupiter", Planet.Jupiter],
  ["Saturn", Planet.Saturn],
  ["Uranus", Planet.Uranus],
  ["Neptune", Planet.Neptune],
  ["Pluto", Planet.Pluto],
] as const;

const nakshatras = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
];

const dashaSequence = [
  ["Ketu", 7],
  ["Venus", 20],
  ["Sun", 6],
  ["Moon", 10],
  ["Mars", 7],
  ["Rahu", 18],
  ["Jupiter", 16],
  ["Saturn", 19],
  ["Mercury", 17],
] as const;

const yogaNames = [
  "Vishkambha",
  "Priti",
  "Ayushman",
  "Saubhagya",
  "Shobhana",
  "Atiganda",
  "Sukarma",
  "Dhriti",
  "Shula",
  "Ganda",
  "Vriddhi",
  "Dhruva",
  "Vyaghata",
  "Harshana",
  "Vajra",
  "Siddhi",
  "Vyatipata",
  "Variyana",
  "Parigha",
  "Shiva",
  "Siddha",
  "Sadhya",
  "Shubha",
  "Shukla",
  "Brahma",
  "Indra",
  "Vaidhriti",
];

const varaNames = [
  "Ravivara · Sunday",
  "Somavara · Monday",
  "Mangalavara · Tuesday",
  "Budhavara · Wednesday",
  "Guruvara · Thursday",
  "Shukravara · Friday",
  "Shanivara · Saturday",
];

let ephemerisPromise: Promise<SwissEphemeris> | null = null;

function getEphemeris() {
  if (!ephemerisPromise) {
    ephemerisPromise = (async () => {
      const response = await fetch(ephemerisWasmUrl);
      if (!response.ok) throw new Error("The chart calculation engine could not be loaded. Please try again.");
      // Some preview servers send generic binary MIME types. A correctly typed
      // local blob keeps WebAssembly streaming reliable without uploading data.
      const engineUrl = URL.createObjectURL(new Blob([await response.arrayBuffer()], { type: "application/wasm" }));
      try {
        const ephemeris = new SwissEphemeris();
        await ephemeris.init(engineUrl);
        return ephemeris;
      } finally {
        URL.revokeObjectURL(engineUrl);
      }
    })().catch((error) => {
      ephemerisPromise = null;
      throw error;
    });
  }
  return ephemerisPromise;
}

const normalize = (value: number) => ((value % 360) + 360) % 360;

function partsAt(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const values: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== "literal") values[part.type] = Number(part.value);
  }
  return values;
}

function offsetAt(date: Date, timezone: string) {
  const values = partsAt(date, timezone);
  const representedAsUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
  );
  return Math.round((representedAsUtc - date.getTime()) / 60000);
}

export function zonedBirthToUtc(input: ChartInput) {
  const [year, month, day] = input.birthDate.split("-").map(Number);
  const fallbackTime = input.timeAccuracy === "unknown" ? "12:00" : input.birthTime;
  const [hour, minute] = fallbackTime.split(":").map(Number);
  const wallClock = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = wallClock;
  for (let index = 0; index < 4; index += 1) {
    const offset = offsetAt(new Date(guess), input.location.timezone);
    guess = wallClock - offset * 60_000;
  }
  const utc = new Date(guess);
  const roundTrip = partsAt(utc, input.location.timezone);
  if (
    roundTrip.year !== year ||
    roundTrip.month !== month ||
    roundTrip.day !== day ||
    roundTrip.hour !== hour ||
    roundTrip.minute !== minute
  ) {
    throw new Error(
      "That local time did not exist in the selected place, usually because clocks changed. Please confirm the recorded time.",
    );
  }
  return { utc, offsetMinutes: offsetAt(utc, input.location.timezone) };
}

function offsetLabel(minutes: number) {
  const sign = minutes >= 0 ? "+" : "−";
  const absolute = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(absolute / 60)).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`;
}

function makePlacement(
  name: string,
  longitude: number,
  latitude: number,
  speed: number,
  house: number | null,
): Placement {
  const normalized = normalize(longitude);
  const signIndex = Math.floor(normalized / 30);
  const withinSign = normalized % 30;
  const degree = Math.floor(withinSign);
  const minute = Math.floor((withinSign - degree) * 60);
  return {
    name,
    symbol: planetSymbols[name] ?? "•",
    longitude: normalized,
    latitude,
    speed,
    retrograde: speed < 0,
    sign: signs[signIndex],
    signIndex,
    degree,
    minute,
    house,
  };
}

function wholeSignHouse(longitude: number, ascendant: number) {
  const firstSignStart = Math.floor(normalize(ascendant) / 30) * 30;
  return Math.floor(normalize(longitude - firstSignStart) / 30) + 1;
}

function cuspHouse(longitude: number, cusps: number[]) {
  for (let house = 1; house <= 12; house += 1) {
    const start = normalize(cusps[house]);
    const end = normalize(cusps[house === 12 ? 1 : house + 1]);
    const span = normalize(end - start);
    const distance = normalize(longitude - start);
    if (distance < span || Math.abs(distance - span) < 0.00001) return house;
  }
  return 1;
}

function calculateAspects(placements: Placement[]) {
  const aspects = [
    [0, "Conjunction", 8],
    [60, "Sextile", 4],
    [90, "Square", 6],
    [120, "Trine", 6],
    [180, "Opposition", 8],
  ] as const;
  const included = placements.filter((item) => item.name !== "Rahu" && item.name !== "Ketu");
  const found: Aspect[] = [];
  for (let left = 0; left < included.length; left += 1) {
    for (let right = left + 1; right < included.length; right += 1) {
      const distance = Math.min(
        normalize(included[left].longitude - included[right].longitude),
        normalize(included[right].longitude - included[left].longitude),
      );
      for (const [angle, type, maximumOrb] of aspects) {
        const orb = Math.abs(distance - angle);
        if (orb <= maximumOrb) {
          found.push({
            between: `${included[left].name}–${included[right].name}`,
            type,
            orb,
          });
          break;
        }
      }
    }
  }
  return found.sort((a, b) => a.orb - b.orb).slice(0, 12);
}

function addYears(date: Date, years: number) {
  return new Date(date.getTime() + years * 365.2425 * 86_400_000);
}

function dashaForMoon(moonLongitude: number, birthDate: Date): DashaInfo {
  const span = 360 / 27;
  const nakIndex = Math.floor(normalize(moonLongitude) / span);
  const sequenceIndex = nakIndex % 9;
  const progress = (normalize(moonLongitude) % span) / span;
  const [, firstYears] = dashaSequence[sequenceIndex];
  let periodStart = addYears(birthDate, -progress * firstYears);
  const now = new Date();
  let cycle = sequenceIndex;
  let guard = 0;
  while (guard < 30) {
    const [lord, years] = dashaSequence[cycle % 9];
    const periodEnd = addYears(periodStart, years);
    if (now < periodEnd) {
      let subStart = periodStart;
      let subLord = lord;
      let subEnd = periodEnd;
      for (let sub = 0; sub < 9; sub += 1) {
        const [candidateLord, candidateYears] = dashaSequence[(cycle + sub) % 9];
        const candidateEnd = addYears(subStart, (years * candidateYears) / 120);
        if (now < candidateEnd) {
          subLord = candidateLord;
          subEnd = candidateEnd;
          break;
        }
        subStart = candidateEnd;
      }
      return {
        lord,
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
        nextLord: dashaSequence[(cycle + 1) % 9][0],
        subLord,
        subStart: subStart.toISOString(),
        subEnd: subEnd.toISOString(),
      };
    }
    periodStart = periodEnd;
    cycle += 1;
    guard += 1;
  }
  const [lord, years] = dashaSequence[cycle % 9];
  return {
    lord,
    start: periodStart.toISOString(),
    end: addYears(periodStart, years).toISOString(),
    nextLord: dashaSequence[(cycle + 1) % 9][0],
    subLord: lord,
    subStart: periodStart.toISOString(),
    subEnd: addYears(periodStart, years).toISOString(),
  };
}

function buildReadings(
  placements: Placement[],
  ascendant: Placement | null,
  midheaven: Placement | null,
  system: AstrologySystem,
  dasha: DashaInfo | null,
) {
  const get = (name: string) => placements.find((item) => item.name === name)!;
  const sun = get("Sun");
  const moon = get("Moon");
  const mercury = get("Mercury");
  const venus = get("Venus");
  const mars = get("Mars");
  const jupiter = get("Jupiter");
  const saturn = get("Saturn");
  const houseText = (placement: Placement) =>
    placement.house ? ` in house ${placement.house}` : "";
  const framework = system === "vedic" ? "Jyotisha" : "Western astrology";
  const sections: ReadingSection[] = [
    {
      title: "Core identity",
      eyebrow: "Your central pattern",
      body: `Your Sun in ${sun.sign} is traditionally read as ${signQualities[sun.signIndex]}. Growth comes as you ${signGrowth[sun.signIndex]}.`,
      evidence: `Sun ${formatPlacement(sun)}${houseText(sun)}`,
      practice: `Choose one action today that expresses ${sun.sign}'s strength without overusing it.`,
    },
    {
      title: "Emotional landscape",
      eyebrow: "What restores you",
      body: `In this tradition, the Moon in ${moon.sign} is interpreted as an inner life that may be ${signQualities[moon.signIndex]}. Treat this as a reflective prompt, not a fact about your personality.`,
      evidence: `Moon ${formatPlacement(moon)}${houseText(moon)}`,
      practice: `Name one feeling precisely, then ask what need sits beneath it.`,
    },
    {
      title: "Mind and communication",
      eyebrow: "How you process",
      body: `Mercury in ${mercury.sign} is traditionally interpreted as a mind that may be ${signQualities[mercury.signIndex]}. One reflective invitation is to ${signGrowth[mercury.signIndex]}.`,
      evidence: `Mercury ${formatPlacement(mercury)}${houseText(mercury)}${mercury.retrograde ? " · retrograde" : ""}`,
      practice: `Before one important message, write the point in a single honest sentence.`,
    },
    {
      title: "Relationships",
      eyebrow: "Connection and desire",
      body: `Traditionally, Venus in ${venus.sign} is associated with connection that feels ${signQualities[venus.signIndex]}, while Mars in ${mars.sign} is associated with pursuing needs in ways that are ${signQualities[mars.signIndex]}. Use the contrast as a question, not a verdict.`,
      evidence: `Venus ${formatPlacement(venus)}${houseText(venus)} · Mars ${formatPlacement(mars)}${houseText(mars)}`,
      practice: `Express one appreciation and one clear request without combining them into a test.`,
    },
    {
      title: "Purpose and growth",
      eyebrow: "Where life expands",
      body: `Jupiter in ${jupiter.sign} is traditionally associated with growth through qualities that are ${signQualities[jupiter.signIndex]}. ${midheaven ? `In modern Western practice, the Midheaven in ${midheaven.sign} can add a public-life reflection: ${signGrowth[midheaven.signIndex]}.` : "This reflection uses Jupiter’s placement rather than a fixed career prediction."}`,
      evidence: `Jupiter ${formatPlacement(jupiter)}${houseText(jupiter)}${midheaven ? ` · MC ${formatPlacement(midheaven)}` : ""}`,
      practice: `Give ten focused minutes to a skill that supports the contribution you want to make.`,
    },
    {
      title: "Discipline and maturity",
      eyebrow: "The long lesson",
      body: `Saturn in ${saturn.sign} is traditionally associated with learning how to ${signGrowth[saturn.signIndex]}. Progress here may feel slow, but consistency tends to matter more than intensity.`,
      evidence: `Saturn ${formatPlacement(saturn)}${houseText(saturn)}${saturn.retrograde ? " · retrograde" : ""}`,
      practice: `Reduce one intimidating responsibility to its smallest repeatable step.`,
    },
  ];
  if (ascendant) {
    sections.unshift({
      title: "How you meet life",
      eyebrow: "Ascendant",
      body: `A ${ascendant.sign} Ascendant is traditionally interpreted as meeting unfamiliar situations in ways that may be ${signQualities[ascendant.signIndex]}. Use this as a reflective lens, not a limit on who you can become.`,
      evidence: `Ascendant ${formatPlacement(ascendant)}`,
      practice: `Notice the first strategy you use in a new situation. Keep what helps; soften what closes you off.`,
    });
  }
  if (system === "vedic" && dasha) {
    sections.push({
      title: `${dasha.lord} mahadasha`,
      eyebrow: "Current timing cycle",
      body: `In the Vimshottari framework, your current major period is ruled by ${dasha.lord}, with a ${dasha.subLord} sub-period. This is best used as a lens for the kinds of lessons receiving emphasis, not as a guarantee of events.`,
      evidence: `${new Date(dasha.start).toLocaleDateString()} – ${new Date(dasha.end).toLocaleDateString()} · ${dasha.subLord} antardasha now`,
      practice: `Review which ${dasha.lord}-related themes are already active in your choices rather than waiting for a prediction.`,
    });
  }
  return sections.map((section) => ({ ...section, eyebrow: `${section.eyebrow} · ${framework}` }));
}

function formatPlacement(placement: Placement) {
  return `${placement.degree}°${String(placement.minute).padStart(2, "0")}′ ${placement.sign}`;
}

export function formatExactPlacement(placement: Placement) {
  return formatPlacement(placement);
}

export async function calculateChart(
  input: ChartInput,
  system: AstrologySystem,
): Promise<ChartResult> {
  const ephemeris = await getEphemeris();
  const { utc, offsetMinutes } = zonedBirthToUtc(input);
  const julianDay = ephemeris.dateToJulianDay(utc);
  const isVedic = system === "vedic";
  if (isVedic) ephemeris.setSiderealMode(SiderealMode.Lahiri);
  const flags =
    CalculationFlag.MoshierEphemeris |
    CalculationFlag.Speed |
    (isVedic ? CalculationFlag.Sidereal : 0);
  const ayanamsa = isVedic ? ephemeris.getAyanamsa(julianDay) : null;

  const raw: Array<{
    name: string;
    longitude: number;
    latitude: number;
    speed: number;
  }> = planetBodies.map(([name, body]) => {
    const position = ephemeris.calculatePosition(julianDay, body, flags);
    return {
      name,
      longitude: position.longitude,
      latitude: position.latitude,
      speed: position.longitudeSpeed,
    };
  });
  const nodePosition = ephemeris.calculatePosition(julianDay, LunarPoint.MeanNode, flags);
  raw.push({
    name: "Rahu",
    longitude: nodePosition.longitude,
    latitude: nodePosition.latitude,
    speed: nodePosition.longitudeSpeed,
  });
  raw.push({
    name: "Ketu",
    longitude: normalize(nodePosition.longitude + 180),
    latitude: -nodePosition.latitude,
    speed: nodePosition.longitudeSpeed,
  });

  const hasTimedHouses = input.timeAccuracy !== "unknown";
  let ascLongitude: number | null = null;
  let mcLongitude: number | null = null;
  let cusps: number[] = [];
  if (hasTimedHouses) {
    const selectedHouseSystem =
      system === "vedic" || input.houseSystem === "whole-sign"
        ? HouseSystem.WholeSign
        : HouseSystem.Placidus;
    const tropicalHouses = ephemeris.calculateHouses(
      julianDay,
      input.location.latitude,
      input.location.longitude,
      selectedHouseSystem,
    );
    ascLongitude = isVedic
      ? normalize(tropicalHouses.ascendant - (ayanamsa ?? 0))
      : tropicalHouses.ascendant;
    mcLongitude = isVedic
      ? normalize(tropicalHouses.mc - (ayanamsa ?? 0))
      : tropicalHouses.mc;
    if (isVedic || input.houseSystem === "whole-sign") {
      const first = Math.floor(ascLongitude / 30) * 30;
      cusps = Array.from({ length: 13 }, (_, index) =>
        index === 0 ? 0 : normalize(first + (index - 1) * 30),
      );
    } else {
      cusps = tropicalHouses.cusps;
    }
  }

  const placements = raw.map((item) => {
    const house =
      ascLongitude === null
        ? null
        : isVedic || input.houseSystem === "whole-sign"
          ? wholeSignHouse(item.longitude, ascLongitude)
          : cuspHouse(item.longitude, cusps);
    return makePlacement(item.name, item.longitude, item.latitude, item.speed, house);
  });
  const ascendant =
    ascLongitude === null ? null : makePlacement("Ascendant", ascLongitude, 0, 0, 1);
  const midheaven =
    mcLongitude === null ? null : makePlacement("Midheaven", mcLongitude, 0, 0, 10);
  const moon = placements.find((item) => item.name === "Moon")!;
  const sun = placements.find((item) => item.name === "Sun")!;
  const nakIndex = Math.floor(moon.longitude / (360 / 27));
  const nakshatra = isVedic
    ? {
        name: nakshatras[nakIndex],
        pada: Math.floor((moon.longitude % (360 / 27)) / (360 / 108)) + 1,
        lord: dashaSequence[nakIndex % 9][0],
      }
    : null;
  const dasha = isVedic ? dashaForMoon(moon.longitude, utc) : null;
  const phase = normalize(moon.longitude - sun.longitude);
  const tithiNumber = Math.floor(phase / 12) + 1;
  const paksha = tithiNumber <= 15 ? "Shukla" : "Krishna";
  const tithiWithin = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15;
  const panchanga = isVedic
    ? {
        tithi: `${paksha} ${tithiWithin}`,
        vara: varaNames[new Date(`${input.birthDate}T12:00:00Z`).getUTCDay()],
        yoga: yogaNames[Math.floor(normalize(sun.longitude + moon.longitude) / (360 / 27))],
      }
    : null;
  const readings = buildReadings(
    placements,
    ascendant,
    system === "western" ? midheaven : null,
    system,
    dasha,
  );

  const timingNote = isVedic
    ? dasha
      ? `You are in a ${dasha.lord} mahadasha, followed by ${dasha.nextLord}. Use this as a reflective timing lens rather than a fixed prediction.`
      : "An exact timing cycle could not be calculated."
    : `Current transits can be compared with this natal chart. The app emphasizes themes and choices rather than guaranteed events.`;

  return {
    system,
    calculatedAt: new Date().toISOString(),
    utcBirthTime: utc.toISOString(),
    timezoneOffset: offsetLabel(offsetMinutes),
    julianDay,
    engineVersion: ephemeris.version(),
    ayanamsa,
    ascendant,
    midheaven,
    cusps,
    placements,
    aspects: calculateAspects(placements),
    nakshatra,
    dasha,
    panchanga,
    readings,
    timingNote,
    settingsNote: isVedic
      ? `Sidereal zodiac · Lahiri ayanamsha · mean lunar node · whole-sign houses · Moshier ephemeris`
      : `${input.houseSystem === "placidus" ? "Placidus" : "Whole-sign"} houses · tropical zodiac · mean lunar node · Moshier ephemeris`,
  };
}
