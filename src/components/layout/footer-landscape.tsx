export function FooterLandscape({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1600 360"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="tz-footer-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9" />
        </linearGradient>
        <g id="tz-tree">
          <path d="M0 0v-26" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="0" cy="-34" r="13" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="-9" cy="-25" r="9" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="9" cy="-25" r="9" stroke="currentColor" strokeWidth="1.1" />
        </g>
        <g id="tz-palm">
          <path d="M0 0c1-18 2-30 2-42" stroke="currentColor" strokeWidth="1.1" />
          <path d="M2-42c-10-7-20-8-27-4M2-42c10-7 20-7 26-2M2-42c-6-10-14-15-22-16M2-42c7-10 16-13 24-13" stroke="currentColor" strokeWidth="1.1" />
        </g>
      </defs>

      <g stroke="url(#tz-footer-fade)" strokeWidth="1.1" opacity="0.85">
        <path d="M0 300h1600" />
        <path d="M0 330h1600" opacity="0.5" />
        <path d="M-20 268c120-14 210 6 300-2s150-30 260-24 190 30 300 22 200-30 320-20 250 30 460 12" />
      </g>

      <g stroke="currentColor" strokeWidth="1.1" opacity="0.55">
        <path d="M96 300V196h74v104" />
        <path d="M96 196l37-30 37 30" />
        <path d="M112 300v-42h20v42M146 300v-42h18v42" />
        <path d="M112 226h20M146 226h18" />
      </g>

      <g stroke="currentColor" strokeWidth="1.1" opacity="0.45">
        <path d="M232 300V150h110v150" />
        <path d="M232 178h110M232 206h110M232 234h110M232 262h110" />
        <path d="M262 150v150M302 150v150" opacity="0.6" />
      </g>

      <g stroke="currentColor" strokeWidth="1.1" opacity="0.6">
        <path d="M404 300v-70h150v70" />
        <path d="M404 230l40-26h72l38 26" />
        <path d="M440 300v-40h32v40" />
        <path d="M498 262h34v20h-34z" />
      </g>

      <g stroke="currentColor" strokeWidth="1.1" opacity="0.4">
        <path d="M612 300V120h132v180" />
        <path d="M612 152h132M612 184h132M612 216h132M612 248h132M612 280h132" />
        <path d="M646 120v180M678 120v180M712 120v180" opacity="0.55" />
        <path d="M660 120v-22h36v22" />
      </g>

      <g stroke="currentColor" strokeWidth="1.1" opacity="0.5">
        <path d="M812 300v-92h46l28-26 28 26h46v92" />
        <path d="M840 300v-46h28v46" />
        <path d="M912 254h30v22h-30z" />
        <path d="M886 182v-18" />
      </g>

      <g stroke="currentColor" strokeWidth="1.1" opacity="0.42">
        <path d="M1006 300V168h96v132" />
        <path d="M1006 196h96M1006 224h96M1006 252h96M1006 280h96" />
        <path d="M1038 168v132M1070 168v132" opacity="0.55" />
      </g>

      <g stroke="currentColor" strokeWidth="1.1" opacity="0.55">
        <path d="M1168 300v-58h124v58" />
        <path d="M1168 242l62-34 62 34" />
        <path d="M1206 300v-34h24v34" />
        <path d="M1252 264h26v18h-26z" />
      </g>

      <g stroke="currentColor" strokeWidth="1.1" opacity="0.38">
        <path d="M1358 300V140h104v160" />
        <path d="M1358 170h104M1358 200h104M1358 230h104M1358 260h104M1358 290h104" />
        <path d="M1392 140v160M1428 140v160" opacity="0.55" />
      </g>

      <g stroke="currentColor" strokeWidth="1" opacity="0.32">
        <path d="M480 300l70-42h180l70 42" />
        <path d="M528 300l44-26h140l44 26" opacity="0.7" />
      </g>

      <g opacity="0.5" color="currentColor">
        <use href="#tz-tree" x="60" y="300" />
        <use href="#tz-tree" x="200" y="300" />
        <use href="#tz-palm" x="372" y="300" />
        <use href="#tz-tree" x="580" y="300" />
        <use href="#tz-palm" x="784" y="300" />
        <use href="#tz-tree" x="974" y="300" />
        <use href="#tz-tree" x="1136" y="300" />
        <use href="#tz-palm" x="1326" y="300" />
        <use href="#tz-tree" x="1500" y="300" />
      </g>

      <g stroke="currentColor" strokeWidth="1" opacity="0.3">
        <path d="M0 316c180 8 300-10 480-4s280 16 460 8 300-14 480-6 180 6 180 6" />
      </g>
    </svg>
  );
}
