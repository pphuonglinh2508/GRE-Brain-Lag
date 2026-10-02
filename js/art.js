/* Comic art kit, word illustrations, and the in-panel speech-bubble engine */
/* ===== Comic art kit: one cast, one style ===== */
const INK = '#24224A';
const SW = 'stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
const CAST = {
  mai:   {skin:'#F3C9A0', shirt:'#FFD23F', pants:'#3E64FF', shoe:'#FFFFFF', hair:'#1D1B33', scale:1},
  bao:   {skin:'#DDAA7E', shirt:'#16BFA0', pants:'#B88E5A', shoe:'#24224A', hair:'#2A2730', scale:1.08},
  ba:    {skin:'#EDC39C', shirt:'#9B6BD6', pants:'#3A3550', shoe:'#8A5A3C', hair:'#C9C7D6', scale:.9},
  kevin: {skin:'#E9BF96', shirt:'#FFFFFF', pants:'#2E2E48', shoe:'#FF5C8A', hair:'#2A2730', scale:1.02},
};
const NPC = ['#7C8DB5', '#E07A5F', '#81B29A', '#F2CC8F', '#B784A7'];

function eyesMouth(expr, who) {
  const glasses = who === 'bao', shades = who === 'kevin';
  let e = '', m = '', x = '';
  const dot = (cx) => `<circle cx="${cx}" cy="-130" r="3.2" fill="${INK}"/>`;
  switch (expr) {
    case 'happy': e = `<path d="M-13,-129 q4,-5 8,0 M5,-129 q4,-5 8,0" fill="none" ${SW}/>`; m = `<path d="M-8,-116 q8,9 16,0" fill="#fff" ${SW}/>`; break;
    case 'sad': e = dot(-9) + dot(9) + `<path d="M-14,-139 l8,3 M14,-139 l-8,3" ${SW}/>`; m = `<path d="M-7,-112 q7,-7 14,0" fill="none" ${SW}/>`; break;
    case 'angry': e = dot(-9) + dot(9) + `<path d="M-15,-140 l10,5 M15,-140 l-10,5" ${SW}/>`; m = `<path d="M-8,-113 q8,-6 16,0" fill="none" ${SW}/>`; x = `<path d="M18,-160 l6,-8 M24,-156 l9,-4 M26,-148 l9,1" stroke="#FF5C8A" stroke-width="3" stroke-linecap="round"/>`; break;
    case 'shock': e = `<circle cx="-9" cy="-131" r="5.5" fill="#fff" ${SW}/><circle cx="9" cy="-131" r="5.5" fill="#fff" ${SW}/>` + `<circle cx="-9" cy="-131" r="2" fill="${INK}"/><circle cx="9" cy="-131" r="2" fill="${INK}"/>`; m = `<ellipse cx="0" cy="-114" rx="5" ry="6.5" fill="${INK}"/>`; break;
    case 'smug': e = `<path d="M-14,-130 h9 M5,-130 h9" ${SW}/>`; m = `<path d="M-6,-116 q9,4 13,-4" fill="none" ${SW}/>`; break;
    case 'cry': e = `<path d="M-13,-131 q4,4 8,0 M5,-131 q4,4 8,0" fill="none" ${SW}/>`; m = `<path d="M-8,-111 q8,-8 16,0" fill="none" ${SW}/>`; x = `<path d="M-12,-126 q-3,10 0,14 q3,-4 0,-14 M12,-126 q-3,10 0,14 q3,-4 0,-14" fill="#7FC8FF" stroke="#3E64FF" stroke-width="1.5"/>`; break;
    case 'sleep': e = `<path d="M-13,-130 q4,3 8,0 M5,-130 q4,3 8,0" fill="none" ${SW}/>`; m = `<circle cx="1" cy="-115" r="3" fill="none" ${SW}/>`; x = `<text x="22" y="-158" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="18" fill="${INK}">z<tspan font-size="13" dy="-6">z</tspan></text>`; break;
    case 'love': e = `<path d="M-9,-126 l-5,-5 a3,3 0 0 1 5,-4 a3,3 0 0 1 5,4z M9,-126 l-5,-5 a3,3 0 0 1 5,-4 a3,3 0 0 1 5,4z" fill="#FF5C8A" stroke="${INK}" stroke-width="1.5"/>`; m = `<path d="M-7,-116 q7,7 14,0" fill="none" ${SW}/>`; break;
    case 'nervous': e = dot(-9) + dot(9); m = `<path d="M-9,-114 q3,-4 6,0 q3,4 6,0 q3,-4 6,0" fill="none" ${SW}/>`; x = `<path d="M24,-150 q-5,9 0,12 q5,-3 0,-12z" fill="#7FC8FF" stroke="#3E64FF" stroke-width="1.5"/>`; break;
    case 'think': e = dot(-9) + `<path d="M5,-131 h8" ${SW}/>` + `<path d="M4,-140 l9,-3" ${SW}/>`; m = `<path d="M-5,-114 h9" ${SW}/>`; break;
    default: e = dot(-9) + dot(9); m = `<path d="M-6,-115 h12" ${SW}/>`;
  }
  if (glasses) e += `<circle cx="-9" cy="-131" r="8" fill="none" ${SW}/><circle cx="9" cy="-131" r="8" fill="none" ${SW}/><path d="M-1,-131 h2" ${SW}/>`;
  if (shades && expr !== 'shock' && expr !== 'cry') e = `<path d="M-19,-136 h38 v4 q0,9 -9,9 h-3 q-6,0 -7,-7 q-1,7 -7,7 h-3 q-9,0 -9,-9z" fill="${INK}"/>`;
  return e + m + x;
}

