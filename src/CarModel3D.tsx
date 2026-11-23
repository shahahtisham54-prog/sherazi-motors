type Props = { lightsOn: boolean; rotating: boolean };

// Stable CSS vehicle preview while the WebGL renderer is isolated.
// The deployed crash originates inside this component's WebGL lifecycle;
// keeping the visual preview avoids taking down the entire React page.
export function CarModel3D({ lightsOn, rotating }: Props) {
  return (
    <div
      className={`car-3d-canvas ${lightsOn ? 'lights-on' : 'lights-off'} ${rotating ? 'is-rotating' : ''}`}
      role="img"
      aria-label="Silver sports coupe visual preview."
    >
      <div className="car-model-fallback" role="img" aria-label="Silver sports coupe visual preview.">
        <div className="car-model">
          <div className="car-shadow" />
          <div className="car-body" />
          <div className="car-hood" />
          <div className="car-roof" />
          <div className="car-window window-front" />
          <div className="car-window window-rear" />
          <div className="car-grille" />
          <div className="car-headlight headlight-left" />
          <div className="car-headlight" />
          <div className="car-wheel wheel-front"><i /></div>
          <div className="car-wheel wheel-rear"><i /></div>
          <div className="car-reflection" />
        </div>
        <span className="car-model-fallback-note">SHERAZI MOTORS · DESIGN PREVIEW</span>
      </div>
    </div>
  );
}
