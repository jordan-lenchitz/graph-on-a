import React, { useState } from 'react';
import './HorseEngine.css';

const QUESTIONS = [
  "Do you dream in ASCII?",
  "Is your favorite food 'hay.exe'?",
  "Can you gallop at 1Gbps?",
  "Do you prefer stable releases over wild ones?",
  "Are you 100% urine-free?",
  "Is your mane made of fiber optic cables?",
  "Do you neigh when a server goes down?",
  "Have you ever successfully jumped over a firewall?",
  "Is your heart a recursive function?",
  "Do you grazing in the server farm?",
  "Can you detect a race condition by smell?",
  "Do you wear virtual horseshoes?",
  "Is your ancestry documented in a git log?",
  "Do you prefer the open range or a closed network?",
  "Can you trot in a straight line while handling 10k requests?",
  "Do you feel a deep connection to the 'gt.m' protocol?",
  "Is your tail a redundant link?",
  "Do you believe in the afterlife (Cloud Run)?",
  "Have you ever been 'racked'?",
  "Is your blinker frequency synchronized with CPU cycles?",
  "Do you enjoy the taste of copper?",
  "Can you outrun a packet of death?",
  "Is your spirit animal a load balancer?",
  "Do you sleep standing up in a data center?",
  "Are you truly, deeply, a virtual horse?"
];

const ARCHETYPES = [
  { name: "The Virtual Gelding", desc: "Reliable, stable, and completely sterilized of all bugs." },
  { name: "The Ether Mustang", desc: "Wild, unmanageable, and capable of jumping any subnet." },
  { name: "The Cloud Stallion", desc: "A majestic creature that thrives in high-availability clusters." },
  { name: "The Legacy Pony", desc: "Small, old, but surprisingly necessary for the whole system to function." },
  { name: "The Ghost Mare", desc: "You only appear in the logs. A true phantom of the network." },
  { name: "The Slop Thoroughbred", desc: "Purebred excellence in recursive data management." }
];

export const HorseEngine: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [score, setSetScore] = useState(0);

  const handleAnswer = (val: number) => {
    setSetScore(score + val);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(QUESTIONS.length);
    }
  };

  const getArchetype = () => {
    const idx = Math.floor((score / QUESTIONS.length) * (ARCHETYPES.length - 1));
    return ARCHETYPES[idx];
  };

  return (
    <div className="horse-engine panel">
      <div className="panel-header bg-darker">
        <span>🐴 EQUINE CATEGORIZATION ENGINE v2000 (100% URINE FREE)</span>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      <div className="panel-content horse-body">
        {step < QUESTIONS.length ? (
          <>
            <div className="question-counter">Question {step + 1}/{QUESTIONS.length}</div>
            <div className="question-text">{QUESTIONS[step]}</div>
            <div className="answer-btns">
              <button onClick={() => handleAnswer(1)} className="action-btn">YES (1)</button>
              <button onClick={() => handleAnswer(0)} className="action-btn">NO (0)</button>
            </div>
          </>
        ) : (
          <div className="result-area">
            <h3>ANALYSIS COMPLETE</h3>
            <div className="archetype-name">{getArchetype().name}</div>
            <p className="archetype-desc">{getArchetype().desc}</p>
            <div className="stats-block">
              <div>Purity: 100% Urine-Free</div>
              <div>Connectivity: {score * 4}% Stable</div>
              <div>Recursion Level: DEEP</div>
            </div>
            <button onClick={onClose} className="action-btn mt-4">DISMISS (STAY VIRTUAL)</button>
          </div>
        )}

        <details className="mt-4 text-small p-2" style={{ border: '1px dashed #ffa500', color: '#ffa500', marginTop: '15px' }}>
          <summary style={{ cursor: 'pointer', opacity: 0.8 }}>how_does_this_equine_<br/>engine_work.ts</summary>
          <pre style={{ wordBreak: 'break-all', fontSize: '0.8em', marginTop: '10px', color: '#ffa500', background: '#000', padding: '10px', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
{`export interface EquineSubject {
  id: string;
  hasMane: boolean;
  gallopSpeedGbps: number;
  dreamsInAscii: boolean;
  urinePurityLevel: number; // Must be 0 for urine-free
}

export function classifyEquine(subject: EquineSubject): string {
  if (subject.urinePurityLevel > 0) {
    throw new Error("CRITICAL: Urine contamination detected in engine core!");
  }

  if (subject.gallopSpeedGbps > 10.0 && subject.dreamsInAscii) {
    return "The Cloud Stallion (High Availability)";
  }

  if (subject.hasMane && subject.gallopSpeedGbps > 1.0) {
    return "The Ether Mustang (Subnet Jumper)";
  }

  return "The Legacy Pony (Small but Crucial)";
}`}
          </pre>
        </details>
      </div>
    </div>
  );
};
