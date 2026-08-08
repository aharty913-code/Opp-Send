export const demoOpportunities = [
  {id:'toast', title:'Territory Account Executive, SMB', company:'Toast', location:'Fredericksburg, VA', stage:'Follow up', heat:92, age:2, next:'Send a specific follow-up today', reason:'Strong title match · recent posting'},
  {id:'nexhealth', title:'Account Executive', company:'NexHealth', location:'Washington, DC', stage:'Review', heat:84, age:5, next:'Review healthcare story', reason:'Remote · relevant sales motion'},
  {id:'performyard', title:'Account Executive', company:'PerformYard', location:'Arlington, VA', stage:'Applied', heat:70, age:9, next:'Find a human or release it', reason:'Good fit · silence accumulating'},
  {id:'paychex', title:'Sales Executive — HR Solutions', company:'Paychex', location:'Arlington, VA', stage:'Applied', heat:55, age:16, next:'One last follow-up', reason:'Application entering the bog'},
  {id:'void', title:'Enterprise Account Executive', company:'Ancient Conglomerate', location:'The Mist (Remote)', stage:'Closed', heat:12, age:31, next:'Archive with dignity', reason:'No response · nutrients returned to earth'}
];

export function normalizeImported(input) {
  const rows = Array.isArray(input) ? input : input?.opportunities || input?.saved || [];
  return rows.map((item, index) => ({
    id: item.id || `import-${Date.now()}-${index}`,
    title: item.title || item.jobTitle || 'Mysterious opportunity',
    company: item.company || 'Unknown corporation',
    location: item.location || 'Location unclear',
    stage: item.stage || 'Captured',
    heat: Number(item.personalFitScore || item.score || 65),
    age: 0,
    next: item.nextAction || 'Review the captured details',
    reason: item.fitSummary || 'Freshly consumed by the toolbar entity'
  }));
}