const ARMS = {
  stand: [[-27,-58],[27,-58]],
  wave:  [[-27,-58],[44,-146,36,-112]],
  point: [[-27,-58],[64,-100,44,-98]],
  cheer: [[-40,-146,-34,-114],[40,-146,34,-114]],
  hold:  [[16,-74,-6,-70],[34,-78,30,-66]],
  think: [[-27,-58],[12,-112,32,-82]],
  shrug: [[-48,-104,-38,-76],[48,-104,38,-76]],
  hips:  [[-34,-70,-36,-90],[34,-70,36,-90]],
  run:   [[-30,-110,-36,-86],[38,-62,30,-80]],
};
function arm(sx, sy, a, shirt, skin) {
  const [hx, hy, ex, ey] = a;
  const d = ex !== undefined ? `M${sx},${sy} Q${ex},${ey} ${hx},${hy}` : `M${sx},${sy} L${hx},${hy}`;
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${shirt}" stroke-width="6.5" stroke-linecap="round"/><circle cx="${hx}" cy="${hy}" r="6" fill="${skin}" ${SW}/>`;
}
function hairBack(who, c) {
  if (who === 'mai') return `<path d="M-31,-102 L-31,-132 A31,31 0 0 1 31,-132 L31,-102 Q24,-98 20,-104 L-20,-104 Q-24,-98 -31,-102z" fill="${c.hair}" ${SW}/>`;
  if (who === 'ba') return `<circle cx="-22" cy="-152" r="12" fill="${c.hair}" ${SW}/>`;
  return '';
}
function hairFront(who, c) {
  if (who === 'mai') return `<path d="M-27,-137 A27,27 0 0 1 27,-137 L27,-133 Q14,-126 1,-134 Q-12,-126 -27,-133z" fill="${c.hair}" ${SW}/>`;
  if (who === 'bao') return `<path d="M-27,-134 L-24,-160 L-13,-149 L-5,-166 L4,-151 L14,-166 L18,-149 L29,-157 L27,-133 Q0,-146 -27,-134z" fill="${c.hair}" ${SW}/>`;
  if (who === 'ba') return `<path d="M-27,-131 A27,27 0 0 1 27,-131 Q12,-143 -27,-131z" fill="${c.hair}" ${SW}/><path d="M-20,-112 q4,3 8,0 M12,-112 q4,3 8,0" fill="none" stroke="${INK}" stroke-width="1.5" opacity=".5"/>`;
  if (who === 'kevin') return `<path d="M-27,-135 A27,27 0 0 1 27,-135z" fill="#FF5C8A" ${SW}/><path d="M-46,-138 h22 v6 h-22z" fill="#FF5C8A" ${SW}/>`;
  return `<path d="M-27,-134 A27,27 0 0 1 27,-134 Q0,-142 -27,-134z" fill="${c.hair}" ${SW}/>`;
}
function person(who, x, ground, expr = 'neutral', pose = 'stand', flip = false, s = 1, hold = '', npc = 0) {
  const c = CAST[who] || {skin:'#E7BE95', shirt:NPC[npc % NPC.length], pants:'#4A4766', shoe:INK, hair:['#3B2A20','#1D1B33','#7A4B2A','#C9C7D6','#2A2730'][npc % 5], scale:1};
  const sc = (c.scale || 1) * s;
  const A = ARMS[pose] || ARMS.stand;
  let g = '';
  // legs + shoes
  g += `<rect x="-18" y="-54" width="14" height="50" rx="5" fill="${c.pants}" ${SW}/><rect x="4" y="-54" width="14" height="50" rx="5" fill="${c.pants}" ${SW}/>`;
  g += `<ellipse cx="-10" cy="-3" rx="12" ry="6" fill="${c.shoe}" ${SW}/><ellipse cx="13" cy="-3" rx="12" ry="6" fill="${c.shoe}" ${SW}/>`;
  g += hairBack(who, c);
  // back arm
  g += arm(-18, -94, A[0], c.shirt, c.skin);
  // torso
  if (who === 'ba') g += `<path d="M-23,-100 q23,-6 46,0 l3,52 q-26,6 -52,0z" fill="${c.shirt}" ${SW}/><circle cx="0" cy="-86" r="2.5" fill="${INK}"/><circle cx="0" cy="-74" r="2.5" fill="${INK}"/><circle cx="0" cy="-62" r="2.5" fill="${INK}"/>`;
  else g += `<rect x="-23" y="-102" width="46" height="54" rx="12" fill="${c.shirt}" ${SW}/>`;
  if (who === 'mai') g += `<path d="M-6,-100 v14 M6,-100 v14" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><rect x="-13" y="-72" width="26" height="12" rx="4" fill="none" stroke="${INK}" stroke-width="2"/>`;
  if (who === 'kevin') g += `<path d="M0,-86 l3,6 7,1 -5,5 1,7 -6,-3 -6,3 1,-7 -5,-5 7,-1z" fill="#FFD23F" stroke="${INK}" stroke-width="1.5"/>`;
  if (who === 'bao') g += `<path d="M-10,-102 l10,10 10,-10" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
  // head
  g += `<rect x="-6" y="-108" width="12" height="10" fill="${c.skin}" ${SW}/><circle cx="0" cy="-128" r="27" fill="${c.skin}" ${SW}/>`;
  g += `<circle cx="-14" cy="-118" r="4" fill="#FF8FA8" opacity=".55"/><circle cx="16" cy="-118" r="4" fill="#FF8FA8" opacity=".55"/>`;
  g += hairFront(who, c);
  g += eyesMouth(expr, who);
  // front arm (+ held prop)
  if (hold) { const h = A[1]; g += `<g transform="translate(${h[0]},${h[1] + 14})">${prop(hold, 0.62)}</g>`; }
  g += arm(18, -94, A[1], c.shirt, c.skin);
  return `<g transform="translate(${x},${ground}) scale(${flip ? -sc : sc},${sc})">${g}</g>`;
}
function cat(x, ground, expr = 'neutral', flip = false, s = 1) {
  const O = '#FFA94D';
  let eyes = expr === 'happy' ? `<path d="M15,-50 q3,-4 6,0 M27,-50 q3,-4 6,0" fill="none" ${SW}/>`
    : expr === 'sleep' ? `<path d="M15,-49 q3,3 6,0 M27,-49 q3,3 6,0" fill="none" ${SW}/><text x="40" y="-70" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="16" fill="${INK}">z</text>`
    : expr === 'shock' ? `<circle cx="18" cy="-50" r="4.5" fill="#fff" ${SW}/><circle cx="30" cy="-50" r="4.5" fill="#fff" ${SW}/>`
    : expr === 'angry' ? `<circle cx="18" cy="-49" r="2.5" fill="${INK}"/><circle cx="30" cy="-49" r="2.5" fill="${INK}"/><path d="M13,-57 l8,4 M35,-57 l-8,4" ${SW}/>`
    : expr === 'smug' ? `<path d="M14,-50 h7 M27,-50 h7" ${SW}/>`
    : `<circle cx="18" cy="-50" r="2.8" fill="${INK}"/><circle cx="30" cy="-50" r="2.8" fill="${INK}"/>`;
  const g = `<path d="M-28,-26 q-26,-10 -22,-38 q2,-6 6,-2 q-2,22 18,30" fill="${O}" ${SW}/>
    <ellipse cx="0" cy="-22" rx="32" ry="22" fill="${O}" ${SW}/><ellipse cx="6" cy="-16" rx="16" ry="12" fill="#FFF4E6"/>
    <path d="M-14,-40 q4,8 0,14 M-4,-43 q4,8 0,14" fill="none" stroke="#D9772A" stroke-width="3" stroke-linecap="round"/>
    <path d="M8,-62 l-2,-20 14,10z M30,-72 l14,-10 -2,20z" fill="${O}" ${SW}/>
    <circle cx="24" cy="-50" r="20" fill="${O}" ${SW}/>${eyes}
    <path d="M22,-42 l2,2 2,-2" fill="none" stroke="${INK}" stroke-width="2"/><path d="M-12,-2 v-8 M14,-2 v-8" ${SW}/>`;
  return `<g transform="translate(${x},${ground}) scale(${flip ? -s : s},${s})">${g}</g>`;
}

/* props: drawn with origin at bottom-centre, ~unit size 60px */
function prop(name, s = 1) {
  const [n, arg] = name.split('~');
  const P = {
    boba: `<path d="M-14,-46 h28 l-4,46 h-20z" fill="#F7E1C6" ${SW}/><circle cx="-5" cy="-8" r="3" fill="${INK}"/><circle cx="4" cy="-6" r="3" fill="${INK}"/><circle cx="0" cy="-13" r="3" fill="${INK}"/><path d="M-16,-46 q16,-12 32,0z" fill="#fff" ${SW}/><path d="M4,-52 l8,-22" stroke="#FF5C8A" stroke-width="5" stroke-linecap="round"/>`,
    phone: `<rect x="-12" y="-44" width="24" height="44" rx="5" fill="${INK}"/><rect x="-9" y="-40" width="18" height="34" rx="2" fill="#7FD3FF"/>`,
    bowl: `<path d="M-34,-24 h68 q-4,24 -34,24 q-30,0 -34,-24z" fill="#fff" ${SW}/><path d="M-30,-24 q30,-8 60,0" fill="#F2B880" ${SW}/><path d="M18,-28 l26,-34 M24,-26 l26,-32" ${SW}/><path d="M-12,-34 q-6,-8 0,-16 q6,-8 0,-16 M2,-34 q-6,-8 0,-16 q6,-8 0,-16" fill="none" stroke="#9AA3C7" stroke-width="2.5" stroke-linecap="round"/>`,
    banhmi: `<path d="M-38,-6 q-4,-22 38,-22 q42,0 38,22 q-38,10 -76,0z" fill="#E9A94F" ${SW}/><path d="M-22,-16 l6,-4 M-6,-18 l6,-4 M10,-18 l6,-4" ${SW}/><path d="M-34,-8 h68" stroke="#6BBF59" stroke-width="4"/>`,
    book: `<rect x="-26" y="-14" width="52" height="14" rx="2" fill="#3E64FF" ${SW}/><rect x="-22" y="-28" width="46" height="14" rx="2" fill="#FF5C8A" ${SW}/><rect x="-24" y="-42" width="48" height="14" rx="2" fill="#16BFA0" ${SW}/>`,
    laptop: `<path d="M-30,-6 l8,-44 h52 l-8,44z" fill="#B7BEDA" ${SW}/><path d="M-40,0 h80 l-6,-8 h-68z" fill="#8F97BF" ${SW}/><circle cx="4" cy="-28" r="5" fill="#fff"/>`,
    table: `<rect x="-70" y="-50" width="140" height="12" rx="3" fill="#C88B5A" ${SW}/><path d="M-60,-38 v38 M60,-38 v38" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`,
    motorbike: `<circle cx="-34" cy="-16" r="16" fill="#3A3550" ${SW}/><circle cx="34" cy="-16" r="16" fill="#3A3550" ${SW}/><circle cx="-34" cy="-16" r="6" fill="#ccc"/><circle cx="34" cy="-16" r="6" fill="#ccc"/><path d="M-40,-30 q10,-26 44,-24 l18,-2 l14,24 l-14,6 h-50z" fill="#FF5C8A" ${SW}/><path d="M20,-58 l10,-16 h12" fill="none" ${SW}/><rect x="-24" y="-60" width="34" height="8" rx="4" fill="${INK}"/>`,
    money: `<rect x="-26" y="-18" width="52" height="18" rx="3" fill="#7BD389" ${SW}/><rect x="-22" y="-30" width="52" height="18" rx="3" fill="#9BE3A6" ${SW}/><text x="4" y="-16" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="13" fill="${INK}">₫</text>`,
    cake: `<rect x="-30" y="-24" width="60" height="24" rx="4" fill="#FFB3C7" ${SW}/><rect x="-20" y="-44" width="40" height="20" rx="4" fill="#fff" ${SW}/><path d="M0,-44 v-12" ${SW}/><path d="M0,-58 q-4,-6 0,-10 q4,4 0,10z" fill="#FFD23F" ${SW}/>`,
    trophy: `<path d="M-18,-60 h36 v12 q0,22 -18,22 q-18,0 -18,-22z" fill="#FFD23F" ${SW}/><path d="M-18,-54 q-14,0 -10,10 q3,6 10,4 M18,-54 q14,0 10,10 q-3,6 -10,4" fill="none" ${SW}/><path d="M-4,-26 h8 v12 h-8z M-16,-14 h32 v14 h-32z" fill="#FFD23F" ${SW}/>`,
    crown: `<path d="M-24,0 l-4,-30 l14,12 l14,-22 l14,22 l14,-12 l-4,30z" fill="#FFD23F" ${SW}/>`,
    heart: `<path d="M0,0 l-22,-22 a12,12 0 0 1 22,-14 a12,12 0 0 1 22,14z" fill="#FF5C8A" ${SW}/>`,
    bolt: `<path d="M6,-60 l-22,34 h14 l-8,26 l26,-38 h-14z" fill="#FFD23F" ${SW}/>`,
    cloud: `<path d="M-40,0 q-14,0 -12,-14 q2,-14 18,-12 q4,-18 24,-16 q18,2 20,16 q18,-2 20,12 q2,14 -14,14z" fill="#fff" ${SW}/>`,
    rain: `<path d="M-40,-30 q-14,0 -12,-14 q2,-14 18,-12 q4,-18 24,-16 q18,2 20,16 q18,-2 20,12 q2,14 -14,14z" fill="#9AA3C7" ${SW}/><path d="M-24,-20 l-6,14 M-4,-20 l-6,14 M16,-20 l-6,14 M34,-20 l-6,14" stroke="#3E64FF" stroke-width="3" stroke-linecap="round"/>`,
    sun: `<circle cx="0" cy="-30" r="20" fill="#FFD23F" ${SW}/><path d="M0,-58 v-8 M0,-2 v8 M-28,-30 h-8 M28,-30 h8 M-20,-50 l-6,-6 M20,-50 l6,-6 M-20,-10 l-6,6 M20,-10 l6,6" ${SW}/>`,
    star: `<path d="M0,-50 l7,16 17,2 -13,11 4,17 -15,-9 -15,9 4,-17 -13,-11 17,-2z" fill="#FFD23F" ${SW}/>`,
    gift: `<rect x="-24" y="-36" width="48" height="36" rx="3" fill="#3E64FF" ${SW}/><rect x="-28" y="-46" width="56" height="12" rx="3" fill="#5C7CFF" ${SW}/><path d="M0,-46 v46" stroke="#FFD23F" stroke-width="7"/><path d="M0,-46 q-16,-16 -16,-2 M0,-46 q16,-16 16,-2" fill="none" ${SW}/>`,
    lixi: `<rect x="-18" y="-46" width="36" height="46" rx="3" fill="#E63946" ${SW}/><circle cx="0" cy="-24" r="9" fill="#FFD23F" ${SW}/><path d="M-18,-40 l18,10 18,-10" fill="none" stroke="#FFD23F" stroke-width="2"/>`,
    lantern: `<path d="M0,-74 v8" ${SW}/><ellipse cx="0" cy="-42" rx="22" ry="26" fill="#E63946" ${SW}/><path d="M-10,-66 q-6,24 0,48 M10,-66 q6,24 0,48" fill="none" stroke="#FFD23F" stroke-width="2"/><rect x="-8" y="-18" width="16" height="6" fill="#FFD23F" ${SW}/><path d="M-4,-12 v12 M4,-12 v12" stroke="#FFD23F" stroke-width="2"/>`,
    sign: `<path d="M0,0 v-50" stroke="#8A5A3C" stroke-width="7"/><rect x="-46" y="-86" width="92" height="38" rx="4" fill="#fff" ${SW}/><text x="0" y="-61" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="${Math.max(9, 17 - (arg || '').length * 0.6)}" fill="${INK}">${(arg || '').replace(/[<&]/g, '')}</text>`,
    fire: `<path d="M0,0 q-28,-4 -22,-34 q4,10 10,8 q-6,-22 12,-38 q-2,16 10,24 q4,-8 2,-14 q20,22 10,44 q-6,10 -22,10z" fill="#FF8A3D" ${SW}/><path d="M0,-4 q-12,-2 -8,-16 q6,4 8,0 q8,10 0,16z" fill="#FFD23F"/>`,
    tree: `<rect x="-8" y="-50" width="16" height="50" fill="#8A5A3C" ${SW}/><circle cx="0" cy="-80" r="38" fill="#6BBF59" ${SW}/><circle cx="-14" cy="-90" r="6" fill="#4E9A43"/><circle cx="16" cy="-74" r="6" fill="#4E9A43"/>`,
    plant: `<path d="M-14,0 l-4,-26 h36 l-4,26z" fill="#E07A5F" ${SW}/><path d="M0,-26 q-20,-20 -14,-40 q14,10 14,40 q0,-30 16,-42 q6,22 -16,42" fill="#6BBF59" ${SW}/>`,
    tray: `<ellipse cx="0" cy="-6" rx="40" ry="8" fill="#D9DCEB" ${SW}/><path d="M-26,-8 q0,-30 26,-30 q26,0 26,30z" fill="#E8EAF5" ${SW}/><circle cx="0" cy="-40" r="4" fill="#D9DCEB" ${SW}/>`,
    box: `<path d="M-30,0 v-40 h60 v40z" fill="#D4A373" ${SW}/><path d="M-30,-40 l-8,-12 h60 l8,12" fill="#E3B88B" ${SW}/>`,
    megaphone: `<path d="M-20,-30 l40,-18 v40 l-40,-14z" fill="#FFD23F" ${SW}/><rect x="-30" y="-32" width="12" height="14" rx="3" fill="#FF5C8A" ${SW}/>`,
    scale: `<path d="M0,0 v-60 M-26,0 h52 M-36,-56 h72" ${SW}/><path d="M-36,-56 l-10,24 h20z M36,-56 l-10,24 h20z" fill="#FFD23F" ${SW}/><circle cx="0" cy="-62" r="5" fill="#FFD23F" ${SW}/>`,
    paper: `<path d="M-20,0 v-52 h30 l10,10 v42z" fill="#fff" ${SW}/><path d="M-12,-38 h20 M-12,-28 h24 M-12,-18 h18" stroke="${INK}" stroke-width="2"/>`,
    moon: `<path d="M8,-60 a30,30 0 1 0 22,48 a24,24 0 1 1 -22,-48z" fill="#FFE98A" ${SW}/>`,
    tv: `<rect x="-40" y="-60" width="80" height="54" rx="6" fill="${INK}"/><rect x="-34" y="-54" width="68" height="42" rx="3" fill="#7FD3FF"/><path d="M-20,-6 l-6,6 M20,-6 l6,6" ${SW}/>`,
    mic: `<path d="M0,0 v-34" stroke="${INK}" stroke-width="4"/><rect x="-8" y="-58" width="16" height="26" rx="8" fill="#9AA3C7" ${SW}/>`,
    sofa: `<rect x="-70" y="-46" width="140" height="30" rx="10" fill="#5C7CFF" ${SW}/><rect x="-78" y="-34" width="156" height="26" rx="10" fill="#7C95FF" ${SW}/><path d="M-66,-8 v8 M66,-8 v8" ${SW}/>`,
    bed: `<rect x="-80" y="-30" width="160" height="22" rx="4" fill="#fff" ${SW}/><rect x="-80" y="-60" width="12" height="60" fill="#C88B5A" ${SW}/><rect x="-62" y="-44" width="34" height="14" rx="6" fill="#FFE9D6" ${SW}/><path d="M-80,-8 v8 M80,-30 v30" ${SW}/>`,
    door: `<rect x="-26" y="-110" width="52" height="110" rx="3" fill="#C88B5A" ${SW}/><circle cx="16" cy="-55" r="4" fill="#FFD23F" ${SW}/>`,
    q: `<text x="0" y="0" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="52" fill="#3E64FF" stroke="${INK}" stroke-width="2">?</text>`,
    ex: `<text x="0" y="0" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="52" fill="#FF5C8A" stroke="${INK}" stroke-width="2">!</text>`,
    sweat: `<path d="M0,0 q-10,-6 0,-24 q10,18 0,24z" fill="#7FC8FF" stroke="#3E64FF" stroke-width="2"/>`,
    note: `<path d="M-6,0 a8,6 0 1 1 0,-1 v-40 l22,-6 v34 a8,6 0 1 1 0,-1 v-24 l-22,6" fill="${INK}" stroke="${INK}" stroke-width="2"/>`,
    durian: `<ellipse cx="0" cy="-26" rx="26" ry="26" fill="#C5D86D" ${SW}/><path d="M-16,-40 l-4,-6 M0,-48 v-7 M16,-40 l4,-6 M-22,-24 l-7,-1 M22,-24 l7,-1 M-12,-14 l-4,5 M12,-14 l4,5" ${SW}/>`,
    coffee: `<path d="M-14,-34 h28 l-3,34 h-22z" fill="#fff" ${SW}/><path d="M-12,-26 h24 l-2,22 h-20z" fill="#8A5A3C"/><path d="M14,-28 q10,0 8,10 q-2,6 -9,5" fill="none" ${SW}/>`,
    bag: `<path d="M-24,0 l4,-40 h40 l4,40z" fill="#FF5C8A" ${SW}/><path d="M-10,-40 q0,-16 10,-16 q10,0 10,16" fill="none" ${SW}/>`,
    rock: `<path d="M-34,0 q-6,-26 14,-34 q16,-10 30,0 q24,6 22,34z" fill="#B0AEC4" ${SW}/>`,
    wall: `<rect x="-40" y="-90" width="80" height="90" fill="#E07A5F" ${SW}/><path d="M-40,-60 h80 M-40,-30 h80 M-10,-90 v30 M20,-60 v30 M-10,-30 v30" stroke="${INK}" stroke-width="2"/>`,
    chain: `<path d="M-30,-6 a8,6 0 1 1 16,0 a8,6 0 1 1 -16,0 M-12,-6 a8,6 0 1 1 16,0 a8,6 0 1 1 -16,0 M6,-6 a8,6 0 1 1 16,0 a8,6 0 1 1 -16,0" fill="none" stroke="#8F97BF" stroke-width="4"/>`,
    arrow: `<path d="M-30,-20 h44 v-10 l18,20 -18,20 v-10 h-44z" fill="#3E64FF" ${SW}/>`,
    x: `<path d="M-20,-40 l40,40 M20,-40 l-40,40" stroke="#E63946" stroke-width="9" stroke-linecap="round"/>`,
    check: `<path d="M-22,-22 l14,14 l30,-34" fill="none" stroke="#16BFA0" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
    bubbles: `<circle cx="-14" cy="-20" r="10" fill="#fff" opacity=".8" ${SW}/><circle cx="10" cy="-36" r="7" fill="#fff" opacity=".8" ${SW}/><circle cx="16" cy="-12" r="5" fill="#fff" opacity=".8" ${SW}/>`,
    puddle: `<ellipse cx="0" cy="-4" rx="46" ry="8" fill="#7FC8FF" stroke="#3E64FF" stroke-width="2.5"/>`,
    stairs: `<path d="M-60,0 v-20 h30 v-20 h30 v-20 h30 v-20 h30 v80z" fill="#D9DCEB" ${SW}/>`,
    flag: `<path d="M-14,0 v-80" ${SW}/><rect x="-14" y="-80" width="44" height="28" fill="#DA251D" ${SW}/><path d="M8,-72 l2,5 5,0 -4,3 2,5 -5,-3 -5,3 2,-5 -4,-3 5,0z" fill="#FFE34D"/>`,
  };
  const body = P[n] || P.q;
  return `<g transform="scale(${s})">${body}</g>`;
}

