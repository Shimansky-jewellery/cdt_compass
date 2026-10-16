import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Compass.css";

const FLOORS = [
  { id: 0, label: "Ground" },
  { id: 1, label: "Level 1" },
  { id: 2, label: "Level 2" },
];

const DESTINATION = {
  name: "Cape Town Diamond Museum",
  lat: -33.907129,
  lng: 18.4202843,
  floor: 1,
};

const ARRIVAL_RADIUS_M = 20;
const NEAR_RADIUS_M = 40;
const FLOOR_STORAGE_KEY = "ctdm-compass-floor";

function isFloorId(value) {
  return FLOORS.some((floor) => floor.id === value);
}

function readSavedFloor() {
  try {
    const savedFloor = window.localStorage.getItem(FLOOR_STORAGE_KEY);
    if (savedFloor === null) return null;
    const floorId = Number(savedFloor);
    return isFloorId(floorId) ? floorId : null;
  } catch {
    return null;
  }
}

const toRad = (degrees) => (degrees * Math.PI) / 180;
const toDeg = (radians) => (radians * 180) / Math.PI;

function FloorArrow({ direction }) {
  const pointsUp = direction === "up";

  return (
    <svg
      className="floorArrowIcon"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      {pointsUp ? (
        <path d="M8 14V3M3.5 7.5 8 3l4.5 4.5" />
      ) : (
        <path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" />
      )}
    </svg>
  );
}

