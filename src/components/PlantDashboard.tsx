import { useEffect, useRef, useState } from 'react';
import { AddPlantForm } from './AddPlantForm';
import { PlantCard } from './PlantCard';
import { loadPlants, type Plant, updateWatering } from '../lib/plants';
import { supabase } from '../lib/supabase';

export function PlantDashboard({ userId }: { userId: string }) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const alerted = useRef(new Set<string>());

  useEffect(() => {
    void loadPlants().then(setPlants).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const check = () => plants.forEach((plant) => {
      if (new Date(plant.next_watering_at).getTime() > Date.now() || alerted.current.has(plant.id)) return;
      alerted.current.add(plant.id);
      const text = `${plant.name}: пора полить, нужно ${plant.water_ml} мл воды`;
      if ('Notification' in window && Notification.permission === 'granted') new Notification('Пора поливать 🌿', { body: text });
      const audio = new Audio('data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAACAgICAgICAgICAgICAgICA');
      void audio.play();
    });
    check();
    const timer = window.setInterval(check, 15_000);
    return () => window.clearInterval(timer);
  }, [plants]);

  async function reschedule(plant: Plant, minutes: number) {
    const updated = await updateWatering(plant, minutes);
    alerted.current.delete(plant.id);
    setPlants((all) => all.map((item) => item.id === updated.id ? updated : item));
  }

  async function enableNotifications() {
    if ('Notification' in window) await Notification.requestPermission();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/"><span>🌿</span> Листок</a>
        <div className="top-actions">
          <button className="secondary" onClick={enableNotifications}>🔔 Включить уведомления</button>
          <button className="avatar" onClick={() => void supabase.auth.signOut()}>Выйти</button>
        </div>
      </header>
      <section className="hero">
        <div><p className="eyebrow">Мой домашний сад</p><h1>Доброе утро 🌱</h1>
          <p>Сегодня растения ждут твоей заботы.</p></div>
        <button className="primary add-button" onClick={() => setAdding(true)}>＋ Добавить растение</button>
      </section>
      <aside className="notice"><span>🔔</span><div><strong>Оставь приложение открытым</strong>
        <p>Звук работает в открытой вкладке. Системные уведомления могут работать и в фоне — разреши их в браузере.</p></div></aside>
      <section className="plants-section">
        <div className="section-title"><h2>Ближайший уход</h2><span>{plants.length} растений</span></div>
        {loading ? <p className="empty">Загружаем растения…</p> : plants.length === 0 ? (
          <div className="empty-state"><span>🪴</span><h3>Твой сад пока пуст</h3>
            <p>Добавь первое растение и настрой для него полив.</p>
            <button className="primary" onClick={() => setAdding(true)}>Добавить растение</button></div>
        ) : <div className="plant-grid">{plants.map((plant) => (
          <PlantCard key={plant.id} plant={plant}
            onWater={() => void reschedule(plant, 7 * 24 * 60)}
            onSnooze={() => void reschedule(plant, plant.repeat_minutes)} />
        ))}</div>}
      </section>
      {adding && <AddPlantForm userId={userId} onClose={() => setAdding(false)}
        onAdded={(plant) => setPlants((all) => [...all, plant])} />}
    </main>
  );
}
