import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { illustrations } from './Illustrations.jsx';

// A slide show for a project. It follows the "tabbed carousel" pattern: the thumbnails are tabs, each slide is
// the panel of its tab, and the arrow buttons, the arrow keys and a swipe all move between them. Only the slide
// on screen and the ones next to it load their pictures, so opening a project stays light.

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const SWIPE_PX = 48;

function thumbOf(media, slide, theme) {
  if (slide.kind === 'video') return `${media}/thumbs/${slide.id}.webp`;
  if (slide.kind === 'shot') return `${media}/thumbs/${slide.file}-${theme}.webp`;
  if (slide.kind === 'phones') return `${media}/thumbs/${slide.shots[0].file}-${theme}.webp`;
  return null;
}

function Icon({ name }) {
  const paths = {
    prev: 'M14.5 5.5L8 12l6.5 6.5',
    next: 'M9.5 5.5L16 12l-6.5 6.5',
    play: 'M8 5.5v13l11-6.5z',
    pause: 'M8 5.5v13M16 5.5v13',
    open: 'M9 5H5.5A1.5 1.5 0 0 0 4 6.5v12A1.5 1.5 0 0 0 5.5 20h12a1.5 1.5 0 0 0 1.5-1.5V15M13 4h7v7M20 4l-9 9',
  };
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

// The "window" a screenshot or a clip sits in.
function Window({ children, label }) {
  return (
    <div className="cs-window">
      <div className="cs-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>{label}</span>
      </div>
      <div className="cs-screen">{children}</div>
    </div>
  );
}

function Video({ slide, media, active, label }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [reduced] = useState(prefersReducedMotion);

  // Play while the slide is on screen, pause when it leaves. With reduced motion nothing starts by itself.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active && !reduced) {
      const attempt = video.play?.();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
    } else {
      video.pause?.();
    }
  }, [active, reduced]);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      const attempt = video.play?.();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
    } else {
      video.pause?.();
    }
  };

  const video = (
    <video
      ref={ref}
      className="cs-video"
      muted
      loop
      playsInline
      preload={active ? 'auto' : 'none'}
      poster={`${media}/video/${slide.id}-poster.jpg`}
      width={slide.width}
      height={slide.height}
      aria-label={slide.caption}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
    >
      <source src={`${media}/video/${slide.id}.mp4`} type="video/mp4" />
    </video>
  );

  return (
    <div className="cs-clip">
      {slide.phone ? <div className="cs-phone cs-phone-video">{video}</div> : <Window label={label}>{video}</Window>}
      <button className="cs-play" type="button" onClick={toggle} aria-label={playing ? 'Pause video' : 'Play video'}>
        <Icon name={playing ? 'pause' : 'play'} />
        <span>{playing ? 'Pause' : 'Play'}</span>
      </button>
    </div>
  );
}

function Shot({ slide, media, theme, near, label }) {
  const src = `${media}/screens/${slide.file}-${theme}.webp`;
  return (
    <Window label={label}>
      {near ? (
        <img className={slide.tall ? 'cs-shot tall' : 'cs-shot'} src={src} width={slide.width} height={slide.height} alt={slide.alt} decoding="async" />
      ) : (
        <div className="cs-shot cs-blank" aria-hidden="true" />
      )}
      {slide.tall && (
        <a className="cs-full" href={src} target="_blank" rel="noopener noreferrer">
          See the full page
          <Icon name="open" />
        </a>
      )}
    </Window>
  );
}

function Phones({ slide, media, theme, near }) {
  return (
    <div className="cs-phones">
      {slide.shots.map((shot) => (
        <figure className="cs-phone" key={shot.file}>
          {near ? (
            <img src={`${media}/screens/${shot.file}-${theme}.webp`} width={slide.width} height={slide.height} alt={shot.alt} decoding="async" />
          ) : (
            <div className="cs-blank" aria-hidden="true" />
          )}
        </figure>
      ))}
    </div>
  );
}

function Cards({ slide }) {
  return (
    <ul className="cs-cards">
      {slide.items.map((item) => (
        <li key={item.title}>
          <h4>{item.title}</h4>
          <p>{item.text}</p>
        </li>
      ))}
    </ul>
  );
}

function Illustration({ slide }) {
  const Viz = illustrations[slide.viz];
  return <div className="cs-art">{Viz && <Viz />}</div>;
}

function SlideBody({ slide, media, theme, index, current, label }) {
  const near = Math.abs(index - current) <= 1;
  if (slide.kind === 'video') return <Video slide={slide} media={media} active={index === current} label={label} />;
  if (slide.kind === 'shot') return <Shot slide={slide} media={media} theme={theme} near={near} label={label} />;
  if (slide.kind === 'phones') return <Phones slide={slide} media={media} theme={theme} near={near} />;
  if (slide.kind === 'cards') return <Cards slide={slide} />;
  return <Illustration slide={slide} />;
}

