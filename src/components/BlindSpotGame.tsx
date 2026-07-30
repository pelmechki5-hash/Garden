import { useEffect, useRef, useState } from 'react';
import { BlindSpotEngine } from '../game/BlindSpotEngine';

export function BlindSpotGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BlindSpotEngine>();
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [change, setChange] = useState('Пространство стабильно');

  useEffect(() => {
    if (!mountRef.current) return;
    const engine = new BlindSpotEngine(mountRef.current, setChange, setPaused);
    engineRef.current = engine;
    return () => engine.destroy();
  }, []);

  const enter = () => {
    setStarted(true);
    setPaused(false);
    engineRef.current?.start();
  };

  return (
    <section className="blind-spot__viewport" ref={mountRef}>
      <div className="blind-spot__grain" />
      <div className="blind-spot__crosshair" />
      <div className="blind-spot__status">
        <span>{change}</span>
        <i>Найдите выход</i>
      </div>

      {!started && (
        <div className="blind-spot__intro">
          <p>ПРОТОКОЛ НАБЛЮДЕНИЯ 04</p>
          <h1>Не всё остаётся<br />на своём месте.</h1>
          <button onClick={enter}>Проснуться</button>
          <small>WASD — движение · мышь — взгляд · ESC — пауза</small>
        </div>
      )}

      {started && paused && (
        <div className="blind-spot__pause">
          <p>НАБЛЮДЕНИЕ ПРЕРВАНО</p>
          <button onClick={enter}>Продолжить</button>
        </div>
      )}
    </section>
  );
}
