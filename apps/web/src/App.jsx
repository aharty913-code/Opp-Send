import {useEffect, useMemo, useState} from 'react';
import {demoOpportunities, normalizeImported} from '@opp-send/shared';

const nav = ['Dashboard', 'Pipeline', 'Documents', 'Creature domain'];

function OpportunityCard({item, onOpen, graveyard=false}) {
  return <button className={`opp-card ${graveyard ? 'grave' : ''}`} onClick={() => onOpen(item)}>
    <span className="opp-top"><span className="company">{item.company}</span><span className="heat">{item.heat}% fit</span></span>
    <strong>{item.title}</strong><span className="muted">{item.location} · {item.stage}</span><span className="next">↳ {item.next}</span>
    {graveyard && <span className="rot">Silent for {item.age} days · {item.reason}</span>}
  </button>;
}

function App() {
  const [section, setSection] = useState('Dashboard');
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('opp-send-opportunities')) || demoOpportunities; } catch { return demoOpportunities; } });
  const [selected, setSelected] = useState(null);
  const [importing, setImporting] = useState(false);
  const [extensionHelp, setExtensionHelp] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [writer, setWriter] = useState('Warm professional');
  const [draft, setDraft] = useState('');
  const [paste, setPaste] = useState('');
  const priority = useMemo(() => items.filter(x => x.stage !== 'Closed').sort((a,b) => b.heat-a.heat).slice(0,3), [items]);
  const graveyard = useMemo(() => items.filter(x => x.age >= 7 || x.stage === 'Closed'), [items]);

  useEffect(() => { localStorage.setItem('opp-send-opportunities', JSON.stringify(items)); }, [items]);
  function openOpportunity(item) { setSelected(item); setDrafting(false); setDraft(''); }
  function importData() { try { const incoming = normalizeImported(JSON.parse(paste)); if (!incoming.length) throw new Error(); setItems(current => [...incoming, ...current]); setPaste(''); setImporting(false); } catch { alert('The creature could not digest that JSON. Copy the saved opportunities again and paste the whole thing.'); } }
  function generateDraft() {
    const voice = writer === 'Warm professional' ? `I wanted to follow up on the ${selected.title} opportunity. I was especially interested in ${selected.reason.toLowerCase()}, and my experience with [relevant proof] could help ${selected.company} [useful outcome].` : writer === 'Concise operator' ? `Following up on the ${selected.title} role. My background in [relevant proof] maps directly to [priority from the job description]. Is the team still moving forward with interviews?` : `The ancient machinery of hiring has gone quiet, so I am gently rattling one tasteful chain. I remain interested in the ${selected.title} role because [specific human reason], and I would love to discuss how [relevant proof] could help ${selected.company}.`;
    setDraft(`Hi [name],\n\n${voice}\n\nBest,\n[Your name]`);
  }

  return <div className="app-shell">
    <header><button className="brand" onClick={() => setSection('Dashboard')}><span className="eye">◉</span> OPP-SEND</button><nav>{nav.map(label => <button className={section === label ? 'active' : ''} onClick={() => setSection(label)} key={label}>{label}</button>)}</nav><button className="import" onClick={() => setImporting(true)}>Import capture</button></header>
    <main>
      <section className="intro"><div><p className="kicker">TODAY'S PRODUCTIVITY RITUAL</p><h1>{section === 'Dashboard' ? 'Feed the search. Keep your soul.' : section}</h1><p>The ancient one does not demand perfection. It requests one useful morsel.</p></div><div className="streak"><strong>3</strong><span>useful acts<br/>this week</span></div></section>
      {section === 'Dashboard' && <><section className="dashboard-grid"><div className="priority"><div className="section-head"><div><p className="kicker">HOT, FRESH, ACTIONABLE</p><h2>Priorit-opps <small className="demo-pill">DEMO DATA</small></h2></div><span>{priority.length} require mortal attention</span></div>{priority.map(x => <OpportunityCard item={x} onOpen={openOpportunity} key={x.id}/>)}</div><button className="creature-portal" onClick={() => setSection('Creature domain')}><img src="/applicant-eater.webp" alt="Green opportunity eater holding application papers"/><div className="portal-copy"><span className="status-dot"/> THE CREATURE IS PECKISH<h2>Its domain</h2><p>Goals, resumes, extension, and an emotionally complicated relationship with your application quality.</p><strong>Enter the maw →</strong></div></button></section><section className="graveyard"><div className="section-head"><div><p className="kicker">APPLICATION GRAVEYARD</p><h2>Where silence develops a rich ecosystem</h2></div><span>No shame. Only compost.</span></div><div className="grave-grid">{graveyard.map(x => <OpportunityCard graveyard item={x} onOpen={openOpportunity} key={x.id}/>)}</div></section></>}
      {section === 'Pipeline' && <section className="panel"><p className="kicker">ALL OPPORTUNITIES</p><h2>The corporate slop conveyor</h2><div className="pipeline">{['Captured','Review','Applied','Follow up','Closed'].map(stage => <div key={stage}><h3>{stage}</h3>{items.filter(x=>x.stage===stage).map(x=><OpportunityCard item={x} onOpen={openOpportunity} key={x.id}/>)}</div>)}</div></section>}
      {section === 'Documents' && <section className="panel"><p className="kicker">DOCUMENT SPELLBOOK</p><h2>Reusable evidence that you are employable</h2><div className="tile-grid"><article><h3>Account Executive resume</h3><p>Consultative sales, pipeline ownership, mysteriously tasteful bullet points.</p><button>Edit ingredients</button></article><article><h3>Mad-lib cover letter</h3><p>I am excited about [THING] because [HUMAN-SOUNDING REASON]...</p><button>Open prompt</button></article><article><h3>Enterprise sales resume</h3><p>For opportunities requiring longer cycles and larger ceremonial budgets.</p><button>Edit ingredients</button></article></div></section>}
      {section === 'Creature domain' && <section className="domain"><div><p className="kicker">THE MAW BEHIND THE TOOLBAR</p><h2>Your creature is hungry, not disappointed</h2><p>Set a humane weekly goal, keep reusable resumes nearby, and install the portal that lets this thing consume job pages.</p><div className="goal"><span>Weekly useful actions</span><strong>3 / 5</strong><progress value="3" max="5"/></div><button onClick={() => setSection('Documents')}>Manage resumes</button> <button className="secondary" onClick={() => setExtensionHelp(true)}>Extension instructions</button></div><img src="/applicant-eater.webp" alt="The opportunity eater"/></section>}
    </main>
    {selected && <div className="scrim" onClick={() => setSelected(null)}><aside className="drawer" onClick={e=>e.stopPropagation()}><button className="close" aria-label="Close opportunity" onClick={()=>setSelected(null)}>×</button><p className="kicker">{selected.stage} · {selected.heat}% FIT</p><h2>{selected.title}</h2><h3>{selected.company}</h3><p>{selected.location}</p><hr/><h3>Recommended next morsel</h3><p>{selected.next}. {selected.reason}.</p><button onClick={()=>setDrafting(!drafting)}>Plan next step</button>{drafting && <div className="draft"><label htmlFor="writer">Choose your correspondence entity</label><select id="writer" value={writer} onChange={e=>setWriter(e.target.value)}><option>Warm professional</option><option>Concise operator</option><option>Tasteful necromancer</option></select><label htmlFor="follow-up">Follow-up ingredients</label><textarea id="follow-up" value={draft || `Hi [name],\n\nI'm excited about the ${selected.title} position because [specific reason]. My experience with [relevant proof] could help ${selected.company} [useful outcome].`} onChange={e=>setDraft(e.target.value)}/><button onClick={generateDraft}>Generate a less haunted draft</button></div>}</aside></div>}
    {importing && <div className="scrim" onClick={()=>setImporting(false)}><aside className="import-modal" onClick={e=>e.stopPropagation()}><button className="close" aria-label="Close import" onClick={()=>setImporting(false)}>×</button><p className="kicker">EXTENSION BRIDGE</p><h2>Regurgitate saved opportunities</h2><p>Until account sync exists, copy the extension's saved opportunity JSON and paste it here.</p><textarea value={paste} onChange={e=>setPaste(e.target.value)} placeholder='[{"title":"Account Executive","company":"Example Corp"}]'/><button onClick={importData}>Digest import</button></aside></div>}
    {extensionHelp && <div className="scrim" onClick={()=>setExtensionHelp(false)}><aside className="import-modal" onClick={e=>e.stopPropagation()}><button className="close" aria-label="Close instructions" onClick={()=>setExtensionHelp(false)}>×</button><p className="kicker">SUMMON THE TOOLBAR ENTITY</p><h2>Load the Chrome extension</h2><ol className="instructions"><li>Download or clone the Opp-Send GitHub repository.</li><li>Open <code>chrome://extensions</code> in Chrome.</li><li>Turn on <strong>Developer mode</strong>.</li><li>Choose <strong>Load unpacked</strong> and select <code>apps/extension</code>.</li><li>Open a LinkedIn job listing and click the Opp-Send icon.</li></ol><a className="github-link" href="https://github.com/aharty913-code/Opp-Send" target="_blank" rel="noreferrer">Open the repository →</a></aside></div>}
  </div>;
}

export default App;
