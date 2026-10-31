import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { content as c } from './content';
import './styles.css';

function Star({ className = '' }) { return <span aria-hidden="true" className={`star ${className}`}>✳</span>; }
function Photo({ photo, eager = false, ...props }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="missing-photo" role="img" aria-label={photo.alt}>✧<span>Add your photo here</span></div> : <img {...props} src={photo.src} alt={photo.alt} width="600" height="740" loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />;
}
function Confetti({ burst }) {
  if (!burst) return null;
  return <div className="confetti" key={burst} aria-hidden="true">{Array.from({ length: 36 }, (_, i) => <i key={i} style={{ '--x': `${(i * 29) % 100}vw`, '--r': `${i * 57}deg`, '--delay': `${(i % 7) * 0.06}s`, background: ['#b9a4db','#efb49b','#b4c4a1','#f0cf6b'][i % 4] }} />)}</div>;
}
function Lightbox({ index, setIndex, onClose }) {
  const ref = useRef(null);
  const returnFocus = useRef(document.activeElement);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previous; returnFocus.current?.focus(); };
  }, []);
  function keydown(e) {
    if (e.key === 'ArrowRight') setIndex((index + 1) % c.photos.length);
    if (e.key === 'ArrowLeft') setIndex((index + c.photos.length - 1) % c.photos.length);
  }
  return <dialog ref={ref} className="lightbox" aria-label="Photo viewer" onCancel={onClose} onKeyDown={keydown} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="lightbox-inner"><button className="lightbox-close" onClick={onClose} autoFocus aria-label="Close photo viewer">✕</button><Photo photo={c.photos[index]} eager /><div className="lightbox-caption"><button aria-label="Previous photo" onClick={() => setIndex((index + c.photos.length - 1) % c.photos.length)}>←</button><p aria-live="polite">{c.photos[index].label}<small>{index + 1} / {c.photos.length}</small></p><button aria-label="Next photo" onClick={() => setIndex((index + 1) % c.photos.length)}>→</button></div></div>
  </dialog>;
}
function GalleryItem({ photo, index, open }) {
  const [flipped, setFlipped] = useState(false);
  return <article className={`gallery-item gallery-item-${index}`}>
    <div className="polaroid"><button className={`flip-photo ${flipped ? 'is-flipped' : ''}`} aria-pressed={flipped} aria-label={`${flipped ? 'Show photo' : 'Read note'}: ${photo.label}`} onClick={() => setFlipped(!flipped)}><span className="photo-front"><Photo photo={photo} /><span className="flip-hint">↻ tap for a little note</span></span><span className="photo-back"><Star /><span>{photo.note}</span><span className="hand">a little reminder, from me</span></span></button><div className="photo-caption"><span className="hand">{photo.label}</span><button onClick={() => open(index)} aria-label={`View full image: ${photo.label}`}>↗</button></div></div><p className="museum-label">{photo.caption}</p>
  </article>;
}
function Quiz() {
  const [answers, setAnswers] = useState([]);
  const question = c.quiz[answers.length];
  const result = c.quizResults[Math.min(2, Math.floor(answers.reduce((a, b) => a + b, 0) / 2.4))];
  return <div className="quiz-content" aria-live="polite">{question ? <><p className="tiny">QUESTION {answers.length + 1} OF {c.quiz.length}</p><h4>{question.question}</h4><div className="quiz-options">{question.answers.map((answer, i) => <button key={answer} onClick={() => setAnswers([...answers, i])}>{answer}<span>↗</span></button>)}</div></> : <><p className="tiny">THE EXTREMELY UNSCIENTIFIC VERDICT</p><h4>{result.title} ✧</h4><p>{result.description}</p><button className="text-button" onClick={() => setAnswers([])}>Try another timeline ↻</button></>}</div>;
}
function App() {
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(0);
  const [character, setCharacter] = useState(3);
  const [lightbox, setLightbox] = useState(null);
  const [adventure, setAdventure] = useState(null);
  const [secret, setSecret] = useState(false);
  const [vibe, setVibe] = useState(-1);
  const [letterOpen, setLetterOpen] = useState(false);
  const heroRef = useRef(null);
  const celebrationTimer = useRef(null);
  useEffect(() => { document.title = `The ${c.name} Universe`; return () => clearTimeout(celebrationTimer.current); }, []);
  function celebrate() { setRevealed(true); setBurst(Date.now()); clearTimeout(celebrationTimer.current); celebrationTimer.current = setTimeout(() => setBurst(0), 2800); }
  function replay() { celebrate(); heroRef.current.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }
  const chosen = c.characters[character];
  return <><a className="skip-link" href="#main">Skip to the scrapbook</a><Confetti burst={burst} />
    <header className="site-header"><a className="brand" href="#home" aria-label="Back to the beginning"><Star /> a little universe<span className="brand-dot">.</span></a><nav aria-label="Main navigation"><a href="#museum">The museum</a><a href="#quests">Side quests</a><a className="nav-note" href="#letter">A note for you <span>↗</span></a></nav></header>
    <main id="main"><section className="hero section-wrap" id="home" ref={heroRef}>
      <div className="hero-copy"><p className="hand personal-greeting">{c.greeting}</p><p className="eyebrow"><span className="tiny-spark">✧</span> A FRIENDSHIP-SIZED CORNER OF THE INTERNET</p><h1>The <span className="name-word">{c.name}<svg viewBox="0 0 500 22" preserveAspectRatio="none" aria-hidden="true"><path d="M4 15 Q 230 -3 494 12 M20 21 Q250 7 480 18" /></svg></span><em>Universe.</em></h1><p className="hero-intro">{c.opening}</p><button className="primary-button" onClick={celebrate}>{revealed ? 'A little more confetti?' : c.revealButton}<span>↗</span></button><p className="hand hero-footnote">a small gift, made just for you <span>↗</span></p></div>
      <div className={`hero-collage ${revealed ? 'revealed' : ''}`}><span className="orbit orbit-one" aria-hidden="true"/><span className="orbit orbit-two" aria-hidden="true"/><Star className="hero-star"/><div className="little-label">ONE OF A KIND<br/><span>100% herself</span></div><div className="hero-photo polaroid"><span className="tape" aria-hidden="true"/><div className="hero-photo-picture">{revealed ? <Photo photo={c.photos[0]} eager /> : <div className="gift-cover"><Star /><span className="hand">the internet did<br/>a good thing.</span><span className="tiny">A VERY COOL HUMAN INSIDE</span></div>}</div><p className="hand">{revealed ? `Meet ${c.name} ♡` : 'a very cool human, indeed.'}</p></div><div className="round-sticker">CREATIVE MIND<br/><span>good soul</span><br/>EXCELLENT FRIEND</div><span className="hand collage-note">the main character<br/>of this little corner ↖</span><div className="reveal-note" role="status">{revealed ? `${c.name} — ${c.introduction}` : 'A tiny celebration of a very good friend.'}</div></div>
      <div className="hero-bottom"><span>MADE BY {c.from.toUpperCase()}, WITH GOOD VIBES</span><a href="#characters">There’s more down here <span>↓</span></a><span className="desktop-only">INTERNET FRIENDS. REAL FRIENDSHIP.</span></div>
    </section>
    <div className="ticker" aria-hidden="true"><div>CREATIVE SOUL <span>✳</span> GOOD CONVERSATIONS <span>✳</span> A LITTLE BIT OF CHAOS <span>✳</span> ENTIRELY HERSELF <span>✳</span> CREATIVE SOUL <span>✳</span> GOOD CONVERSATIONS</div></div>
    <section id="characters" className="characters section-wrap section-space"><div className="section-heading"><div><p className="eyebrow">01 / THE MANY SIDES OF YOU</p><h2>Pick your <em>character.</em></h2></div><p>Some people have a thing.<br/>You apparently have a whole collection.</p></div><div className="character-layout"><div className="character-choices" aria-label="Choose a talent">{c.characters.map((item, i) => <button key={item.name} aria-pressed={character === i} className={character === i ? 'selected' : ''} onClick={() => { setCharacter(i); if (i === 3) { setBurst(Date.now()); clearTimeout(celebrationTimer.current); celebrationTimer.current = setTimeout(() => setBurst(0), 2800); } }}><span className="character-icon">{item.icon}</span><span>{item.name}</span><span className="choice-arrow">↗</span></button>)}<p className="hand choice-note">multi-talented is an understatement.</p></div><div className="character-feature"><div className="character-picture"><Photo key={chosen.photo} photo={c.photos[chosen.photo]} /><span className="character-badge">CURRENTLY PLAYING<br/><b>{chosen.name.startsWith('All') ? 'the whole collection' : chosen.name}</b></span></div><div className="character-caption" aria-live="polite"><span aria-hidden="true">✧</span><h3>{chosen.title}</h3><p>{chosen.caption}</p></div></div></div></section>
    <section id="museum" className="museum section-space"><div className="section-wrap"><div className="section-heading"><div><p className="eyebrow">02 / A FEW THINGS WORTH FRAMING</p><h2>A tiny museum <em>of you.</em></h2></div><p>No velvet ropes. No serious art critic.<br/>Just a few little reasons to smile.</p></div><div className="gallery">{c.photos.map((photo, index) => <GalleryItem key={photo.src} photo={photo} index={index} open={setLightbox} />)}</div><p className="hand museum-footer">Every photo has a little something on the other side. ↻</p></div></section>
    <section id="quests" className="section-wrap section-space quests"><div className="section-heading"><div><p className="eyebrow">03 / FOR THE PLOT</p><h2>Friendship <em>side quests.</em></h2></div><p>A few completely unserious possibilities.<br/>Excellent company included.</p></div><div className="quest-layout"><article className="adventure-paper"><div className="quest-number">SIDE QUEST / 01</div><span className="hand adventure-tag">no passport required</span><h3>Where are we<br/>off to?</h3><p>Pick an imaginary adventure.</p><div className="adventure-options">{c.adventures.map((item, i) => <button key={item.name} aria-pressed={adventure === i} onClick={() => setAdventure(i)}><span>{item.icon}</span>{item.name}<span>↗</span></button>)}</div><p className="adventure-result" aria-live="polite">{adventure === null ? 'One click. A whole hypothetical afternoon.' : c.adventures[adventure].result}</p></article><article className="quiz-paper"><div className="quest-number">SIDE QUEST / 02</div><h3>How much chaos would<br/>our hangout contain?</h3><Quiz /></article></div><article className="forbidden-paper"><div><p className="quest-number">SIDE QUEST / 03</p><h3>A test of self-control.</h3><p aria-live="polite">{secret ? c.secret : 'A mysterious button. A very clear instruction.'}</p></div><button className={`forbidden-button ${secret ? 'pressed' : ''}`} onClick={() => setSecret(!secret)}>{secret ? 'Okay, reset it ↻' : 'Don’t press this'}<span aria-hidden="true">{secret ? '✓' : '↗'}</span></button></article><p className="local-note">Just for fun. Your choices stay here; nothing is sent to {c.from}.</p></section>
    <section className="vibes section-space" id="vibes"><div className="section-wrap vibes-layout"><div><p className="eyebrow">04 / KEEP THIS ONE IN YOUR POCKET</p><h2>Emergency<br/><em>good vibes.</em><Star /></h2><p>For the big days. The “meh” days.<br/>And the days that need a tiny reminder.</p><button className="vibe-button" onClick={() => setVibe((vibe + 1) % c.vibes.length)}>One good vibe, please <span>✳</span></button><p className="hand">unlimited refills. friendship policy.</p></div><div className="vibe-note"><span className="tape" aria-hidden="true"/><span className="tiny">A LITTLE REMINDER FOR YOU</span><blockquote aria-live="polite" aria-atomic="true">{vibe < 0 ? 'A little encouragement is waiting on the other side of that button.' : c.vibes[vibe]}</blockquote><div><span className="hand">you’ve got this.</span><span className="tiny">{vibe < 0 ? 'READY WHEN YOU ARE' : `${String(vibe + 1).padStart(2, '0')} / ${c.vibes.length}`}</span></div></div></div></section>
    <section id="letter" className="letter-section section-wrap section-space"><p className="eyebrow">05 / ONE LAST LITTLE THING</p><h2>You’ve got <em>friend mail.</em></h2><p>Because some things deserve more than a chat bubble.</p><div className={`envelope-scene ${letterOpen ? 'open' : ''}`}><button className="envelope" aria-expanded={letterOpen} aria-controls="friend-letter" onClick={() => setLetterOpen(!letterOpen)}><span className="envelope-flap"/><span className="envelope-front"/><span className="envelope-to hand">To: {c.name}<small>from your corner-of-the-internet friend</small></span><span className="wax-seal">✳</span><span className="envelope-action">{letterOpen ? 'Close the envelope ↑' : 'A little note for you · click to open'}</span></button>{letterOpen && <article id="friend-letter" className="letter-paper"><span className="tiny">SENT WITH GOOD VIBES, ALWAYS</span><h3 className="hand">Hey {c.name},</h3><p>{c.letter}</p><p className="hand signature">— {c.from}</p><Star /></article>}</div><button className="text-button replay" onClick={replay}>A little more celebration? Replay the beginning <span>↻</span></button></section>
    </main><footer className="site-footer section-wrap"><a className="brand" href="#home"><Star /> a little universe.</a><p>Made for a friend in {c.location}.<br/>Very glad the internet did its thing.</p><span className="hand">From {c.from}, with friendship.</span></footer>{lightbox !== null && <Lightbox index={lightbox} setIndex={setLightbox} onClose={() => setLightbox(null)} />}</>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