/* backgrounds: 400 x 260 */
function bg(name) {
  const W = 400, H = 260, G = 228;
  const sky = (c) => `<rect width="${W}" height="${H}" fill="${c}"/>`;
  const floor = (c) => `<rect y="${G}" width="${W}" height="${H - G}" fill="${c}"/><path d="M0,${G} H${W}" ${SW}/>`;
  const win = (x, y, c = '#BDE3FF') => `<rect x="${x}" y="${y}" width="70" height="56" rx="4" fill="${c}" ${SW}/><path d="M${x + 35},${y} v56 M${x},${y + 28} h70" ${SW}/>`;
  const B = {
    room: sky('#FFE9D6') + win(290, 40) + `<rect x="40" y="46" width="54" height="70" fill="#FFB3C7" ${SW}/><path d="M50,96 l12,-18 10,12 8,-8 12,14" fill="none" ${SW}/>` + floor('#E3B88B'),
    kitchen: sky('#E6F4EA') + `<path d="M0,40 H400 M0,80 H400 M0,120 H400" stroke="#C7E3D0" stroke-width="2"/><rect x="250" y="140" width="150" height="88" fill="#C88B5A" ${SW}/><rect x="250" y="132" width="150" height="10" fill="#8F97BF" ${SW}/><path d="M300,120 h40 v12 h-40z" fill="#3A3550" ${SW}/><path d="M308,116 q4,-10 0,-18 M324,116 q4,-10 0,-18" fill="none" stroke="#9AA3C7" stroke-width="2.5"/>` + floor('#F2CC8F'),
    street: sky('#BDE3FF') + `<rect x="10" y="60" width="110" height="170" fill="#F2CC8F" ${SW}/><rect x="130" y="40" width="120" height="190" fill="#FFB3C7" ${SW}/><rect x="260" y="70" width="130" height="160" fill="#B5E3D8" ${SW}/>` +
      `<rect x="20" y="90" width="90" height="22" fill="#E63946" ${SW}/><rect x="140" y="70" width="100" height="22" fill="#3E64FF" ${SW}/><rect x="270" y="100" width="110" height="22" fill="#FFD23F" ${SW}/>` +
      `<path d="M10,150 h110 M130,140 h120 M260,160 h130" stroke="${INK}" stroke-width="2" stroke-dasharray="6 6"/><path d="M60,40 Q200,20 340,46" fill="none" stroke="${INK}" stroke-width="1.5"/>` + floor('#9AA3C7'),
    cafe: sky('#F6E7D8') + `<rect x="30" y="34" width="110" height="74" rx="4" fill="#2F4A3A" ${SW}/><path d="M44,56 h60 M44,72 h76 M44,88 h50" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>` +
      `<path d="M240,0 v40 M320,0 v30" ${SW}/><path d="M226,40 h28 l-6,12 h-16z M306,30 h28 l-6,12 h-16z" fill="#FFD23F" ${SW}/>` + floor('#C88B5A'),
    classroom: sky('#EDEBFF') + `<rect x="60" y="30" width="280" height="110" rx="4" fill="#2F6B4F" ${SW}/><path d="M80,60 h90 M80,80 h140 M80,100 h60" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/><rect x="360" y="40" width="30" height="40" rx="15" fill="#fff" ${SW}/>` + floor('#D9C2A3'),
    park: sky('#BDE3FF') + `<circle cx="340" cy="44" r="22" fill="#FFD23F" ${SW}/><path d="M0,150 q100,-30 200,0 q100,30 200,0 v80 H0z" fill="#9ED98C" ${SW}/>` + floor('#7DC46B'),
    night: sky('#25235A') + `<path d="M330,30 a24,24 0 1 0 18,40 a20,20 0 1 1 -18,-40z" fill="#FFE98A"/><circle cx="60" cy="40" r="2" fill="#fff"/><circle cx="150" cy="24" r="2" fill="#fff"/><circle cx="240" cy="54" r="2" fill="#fff"/><circle cx="100" cy="80" r="1.5" fill="#fff"/>` +
      `<path d="M0,228 v-70 h40 v-30 h30 v40 h40 v-60 h30 v50 h50 v-30 h40 v60 h40 v-80 h40 v50 h50 v70z" fill="#3A3770"/><rect x="250" y="120" width="10" height="10" fill="#FFD23F"/><rect x="120" y="140" width="10" height="10" fill="#FFD23F"/>` + floor('#2E2C5E'),
    stage: sky('#3A1F4A') + `<path d="M0,0 h70 q-10,120 0,228 h-70z M400,0 h-70 q10,120 0,228 h70z" fill="#E63946" ${SW}/><path d="M140,0 L80,228 H320 L260,0z" fill="#FFF3B0" opacity=".35"/>` + floor('#8A5A3C'),
    beach: sky('#BDE3FF') + `<circle cx="70" cy="50" r="24" fill="#FFD23F" ${SW}/><rect y="150" width="400" height="78" fill="#4FA8E8"/><path d="M0,160 q20,-8 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0" fill="none" stroke="#fff" stroke-width="2.5"/>` + floor('#F7DFA3'),
    office: sky('#E3E8F7') + win(40, 40, '#CDE8FF') + win(120, 40, '#CDE8FF') + `<rect x="280" y="50" width="90" height="60" fill="#fff" ${SW}/><path d="M290,96 l18,-24 16,14 18,-30 18,40" fill="none" stroke="#16BFA0" stroke-width="3"/>` + floor('#B7BEDA'),
    market: sky('#FFF3C4') + `<path d="M0,30 h400 v40 H0z" fill="#fff" ${SW}/><path d="M0,30 h40 v40 h-40z M80,30 h40 v40 h-40z M160,30 h40 v40 h-40z M240,30 h40 v40 h-40z M320,30 h40 v40 h-40z" fill="#E63946"/><path d="M0,70 q20,14 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0" fill="#fff" ${SW}/>` +
      `<rect x="20" y="160" width="360" height="40" fill="#C88B5A" ${SW}/><circle cx="60" cy="152" r="10" fill="#FF8A3D" ${SW}/><circle cx="82" cy="152" r="10" fill="#FFD23F" ${SW}/><circle cx="300" cy="152" r="10" fill="#6BBF59" ${SW}/><circle cx="322" cy="152" r="10" fill="#E63946" ${SW}/>` + floor('#D9C2A3'),
    temple: sky('#FFE3C7') + `<path d="M40,80 l160,-50 l160,50z" fill="#E63946" ${SW}/><rect x="70" y="80" width="18" height="148" fill="#C1272D" ${SW}/><rect x="312" y="80" width="18" height="148" fill="#C1272D" ${SW}/><rect x="170" y="140" width="60" height="40" fill="#FFD23F" ${SW}/><path d="M190,140 v-24 M200,140 v-28 M210,140 v-24" stroke="#8A5A3C" stroke-width="2.5"/>` + floor('#F2CC8F'),
    plain: sky('#FFF3C4') + floor('#FFE08A'),
    sky: sky('#BDE3FF') + `<path d="M40,60 q-10,0 -8,-10 q2,-10 14,-8 q4,-14 18,-12 q12,2 14,12 q12,-2 14,8 q2,10 -10,10z" fill="#fff" ${SW}/>` + floor('#9ED98C'),
    library: sky('#F3E9DC') + [30, 140, 250].map(x => `<rect x="${x}" y="30" width="100" height="190" fill="#C88B5A" ${SW}/><path d="M${x},90 h100 M${x},150 h100" ${SW}/>` + [0, 1, 2].map(r => [0, 1, 2, 3, 4, 5].map(k => `<rect x="${x + 8 + k * 15}" y="${44 + r * 60}" width="11" height="44" fill="${['#3E64FF', '#FF5C8A', '#16BFA0', '#FFD23F'][(k + r) % 4]}" stroke="${INK}" stroke-width="1.5"/>`).join('')).join('')).join('') + floor('#B88E5A'),
  };
  return (B[name] || B.plain) + `<rect width="${W}" height="${H}" fill="url(#ht)" opacity=".35"/>`;
}

