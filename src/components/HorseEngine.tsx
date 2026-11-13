import React, { useState } from 'react';
import './HorseEngine.css';
import { QuineCodeBlock } from './QuineCodeBlock';
import HorseEngineRaw from './HorseEngine.tsx?raw';

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
  "Do you graze in the server farm?",
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
  "Are you truly, deeply, a virtual horse?",
];

const ARCHETYPES = [
  {
    name: 'The Unprovisioned Foal',
    desc: 'Zero uptime, zero network interfaces, still waiting on `terraform apply` to grow legs.',
  },
  {
    name: 'The RFC 1149 Carrier Shetty',
    desc: 'Tiny Shetland pony strapped to a homing pigeon. High packet loss in crosswinds, but strictly IETF-compliant.',
  },
  {
    name: 'The Loopback Burro',
    desc: 'Stubbornly refuses to leave 127.0.0.1. There is no place like home because there is no default gateway.',
  },
  {
    name: 'The Cold-Start Clydesdale',
    desc: 'Massive 2,000-pound draft horse that takes 14 seconds to wake up whenever Cloud Run scales to zero.',
  },
  {
    name: 'The Legacy Pony',
    desc: 'Small, old, written in ANSI MUMPS in 1983, and somehow still load-bearing for 40% of North American healthcare.',
  },
  {
    name: 'The Split-Brain Appaloosa',
    desc: 'Spotted coat caused by an etcd quorum failure; half of you thinks it is leader, the other half is fencing the barn.',
  },
  {
    name: 'The Virtual Gelding',
    desc: 'Reliable, predictable, and completely sterilized of all side effects and state mutations.',
  },
  {
    name: 'The Tritone-Substitution Trotter',
    desc: 'Resolves dominant seventh dressage cadences down by a chromatic semitone. Stephen Sondheim’s favorite steed.',
  },
  {
    name: 'The BGP-Flapping Filly',
    desc: 'Announces and withdraws routes to the pasture 4,000 times a minute until AS666 dampens your oats.',
  },
  {
    name: 'The Just-Intonation Paso Fino',
    desc: 'Trots exclusively in 11-limit septimal comma ratios. Refuses to share a paddock with equal-tempered keyboards.',
  },
  {
    name: 'The Ghost Mare',
    desc: 'You only appear in /var/log/syslog at 03:14 UTC during leap seconds. A true phantom of the data-link layer.',
  },
  {
    name: 'The Idempotent Arabian',
    desc: 'Feed you one carrot or ten thousand carrots—the resulting state of the stable is mathematically identical.',
  },
  {
    name: 'The Zero-Trust Zebra',
    desc: 'Technically an equid, spiritually a hardware security module. Demands a FIDO2 biometric tap before every sugar cube.',
  },
  {
    name: 'The YottaDB Yearling',
    desc: 'Stores every hoofprint directly in a lockless hierarchical ^GLOBAL tree with sub-millisecond equine persistence.',
  },
  {
    name: 'The Chaos-Monkey Mule',
    desc: 'Half donkey, half PagerDuty alert. Kicks a random production network endpoint group offline every Friday at 4:55 PM.',
  },
  {
    name: 'The Ephemeral Lipizzaner',
    desc: 'Trained in classical Viennese dressage entirely inside a tmpfs RAM disk. Vanishes into thin air on SIGTERM.',
  },
  {
    name: 'The Byzantine Generals’ Bronco',
    desc: 'Requires 3f + 1 other horses in the herd to reach consensus on whether the barn door is open before galloping.',
  },
  {
    name: 'The Ether Mustang',
    desc: 'Wild, unmanaged, and capable of jumping any /24 subnet fence without a NAT gateway.',
  },
  {
    name: 'The Cilium eBPF Centaur',
    desc: 'Upper half site reliability engineer, lower half kernel-space packet filter. Drops unauthorized riders at XDP line rate.',
  },
  {
    name: 'The $HOROLOG Hackney',
    desc: 'Measures every lap in days since December 31, 1840 and seconds since midnight, just as James Poitras intended.',
  },
  {
    name: 'The Cloud Stallion',
    desc: 'A majestic multi-region creature that thrives in active-active high-availability clusters with 0.00% urine content.',
  },
  {
    name: 'The Kleene Quine Quarter-Horse',
    desc: 'Every time you neigh, you emit your own complete TypeScript source code and a verified 35-round SHA257SUM.',
  },
  {
    name: 'The Sondheim Patter-Song Palomino',
    desc: 'Gallops in additive 12/8 meter while internal-rhyming "Intersystems IRIS" with "papyrus" and "Osiris" at 180 BPM.',
  },
  {
    name: 'The Quantum-Entangled Shire',
    desc: 'Simultaneously grazing in us-central1 and europe-west4 until a Grafana dashboard poll collapses your wavefunction.',
  },
  {
    name: 'The Slop Thoroughbred',
    desc: 'Purebred excellence in recursive cellular automata and zero-downtime Cloudflare Worker KV state mutations.',
  },
  {
    name: 'The Omniscient Equus Singularity',
    desc: 'Perfect 25/25. You have transcended the pasture, the hypervisor, and the OSI model itself. All packets are hay.',
  },
];

export const HorseEngine: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (val: number) => {
    setScore(score + val);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(QUESTIONS.length);
    }
  };

  const getArchetype = () => {
    const idx = Math.max(0, Math.min(ARCHETYPES.length - 1, score));
    return ARCHETYPES[idx];
  };

  const currentArchetype = getArchetype();

  const equineSnippet = `// live_equine_state: step=${step}/${QUESTIONS.length} | score=${score}/${QUESTIONS.length}
// current_projection="${currentArchetype.name}" | urinePurity=100%
export interface EquineArchetype {
  name: string;
  desc: string;
}

export function classifyEquineByScore(score: number, archetypes: EquineArchetype[]): EquineArchetype {
  const clampedScore = Math.max(0, Math.min(archetypes.length - 1, score));
  return archetypes[clampedScore];
}`;

  return (
    <div className="horse-engine panel">
      <div className="panel-header bg-darker">
        <span>🐴 EQUINE CATEGORIZATION ENGINE v2000 (100% URINE FREE)</span>
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      </div>
      <div className="panel-content horse-body">
        {step < QUESTIONS.length ? (
          <>
            <div className="question-counter">
              Question {step + 1}/{QUESTIONS.length}
            </div>
            <div className="question-text">{QUESTIONS[step]}</div>
            <div className="answer-btns">
              <button onClick={() => handleAnswer(1)} className="action-btn">
                YES (1)
              </button>
              <button onClick={() => handleAnswer(0)} className="action-btn">
                NO (0)
              </button>
            </div>
          </>
        ) : (
          <div className="result-area">
            <h3>ANALYSIS COMPLETE</h3>
            <div className="archetype-name">{currentArchetype.name}</div>
            <p className="archetype-desc">{currentArchetype.desc}</p>
            <div className="stats-block">
              <div>Purity: 100% Urine-Free</div>
              <div>
                Equine Score: {score}/{QUESTIONS.length} ({score * 4}% Stable)
              </div>
              <div>Recursion Level: DEEP</div>
            </div>
            <button onClick={onClose} className="action-btn mt-4">
              DISMISS (STAY VIRTUAL)
            </button>
          </div>
        )}

        <QuineCodeBlock
          summary={
            <>
              how_does_this_equine_
              <br />
              engine_work.ts
            </>
          }
          snippet={equineSnippet}
          rawSource={HorseEngineRaw}
          rawFilename="src/components/HorseEngine.tsx"
          color="#ffa500"
        />
      </div>
    </div>
  );
};