function getBearing(from, to) {
  const latitudeFrom = toRad(from.lat);
  const latitudeTo = toRad(to.lat);
  const longitudeDifference = toRad(to.lng - from.lng);
  const y = Math.sin(longitudeDifference) * Math.cos(latitudeTo);
  const x =
    Math.cos(latitudeFrom) * Math.sin(latitudeTo) -
    Math.sin(latitudeFrom) *
      Math.cos(latitudeTo) *
      Math.cos(longitudeDifference);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function getDistance(from, to) {
  const earthRadius = 6371000;
  const latitudeDifference = toRad(to.lat - from.lat);
  const longitudeDifference = toRad(to.lng - from.lng);
  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(longitudeDifference / 2) ** 2;
  return (
    2 *
    earthRadius *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

function formatDistance(metres) {
  return metres < 1000
    ? `${Math.round(metres)} m`
    : `${(metres / 1000).toFixed(1)} km`;
}

export default function Compass() {
  const [searchParams] = useSearchParams();
  const floorParam = searchParams.get("floor");
  const requestedFloor =
    FLOORS.find((floor) => String(floor.id) === floorParam)?.id ?? null;
  const [started, setStarted] = useState(false);
  const [position, setPosition] = useState(null);
  const [heading, setHeading] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState("");
  const [userFloor, setUserFloor] = useState(
    () => requestedFloor ?? readSavedFloor()
  );
  const lastRotation = useRef(0);

  useEffect(() => {
    if (userFloor === null) return;
    try {
      window.localStorage.setItem(FLOOR_STORAGE_KEY, String(userFloor));
    } catch {
      // Keep floor selection usable when browser storage is unavailable.
    }
  }, [userFloor]);

  const start = async () => {
    setError("");
    try {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        const result = await DeviceOrientationEvent.requestPermission();
        if (result !== "granted") {
          setError("Compass permission was denied.");
          return;
        }
      }
      setStarted(true);
    } catch (cause) {
      setError(cause.message || "Could not start the compass.");
    }
  };

  useEffect(() => {
    if (!started || !("geolocation" in navigator)) return;

    const id = navigator.geolocation.watchPosition(
      (currentPosition) =>
        setPosition({
          lat: currentPosition.coords.latitude,
          lng: currentPosition.coords.longitude,
          accuracy: currentPosition.coords.accuracy,
        }),
      (locationError) => setError(`Location error: ${locationError.message}`),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const handleOrientation = (event) => {
      let currentHeading = null;
      if (typeof event.webkitCompassHeading === "number") {
        currentHeading = event.webkitCompassHeading;
      } else if (event.absolute && event.alpha != null) {
        currentHeading = 360 - event.alpha;
      }
      if (currentHeading != null) setHeading(currentHeading);
    };

    const eventName =
      "ondeviceorientationabsolute" in window
        ? "deviceorientationabsolute"
        : "deviceorientation";

    window.addEventListener(eventName, handleOrientation, true);
    return () => window.removeEventListener(eventName, handleOrientation, true);
  }, [started]);

  useEffect(() => {
    if (!position || heading == null) return;
    const target = getBearing(position, DESTINATION) - heading;
    const current = lastRotation.current;
    const delta = ((((target - current) % 360) + 540) % 360) - 180;
    const next = current + delta;
    lastRotation.current = next;
    setRotation(next);
  }, [position, heading]);

  const distance = position ? getDistance(position, DESTINATION) : null;
  const floorDifference =
    userFloor === null ? null : DESTINATION.floor - userFloor;
  const onDestinationFloor =
    userFloor === null || floorDifference === 0;
  const arrived =
    distance != null &&
    distance <= ARRIVAL_RADIUS_M &&
    onDestinationFloor;
  const wrongFloor = floorDifference !== null && floorDifference !== 0;
  const nearWrongFloor =
    distance != null && distance <= NEAR_RADIUS_M && wrongFloor;
  const atEntranceWrongFloor =
    distance != null && distance <= ARRIVAL_RADIUS_M && wrongFloor;
  const destinationFloorLabel = FLOORS.find(
    (floor) => floor.id === DESTINATION.floor
  )?.label;
  const locationUnsupported = started && !("geolocation" in navigator);

  let floorMessage = "Select your floor for directions inside the building";
  let floorDirection = null;
  if (floorDifference === 0) {
    floorMessage = "You're on the right floor";
  } else if (floorDifference !== null) {
    const floorCount = Math.abs(floorDifference);
    floorDirection = floorDifference > 0 ? "up" : "down";
    floorMessage = `Go ${floorDirection} ${floorCount} ${
      floorCount === 1 ? "floor" : "floors"
    }`;
  }

  let closeFloorMessage = "";
  if (nearWrongFloor) {
    const floorCount = Math.abs(floorDifference);
    const plural = floorCount === 1 ? "floor" : "floors";
    if (atEntranceWrongFloor) {
      const position = floorDifference > 0 ? "below" : "above";
      closeFloorMessage = `You're right ${position} the museum — go ${floorDirection} ${floorCount} ${plural}`;
    } else {
      closeFloorMessage = `You're nearly there — go ${floorDirection} ${floorCount} ${plural} to ${destinationFloorLabel}`;
    }
  }

  return (
    <main className="compassPage">
      <header className="compassHeader">
        <p className="compassLabel">Heading to</p>
        <h1>{DESTINATION.name}</h1>
      </header>

      {locationUnsupported ? (
        <p className="compassError">This browser doesn&apos;t support location.</p>
      ) : !started ? (
        <button className="compassStart" onClick={start}>
          Start compass
        </button>
      ) : arrived ? (
        <div className="compassArrived">You&apos;ve arrived 🎉</div>
      ) : (
        <>
          {nearWrongFloor && (
            <p className="compassFloorPriority" role="status">
              <FloorArrow direction={floorDirection} />
              {closeFloorMessage}
            </p>
          )}
          <div className="compassDial">
            <svg
              className="compassArrow"
              viewBox="0 0 100 100"
              style={{ transform: `rotate(${rotation}deg)` }}
              aria-label="Direction to destination"
            >
              <polygon points="50,6 78,82 50,66 22,82" />
            </svg>
          </div>

          <div className="compassReadout">
            {distance != null ? (
              <p className="compassDistance">{formatDistance(distance)}</p>
            ) : (
              <p className="compassStatus">Finding your location…</p>
            )}
            {position && heading == null && (
              <p className="compassStatus">
                Waiting for compass… (desktop browsers don&apos;t have one)
              </p>
            )}
            {position && (
              <p className="compassAccuracy">
                GPS accuracy ±{Math.round(position.accuracy)} m
              </p>
            )}
          </div>
        </>
      )}

      <section className="floorGuidance" aria-label="Floor guidance">
        <h2>Which floor are you on?</h2>
        <div className="floorOptions" role="group" aria-label="Select your floor">
          {FLOORS.map((floor) => (
            <button
              className={`floorOption${userFloor === floor.id ? " floorOption--selected" : ""}`}
              key={floor.id}
              type="button"
              aria-pressed={userFloor === floor.id}
              onClick={() => setUserFloor(floor.id)}
            >
              {floor.label}
            </button>
          ))}
        </div>
        {!nearWrongFloor && (
          <p className="floorMessage" role="status">
            {floorDirection && <FloorArrow direction={floorDirection} />}
            {floorMessage}
          </p>
        )}
      </section>

      {error && <p className="compassError">{error}</p>}
      <p className="compassHint">Hold your phone flat and upright (portrait).</p>
    </main>
  );
}