/* Scene spec -> SVG string
   spec = {bg:'room', cast:'mai:30:happy:wave,ba:70:angry:point:L', props:'bowl:50:228:1.2', fx:'bolt:80:60'} */
function drawScene(spec, label) {
  const G = 228;
  let out = bg(spec.bg);
  const props = (spec.props || '').split(',').filter(Boolean).map(p => { const [n, x, y, s] = p.split(':'); return `<g transform="translate(${x * 4},${+(y || G)})">${prop(n, +(s || 1))}</g>`; });
  const back = [], front = [];
  props.forEach((p, i) => { const y = +((spec.props.split(',')[i] || '').split(':')[2] || G); (y < 180 ? back : front).push(p); });
  out += back.join('');
  (spec.cast || '').split(',').filter(Boolean).forEach(c => {
    const [who, x, expr, pose, flag, holdItem] = c.split(':');
    const flip = flag === 'L';
    if (who === 'mochi') out += cat(x * 4, G + 4, expr, flip, 0.95);
    else if (who.startsWith('npc')) out += person('npc', x * 4, G + 4, expr, pose, flip, 0.95, holdItem || '', +who.slice(3) || 0);
    else out += person(who, x * 4, G + 4, expr, pose, flip, 1, holdItem || '');
  });
  out += front.join('');
  (spec.fx || '').split(',').filter(Boolean).forEach(p => { const [n, x, y, s] = p.split(':'); out += `<g transform="translate(${x * 4},${y})">${prop(n, +(s || .8))}</g>`; });
  return `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label || 'Comic panel'}">${out}</svg>`;
}
const HT_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><pattern id="ht" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.2" fill="${INK}" opacity=".35"/></pattern></defs></svg>`;

