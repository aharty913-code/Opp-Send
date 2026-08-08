import {useEffect, useMemo, useState} from 'react';
import {demoOpportunities, normalizeImported} from '@opp-send/shared';

const nav = ['Today', 'Opportunities', 'Documents', 'Search health'];

function Mark({children, tone='green'}) { return <span className={`mark ${tone}`}>{children}</span>; }

function OpportunityRow({item, onOpen, featured=false}) {
  return <button className={`opportunity-row ${featured ? 'featured' : ''}`} onClick={() => onOpen(item)}>
    <span className="row-company">{item.company}</span>
    <span className="row-title">{item.title}</span>
    <span className="row-meta">{item.location}</span>
    <span className="row-action">{item.next}</span>
    <span className="row-score">{item.heat}<small>%</small></span>
  </button>;
}

function App() {
  const [section, setSection] = useState('Today');
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('opp-send-opportunities')) || demoOpportunities; } catch { return demoOpportunities; } });
  const [selected, setSelected] = useState(null);
  const [importing, setImporting] = useState(false);
  const [extensionHelp, setExtensionHelp] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [writer, setWriter] = useState('Professional');
  const [draft, setDraft] = useState('');
  const [paste, setPaste] = useState('');
  const priority = useMemo(() => items.filter(x => x.stage !== 'Closed').sort((a,b) => b.heat-a.heat), [items]);
  const aging = useMemo(() => items.filter(x => x.age >= 7 || x.stage === 'Closed'), [items]);

  useEffect(() => { localStorage.setItem('opp-send-opportunities', JSON.stringify(items)); }, [items]);
  function openOpportunity(item) { setSelected(item); setDrafting(false); setDraft(''); }
  function importData() { try { const incoming = normalizeImported(JSON.parse(paste)); if (!incoming.length) throw new Error(); setItems(current => [...incoming, ...current]); setPaste(''); setImporting(false); } catch { alert('We could not read that export. Paste the complete opportunity JSON and try again.'); } }
  function generateDraft() {
    const body = writer === 'Professional'
      ? `I wanted to follow up on the ${selected.title} opportunity. I remain interested in the role, particularly because ${selected.reason.toLowerCase()}. My experience with [relevant example] could help ${selected.company} [specific outcome].`
      : writer === 'Direct'
        ? `Following up on the ${selected.title} role. My experience in [relevant area] aligns with [priority from the job description]. Is the team still moving forward with interviews?`
        : `I am following up on the ${selected.title} position because [specific reason]. In my previous work, I [relevant achievement], which appears directly relevant to ${selected.company}'s need for [priority].`;
    setDraft(`Hi [name],\n\n${body}\n\nBest,\n[Your name]`);
  }

  const activeNav = section === 'Pipeline' ? 'Opportunities' : section === 'Creature domain' ? 'Search health' : section;

  return <div className="workspace">
    <header className="topbar">
      <button className="wordmark" onClick={() => setSection('Today')}>OPP<span>•</span>SEND</button>
      <nav>{nav.map(label => <button className={activeNav === label ? 'active' : ''} onClick={() => setSection(label === 'Opportunities' ? 'Pipeline' : label === 'Search health' ? 'Creature domain' : label)} key={label}>{label}</button>)}</nav>
      <button className="capture-button" onClick={() => setImporting(true)}><span>+</span> Add opportunity</button>
    </header>

    <main>
      {section === 'Today' && <>
        <section className="editorial-hero">
          <div><p className="eyebrow">FRIDAY, AUGUST 7 <Mark>3 actions</Mark></p><h1>Do what<br/>matters <i>next.</i></h1></div>
          <p className="hero-note">Opp-Send reviews your active search and surfaces the actions most likely to create momentum.</p>
          <div className="tentacle-mark" aria-hidden="true"><span>◜</span><span>〰</span></div>
        </section>

        <section className="next-action">
          <div className="action-index">01</div>
          <div><p className="eyebrow">HIGHEST PRIORITY</p><h2>Follow up with Toast today.</h2><p>The role is a strong match and was posted recently. A specific follow-up now has more value than another low-context application.</p><button onClick={() => openOpportunity(priority[0])}>Plan the next step <span>↗</span></button></div>
          <div className="signal"><strong>92</strong><span>personal fit</span></div>
        </section>

        <section className="opportunity-section">
          <div className="section-title"><div><p className="eyebrow">PRIORITIZED OPPORTUNITIES <Mark tone="pink">DEMO DATA</Mark></p><h2>Focus where the signal is strongest.</h2></div><button onClick={() => setSection('Pipeline')}>View all opportunities ↗</button></div>
          <div className="opportunity-list">{priority.slice(0,4).map((item,index) => <OpportunityRow item={item} featured={index===0} onOpen={openOpportunity} key={item.id}/>)}</div>
        </section>

        <section className="insight-grid">
          <article className="metric-card pink"><p className="eyebrow">SEARCH HEALTH</p><strong>72</strong><h3>Focused, with room to improve.</h3><p>Your recent opportunities align well with your target titles. Follow-through is currently the largest gap.</p><button onClick={() => setSection('Creature domain')}>Review search health ↗</button></article>
          <article className="activity-card"><p className="eyebrow">RECENT ACTIVITY</p><ul><li><time>Today</time><span>Toast moved to follow-up</span></li><li><time>Yesterday</time><span>NexHealth captured from LinkedIn</span></li><li><time>Aug 4</time><span>Account Executive resume updated</span></li><li><time>Aug 1</time><span>PerformYard application submitted</span></li></ul></article>
        </section>

        <section className="aging-section"><div className="section-title"><div><p className="eyebrow">NEEDS A DECISION</p><h2>Applications losing momentum.</h2></div><p>Follow up, archive, or define a concrete next action.</p></div><div className="aging-grid">{aging.map(item => <button onClick={() => openOpportunity(item)} key={item.id}><span>{item.company}</span><strong>{item.title}</strong><small>{item.age} days without activity</small><i>{item.next} ↗</i></button>)}</div></section>
      </>}

      {section === 'Pipeline' && <section className="page-section"><p className="eyebrow">OPPORTUNITIES</p><h1>Every lead.<br/><i>One clear view.</i></h1><div className="pipeline editorial-pipeline">{['Captured','Review','Applied','Follow up','Closed'].map(stage => <div key={stage}><h3>{stage}</h3>{items.filter(x=>x.stage===stage).map(x=><OpportunityRow item={x} onOpen={openOpportunity} key={x.id}/>)}</div>)}</div></section>}

      {section === 'Documents' && <section className="page-section"><p className="eyebrow">DOCUMENTS</p><h1>Your experience,<br/><i>ready to adapt.</i></h1><div className="document-grid"><article><span>01</span><h2>Account Executive resume</h2><p>Primary version for consultative and full-cycle sales roles.</p><button>Edit document ↗</button></article><article><span>02</span><h2>Enterprise sales resume</h2><p>Longer sales cycles, strategic accounts, and complex buying groups.</p><button>Edit document ↗</button></article><article className="new-document"><span>+</span><h2>Create a document</h2><p>Build a reusable resume version or application prompt.</p><button>Create new ↗</button></article></div></section>}

      {section === 'Creature domain' && <section className="page-section health-page"><p className="eyebrow">SEARCH HEALTH</p><h1>See the system.<br/><i>Adjust the search.</i></h1><div className="health-layout"><article className="health-score"><strong>72</strong><span>Overall search health</span><div className="organic-line"/></article><div className="health-details"><div><span>Opportunity quality</span><strong>84</strong><progress value="84" max="100"/></div><div><span>Role alignment</span><strong>79</strong><progress value="79" max="100"/></div><div><span>Follow-through</span><strong>51</strong><progress value="51" max="100"/></div><div><span>Search consistency</span><strong>68</strong><progress value="68" max="100"/></div></div></div><div className="extension-callout"><div><p className="eyebrow">BROWSER EXTENSION</p><h2>Capture opportunities without breaking focus.</h2><p>Bring job details into Opp-Send from LinkedIn and review them here.</p></div><button onClick={() => setExtensionHelp(true)}>Installation instructions ↗</button></div></section>}
    </main>

    {selected && <div className="scrim" onClick={() => setSelected(null)}><aside className="drawer" onClick={e=>e.stopPropagation()}><button className="close" aria-label="Close opportunity" onClick={()=>setSelected(null)}>×</button><p className="eyebrow">{selected.stage} · {selected.heat}% PERSONAL FIT</p><h2>{selected.title}</h2><h3>{selected.company}</h3><p>{selected.location}</p><hr/><h3>Recommended next action</h3><p>{selected.next}. {selected.reason}.</p><button onClick={()=>setDrafting(!drafting)}>Plan next step</button>{drafting && <div className="draft"><label htmlFor="writer">Writing style</label><select id="writer" value={writer} onChange={e=>setWriter(e.target.value)}><option>Professional</option><option>Direct</option><option>Evidence-led</option></select><label htmlFor="follow-up">Draft</label><textarea id="follow-up" value={draft || `Hi [name],\n\nI'm following up on the ${selected.title} position because [specific reason]. My experience with [relevant proof] could help ${selected.company} [useful outcome].`} onChange={e=>setDraft(e.target.value)}/><button onClick={generateDraft}>Generate draft</button></div>}</aside></div>}
    {importing && <div className="scrim centered" onClick={()=>setImporting(false)}><aside className="modal" onClick={e=>e.stopPropagation()}><button className="close" aria-label="Close import" onClick={()=>setImporting(false)}>×</button><p className="eyebrow">ADD OPPORTUNITY</p><h2>Import an extension capture</h2><p>Until account sync is connected, paste the opportunity export below.</p><textarea value={paste} onChange={e=>setPaste(e.target.value)} placeholder='[{"title":"Account Executive","company":"Example Corp"}]'/><button onClick={importData}>Import opportunity</button></aside></div>}
    {extensionHelp && <div className="scrim centered" onClick={()=>setExtensionHelp(false)}><aside className="modal" onClick={e=>e.stopPropagation()}><button className="close" aria-label="Close instructions" onClick={()=>setExtensionHelp(false)}>×</button><p className="eyebrow">BROWSER EXTENSION</p><h2>Install the current prototype</h2><ol><li>Download or clone the Opp-Send GitHub repository.</li><li>Open <code>chrome://extensions</code> in Chrome.</li><li>Enable Developer mode.</li><li>Select Load unpacked and choose <code>apps/extension</code>.</li><li>Open a LinkedIn job listing and select the Opp-Send icon.</li></ol><a href="https://github.com/aharty913-code/Opp-Send" target="_blank" rel="noreferrer">Open GitHub repository ↗</a></aside></div>}
  </div>;
}

export default App;