export default function Carousel({ slides, media, theme, label, windowLabel = 'folio' }) {
  const id = useId();
  const [index, setIndex] = useState(0);
  const root = useRef(null);
  const viewport = useRef(null);
  const thumbs = useRef([]);
  const strips = useRef(null);
  const last = slides.length - 1;

  const go = useCallback((next) => setIndex(((next % slides.length) + slides.length) % slides.length), [slides.length]);

  // Keep the chosen thumbnail in view. Only the strip scrolls, and only sideways: scrollIntoView would also move
  // the sheet on a phone and push the slide out of sight.
  useEffect(() => {
    const strip = strips.current;
    const thumb = thumbs.current[index];
    if (!strip || !thumb) return;
    const left = thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2;
    strip.scrollTo?.({ left: Math.max(0, left), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [index]);

  // The arrow keys move between slides while focus is inside the carousel, and a swipe does the same.
  useEffect(() => {
    const element = root.current;
    const area = viewport.current;
    const onKey = (event) => {
      if (event.target.closest?.('[role="tablist"]')) return;
      if (event.key === 'ArrowRight') go(index + 1);
      else if (event.key === 'ArrowLeft') go(index - 1);
      else return;
      event.preventDefault();
    };
    let start = null;
    const onDown = (event) => {
      if (event.pointerType === 'mouse') return;
      start = [event.clientX, event.clientY];
    };
    const onUp = (event) => {
      if (!start) return;
      const dx = event.clientX - start[0];
      const dy = event.clientY - start[1];
      start = null;
      if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
    };
    element.addEventListener('keydown', onKey);
    area.addEventListener('pointerdown', onDown);
    area.addEventListener('pointerup', onUp);
    area.addEventListener('pointercancel', () => {
      start = null;
    });
    return () => {
      element.removeEventListener('keydown', onKey);
      area.removeEventListener('pointerdown', onDown);
      area.removeEventListener('pointerup', onUp);
    };
  }, [go, index]);

  function onThumbKey(event, position) {
    let next = -1;
    if (event.key === 'ArrowRight') next = position + 1;
    else if (event.key === 'ArrowLeft') next = position - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next < 0 && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const target = ((next % slides.length) + slides.length) % slides.length;
    go(target);
    thumbs.current[target]?.focus();
  }

  const slide = slides[index];

  return (
    <section className="carousel" ref={root} aria-roledescription="carousel" aria-label={label}>
      <div className="cs-viewport" ref={viewport}>
        <div className="cs-track" id={`${id}-track`} data-at={index}>
          {slides.map((item, i) => (
            <div
              key={item.title}
              className="cs-slide"
              role="tabpanel"
              id={`${id}-slide-${i}`}
              aria-labelledby={`${id}-tab-${i}`}
              inert={i !== index}
              aria-hidden={i !== index ? true : undefined}
            >
              <SlideBody slide={item} media={media} theme={theme} index={i} current={index} label={windowLabel} />
            </div>
          ))}
        </div>
        <button className="cs-arrow cs-prev" type="button" aria-controls={`${id}-track`} aria-label="Previous slide" onClick={() => go(index - 1)}>
          <Icon name="prev" />
        </button>
        <button className="cs-arrow cs-next" type="button" aria-controls={`${id}-track`} aria-label="Next slide" onClick={() => go(index + 1)}>
          <Icon name="next" />
        </button>
      </div>

      <div className="cs-caption" aria-live="polite" aria-atomic="true">
        <p className="cs-count">
          {index + 1} / {slides.length}
        </p>
        <h3>{slide.title}</h3>
        <p>{slide.caption}</p>
      </div>

      <div className="cs-thumbs" role="tablist" aria-label="Choose a slide" ref={strips}>
        {slides.map((item, i) => {
          const thumb = thumbOf(media, item, theme);
          return (
            <button
              key={item.title}
              ref={(node) => {
                thumbs.current[i] = node;
              }}
              className={`cs-thumb${item.kind === 'video' ? ' is-video' : ''}${thumb ? '' : ' is-text'}`}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-controls={`${id}-slide-${i}`}
              aria-selected={i === index}
              aria-label={item.title}
              tabIndex={i === index ? 0 : -1}
              onClick={() => go(i)}
              onKeyDown={(event) => onThumbKey(event, i)}
            >
              {thumb ? <img src={thumb} width="160" height="100" alt="" loading="lazy" decoding="async" /> : <span>{item.title}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