/* ===== Comic panels: speech bubbles, thought clouds and caption boxes drawn inside the SVG ===== */
const NW = 500, PW = 400, OY = 100, PH = 260 + OY, GND = 232 + OY;
const TXT_FONT = '"Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", sans-serif';
const _cv = document.createElement('canvas').getContext('2d');
function textW(t, weight, size) { _cv.font = `${weight} ${size}px ${TXT_FONT}`; return _cv.measureText(t).width; }

// "Kevin is *loquacious* today" -> tokens; vocab words become bold, tappable, with a part-of-speech tag after them
function tokenize(txt, s) {
  const out = [];
  String(txt).split(/(\*[^*]+\*)/).forEach(part => {
    if (!part) return;
    if (part.startsWith('*') && part.endsWith('*')) {
      const form = part.slice(1, -1), f = form.toLowerCase();
      const cp = w => { let k = 0; while (k < w.length && w[k] === f[k]) k++; return k; };
      const hit = s.w.map(a => a[0]).filter(w => f.startsWith(stem(w))).sort((a, b) => cp(b) - cp(a) || b.length - a.length)[0];
      const key = hit ? s.n + ':' + hit : null, x = key ? BYKEY[key] : null;
      const ws = form.split(/\s+/);
      ws.forEach((w, i) => out.push({t: w, b: true, key, glue: i > 0 ? false : null}));
      if (x && x.pos) out[out.length - 1].pos = '(' + x.pos + ')';
    } else {
      part.split(/(\s+)/).forEach(w => { if (w && !/^\s+$/.test(w)) out.push({t: w}); else if (w) out.push({sp: true}); });
    }
  });
  // merge punctuation that directly follows a bold word ("*abound*," -> attach "," to the token)
  const res = [];
  for (let i = 0; i < out.length; i++) {
    const k = out[i];
    if (k.sp) { if (res.length) res[res.length - 1].spAfter = true; continue; }
    if (!k.b && res.length && !res[res.length - 1].spAfter) { res[res.length - 1].tail = (res[res.length - 1].tail || '') + k.t; continue; }
    res.push(k);
  }
  return res;
}
function tokW(k, size) {
  let w = textW(k.t, k.b ? 800 : NW, size);
  if (k.pos) w += textW(' ' + k.pos, 600, size * .78);
  if (k.tail) w += textW(k.tail, NW, size);
  return w;
}
function wrapTokens(toks, maxW, size) {
  const sp = textW(' ', NW, size), lines = [];
  let cur = [], w = 0;
  toks.forEach(k => {
    const kw = tokW(k, size);
    if (cur.length && w + sp + kw > maxW) { lines.push({toks: cur, w}); cur = []; w = 0; }
    w += (cur.length ? sp : 0) + kw; cur.push(k);
  });
  if (cur.length) lines.push({toks: cur, w});
  return lines;
}
function lineSVG(line, x, y, size) {
  const parts = line.toks.map((k, i) => {
    const lead = i ? ' ' : '';
    let s = k.b
      ? `${lead}<tspan class="svw" font-weight="800"${k.key ? ` data-word="${esc(k.key)}"` : ''}>${esc(k.t)}</tspan>`
      : `${lead}${esc(k.t)}`;
    if (k.pos) s += `<tspan font-size="${(size * .78).toFixed(1)}" fill="#5C5A80"> ${esc(k.pos)}</tspan>`;
    if (k.tail) s += esc(k.tail);
    return s;
  }).join('');
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family='${TXT_FONT}' font-weight="${NW}" font-size="${size}" fill="${INK}" xml:space="preserve">${parts}</text>`;
}
function measureBlock(toks, maxW, size, padX, padY) {
  const lines = wrapTokens(toks, maxW - padX * 2, size);
  const lh = size * 1.22;
  const w = Math.max(...lines.map(l => l.w)) + padX * 2;
  const h = lines.length * lh + padY * 2 - (lh - size) ;
  return {lines, w, h, lh, size, padX, padY};
}
const overlap = (a, b, gap = 0) => a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;

// where everybody's head is in a panel (for bubble tails and for keeping text off faces)
function castGeometry(cast, fx) {
  const heads = {}, boxes = [];
  (cast || '').split(',').filter(Boolean).forEach(c => {
    const [who, xs, , , flag] = c.split(':');
    const X = +xs * 4;
    if (who === 'mochi') {
      const s = .95, hx = X + (flag === 'L' ? -24 : 24) * s;
      heads[who] = {mx: hx, my: GND - 44 * s, top: GND - 82 * s, x: X};
      boxes.push({x: hx - 26, y: GND - 84 * s, w: 52, h: 46});
      return;
    }
    const sc = (CAST[who] ? CAST[who].scale || 1 : 1) * (who.startsWith('npc') ? .95 : 1);
    const top = GND - 170 * sc;
    heads[who] = {mx: X, my: GND - 114 * sc, top, x: X};
    boxes.push({x: X - 36 * sc, y: top, w: 72 * sc, h: 72 * sc});
  });
  (fx || '').split(',').filter(Boolean).forEach(p => {
    const [, x, y, s] = p.split(':'); const k = +(s || .8);
    boxes.push({x: x * 4 - 30 * k, y: +y + OY - 60 * k, w: 60 * k, h: 60 * k});
  });
  return {heads, boxes};
}

function speechSVG(b, tip) {
  const {x, y, w, h} = b, r = Math.min(16, h / 2);
  const bx = Math.max(x + r + 4, Math.min(x + w - r - 16, tip.x - 7));
  const base1 = bx, base2 = bx + 16;
  const tail = `M${base1},${y + h - 1} L${tip.x},${tip.y} L${base2},${y + h - 1}`;
  return `<path d="${tail}" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#fff" stroke="${INK}" stroke-width="2.5"/>` +
    `<path d="M${base1 + 1.6},${y + h - 4} L${tip.x},${tip.y - 3} L${base2 - 1.6},${y + h - 4}z" fill="#fff"/>`;
}
function thoughtSVG(b, tip) {
  const {x, y, w, h} = b;
  let puffs = '';
  const step = 22, rr = 13;
  for (let px = x + 10; px <= x + w - 10; px += step) puffs += `<circle cx="${px}" cy="${y + 4}" r="${rr}"/><circle cx="${px}" cy="${y + h - 4}" r="${rr}"/>`;
  for (let py = y + 10; py <= y + h - 10; py += step) puffs += `<circle cx="${x + 4}" cy="${py}" r="${rr}"/><circle cx="${x + w - 4}" cy="${py}" r="${rr}"/>`;
  const cloud = `<g fill="#fff" stroke="${INK}" stroke-width="2.5">${puffs}</g><g fill="#fff">${puffs.replace(/r="13"/g, 'r="10.6"')}</g><rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" rx="10" fill="#fff"/>`;
  const sx = Math.max(x + 14, Math.min(x + w - 14, tip.x)), sy = y + h + 8;
  const dots = [0.25, 0.55, 0.85].map((t, i) => {
    const cx = sx + (tip.x - sx) * t, cy = sy + (tip.y - sy) * t;
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${[7, 5, 3.2][i]}" fill="#fff" stroke="${INK}" stroke-width="2.2"/>`;
  }).join('');
  return dots + cloud;
}
function captionSVG(b) {
  return `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="#FFD23F" stroke="${INK}" stroke-width="2.5"/>`;
}
function blockText(b) {
  const cx = b.x + b.w / 2;
  return b.m.lines.map((l, i) => lineSVG(l, cx, b.y + b.m.padY + b.m.size * .86 + i * b.m.lh, b.m.size)).join('');
}

