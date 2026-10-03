export default function Panel({ id, title, kicker, children }) {
  return (
    <section className="panel" id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`}>
      <header className="phead">
        <h2>{title}</h2>
        <p className="kick">{kicker}</p>
      </header>
      {children}
    </section>
  );
}
