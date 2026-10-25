import { useId, type ReactNode } from 'react';
import {
  ScanLine,
  ListChecks,
  Store,
  ShoppingCart,
  Package,
  Monitor,
  Video,
  CalendarDays,
  Cloud,
  Database,
  ShieldCheck,
  KeyRound,
  AppWindow,
  Users,
  Inbox,
  ClipboardCheck,
  CircleCheck,
  Pause,
  Play,
} from 'lucide-react';
import type { Locale } from '@tevoniq/types';
import { illustrationCopy, type SolutionScene } from '@/config/solution-illustrations';
import './solution-illustration.css';

function Panel({
  x,
  y,
  width = 146,
  height = 144,
  children,
  accent = false,
}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  children?: ReactNode;
  accent?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        width={width}
        height={height}
        rx="17"
        className={accent ? 'illustration-panel illustration-panel--accent' : 'illustration-panel'}
      />
      <path d={`M18 1 H${width - 18}`} className="illustration-panel-edge" />
      {children}
    </g>
  );
}
function Flow({ d, reverse = false }: { d: string; reverse?: boolean }) {
  return (
    <g>
      <path d={d} className="illustration-flow-base" />
      <path d={d} className={`illustration-flow${reverse ? ' illustration-flow--reverse' : ''}`} />
    </g>
  );
}
function Check({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="13" className="illustration-check-circle" />
      <path
        d="m-6 0 4 4 8-9"
        pathLength="1"
        className="illustration-draw-check"
        style={{ animationDelay: `${delay}s` }}
      />
    </g>
  );
}
function Person({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="25" className="illustration-avatar" />
      <circle cy="-5" r="7" fill="#a1d8ff" />
      <path d="M-13 15c1-15 25-15 26 0" fill="#699ed7" />
    </g>
  );
}
function Rack({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 31, 62].map((offset) => (
        <g key={offset} transform={`translate(0 ${offset})`}>
          <rect width="92" height="23" rx="5" className="illustration-device" />
          <path d="M13 9h35M13 14h26" stroke="#5d83b4" strokeWidth="2" />
          <circle
            cx="76"
            cy="11"
            r="3"
            className="illustration-status"
            style={{ animationDelay: `${offset / 30}s` }}
          />
        </g>
      ))}
    </g>
  );
}
function Paper({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M0 8a8 8 0 0 1 8-8h40l18 18v64a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8Z"
        className="illustration-paper"
      />
      <path
        d="M48 0v18h18M13 32h39M13 44h33M13 56h39M13 68h24"
        fill="none"
        stroke="#83b9ee"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="13" y="13" width="18" height="7" rx="2" fill="#d8b57a" />
    </g>
  );
}

