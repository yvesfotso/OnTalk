/**
 * A hand-built illustration (not a stock photo) of someone practising with
 * OnTalk, in the app's own palette. Kept as inline SVG so it never needs an
 * image asset or licensing.
 */
export function LearnerIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 440"
      className={className}
      role="img"
      aria-label="Illustration of a learner sitting cross-legged, wearing headphones and looking at the OnTalk app on their phone"
    >
      <defs>
        <clipPath id="phoneScreenClip">
          <rect x="177" y="248" width="66" height="112" rx="8" />
        </clipPath>
      </defs>

      {/* Backdrop */}
      <circle cx="210" cy="210" r="180" fill="var(--color-primary-subtle)" />
      <circle cx="70" cy="80" r="26" fill="var(--color-success-subtle)" />
      <circle cx="360" cy="140" r="16" fill="var(--color-accent-subtle)" />
      <ellipse cx="210" cy="404" rx="150" ry="18" fill="var(--color-border)" opacity="0.5" />

      {/* Crossed legs */}
      <path
        d="M90 392 C90 340 140 330 210 330 C280 330 330 340 330 392 C330 402 320 406 210 406 C100 406 90 402 90 392 Z"
        fill="var(--color-dark-subtle)"
      />
      <path
        d="M120 388 C150 360 180 356 210 356 C150 356 130 372 120 388 Z"
        fill="var(--color-dark)"
        opacity="0.35"
      />

      {/* Back arm + sleeve (behind torso, holding phone from the left) */}
      <path
        d="M150 250 C122 258 108 288 118 320 C122 332 138 336 150 328"
        fill="none"
        stroke="var(--color-primary-hover)"
        strokeWidth="34"
        strokeLinecap="round"
      />

      {/* Torso (hoodie) */}
      <rect x="140" y="196" width="140" height="150" rx="58" fill="var(--color-primary)" />
      <path
        d="M140 254 C140 224 165 200 210 200 C255 200 280 224 280 254 L280 236 C280 210 250 196 210 196 C170 196 140 210 140 236 Z"
        fill="var(--color-primary-hover)"
        opacity="0.5"
      />

      {/* Front arm + sleeve (holding phone from the right) */}
      <path
        d="M268 248 C298 254 314 284 304 316 C300 328 284 334 270 326"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="34"
        strokeLinecap="round"
      />

      {/* Phone */}
      <rect
        x="172"
        y="243"
        width="76"
        height="122"
        rx="12"
        fill="var(--color-surface)"
        stroke="var(--color-border-strong)"
        strokeWidth="2"
      />
      <g clipPath="url(#phoneScreenClip)">
        <rect x="177" y="248" width="66" height="112" fill="var(--color-background)" />
        <rect x="184" y="256" width="52" height="10" rx="5" fill="var(--color-primary-subtle)" />
        <rect x="184" y="271" width="34" height="7" rx="3.5" fill="var(--color-border)" />
        <rect x="184" y="290" width="52" height="30" rx="10" fill="var(--color-primary)" />
        <rect x="190" y="298" width="28" height="6" rx="3" fill="var(--color-primary-foreground)" opacity="0.85" />
        <rect x="190" y="308" width="20" height="6" rx="3" fill="var(--color-primary-foreground)" opacity="0.6" />
        <rect x="184" y="328" width="52" height="22" rx="8" fill="var(--color-subtle)" />
        <circle cx="196" cy="339" r="4" fill="var(--color-success)" />
        <rect x="205" y="336" width="26" height="6" rx="3" fill="var(--color-border-strong)" />
      </g>

      {/* Headphones */}
      <path
        d="M156 176 C156 132 180 104 210 104 C240 104 264 132 264 176"
        fill="none"
        stroke="var(--color-dark)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <rect x="144" y="168" width="22" height="40" rx="11" fill="var(--color-dark)" />
      <rect x="254" y="168" width="22" height="40" rx="11" fill="var(--color-dark)" />

      {/* Head */}
      <circle cx="210" cy="172" r="52" fill="#E7B38A" />
      <path
        d="M160 160 C160 122 182 96 210 96 C238 96 260 122 260 160 C260 142 250 152 240 148 C228 142 226 130 210 130 C194 130 190 144 180 148 C168 152 160 144 160 160 Z"
        fill="var(--color-dark)"
      />

      {/* Face */}
      <circle cx="192" cy="176" r="4.5" fill="var(--color-dark)" />
      <circle cx="228" cy="176" r="4.5" fill="var(--color-dark)" />
      <path
        d="M195 196 C202 204 218 204 225 196"
        fill="none"
        stroke="var(--color-dark)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="178" cy="188" r="7" fill="var(--color-primary)" opacity="0.25" />
      <circle cx="242" cy="188" r="7" fill="var(--color-primary)" opacity="0.25" />

      {/* Floating speech bubble */}
      <g className="animate-rise">
        <path
          d="M292 70 h96 a12 12 0 0 1 12 12 v46 a12 12 0 0 1 -12 12 h-58 l-18 18 v-18 h-20 a12 12 0 0 1 -12 -12 v-46 a12 12 0 0 1 12 -12 Z"
          fill="var(--color-surface)"
          stroke="var(--color-border)"
          strokeWidth="2"
        />
        <text
          x="340"
          y="102"
          textAnchor="middle"
          fontSize="17"
          fontWeight="600"
          fill="var(--color-foreground)"
          fontFamily="var(--font-sans)"
        >
          Hello!
        </text>
        <text
          x="340"
          y="122"
          textAnchor="middle"
          fontSize="11"
          fill="var(--color-muted-foreground)"
          fontFamily="var(--font-sans)"
        >
          Nice to meet you.
        </text>
      </g>

      {/* Floating streak badge */}
      <g>
        <rect x="18" y="240" width="88" height="40" rx="20" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
        <path
          d="M42 250 C36 258 34 266 38 272 C34 270 32 264 34 258 C38 264 46 264 46 272 C46 278 40 280 38 280 C46 282 54 276 52 266 C51 261 46 256 46 250 C46 256 42 254 42 250 Z"
          fill="var(--color-primary)"
        />
        <text x="68" y="266" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--color-foreground)" fontFamily="var(--font-sans)">
          4
        </text>
      </g>

      {/* Floating XP sparkle badge */}
      <g>
        <rect x="300" y="330" width="92" height="40" rx="20" fill="var(--color-dark)" />
        <path
          d="M322 342 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z"
          fill="var(--color-primary)"
        />
        <text x="356" y="356" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--color-dark-foreground)" fontFamily="var(--font-sans)">
          +20 XP
        </text>
      </g>
    </svg>
  );
}