function layoutPanel(p, s, geo) {
  const bubs = (p.bub || []);
    const sizes = [13.5, 12.5, 11.5, 10.5], cfg = [];
  (p.cap ? ['tl', 'tr'] : ['none']).forEach(c => sizes.forEach(z => cfg.push([c, z])));
  if (p.cap) ['bl', 'br'].forEach(c => sizes.forEach(z => cfg.push([c, z])));
  for (const [corner, size] of cfg) {
    {
      const placed = [], obst = geo.boxes.slice();
      let ok = true, cap = null;
      if (p.cap) {
        const m = measureBlock(tokenize(p.cap, s), bubs.length ? 236 : 360, size - .5, 9, 7);
        const x = corner.endsWith('l') ? 1.5 : PW - m.w - 1.5, y = corner.startsWith('t') ? 1.5 : PH - m.h - 1.5;
        cap = {x, y, w: m.w, h: m.h, m};
        if (obst.some(o => overlap(cap, o, 2))) ok = false;
        placed.push(cap);
      }
      const out = [];
      for (const [who, txt, kind] of bubs) {
        if (!ok) break;
        const hd = geo.heads[who] || {mx: 200, my: GND - 110, top: GND - 170, x: 200};
        const think = kind === 'think';
        const m = measureBlock(tokenize(txt, s), bubs.length > 1 ? 184 : 250, size, think ? 14 : 12, think ? 12 : 8);
        const pad = think ? 12 : 0, w = m.w + pad * 2, h = m.h + pad * 2;
        let best = null;
        for (let y = Math.floor(hd.top - (think ? 26 : 16) - h); y >= 4 && !best; y -= 3) {
          for (const dx of [0, -20, 20, -40, 40, -60, 60, -85, 85, -110, 110, -140, 140]) {
            const cx = Math.max(w / 2 + 5, Math.min(PW - w / 2 - 5, hd.mx + dx));
            const r = {x: cx - w / 2, y, w, h};
            if (placed.some(o => overlap(r, o, think ? 12 : 6)) || obst.some(o => overlap(r, o, 3))) continue;
            best = r; break;
          }
        }
        if (!best) { ok = false; break; }
        if (think) best = {x: best.x + pad, y: best.y + pad, w: m.w, h: m.h};
        best.m = m; best.kind = think ? 'think' : 'say';
        best.tip = think ? {x: hd.mx + 4, y: hd.top + 2} : {x: hd.mx + (hd.mx < best.x + best.w / 2 ? 6 : -6), y: hd.top + 4};
        placed.push(best); out.push(best);
      }
      if (ok) return {cap, bubs: out};
    }
  }
  // last resort: stack everything from the top
  window.__fb = (window.__fb || []); window.__fb.push(p.cap || (p.bub[0] || [])[1]);
  let y = 2; const fb = {cap: null, bubs: []};
  if (p.cap) { const m = measureBlock(tokenize(p.cap, s), 380, 10, 8, 6); fb.cap = {x: 1.5, y: 1.5, w: m.w, h: m.h, m}; y = m.h + 6; }
  for (const [who, txt, kind] of bubs) {
    const hd = geo.heads[who] || {mx: 200, top: GND - 170};
    const m = measureBlock(tokenize(txt, s), 300, 10, 10, 6);
    const cx = Math.max(m.w / 2 + 5, Math.min(PW - m.w / 2 - 5, hd.mx));
    const b = {x: cx - m.w / 2, y, w: m.w, h: m.h, m, kind: kind === 'think' ? 'think' : 'say', tip: {x: hd.mx, y: hd.top + 4}};
    fb.bubs.push(b); y += m.h + 8;
  }
  return fb;
}

function skyOf(name) { const m = /fill="(#[0-9A-Fa-f]{6})"/.exec(bg(name)); return m ? m[1] : '#FFF3C4'; }
function comicPanel(p, s, label) {
  const scene = drawScene({bg: p.bg, cast: p.cast, props: p.props, fx: p.fx}, label);
  const inner = scene.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const geo = castGeometry(p.cast, p.fx);
  const L = layoutPanel(p, s, geo);
  let fg = '';
  L.bubs.forEach(b => { fg += (b.kind === 'think' ? thoughtSVG(b, b.tip) : speechSVG(b, b.tip)) + blockText(b); });
  if (L.cap) fg += captionSVG(L.cap) + blockText(L.cap);
  return `<svg viewBox="0 0 ${PW} ${PH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)}">` +
    `<rect width="${PW}" height="${OY + 2}" fill="${skyOf(p.bg)}"/><rect width="${PW}" height="${OY + 2}" fill="url(#ht)" opacity=".35"/>` +
    `<g transform="translate(0,${OY})">${inner}</g>${fg}</svg>`;
}
const plainText = t => String(t).replace(/\*/g, '');