function Scene({ scene }: { scene: SolutionScene }) {
  if (scene === 'documents')
    return (
      <>
        <Flow d="M216 165H281M435 165H499" />
        <Panel x={70} y={98}>
          <g className="illustration-paper-float">
            <Paper x={35} y={26} />
            <Paper x={47} y={16} />
          </g>
        </Panel>
        <Panel x={283} y={67} width={152} height={192} accent>
          <ScanLine x={55} y={18} size={42} />
          <rect x="24" y="78" width="104" height="76" rx="8" className="illustration-device" />
          <path
            d="M40 96h70M40 113h54M40 130h65"
            stroke="#82b9ed"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M15 81h122" className="illustration-scanner" />
        </Panel>
        <Panel x={500} y={98}>
          <ListChecks x={53} y={16} size={35} />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(17 ${66 + i * 23})`}>
              <path d="M0 0h74" stroke="#6e9fcf" strokeWidth="5" strokeLinecap="round" />
              <Check x={101} y={0} delay={i * 0.8} />
            </g>
          ))}
        </Panel>
      </>
    );
  if (scene === 'retail')
    return (
      <>
        <Flow d="M215 169H285M435 169H502M575 242V270H145V242" />
        <Panel x={70} y={96}>
          <Store x={49} y={15} size={49} />
          <rect x="24" y="70" width="97" height="45" rx="5" className="illustration-device" />
          <path
            d="M37 82h25v22H37ZM76 82h30v6H76ZM76 97h20"
            fill="none"
            stroke="#8dc5f5"
            strokeWidth="3"
          />
          <circle cx="73" cy="128" r="4" fill="#d9b579" />
        </Panel>
        <Panel x={285} y={73} width={150} height={186} accent>
          <ShoppingCart x={51} y={15} size={46} />
          <rect x="23" y="77" width="104" height="66" rx="9" className="illustration-device" />
          <path
            d="M36 94h54M36 107h39M36 120h64"
            stroke="#7bafe0"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Check x={119} y={149} />
        </Panel>
        <Panel x={502} y={96}>
          <Package x={52} y={14} size={42} />
          {(
            [
              [23, 75],
              [74, 75],
              [49, 105],
            ] as const
          ).map(([x, y], i) => (
            <g key={i} className="illustration-stock" style={{ animationDelay: `${i * 0.65}s` }}>
              <rect x={x} y={y} width="44" height="28" rx="4" fill="#254d7b" stroke="#7dc8f2" />
              <path d={`M${x + 22} ${y}v10`} stroke="#d9b579" strokeWidth="4" />
            </g>
          ))}
        </Panel>
      </>
    );
  if (scene === 'workplace')
    return (
      <>
        <Flow d="M215 157H286M433 157H501M360 222V275H145V240" />
        <Panel x={70} y={89} height={157}>
          <Monitor x={45} y={13} size={55} />
          <rect x="27" y="96" width="94" height="26" rx="13" fill="#38618b" stroke="#85bdee" />
          <circle cx="33" cy="83" r="9" fill="#d9b579" />
          <circle cx="73" cy="78" r="9" fill="#8fd7f8" />
          <circle cx="113" cy="83" r="9" fill="#8fd7f8" />
          <path d="M18 134h112" stroke="#719bc4" strokeWidth="3" />
        </Panel>
        <g className="illustration-hub">
          <circle cx="360" cy="158" r="68" className="illustration-hub-halo" />
          <circle cx="360" cy="158" r="53" className="illustration-core" />
          <Users x={334} y={132} size={52} />
        </g>
        <Panel x={501} y={89} height={157}>
          <Video x={56} y={15} size={35} />
          <Person x={43} y={89} />
          <Person x={105} y={89} />
          <path d="M27 134h92" stroke="#70a6d9" strokeWidth="4" strokeLinecap="round" />
        </Panel>
        <g transform="translate(319 248)">
          <rect width="82" height="43" rx="10" className="illustration-panel" />
          <CalendarDays x={10} y={9} size={25} />
          <Check x={63} y={22} />
        </g>
      </>
    );
  if (scene === 'cloud')
    return (
      <>
        <Flow d="M214 159H282M437 159H502M573 243V270H144V243" />
        <Flow d="M502 183H437M282 183H214" reverse />
        <Panel x={69} y={90} height={155}>
          <Rack x={27} y={32} />
        </Panel>
        <g className="illustration-cloud-float">
          <path
            d="M312 181c-44-1-42-63-2-64 9-57 91-54 100 0 44-2 47 63 4 64Z"
            className="illustration-cloud"
          />
          <Cloud x={330} y={128} size={59} />
          <path d="M320 198h80" stroke="#59baf0" strokeWidth="3" strokeLinecap="round" />
        </g>
        <Panel x={502} y={90} height={155}>
          <Database x={50} y={20} size={49} />
          <path d="M33 98h79M33 115h60" stroke="#6da3d3" strokeWidth="4" strokeLinecap="round" />
          <Check x={119} y={123} />
        </Panel>
        <g transform="translate(330 249)">
          <rect width="60" height="42" rx="10" className="illustration-panel" />
          <ShieldCheck x={15} y={6} size={30} />
        </g>
      </>
    );
  if (scene === 'access')
    return (
      <>
        <Flow d="M216 163H293M427 163H502" />
        <Panel x={70} y={89} height={161}>
          <Person x={73} y={54} />
          <rect x="31" y="97" width="84" height="38" rx="6" className="illustration-device" />
          <path d="M45 110h55M45 123h32" stroke="#83b9ee" strokeWidth="3" strokeLinecap="round" />
          <circle cx="110" cy="57" r="5" className="illustration-status" />
        </Panel>
        <circle cx="360" cy="165" r="82" className="illustration-policy-ring" />
        <path
          d="m360 78 65 25v61c0 39-33 72-65 87-32-15-65-48-65-87v-61Z"
          className="illustration-shield"
        />
        <KeyRound x={333} y={131} size={54} />
        <Check x={360} y={213} />
        <Panel x={502} y={89} height={161}>
          {[
            [20, 26],
            [81, 26],
            [20, 88],
            [81, 88],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <rect width="45" height="45" rx="9" className="illustration-device" />
              <AppWindow x={10} y={10} size={25} />
              <circle
                cx="39"
                cy="39"
                r="4"
                className="illustration-status"
                style={{ animationDelay: `${i * 0.6}s` }}
              />
            </g>
          ))}
        </Panel>
      </>
    );
  return (
    <>
      <Flow d="M215 161H282M437 161H502M575 243V275H145V243" />
      <Panel x={70} y={89} height={160}>
        <Inbox x={51} y={17} size={44} />
        {[0, 1, 2].map((i) => (
          <g key={i} className="illustration-request" style={{ animationDelay: `${i * 0.8}s` }}>
            <rect
              x="24"
              y={78 + i * 23}
              width="98"
              height="16"
              rx="4"
              className="illustration-device"
            />
            <path d={`M35 ${86 + i * 23}h58`} stroke="#79aedc" strokeWidth="3" />
          </g>
        ))}
      </Panel>
      <Panel x={282} y={66} width={155} height={193} accent>
        <ClipboardCheck x={56} y={15} size={44} />
        <path d="M76 78v88" stroke="#496c96" strokeDasharray="4 5" />
        {[0, 1, 2].map((i) => (
          <g key={i} className="illustration-approval" style={{ animationDelay: `${i * 0.8}s` }}>
            <rect
              x={i === 1 ? 84 : 17}
              y={82 + i * 27}
              width="53"
              height="19"
              rx="4"
              fill={i === 1 ? '#315c88' : '#24446e'}
              stroke="#78bce8"
            />
            <path d={`M${i === 1 ? 94 : 27} ${92 + i * 27}h31`} stroke="#a4d8f4" strokeWidth="3" />
          </g>
        ))}
      </Panel>
      <Panel x={502} y={89} height={160}>
        <CircleCheck x={51} y={15} size={45} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <path
              d={`M26 ${89 + i * 22}h67`}
              stroke="#79aedc"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <Check x={116} y={88 + i * 22} delay={i * 0.7} />
          </g>
        ))}
      </Panel>
    </>
  );
}

export function SolutionIllustration({
  scene,
  locale,
  hero = false,
  animated = true,
}: {
  scene: SolutionScene;
  locale: Locale;
  hero?: boolean;
  animated?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const copy = illustrationCopy[locale],
    subject = copy[scene];
  return (
    <figure
      className={`concept-visual solution-illustration${hero ? ' concept-visual--hero' : ''}`}
      data-scene={scene}
      data-animated={animated}
    >
      {animated && (
        <input
          id={`pause-${uid}`}
          type="checkbox"
          className="solution-animation-toggle"
          aria-label={`${copy.pause}: ${subject.title}`}
        />
      )}
      <svg
        viewBox="0 0 720 360"
        role="img"
        aria-labelledby={`title-${uid} desc-${uid}`}
        focusable="false"
        direction={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        <title id={`title-${uid}`}>{subject.title}</title>
        <desc id={`desc-${uid}`}>{subject.description}</desc>
        <defs>
          <pattern id={`grid-${uid}`} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="#8db7e9" strokeOpacity=".06" />
          </pattern>
          <radialGradient id={`glow-${uid}`}>
            <stop stopColor="#194c7c" />
            <stop offset="1" stopColor="#0a1c38" />
          </radialGradient>
        </defs>
        <rect width="720" height="360" fill={`url(#glow-${uid})`} />
        <rect width="720" height="360" fill={`url(#grid-${uid})`} />
        <path d="M48 305H672" className="illustration-baseline" />
        <Scene scene={scene} />
        {[143, 360, 575].map((x, i) => (
          <text key={i} x={x} y="325" textAnchor="middle" className="illustration-label">
            {subject.labels[i]}
          </text>
        ))}
      </svg>
      <figcaption>{copy.caption}</figcaption>
      {animated && (
        <label htmlFor={`pause-${uid}`} className="solution-animation-control">
          <span className="animation-pause">
            <Pause size={12} aria-hidden="true" />
            {copy.pause}
          </span>
          <span className="animation-play">
            <Play size={12} aria-hidden="true" />
            {copy.resume}
          </span>
        </label>
      )}
    </figure>
  );
}