/* ===== Custom mnemonic scenes for words with no usable PDF image ===== */
const T = (x, y, s, body, flip) => `<g transform="translate(${x},${y}) scale(${flip ? -s : s},${s})">${body}</g>`;
const LBL = (x, y, txt, size = 22, fill = INK) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="${size}" fill="${fill}" stroke="#fff" stroke-width="4" paint-order="stroke">${txt}</text>`;
const K = {
  dog: (expr = 'happy') => `<path d="M-40,-30 q-14,-4 -18,-18" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><ellipse cx="-10" cy="-30" rx="36" ry="20" fill="#C08A55" ${SW}/><path d="M-34,-14 v14 M-18,-12 v12 M2,-12 v12 M16,-14 v14" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><circle cx="28" cy="-52" r="20" fill="#C08A55" ${SW}/><path d="M16,-66 q-14,8 -8,30 q10,-8 8,-30z" fill="#7A4B2A" ${SW}/><ellipse cx="44" cy="-48" rx="10" ry="8" fill="#E7C49B" ${SW}/><circle cx="50" cy="-52" r="4" fill="${INK}"/>${expr === 'sad' ? `<path d="M24,-60 l8,3" ${SW}/><circle cx="31" cy="-55" r="2.5" fill="${INK}"/><path d="M28,-50 q-2,8 0,12 q2,-4 0,-12z" fill="#7FC8FF"/>` : `<circle cx="31" cy="-58" r="3" fill="${INK}"/>`}`,
  egg: `<path d="M0,0 q-34,0 -34,-40 q0,-44 34,-50 q34,6 34,50 q0,40 -34,40z" fill="#FFF6E0" ${SW}/><path d="M-30,-56 l10,8 8,-10 10,10 8,-10 10,10 8,-8" fill="none" ${SW}/>`,
  turtle: `<ellipse cx="0" cy="-16" rx="26" ry="16" fill="#6BBF59" ${SW}/><path d="M-12,-26 l8,8 l-8,8 M8,-28 l-6,10 6,10" fill="none" stroke="#3F7F35" stroke-width="2.5"/><circle cx="30" cy="-14" r="9" fill="#B5E39A" ${SW}/><circle cx="33" cy="-16" r="2" fill="${INK}"/><path d="M-16,-2 v6 M14,-2 v6" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
  slug: `<path d="M-40,0 q0,-20 30,-22 q30,0 40,-20 q10,-6 12,4 q2,14 -10,26 q-4,12 -20,12z" fill="#C5D86D" ${SW}/><path d="M28,-42 l-4,-14 M38,-40 l2,-14" ${SW}/><circle cx="24" cy="-58" r="4" fill="${INK}"/><circle cx="40" cy="-56" r="4" fill="${INK}"/><rect x="-18" y="-22" width="20" height="14" fill="#fff" ${SW}/><text x="-8" y="-11" text-anchor="middle" font-size="11" font-weight="800" font-family="sans-serif" fill="${INK}">1</text>`,
  snowman: `<circle cx="0" cy="-30" r="30" fill="#fff" ${SW}/><circle cx="0" cy="-80" r="22" fill="#fff" ${SW}/><path d="M0,-80 l20,4 l-20,4z" fill="#FF8A3D" ${SW}/><circle cx="-8" cy="-86" r="3" fill="${INK}"/><circle cx="8" cy="-86" r="3" fill="${INK}"/><path d="M-8,-70 q8,-6 16,0" fill="none" ${SW}/><path d="M-14,-102 h28 v-20 h-28z M-20,-102 h40" fill="${INK}" ${SW}/><path d="M24,-74 q-4,10 0,14 q4,-4 0,-14z M-26,-60 q-4,10 0,14 q4,-4 0,-14z" fill="#7FC8FF" stroke="#3E64FF" stroke-width="1.5"/><ellipse cx="0" cy="2" rx="40" ry="6" fill="#7FC8FF" opacity=".7"/>`,
  clam: (rot = 0) => `<g transform="rotate(${rot})"><path d="M-22,0 q22,10 44,0 q-4,-10 -22,-10 q-18,0 -22,10z" fill="#F4C7D7" ${SW}/><path d="M-22,-8 q22,-34 44,0" fill="#F9DCE6" ${SW}/><ellipse cx="0" cy="-6" rx="9" ry="6" fill="${INK}"/><circle cx="-8" cy="-22" r="3" fill="${INK}"/><circle cx="8" cy="-22" r="3" fill="${INK}"/></g>`,
  fish: `<path d="M-30,0 q30,-24 60,0 q-30,24 -60,0z" fill="#FF8A3D" ${SW}/><path d="M-30,0 l-16,-14 v28z" fill="#FF8A3D" ${SW}/><circle cx="16" cy="-4" r="4" fill="${INK}"/>`,
  train: `<rect x="-110" y="-60" width="90" height="50" rx="8" fill="#3E64FF" ${SW}/><rect x="-14" y="-60" width="110" height="50" rx="8" fill="#3E64FF" ${SW}/><path d="M96,-60 q30,0 30,30 v20 h-30z" fill="#5C7CFF" ${SW}/><rect x="-100" y="-50" width="24" height="18" fill="#BDE3FF" ${SW}/><rect x="-64" y="-50" width="24" height="18" fill="#BDE3FF" ${SW}/><rect x="0" y="-50" width="24" height="18" fill="#BDE3FF" ${SW}/><rect x="36" y="-50" width="24" height="18" fill="#BDE3FF" ${SW}/><circle cx="-90" cy="-6" r="9" fill="${INK}"/><circle cx="-40" cy="-6" r="9" fill="${INK}"/><circle cx="10" cy="-6" r="9" fill="${INK}"/><circle cx="70" cy="-6" r="9" fill="${INK}"/><path d="M-150,-50 h-30 M-140,-36 h-44 M-150,-22 h-26" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  tophat: `<rect x="-16" y="-34" width="32" height="30" fill="${INK}"/><rect x="-24" y="-6" width="48" height="6" rx="2" fill="${INK}"/><rect x="-16" y="-14" width="32" height="5" fill="#E63946"/>`,
  nonla: `<path d="M-36,0 L0,-26 L36,0z" fill="#F2D27A" ${SW}/><path d="M-18,-6 l18,-14 M0,-4 v-18 M18,-6 l-18,-14" stroke="#C9A64A" stroke-width="1.5"/>`,
  cage: `<rect x="-56" y="-180" width="112" height="180" rx="8" fill="none" ${SW}/>` + [-40, -20, 0, 20, 40].map(x => `<path d="M${x},-180 v180" stroke="${INK}" stroke-width="4"/>`).join('') + `<path d="M-56,-180 q56,-36 112,0" fill="#8F97BF" ${SW}/>`,
  roots: `<path d="M0,0 q-10,20 -30,26 M0,0 q4,24 -6,40 M0,0 q14,18 34,22 M0,0 q20,4 30,-2 M-20,22 q-14,4 -20,14 M20,20 q8,10 6,20" fill="none" stroke="#8A5A3C" stroke-width="5" stroke-linecap="round"/>`,
  eye: `<path d="M-60,0 q60,-56 120,0 q-60,56 -120,0z" fill="#fff" ${SW}/><circle cx="14" cy="0" r="22" fill="#6B4A2E" ${SW}/><circle cx="20" cy="-2" r="10" fill="${INK}"/><circle cx="25" cy="-8" r="4" fill="#fff"/>`,
  bug: `<ellipse cx="0" cy="-6" rx="8" ry="6" fill="#E63946" ${SW}/><path d="M-4,-12 l-3,-6 M4,-12 l3,-6" stroke="${INK}" stroke-width="2"/>`,
  ship: `<path d="M-60,0 h120 l-16,24 h-88z" fill="#E07A5F" ${SW}/><rect x="-30" y="-30" width="50" height="30" fill="#fff" ${SW}/><path d="M30,-50 v50" ${SW}/><path d="M30,-50 l26,18 h-26z" fill="#FFD23F" ${SW}/>`,
  sub: `<ellipse cx="0" cy="0" rx="62" ry="22" fill="#FFD23F" ${SW}/><rect x="-14" y="-38" width="28" height="18" rx="5" fill="#FFD23F" ${SW}/><path d="M6,-38 v-14 h12" fill="none" ${SW}/><circle cx="-26" cy="0" r="7" fill="#BDE3FF" ${SW}/><circle cx="0" cy="0" r="7" fill="#BDE3FF" ${SW}/><circle cx="26" cy="0" r="7" fill="#BDE3FF" ${SW}/>`,
  pumpkin: `<ellipse cx="-24" cy="-44" rx="34" ry="44" fill="#FF8A3D" ${SW}/><ellipse cx="24" cy="-44" rx="34" ry="44" fill="#FF8A3D" ${SW}/><ellipse cx="0" cy="-44" rx="30" ry="46" fill="#FF9F55" ${SW}/><path d="M0,-90 q4,-16 14,-18" fill="none" stroke="#3F7F35" stroke-width="7" stroke-linecap="round"/>`,
  yieldsign: `<path d="M0,0 v-60" stroke="#8F97BF" stroke-width="6"/><path d="M-40,-120 h80 l-40,64z" fill="#fff" stroke="#E63946" stroke-width="9" stroke-linejoin="round"/><text x="0" y="-102" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="13" fill="#E63946">YIELD</text>`,
  umbrella: `<path d="M-50,-60 q50,-50 100,0 q-12,-8 -25,0 q-12,-8 -25,0 q-12,-8 -25,0 q-12,-8 -25,0z" fill="#FF5C8A" ${SW}/><path d="M0,-80 v70 q0,10 -10,8" fill="none" ${SW}/>`,
  steam: `<path d="M0,0 q-14,-6 -8,-20 q-12,-12 4,-22 q4,-14 18,-8 q14,-4 14,10 q12,8 2,20 q4,14 -12,16z" fill="#fff" ${SW}/>`,
  catface: `<circle cx="0" cy="0" r="14" fill="#FFA94D" ${SW}/><path d="M-12,-6 l-2,-14 10,7z M12,-6 l2,-14 -10,7z" fill="#FFA94D" ${SW}/><circle cx="-5" cy="0" r="2" fill="${INK}"/><circle cx="5" cy="0" r="2" fill="${INK}"/>`,
  dogface: `<circle cx="0" cy="0" r="14" fill="#C08A55" ${SW}/><path d="M-12,-8 q-8,6 -4,18 q6,-4 4,-18z M12,-8 q8,6 4,18 q-6,-4 -4,-18z" fill="#7A4B2A" ${SW}/><circle cx="-5" cy="-1" r="2" fill="${INK}"/><circle cx="5" cy="-1" r="2" fill="${INK}"/><ellipse cx="0" cy="6" rx="4" ry="3" fill="${INK}"/>`,
  hat: `<path d="M-30,0 h60 l-6,-8 h-48z" fill="${INK}"/><path d="M-22,-8 q0,-40 22,-40 q22,0 22,40z" fill="${INK}"/><path d="M-22,-14 h44" stroke="#E63946" stroke-width="5"/>`,
  maze: `<rect x="-90" y="-150" width="180" height="150" fill="#fff" ${SW}/><path d="M-70,-130 h140 v110 h-120 v-90 h100 v70 h-80 v-50 h60 v30 h-40" fill="none" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`,
  stamp: `<rect x="-30" y="-14" width="60" height="22" rx="3" fill="none" stroke="#E63946" stroke-width="3" transform="rotate(-12)"/><text x="0" y="2" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="11" fill="#E63946" transform="rotate(-12)">APPROVED</text>`,
  fence: `<path d="M-120,0 v-50 M-80,0 v-50 M-40,0 v-50 M0,0 v-50 M40,0 v-50 M80,0 v-50 M120,0 v-50 M-130,-38 h260 M-130,-18 h260" stroke="#8A5A3C" stroke-width="7" stroke-linecap="round"/>`,
  chips: `<ellipse cx="0" cy="-6" rx="16" ry="6" fill="#E63946" ${SW}/><ellipse cx="0" cy="-14" rx="16" ry="6" fill="#3E64FF" ${SW}/><ellipse cx="0" cy="-22" rx="16" ry="6" fill="#FFD23F" ${SW}/>`,
  glass: `<path d="M-10,-30 h20 l-3,30 h-14z" fill="#FFE98A" ${SW}/><path d="M-10,-30 h20" stroke="#fff" stroke-width="4"/>`,
};
const sceneSVG = (inner, label) => `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">${inner}</svg>`;
const WORD_ART = {
  'betray': () => sceneSVG(bg('kitchen') + person('mai', 110, 232, 'smug', 'hold') + T(150, 140, 1, prop('tray')) + T(150, 112, 1, `<circle r="20" fill="#FFE0B3" ${SW}/><circle cx="-7" cy="-3" r="2.5" fill="${INK}"/><circle cx="7" cy="-3" r="2.5" fill="${INK}"/><path d="M-8,8 q8,-6 16,0" fill="none" ${SW}/>` + prop('sweat', .5)) + person('kevin', 300, 232, 'nervous', 'shrug', true) + LBL(150, 72, 'ON A TRAY!'), 'Mai serves a sweaty guilty face on a tray while Kevin panics'),
  'dogged': () => sceneSVG(bg('park') + T(110, 232, 1.2, K.dog()) + `<path d="M170,170 q60,10 104,-4" fill="none" stroke="#C9A64A" stroke-width="6" stroke-linecap="round"/>` + person('kevin', 310, 232, 'shock', 'run', true) + LBL(200, 60, 'WON\'T LET GO'), 'A dog refuses to let go of a rope while Kevin pulls'),
  'engender': () => sceneSVG(bg('room') + T(200, 228, 1.3, K.egg) + T(170, 92, .6, prop('heart')) + T(220, 70, .7, prop('heart')) + T(250, 100, .5, prop('star')) + person('mai', 80, 232, 'love', 'cheer') + LBL(200, 40, 'NEW FEELINGS!'), 'A magic egg hatches hearts and stars'),
  'subvert': () => sceneSVG(bg('beach') + T(220, 150, 1, `<g transform="rotate(160)">${K.ship}</g>`) + T(200, 206, 1, K.sub) + LBL(200, 50, 'FLIP FROM BELOW!'), 'A submarine flips a ship from underneath'),
  'tortuous': () => sceneSVG(bg('park') + `<path d="M20,220 C80,140 0,120 120,110 S60,40 200,60 S260,170 330,90 S300,30 390,40" fill="none" stroke="#9AA3C7" stroke-width="22" stroke-linecap="round"/><path d="M20,220 C80,140 0,120 120,110 S60,40 200,60 S260,170 330,90 S300,30 390,40" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="8 8"/>` + T(70, 160, .9, K.turtle) + LBL(260, 230, '100 ZIGZAGS'), 'A tortoise crawls along a very twisty road'),
  'clamorous': () => sceneSVG(bg('beach') + [[40, 222, -10], [90, 214, 8], [140, 224, 0], [190, 212, -6], [240, 222, 10], [290, 214, -4], [340, 222, 6]].map(([x, y, r]) => T(x, y, 1, K.clam(r))).join('') + person('bao', 365, 232, 'shock', 'cheer', true, .7) + LBL(150, 100, 'AAAAAAH!!', 30, '#FF5C8A'), 'A beach full of clams all screaming at once'),
  'convivial': () => sceneSVG(bg('cafe') + `<g transform="translate(200,228)">${prop('table')}</g>` + person('mai', 90, 232, 'happy', 'cheer') + person('bao', 200, 232, 'happy', 'hold', false, 1, 'boba') + person('kevin', 310, 232, 'happy', 'wave', true) + T(150, 80, .6, prop('note')) + T(250, 70, .6, prop('note')) + LBL(200, 40, 'VIVA LA PARTY!'), 'Friends cheering at a lively café party'),
  'egregious': () => sceneSVG(bg('office') + `<g transform="translate(200,228)">${prop('table')}</g>` + Array.from({length: 10}, (_, i) => `<ellipse cx="${150 + (i % 5) * 22}" cy="${170 - Math.floor(i / 5) * 12}" rx="10" ry="7" fill="#FFF6E0" ${SW}/>`).join('') + person('kevin', 90, 232, 'smug', 'hold', false, 1, 'banhmi') + person('npc0', 320, 232, 'shock', 'shrug', true) + LBL(200, 60, '40 EGGS?!'), 'Kevin ate a mountain of eggs at the office meeting'),
  'antithesis': () => sceneSVG(`<rect width="400" height="260" fill="#C88B5A"/>` + [0, 40, 80, 120, 160, 200].map(y => `<path d="M0,${y} H400" stroke="#8A5A3C" stroke-width="3"/>`).join('') + `<rect y="228" width="400" height="32" fill="#8A5A3C"/>` + T(200, 228, 1.1, K.snowman) + T(90, 120, 1, K.steam) + T(310, 100, 1, K.steam) + LBL(200, 40, 'SNOWMAN IN A SAUNA'), 'A melting snowman sits in a hot sauna'),
  'provincial': () => sceneSVG(bg('park') + T(220, 228, 1, K.fence) + person('npc2', 120, 232, 'neutral', 'think') + T(120, 90, 1, K.nonla) + `<g transform="translate(330,228)">${prop('sign~WORLD ENDS')}</g>`, 'A farmer thinks the world ends at his fence'),
  'sluggish': () => sceneSVG(bg('park') + `<rect y="190" width="400" height="38" fill="#E07A5F"/><path d="M0,208 H400" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/>` + T(130, 226, 1, K.slug) + `<g transform="translate(360,228)">${prop('flag')}</g>` + person('mai', 260, 190, 'sleep', 'stand', false, .6) + LBL(160, 60, 'LAP 1 OF 1... SLOWLY'), 'A slug races slowly on a running track'),
  'peripheral': () => sceneSVG(bg('plain') + T(110, 130, 1.4, K.eye) + T(380, 210, 1.2, K.bug) + `<path d="M200,130 Q300,140 370,200" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="6 6"/>` + LBL(250, 60, 'WAY OUT HERE...'), 'A big eye glances at a tiny bug at the very edge'),
  'urbane': () => sceneSVG(bg('street') + person('npc4', 140, 232, 'smug', 'wave') + T(140, 88, 1, K.tophat) + `<circle cx="149" cy="112" r="8" fill="none" stroke="#FFD23F" stroke-width="2.5"/>` + person('mai', 280, 232, 'love', 'stand', true) + LBL(200, 40, 'GOOD EVENING, MADAM'), 'A smooth city gentleman in a top hat greets Mai'),
  'byzantine': () => sceneSVG(bg('office') + T(200, 220, 1, K.maze) + `<g transform="translate(70,228)">${prop('paper')}</g><g transform="translate(330,228)">${prop('paper')}</g><g transform="translate(340,200)">${prop('paper')}</g>` + person('mai', 200, 200, 'shock', 'shrug', false, .45) + LBL(200, 40, 'FORM 27-B?!'), 'Mai is lost in a giant maze of forms'),
  'documentary': () => sceneSVG(bg('office') + [0, 1, 2, 3].map(i => T(150 + i * 4, 228 - i * 16, 1.6, prop('paper'))).join('') + T(170, 150, 1, K.stamp) + person('bao', 300, 232, 'smug', 'point', true) + LBL(200, 40, 'PROOF. STAMPED.'), 'A stack of stamped papers proving it is real'),
  'subtle': () => sceneSVG(bg('cafe') + person('mai', 290, 232, 'think', 'stand', true) + `<g transform="translate(200,228)">${prop('table')}</g>` + person('kevin', 190, 232, 'smug', 'hold', false, .55) + LBL(240, 150, 'psst...', 16) + LBL(200, 40, 'A WHISPER UNDER THE TABLE'), 'Kevin whispers from under the table'),
  'superficial': () => sceneSVG(`<rect width="400" height="60" fill="#BDE3FF"/><rect y="60" width="400" height="200" fill="#2C5DA8"/><rect y="150" width="400" height="110" fill="#1C3D78"/><path d="M0,60 q20,-8 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0" fill="none" stroke="#fff" stroke-width="3"/>` + T(200, 74, 1, K.fish) + T(320, 250, 1, prop('gift')) + LBL(320, 196, 'TREASURE (ignored)', 14, '#FFD23F') + LBL(200, 40, 'TOP ONLY'), 'A fish swims only at the surface, ignoring the deep treasure'),
  'inhibit': () => sceneSVG(bg('room') + person('kevin', 140, 232, 'sad', 'point') + T(140, 228, 1, K.cage) + `<g transform="translate(300,228)">${prop('phone', 1.4)}</g>` + LBL(300, 120, 'SO CLOSE', 18), 'Kevin is caged and cannot reach his phone'),
  'radical': () => sceneSVG(bg('park') + T(240, 150, 1, prop('tree')) + T(240, 150, 1, K.roots) + person('bao', 110, 232, 'angry', 'run') + `<path d="M150,140 L230,130" stroke="#C9A64A" stroke-width="5"/>` + LBL(240, 40, 'BY THE ROOTS!'), 'Bảo rips a whole tree out by its roots'),
  'transitory': () => sceneSVG(bg('sky') + `<rect y="214" width="400" height="8" fill="#8F97BF"/>` + T(220, 214, 1, K.train) + person('mai', 60, 232, 'happy', 'wave', false, .8) + LBL(240, 60, 'BYE! (GONE)'), 'A train zooms past and is gone'),
  'confound': () => sceneSVG(bg('stage') + T(200, 210, 1.5, K.hat) + `<path d="M226,196 q20,-20 10,-40" fill="none" stroke="#FFA94D" stroke-width="8" stroke-linecap="round"/>` + person('kevin', 90, 232, 'shock', 'shrug') + T(300, 120, 1, prop('q')) + LBL(200, 40, 'WHERE DID THE CAT GO?'), 'A cat vanishes into a magic hat, confusing Kevin'),
  'manifest': () => sceneSVG(bg('stage') + person('kevin', 200, 232, 'smug', 'cheer') + T(110, 80, .8, prop('star')) + T(290, 70, .9, prop('star')) + T(70, 140, 1, prop('lantern')) + T(330, 140, 1, prop('lantern')) + LBL(200, 40, 'LOOK AT ME!'), 'Kevin shows off clearly at a festival'),
  'ire': () => sceneSVG(bg('kitchen') + person('ba', 200, 232, 'angry', 'hips') + T(150, 92, .8, K.steam) + T(250, 92, .8, K.steam, true) + T(200, 228, 1, prop('fire', .7)) + LBL(200, 40, 'STEAM FROM THE EARS'), 'Bà is so angry steam blasts from her ears'),
  'jeopardize': () => sceneSVG(bg('stage') + `<rect x="150" y="150" width="100" height="78" fill="#3E64FF" ${SW}/>` + LBL(200, 196, 'ALL IN', 22, '#FFD23F') + person('kevin', 90, 232, 'smug', 'point') + T(260, 150, 1, K.chips) + T(290, 150, 1, K.chips) + T(320, 228, 1, prop('money')), 'Kevin bets everything on a game show'),
  'yield': () => sceneSVG(bg('park') + T(70, 228, 1, K.yieldsign) + T(230, 228, 1.2, K.pumpkin) + person('mai', 345, 232, 'happy', 'cheer', true, .9) + LBL(230, 40, 'GIVE WAY + BIG HARVEST'), 'A yield sign beside a giant harvested pumpkin'),
  'doctrinaire': () => sceneSVG(bg('library') + person('npc0', 130, 232, 'sad', 'stand') + `<g transform="translate(270,228)">${prop('book', 2)}</g><path d="M150,170 q60,40 100,0" fill="none" stroke="#8F97BF" stroke-width="6" stroke-dasharray="10 4"/>` + LBL(270, 120, 'THE RULEBOOK'), 'A man chained to a giant rulebook'),
  'figurative': () => sceneSVG(bg('street') + T(130, 60, 1, prop('rain')) + T(290, 50, 1, prop('rain')) + [[80, 100], [170, 130], [250, 110], [330, 140], [120, 170], [290, 175]].map(([x, y], i) => T(x, y, 1, i % 2 ? K.dogface : K.catface)).join('') + person('mai', 200, 232, 'shock', 'hold') + T(206, 132, 1, K.umbrella), 'Cats and dogs raining from the clouds onto Mai'),
  'lugubrious': () => sceneSVG(bg('stage') + T(200, 228, 1.4, K.dog('sad')) + `<g transform="translate(130,228)">${prop('mic', 1.4)}</g>` + T(270, 90, .7, prop('note')) + T(310, 120, .6, prop('note')) + LBL(200, 40, 'AWOOOO... (sad)'), 'A sad basset hound singing a mournful song'),
};
