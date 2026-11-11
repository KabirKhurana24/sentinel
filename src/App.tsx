import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import {
  Activity, AlertOctagon, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight,
  Bell, Bot, Check, CheckCheck, CheckCircle2, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, Clock3, Download, Ellipsis, Eye, EyeOff, FileCheck2,
  Filter, Fingerprint, Gauge, GitBranch, KeyRound, LayoutDashboard, ListChecks,
  LockKeyhole, LogOut, Menu, Plus, RefreshCw, Search, Shield,
  ShieldAlert, ShieldCheck, SlidersHorizontal, Sparkles, Users, X, Zap,
} from 'lucide-react'

type OwnerStatus = 'Active' | 'Departed' | 'Unknown'
type AgentStatus = 'Active' | 'Suspended' | 'Inactive'
type Agent = {
  id: string; name: string; type: string; platform: string; owner: string; ownerStatus: OwnerStatus;
  team: string; environment: string; status: AgentStatus; risk: number; riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  lastActive: string; daysInactive: number; scopes: string[]; resources: string[]; credential: string;
  discovery: string; created: string; notes: string; reviewed: boolean; flags: string[];
}
type Event = { id: number; action: string; target: string; actor: string; time: string; detail: string; tone: 'danger' | 'success' | 'info' | 'warning' }
type Review = { id: string; title: string; target: string; reviewer: string; due: string; priority: string; status: 'Pending' | 'Approved' | 'Completed'; reason: string }
type NavKey = 'overview' | 'inventory' | 'risk' | 'reviews' | 'audit'

const seedAgents: Agent[] = [
  { id:'AG-1042', name:'Deal Desk Copilot', type:'AI Agent', platform:'Azure AI Foundry', owner:'Daniel Brooks', ownerStatus:'Departed', team:'Revenue Operations', environment:'Production', status:'Active', risk:96, riskLevel:'Critical', lastActive:'Today, 09:42', daysInactive:0, scopes:['Salesforce: Admin','SharePoint: Read','Contract Vault: Read'], resources:['Salesforce','SharePoint','Contract Vault'], credential:'OAuth service principal', discovery:'Microsoft Entra ID', created:'18 Feb 2026', notes:'Created for contract review automation. Owner account was disabled 12 days ago; agent identity remains active.', reviewed:false, flags:['Owner departed','Admin privilege','Sensitive contract data'] },
  { id:'AG-1038', name:'Finance Reconciliation Bot', type:'Service Account', platform:'Custom / Python', owner:'Marcus Lee', ownerStatus:'Active', team:'Finance', environment:'Production', status:'Active', risk:91, riskLevel:'Critical', lastActive:'118 days ago', daysInactive:118, scopes:['NetSuite: Admin','Stripe: Write','S3 Finance: Read'], resources:['NetSuite','Stripe','AWS S3'], credential:'API key + client secret', discovery:'AWS IAM', created:'04 Nov 2025', notes:'No successful activity in 118 days. Broad write access remains configured across finance systems.', reviewed:false, flags:['Dormant >90 days','Admin privilege','Financial systems'] },
  { id:'AG-1029', name:'Support Triage Agent', type:'AI Agent', platform:'OpenAI Assistants', owner:'Emily Carter', ownerStatus:'Departed', team:'Customer Experience', environment:'Production', status:'Active', risk:88, riskLevel:'High', lastActive:'Yesterday, 18:10', daysInactive:0, scopes:['Zendesk: Admin','Customer DB: Read'], resources:['Zendesk','Customer Database'], credential:'OAuth app', discovery:'Okta + SaaS connector', created:'09 Jan 2026', notes:'Owner left the company. Agent is still active and can read customer records.', reviewed:false, flags:['Owner departed','Customer PII access'] },
  { id:'AG-1024', name:'Hiring Insights Assistant', type:'AI Agent', platform:'Microsoft Copilot Studio', owner:'Sophia Chen', ownerStatus:'Active', team:'People Operations', environment:'Production', status:'Active', risk:78, riskLevel:'High', lastActive:'Today, 08:22', daysInactive:0, scopes:['Workday: Read','SharePoint HR: Read','Entra ID: User.Read.All'], resources:['Workday','SharePoint HR','Microsoft Entra ID'], credential:'Managed identity', discovery:'Microsoft Entra ID', created:'21 Mar 2026', notes:'Access to employee records is broader than the current use case requires.', reviewed:false, flags:['Sensitive employee data','Broad directory scope'] },
  { id:'AG-1019', name:'Warehouse Sync Worker', type:'Service Account', platform:'AWS Lambda', owner:'Unassigned', ownerStatus:'Unknown', team:'Data Platform', environment:'Production', status:'Active', risk:82, riskLevel:'High', lastActive:'4 days ago', daysInactive:4, scopes:['Redshift: Admin','S3 Data Lake: Write'], resources:['Amazon Redshift','AWS S3 Data Lake'], credential:'IAM access key', discovery:'AWS IAM', created:'13 Aug 2025', notes:'No accountable human owner is mapped to this identity.', reviewed:false, flags:['Unknown owner','Admin privilege'] },
  { id:'AG-1014', name:'GitHub Release Orchestrator', type:'AI Agent', platform:'GitHub Actions', owner:'Oliver Grant', ownerStatus:'Active', team:'Engineering', environment:'Production', status:'Active', risk:63, riskLevel:'Medium', lastActive:'Today, 07:56', daysInactive:0, scopes:['GitHub: Repo Admin','Package Registry: Write'], resources:['GitHub','Package Registry'], credential:'GitHub App token', discovery:'GitHub Enterprise', created:'15 Dec 2025', notes:'Repository administration is required for release automation, but the package registry scope should be reviewed.', reviewed:true, flags:['Elevated repository scope'] },
  { id:'AG-1008', name:'Marketing Content Assistant', type:'AI Agent', platform:'Claude for Work', owner:'Unassigned', ownerStatus:'Unknown', team:'Marketing', environment:'Sandbox', status:'Active', risk:72, riskLevel:'High', lastActive:'2 days ago', daysInactive:2, scopes:['Google Drive: Read','Notion: Read'], resources:['Google Drive','Notion'], credential:'OAuth app', discovery:'Browser + OAuth discovery', created:'02 Apr 2026', notes:'Discovered outside the approved app catalogue. Owner and business purpose are not verified.', reviewed:false, flags:['Shadow AI','Unknown owner'] },
  { id:'AG-1003', name:'Product Research Agent', type:'AI Agent', platform:'LangGraph / Internal', owner:'Ava Patel', ownerStatus:'Active', team:'Product', environment:'Development', status:'Active', risk:34, riskLevel:'Low', lastActive:'Today, 10:14', daysInactive:0, scopes:['Jira: Read','Confluence: Read'], resources:['Jira','Confluence'], credential:'Vault-managed token', discovery:'Internal agent registry', created:'28 Apr 2026', notes:'Owner and purpose are documented; access is read-only and scoped to product tools.', reviewed:true, flags:[] },
  { id:'AG-0998', name:'Legacy CRM Data Export', type:'Service Account', platform:'Salesforce Integration', owner:'Noah Williams', ownerStatus:'Active', team:'Sales Operations', environment:'Production', status:'Inactive', risk:54, riskLevel:'Medium', lastActive:'96 days ago', daysInactive:96, scopes:['Salesforce: Export','S3 Archive: Write'], resources:['Salesforce','AWS S3 Archive'], credential:'Connected app secret', discovery:'Salesforce Connected Apps', created:'02 Jun 2025', notes:'Dormant integration with export permissions. Confirm whether downstream reporting still depends on it.', reviewed:false, flags:['Dormant >90 days'] },
  { id:'AG-0991', name:'Invoice OCR Processor', type:'AI Agent', platform:'Google Vertex AI', owner:'Isabella Moore', ownerStatus:'Active', team:'Accounts Payable', environment:'Production', status:'Active', risk:58, riskLevel:'Medium', lastActive:'Today, 06:49', daysInactive:0, scopes:['Drive AP: Read','NetSuite: Invoice Create'], resources:['Google Drive AP','NetSuite'], credential:'Service account key', discovery:'Google Cloud IAM', created:'11 Jan 2026', notes:'Uses invoice data and has create access in NetSuite. Review the credential rotation date.', reviewed:true, flags:['Financial data access'] },
  { id:'AG-0985', name:'Customer Health Summarizer', type:'AI Agent', platform:'Azure OpenAI', owner:'Mia Johnson', ownerStatus:'Active', team:'Customer Success', environment:'Production', status:'Active', risk:41, riskLevel:'Low', lastActive:'Yesterday, 16:24', daysInactive:1, scopes:['Salesforce: Read','Gainsight: Read'], resources:['Salesforce','Gainsight'], credential:'Managed identity', discovery:'Microsoft Entra ID', created:'06 May 2026', notes:'Read-only access with a named owner and documented business purpose.', reviewed:true, flags:[] },
  { id:'AG-0976', name:'Legacy Jenkins Deploy Key', type:'API Token', platform:'Jenkins', owner:'Liam Scott', ownerStatus:'Active', team:'Platform Engineering', environment:'Staging', status:'Active', risk:69, riskLevel:'High', lastActive:'102 days ago', daysInactive:102, scopes:['Kubernetes: Deploy','Container Registry: Write'], resources:['Kubernetes','Container Registry'], credential:'Static API token', discovery:'Secrets scan', created:'19 Sep 2025', notes:'Static token has not rotated in 11 months and the deployment workflow has been migrated.', reviewed:false, flags:['Dormant >90 days','Credential age >180 days'] },
  { id:'AG-0972', name:'Slack Knowledge Assistant', type:'AI Agent', platform:'Slack AI + Custom App', owner:'Priya Nair', ownerStatus:'Active', team:'People Operations', environment:'Production', status:'Active', risk:47, riskLevel:'Medium', lastActive:'Today, 08:35', daysInactive:0, scopes:['Slack: History Read','Google Drive HR: Read'], resources:['Slack','Google Drive HR'], credential:'OAuth user token', discovery:'Okta + OAuth discovery', created:'17 May 2026', notes:'The assistant can read HR knowledge channels. Confirm that private-channel access is limited to approved sources.', reviewed:false, flags:['Sensitive employee data'] },
  { id:'AG-0968', name:'Terraform Cloud Provisioner', type:'Service Account', platform:'Terraform Cloud', owner:'Jordan Kim', ownerStatus:'Active', team:'Cloud Infrastructure', environment:'Production', status:'Active', risk:86, riskLevel:'Critical', lastActive:'Today, 06:20', daysInactive:0, scopes:['AWS IAM: AdministratorAccess','Kubernetes: Cluster Admin'], resources:['AWS IAM','Kubernetes'], credential:'OIDC workload identity', discovery:'Terraform Cloud + AWS IAM', created:'03 Oct 2025', notes:'A broad provisioning identity is used by multiple workspaces. Split permissions by environment and workload.', reviewed:false, flags:['Admin privilege','Multiple environments'] },
  { id:'AG-0962', name:'Legal Contract Extractor', type:'AI Agent', platform:'Azure AI Foundry', owner:'Grace Turner', ownerStatus:'Active', team:'Legal Operations', environment:'Production', status:'Active', risk:61, riskLevel:'Medium', lastActive:'Today, 09:03', daysInactive:0, scopes:['SharePoint Legal: Read','Contract Vault: Read','Docusign: Read'], resources:['SharePoint Legal','Contract Vault','Docusign'], credential:'Managed identity', discovery:'Microsoft Entra ID', created:'09 Jun 2026', notes:'Reads signed agreements and contract metadata. Data retention and external model routing should be confirmed.', reviewed:false, flags:['Sensitive contract data'] },
  { id:'AG-0954', name:'Analytics Read Replica', type:'Service Account', platform:'Snowflake', owner:'Unassigned', ownerStatus:'Unknown', team:'Analytics', environment:'Production', status:'Active', risk:74, riskLevel:'High', lastActive:'7 days ago', daysInactive:7, scopes:['Snowflake: Read','Customer Warehouse: Read'], resources:['Snowflake','Customer Warehouse'], credential:'Key-pair authentication', discovery:'Snowflake Access History', created:'14 Jul 2025', notes:'Read access spans customer and product schemas, but no accountable owner is recorded.', reviewed:false, flags:['Unknown owner','Customer data access'] },
  { id:'AG-0948', name:'Browser Meeting Summarizer', type:'AI Agent', platform:'Chrome Extension', owner:'Ethan Cole', ownerStatus:'Active', team:'Sales', environment:'Sandbox', status:'Active', risk:68, riskLevel:'High', lastActive:'Yesterday, 17:12', daysInactive:1, scopes:['Browser: Active Tab Read','Google Calendar: Read','Gmail: Read'], resources:['Chrome Browser','Google Calendar','Gmail'], credential:'OAuth refresh token', discovery:'Browser extension inventory', created:'22 Aug 2026', notes:'A browser extension has broad mailbox permissions. Validate business purpose and approved deployment population.', reviewed:false, flags:['Shadow AI','Broad OAuth scope'] },
  { id:'AG-0933', name:'Artifact Signing Worker', type:'Service Account', platform:'GitHub Actions + KMS', owner:'Oliver Grant', ownerStatus:'Active', team:'Engineering', environment:'Production', status:'Active', risk:29, riskLevel:'Low', lastActive:'Today, 07:40', daysInactive:0, scopes:['GitHub: Contents Read','AWS KMS: Sign'], resources:['GitHub','AWS KMS'], credential:'OIDC federated role', discovery:'GitHub Enterprise + AWS IAM', created:'12 Feb 2026', notes:'Dedicated signing identity with a narrowly scoped role and a named owner.', reviewed:true, flags:[] },
  { id:'AG-0920', name:'Vendor Risk Monitor', type:'AI Agent', platform:'LangGraph / Internal', owner:'Mia Johnson', ownerStatus:'Active', team:'Procurement', environment:'Development', status:'Active', risk:38, riskLevel:'Low', lastActive:'Today, 10:02', daysInactive:0, scopes:['Coupa: Read','Vendor Portal: Read'], resources:['Coupa','Vendor Portal'], credential:'Vault-managed token', discovery:'Internal agent registry', created:'02 Sep 2026', notes:'Read-only vendor monitoring workflow with a documented owner and approved data sources.', reviewed:true, flags:[] },
  { id:'AG-0915', name:'Benefits Helpdesk Assistant', type:'AI Agent', platform:'Microsoft Copilot Studio', owner:'Sophia Chen', ownerStatus:'Active', team:'People Operations', environment:'Production', status:'Active', risk:79, riskLevel:'High', lastActive:'Today, 08:48', daysInactive:0, scopes:['Workday Benefits: Read','SharePoint HR: Read','ServiceNow: Create'], resources:['Workday','SharePoint HR','ServiceNow'], credential:'Managed identity', discovery:'Microsoft Entra ID', created:'25 Sep 2026', notes:'The bot can read benefits information and create HR tickets. Review whether ticket payloads may contain sensitive employee details.', reviewed:false, flags:['Sensitive employee data','Broad directory scope'] },
]
const seedEvents: Event[] = [
  {id:1,action:'Risk detected',target:'Deal Desk Copilot',actor:'Governance Monitor',time:'Today, 09:42',detail:'Owner account disabled while agent identity remained active.',tone:'danger'},
  {id:2,action:'Access review completed',target:'Product Research Agent',actor:'Ava Patel',time:'Today, 09:18',detail:'Read-only access confirmed for Jira and Confluence.',tone:'success'},
  {id:3,action:'Dormancy threshold crossed',target:'Finance Reconciliation Bot',actor:'Governance Monitor',time:'Today, 08:55',detail:'No activity detected for 118 days.',tone:'warning'},
  {id:4,action:'New identity discovered',target:'Marketing Content Assistant',actor:'Discovery Connector',time:'Yesterday, 16:34',detail:'OAuth application discovered through browser and consent signals.',tone:'info'},
  {id:5,action:'Permission changed',target:'GitHub Release Orchestrator',actor:'Oliver Grant',time:'Yesterday, 14:21',detail:'Package registry write permission added for release automation.',tone:'info'},
  {id:6,action:'High-privilege identity discovered',target:'Terraform Cloud Provisioner',actor:'Discovery Connector',time:'Yesterday, 12:08',detail:'Administrator permissions found across AWS and Kubernetes.',tone:'danger'},
  {id:7,action:'Unowned identity detected',target:'Analytics Read Replica',actor:'Governance Monitor',time:'Yesterday, 11:32',detail:'No accountable owner found for a production warehouse identity.',tone:'warning'},
  {id:8,action:'Credential posture checked',target:'Artifact Signing Worker',actor:'Governance Monitor',time:'Yesterday, 10:14',detail:'Federated workload identity and narrow signing scope confirmed.',tone:'success'},
]
const seedReviews: Review[] = [
  {id:'REV-2081',title:'Departed owner access review',target:'Deal Desk Copilot',reviewer:'Security Operations',due:'Today',priority:'Critical',status:'Pending',reason:'Owner account disabled; agent retains Salesforce admin access.'},
  {id:'REV-2078',title:'Dormant identity certification',target:'Finance Reconciliation Bot',reviewer:'Finance Systems Owner',due:'Today',priority:'Critical',status:'Pending',reason:'118 days inactive with write permissions to financial systems.'},
  {id:'REV-2071',title:'Sensitive data scope review',target:'Hiring Insights Assistant',reviewer:'People Systems Admin',due:'Tomorrow',priority:'High',status:'Pending',reason:'Employee records and broad directory scope require certification.'},
  {id:'REV-2064',title:'Ownership validation',target:'Warehouse Sync Worker',reviewer:'Data Platform Lead',due:'Tomorrow',priority:'High',status:'Pending',reason:'No accountable owner is mapped to the production identity.'},
  {id:'REV-2061',title:'Infrastructure privilege review',target:'Terraform Cloud Provisioner',reviewer:'Cloud Security Lead',due:'Tomorrow',priority:'Critical',status:'Pending',reason:'Administrator access spans AWS and Kubernetes environments.'},
  {id:'REV-2057',title:'OAuth scope certification',target:'Browser Meeting Summarizer',reviewer:'IT Security',due:'In 2 days',priority:'High',status:'Pending',reason:'Browser extension requests broad mailbox and calendar permissions.'},
  {id:'REV-2051',title:'Sensitive data access review',target:'Legal Contract Extractor',reviewer:'Legal Systems Owner',due:'In 3 days',priority:'High',status:'Pending',reason:'Confirm approved contract data sources and model-routing controls.'},
]
const riskClass = (level: string) => level.toLowerCase()
const initials = (name: string) => name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()

const storageKeys = { agents: 'sentinel-agents', events: 'sentinel-events', reviews: 'sentinel-reviews' }

export default function App() {
  const [authMode,setAuthMode] = useState<'signed-out'|'demo'|'supabase'>('signed-out')
  const [authUser,setAuthUser] = useState<User|null>(null)
  const [authReady,setAuthReady] = useState(!isSupabaseConfigured)
  const [authBusy,setAuthBusy] = useState(false)
  const [authError,setAuthError] = useState('')
  const [workspaceId,setWorkspaceId] = useState<string|null>(null)
  const [workspaceReady,setWorkspaceReady] = useState(false)
  const [syncStatus,setSyncStatus] = useState<'local'|'syncing'|'synced'|'error'>('local')
  const [agents,setAgents] = useState<Agent[]>(()=>{ try { const x=localStorage.getItem(storageKeys.agents); return x?JSON.parse(x):seedAgents } catch{return seedAgents} })
  const [events,setEvents] = useState<Event[]>(()=>{ try { const x=localStorage.getItem(storageKeys.events); return x?JSON.parse(x):seedEvents } catch{return seedEvents} })
  const [reviews,setReviews] = useState<Review[]>(()=>{ try { const x=localStorage.getItem(storageKeys.reviews); return x?JSON.parse(x):seedReviews } catch{return seedReviews} })
  const [page,setPage] = useState<NavKey>('overview')
  const [selected,setSelected] = useState<string|null>(null)
  const [search,setSearch] = useState('')
  const [filter,setFilter] = useState('All')
  const [riskFilter,setRiskFilter] = useState('All')
  const [showRemediation,setShowRemediation] = useState(false)
  const [toast,setToast] = useState('')
  const [mobileNav,setMobileNav] = useState(false)
  const [showHelp,setShowHelp] = useState(false)
  const [reviewModal,setReviewModal] = useState(false)
  const [newReviewTarget,setNewReviewTarget] = useState(seedAgents[0].id)

  useEffect(()=>{
    if(!supabase){setAuthReady(true);return}
    let mounted=true
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(!mounted)return
      const user=session?.user??null
      setAuthUser(user)
      setAuthMode(user?'supabase':'signed-out')
      if(!user){setWorkspaceId(null);setWorkspaceReady(false)}
    })
    supabase.auth.getSession().then(({data})=>{
      if(!mounted)return
      const user=data.session?.user??null
      setAuthUser(user)
      setAuthMode(user?'supabase':'signed-out')
      setAuthReady(true)
    }).catch(()=>{if(mounted)setAuthReady(true)})
    return ()=>{mounted=false;subscription.unsubscribe()}
  },[])

  useEffect(()=>{
    if(authMode!=='supabase'||!authUser||!supabase){setWorkspaceId(null);setWorkspaceReady(authMode==='demo');return}
    const client = supabase
    let cancelled=false
    setWorkspaceReady(false)
    setSyncStatus('syncing')
    const loadWorkspace=async()=>{
      try{
        const {data:bootstrappedId,error:bootstrapError}=await client.rpc('bootstrap_sentinel_workspace')
        if(bootstrapError)throw bootstrapError
        const id=String(bootstrappedId)
        const {data:state,error:stateError}=await client.from('sentinel_demo_state').select('agents,events,reviews').eq('workspace_id',id).maybeSingle()
        if(stateError)throw stateError
        let nextAgents=Array.isArray(state?.agents)?state.agents as Agent[]:[]
        let nextEvents=Array.isArray(state?.events)?state.events as Event[]:[]
        let nextReviews=Array.isArray(state?.reviews)?state.reviews as Review[]:[]
        if(!state||nextAgents.length===0){
          nextAgents=seedAgents;nextEvents=seedEvents;nextReviews=seedReviews
          const {error:seedError}=await client.from('sentinel_demo_state').upsert({workspace_id:id,agents:nextAgents,events:nextEvents,reviews:nextReviews,updated_at:new Date().toISOString()},{onConflict:'workspace_id'})
          if(seedError)throw seedError
        }
        if(cancelled)return
        setAgents(nextAgents);setEvents(nextEvents);setReviews(nextReviews);setWorkspaceId(id);setWorkspaceReady(true);setSyncStatus('synced')
      }catch(error){
        if(cancelled)return
        const message=error instanceof Error?error.message:'Unable to load the Sentinel workspace.'
        setAuthError(`Supabase setup issue: ${message}`)
        setWorkspaceReady(false)
        setSyncStatus('error')
      }
    }
    void loadWorkspace()
    return ()=>{cancelled=true}
  },[authMode,authUser?.id])

  useEffect(()=>{
    if(authMode!=='demo')return
    try{localStorage.setItem(storageKeys.agents,JSON.stringify(agents));localStorage.setItem(storageKeys.events,JSON.stringify(events));localStorage.setItem(storageKeys.reviews,JSON.stringify(reviews))}catch{}
  },[agents,events,reviews,authMode])

  useEffect(()=>{
    if(authMode!=='supabase'||!workspaceId||!workspaceReady||!supabase)return
    const client = supabase
    let cancelled=false
    const timeout=window.setTimeout(async()=>{
      setSyncStatus('syncing')
      const {error}=await client.from('sentinel_demo_state').upsert({workspace_id:workspaceId,agents,events,reviews,updated_at:new Date().toISOString()},{onConflict:'workspace_id'})
      if(cancelled)return
      setSyncStatus(error?'error':'synced')
      if(error)setToast('Cloud sync failed. Check the Supabase connection.')
    },450)
    return ()=>{cancelled=true;window.clearTimeout(timeout)}
  },[agents,events,reviews,authMode,workspaceId,workspaceReady])

  const signIn=async(email:string,password:string)=>{
    setAuthError('')
    if(!supabase){setAuthError('Supabase is not configured yet. Add the project URL and publishable/anon key, or use the local sample workspace below.');return}
    setAuthBusy(true)
    try{
      const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password})
      if(error)setAuthError(error.message)
    }catch(error){setAuthError(error instanceof Error?error.message:'Unable to sign in. Check the connection and try again.')}
    finally{setAuthBusy(false)}
  }
  const signOut=async()=>{
    if(authMode==='supabase'&&supabase)await supabase.auth.signOut()
    setAuthUser(null);setWorkspaceId(null);setWorkspaceReady(false);setAuthMode('signed-out');setAuthError('');setPage('overview')
  }
  const enterDemo=()=>{setAuthError('');setAuthUser(null);setWorkspaceId(null);setAuthMode('demo');setWorkspaceReady(true);setSyncStatus('local')}
  useEffect(()=>{ if(!toast)return; const t=window.setTimeout(()=>setToast(''),2800); return ()=>window.clearTimeout(t)},[toast])

  if(!authReady)return <div className="auth-loading"><div className="auth-spinner"/><span>Checking your Sentinel session…</span></div>
  if(authMode==='signed-out')return <LoginScreen configured={isSupabaseConfigured} loading={authBusy} error={authError} onSignIn={signIn} onDemo={enterDemo}/>
  if(authMode==='supabase'&&!workspaceReady)return <div className="auth-loading"><div className="auth-spinner"/><span>Preparing your secure workspace…</span>{authError&&<p>{authError}</p>}<button className="auth-link-button" onClick={signOut}>Sign out</button></div>

  const selectedAgent = agents.find(a=>a.id===selected) || null
  const highRisk = agents.filter(a=>a.status!=='Suspended' && (a.riskLevel==='Critical'||a.riskLevel==='High')).length
  const orphaned = agents.filter(a=>a.ownerStatus!=='Active' && a.status!=='Suspended').length
  const pending = reviews.filter(r=>r.status==='Pending').length
  const visibleAgents = agents.filter(a=>{
    const q=search.toLowerCase()
    const matches = !q || [a.name,a.owner,a.team,a.platform,a.id].some(v=>v.toLowerCase().includes(q))
    const statusOk = filter==='All' || (filter==='Orphaned' ? a.ownerStatus!=='Active' : filter==='Dormant' ? a.daysInactive>=90 : filter==='Active' ? a.status==='Active' : filter==='Suspended' ? a.status==='Suspended' : true)
    const riskOk = riskFilter==='All' || a.riskLevel===riskFilter
    return matches && statusOk && riskOk
  })
  const addEvent = (action:string,target:string,detail:string,tone:Event['tone']='info') => {
    setEvents(prev=>[{id:Date.now(),action,target,actor:authMode==='supabase'?(authUser?.email||'Workspace Admin'):'Demo Admin',time:'Just now',detail,tone},...prev])
  }
  const openAgent=(id:string)=>{setSelected(id);setShowRemediation(false)}
  const markReviewed=(agent:Agent)=>{
    setAgents(prev=>prev.map(a=>a.id===agent.id?{...a,reviewed:true}:a))
    addEvent('Access review completed',agent.name,'Review marked complete in the demo workspace.','success')
    setToast(`${agent.name} marked as reviewed`)
  }
  const simulateOffboarding=()=>{
    const target=agents.find(a=>a.id==='AG-1014') || agents[5]
    if(!target)return
    if(target.ownerStatus==='Departed'){setToast('The offboarding scenario is already active');return}
    setAgents(prev=>prev.map(a=>a.id===target.id?{...a,owner:'Oliver Grant (Departed)',ownerStatus:'Departed',risk:94,riskLevel:'Critical',flags:[...new Set([...a.flags,'Owner departed','Elevated repository scope'])],reviewed:false}:a))
    setReviews(prev=>[{id:`REV-${Math.floor(2100+Math.random()*700)}`,title:'Offboarding-triggered agent review',target:target.name,reviewer:'Security Operations',due:'Today',priority:'Critical',status:'Pending',reason:'Owner departure detected while the agent identity is still active.'},...prev])
    addEvent('Offboarding signal received',target.name,'Owner is now marked as departed; active permissions were left unchanged pending review.','danger')
    setToast('Scenario added: active agent with a departed owner')
  }
  const approveReview=(review:Review)=>{
    setReviews(prev=>prev.map(r=>r.id===review.id?{...r,status:'Completed'}:r))
    const agent=agents.find(a=>a.name===review.target)
    if(agent)setAgents(prev=>prev.map(a=>a.id===agent.id?{...a,reviewed:true}:a))
    addEvent('Review completed',review.target,`Review ${review.id} completed by ${authMode==='supabase'?(authUser?.email||'Workspace Admin'):'Demo Admin'}. No permissions were changed.`, 'success')
    setToast(`Review completed for ${review.target}`)
  }
  const createReview=()=>{
    const agent=agents.find(a=>a.id===newReviewTarget)
    if(!agent)return
    const review:Review={id:`REV-${Math.floor(2100+Math.random()*700)}`,title:'Ad hoc access certification',target:agent.name,reviewer:'Security Operations',due:'In 3 days',priority:agent.riskLevel==='Critical'?'Critical':agent.riskLevel==='High'?'High':'Normal',status:'Pending',reason:'Manual review initiated by an administrator.'}
    setReviews(prev=>[review,...prev]);addEvent('Review created',agent.name,`Access certification ${review.id} was created.`, 'info');setReviewModal(false);setToast('Access review created')
  }
  const runRemediation=(agent:Agent,actions:string[],newOwner:string)=>{
    if(!actions.length){setToast('Select at least one remediation step');return}
    let updated={...agent}
    if(actions.includes('Reassign owner')){updated.owner=newOwner;updated.ownerStatus='Active';updated.flags=updated.flags.filter(f=>f!=='Owner departed'&&f!=='Unknown owner')}
    if(actions.includes('Remove admin access')){updated.scopes=updated.scopes.filter(s=>!s.toLowerCase().includes('admin'));updated.flags=updated.flags.filter(f=>f!=='Admin privilege')}
    if(actions.includes('Rotate credential'))updated.credential='Rotated · Vault-managed'
    if(actions.includes('Suspend agent'))updated.status='Suspended'
    const stillOwnerRisk=updated.ownerStatus!=='Active'
    const stillAdmin=updated.scopes.some(s=>s.toLowerCase().includes('admin'))
    updated.risk=Math.max(8,Math.min(99,updated.risk-(actions.includes('Reassign owner')?27:0)-(actions.includes('Remove admin access')?25:0)-(actions.includes('Rotate credential')?8:0)-(actions.includes('Suspend agent')?38:0)))
    updated.riskLevel=updated.risk>=85?'Critical':updated.risk>=65?'High':updated.risk>=40?'Medium':'Low'
    if(!stillOwnerRisk)updated.flags=updated.flags.filter(f=>f!=='Owner departed'&&f!=='Unknown owner')
    if(!stillAdmin)updated.flags=updated.flags.filter(f=>f!=='Admin privilege')
    setAgents(prev=>prev.map(a=>a.id===agent.id?updated:a))
    addEvent('Remediation simulated',agent.name,`Planned actions: ${actions.join(', ')}. This demo records the intention only; no external system was changed.`, 'success')
    setShowRemediation(false);setSelected(null);setToast('Remediation recorded in the demo audit trail')
  }
  const resetDemo=()=>{setAgents(seedAgents);setEvents(seedEvents);setReviews(seedReviews);setSearch('');setFilter('All');setRiskFilter('All');setSelected(null);setToast('Demo data reset to original state')}
  const exportCSV=()=>{
    const rows=[['ID','Name','Type','Platform','Owner','Owner status','Team','Environment','Status','Risk score','Risk level','Last active','Scopes'],...agents.map(a=>[a.id,a.name,a.type,a.platform,a.owner,a.ownerStatus,a.team,a.environment,a.status,String(a.risk),a.riskLevel,a.lastActive,a.scopes.join('; ')])]
    const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const link=document.createElement('a');link.href=url;link.download='sentinel-identity-inventory-demo.csv';link.click();URL.revokeObjectURL(url);setToast('CSV export generated')
  }

  const navItems:[NavKey,string,any,number][]=[['overview','Overview',LayoutDashboard,0],['inventory','Agent inventory',Bot,0],['risk','Risk queue',ShieldAlert,highRisk],['reviews','Access reviews',FileCheck2,pending],['audit','Audit trail',Activity,0]]
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-mark"><ShieldCheck size={19}/></div><div><div className="brand-name">sentinel</div><div className="brand-sub">AI IDENTITY &amp; GOVERNANCE</div></div><button className="mobile-close icon-button" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><div className="workspace-avatar">N</div><div className="workspace-copy"><strong>Northstar Systems</strong><small>Enterprise workspace</small></div><ChevronDown size={15}/></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="main-nav">{navItems.map(([key,label,Icon,count])=><button key={key} className={`nav-item ${page===key?'nav-active':''}`} onClick={()=>{setPage(key);setMobileNav(false);setSelected(null)}}><Icon size={17}/><span>{label}</span>{count>0&&<span className="nav-count">{count}</span>}</button>)}</nav>
      <div className="nav-caption nav-caption-spaced">GOVERNANCE</div>
      <button className="nav-item" onClick={()=>setShowHelp(true)}><GitBranch size={17}/><span>Demo walkthrough</span><span className="nav-soon">DEMO</span></button>
      <button className="nav-item" onClick={()=>setPage('reviews')}><Users size={17}/><span>Review assignments</span></button>
      <div className="sidebar-bottom"><div className="sidebar-help"><div className="help-icon"><CircleHelp size={17}/></div><div><strong>Need a hand?</strong><small>Explore the demo guide</small></div><button onClick={()=>setShowHelp(true)}><ArrowUpRight size={15}/></button></div><div className="profile"><div className="profile-avatar">{authMode==='supabase'?initials(authUser?.email||'Admin'):'DE'}</div><div className="profile-copy"><strong>{authMode==='supabase'?(authUser?.email||'Workspace Admin'):'Demo Admin'}</strong><small>Security administrator</small></div><button className="profile-logout" title="Sign out" onClick={signOut}><LogOut size={16}/></button></div></div>
    </aside>
    {mobileNav&&<div className="mobile-scrim" onClick={()=>setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><div className="top-left"><button className="icon-button mobile-menu" onClick={()=>setMobileNav(true)}><Menu size={19}/></button><div className="breadcrumbs"><span>Northstar Systems</span><ChevronRight size={14}/><strong>{navItems.find(x=>x[0]===page)?.[1]}</strong></div></div><div className="top-actions"><div className={`demo-pill ${authMode==='supabase'?'connected-pill':''}`}><span></span> {authMode==='supabase'?(syncStatus==='syncing'?'SYNCING TO SUPABASE':syncStatus==='error'?'SYNC ERROR':'SUPABASE CONNECTED'):'LOCAL DEMO ENVIRONMENT'}</div><button className="icon-button" title="Help" onClick={()=>setShowHelp(true)}><CircleHelp size={18}/></button><button className="icon-button notification" title="Notifications" onClick={()=>setPage('risk')}><Bell size={18}/><i></i></button><div className="top-avatar">{authMode==='supabase'?initials(authUser?.email||'Admin'):'DE'}</div></div></header>
      <div className="page-wrap">
        {page==='overview'&&<Overview agents={agents} reviews={reviews} highRisk={highRisk} orphaned={orphaned} pending={pending} events={events} onOpen={openAgent} onPage={setPage} onSimulate={simulateOffboarding} onNewReview={()=>setReviewModal(true)} />}
        {page==='inventory'&&<Inventory agents={visibleAgents} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} riskFilter={riskFilter} setRiskFilter={setRiskFilter} onOpen={openAgent} onExport={exportCSV} />}
        {page==='risk'&&<RiskQueue agents={agents.filter(a=>a.status!=='Suspended'&&(a.riskLevel==='Critical'||a.riskLevel==='High'||a.ownerStatus!=='Active'||a.daysInactive>=90))} onOpen={openAgent} onSimulate={simulateOffboarding} />}
        {page==='reviews'&&<Reviews reviews={reviews} onComplete={approveReview} onCreate={()=>setReviewModal(true)} />}
        {page==='audit'&&<Audit events={events} onExport={exportCSV} />}
        <footer className="page-footer"><span>Sentinel <b>·</b> Independent concept prototype</span><span>All records are fictional. Actions are simulated and do not connect to live systems.</span></footer>
      </div>
    </main>
    {selectedAgent&&<AgentDrawer agent={selectedAgent} onClose={()=>{setSelected(null);setShowRemediation(false)}} onReview={markReviewed} onRemediate={()=>setShowRemediation(true)} />}
    {showRemediation&&selectedAgent&&<RemediationModal agent={selectedAgent} onClose={()=>setShowRemediation(false)} onApply={(actions,owner)=>runRemediation(selectedAgent,actions,owner)} />}
    {reviewModal&&<CreateReviewModal agents={agents} selected={newReviewTarget} setSelected={setNewReviewTarget} onClose={()=>setReviewModal(false)} onCreate={createReview} />}
    {showHelp&&<HelpModal onClose={()=>setShowHelp(false)} onReset={()=>{resetDemo();setShowHelp(false)}} />}
    {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}<button onClick={()=>setToast('')}><X size={14}/></button></div>}
  </div>
}

function LoginScreen({configured,loading,error,onSignIn,onDemo}:{configured:boolean;loading:boolean;error:string;onSignIn:(email:string,password:string)=>void;onDemo:()=>void}){
  const [email,setEmail]=useState(import.meta.env.VITE_LOCAL_PREFILL_EMAIL||'demo@example.com')
  const [password,setPassword]=useState(import.meta.env.DEV?(import.meta.env.VITE_LOCAL_PREFILL_PASSWORD||''):'')
  const [showPassword,setShowPassword]=useState(false)
  return <main className="auth-shell">
    <section className="auth-story">
      <div className="auth-brand"><span className="auth-brand-mark"><ShieldCheck size={21}/></span><span>sentinel</span><small>AI IDENTITY &amp; GOVERNANCE</small></div>
      <div className="auth-story-copy"><span className="auth-eyebrow">IDENTITY CONTROL PLANE</span><h1>Know every identity.<br/><em>Control every permission.</em></h1><p>Investigate risky AI agents and machine identities, review their access, and keep every decision traceable.</p><div className="auth-story-points"><span><ShieldCheck size={15}/> Risk-aware identity inventory</span><span><ListChecks size={15}/> Human-approved remediation</span><span><Activity size={15}/> Persistent audit history</span></div></div>
      <div className="auth-story-foot">INDEPENDENT PRODUCT CONCEPT · FICTIONAL SAMPLE DATA</div>
    </section>
    <section className="auth-panel"><div className="auth-card"><div className="auth-card-icon"><Fingerprint size={22}/></div><span className="auth-eyebrow">WELCOME BACK</span><h2>Sign in to Sentinel</h2><p>Use your Supabase demo account to open your workspace.</p>
      <form onSubmit={e=>{e.preventDefault();onSignIn(email,password)}} className="auth-form">
        <label htmlFor="sentinel-email">EMAIL ADDRESS</label><input id="sentinel-email" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" required/>
        <label htmlFor="sentinel-password">PASSWORD</label><div className="password-field"><input id="sentinel-password" type={showPassword?'text':'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div>
        {error&&<div className="auth-error"><AlertTriangle size={15}/><span>{error}</span></div>}
        <button className="auth-submit" type="submit" disabled={loading}>{loading?'Signing in…':<>Sign in securely <ArrowRight size={16}/></>}</button>
      </form>
      <div className="auth-divider"><span>OR</span></div><button className="auth-demo-button" onClick={onDemo}>Explore sample workspace <ArrowRight size={15}/></button>
      <div className="auth-setup-note">{configured?<><CheckCircle2 size={14}/> Supabase is configured. Authentication and workspace data use your connected project.</>:<><CircleHelp size={14}/> Supabase connection details are not set yet. Local demo mode works without credentials.</>}</div>
      <small className="auth-privacy">Do not use production credentials in a public demo. This prototype uses fictional identity records and simulated remediation.</small>
    </div></section>
  </main>
}

function PageHeading({eyebrow,title,description,children}:{eyebrow:string;title:string;description:string;children?:React.ReactNode}){return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{children&&<div className="heading-actions">{children}</div>}</div>}
function Button({children,onClick,variant='primary',icon,disabled}:{children:React.ReactNode;onClick?:()=>void;variant?:'primary'|'secondary'|'quiet'|'danger';icon?:React.ReactNode;disabled?:boolean}){return <button className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>{icon}{children}</button>}
function RiskBadge({level}:{level:string}){return <span className={`risk-badge risk-${riskClass(level)}`}><i/>{level}</span>}
function StatusBadge({status}:{status:string}){return <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>}

function Overview({agents,reviews,highRisk,orphaned,pending,events,onOpen,onPage,onSimulate,onNewReview}:{agents:Agent[];reviews:Review[];highRisk:number;orphaned:number;pending:number;events:Event[];onOpen:(id:string)=>void;onPage:(p:NavKey)=>void;onSimulate:()=>void;onNewReview:()=>void}){
  const riskCounts={critical:agents.filter(a=>a.riskLevel==='Critical').length,high:agents.filter(a=>a.riskLevel==='High').length,medium:agents.filter(a=>a.riskLevel==='Medium').length,low:agents.filter(a=>a.riskLevel==='Low').length};
  const dueToday=reviews.filter(r=>r.status==='Pending'&&r.due==='Today').length;
  const totalRisk=Math.max(1,agents.length); const c1=riskCounts.critical/totalRisk*100; const c2=c1+riskCounts.high/totalRisk*100; const c3=c2+riskCounts.medium/totalRisk*100;
  const donutStyle={background:`conic-gradient(var(--critical) 0 ${c1}%,var(--high) ${c1}% ${c2}%,var(--medium) ${c2}% ${c3}%,var(--low) ${c3}% 100%)`};
  const priority=agents.filter(a=>a.status!=='Suspended'&&(a.riskLevel==='Critical'||a.ownerStatus!=='Active'||a.daysInactive>=90)).sort((a,b)=>b.risk-a.risk).slice(0,4)
  return <>
    <PageHeading eyebrow="SECURITY OVERVIEW" title="Good evening, Admin" description="Here’s the current posture of AI agents and non-human identities across your workspace."><Button variant="secondary" icon={<RefreshCw size={15}/>} onClick={onSimulate}>Run offboarding scenario</Button><Button icon={<Plus size={16}/>} onClick={onNewReview}>Create access review</Button></PageHeading>
    <div className="notice-strip"><div className="notice-icon"><Sparkles size={16}/></div><div><strong>Sample workspace is ready</strong><span>Explore 20 fictional identities, risk signals, approval workflows, and audit events. No identity-provider integrations are enabled; remediation remains simulated.</span></div><button onClick={()=>onPage('inventory')}>Explore inventory <ArrowRight size={14}/></button></div>
    <div className="metric-grid">
      <Metric title="Identities discovered" value={agents.length.toString()} note="Across 12 sample sources" icon={<Fingerprint size={18}/>} trend="+3 this month" good />
      <Metric title="High-risk identities" value={highRisk.toString()} note="Critical and high severity" icon={<ShieldAlert size={18}/>} trend="Needs attention" alert />
      <Metric title="Orphaned identities" value={orphaned.toString()} note="Departed or unknown owners" icon={<Users size={18}/>} trend="Ownership gaps" alert />
      <Metric title="Pending reviews" value={pending.toString()} note="Awaiting an administrator" icon={<ListChecks size={18}/>} trend="2 due today" />
    </div>
    <div className="content-grid overview-grid">
      <section className="panel posture-panel"><div className="panel-head"><div><h2>Identity risk posture</h2><p>Risk distribution across the demo inventory</p></div><span className="subtle-tag">Current snapshot</span></div><div className="posture-content"><div className="donut-wrap"><div className="donut" style={donutStyle}><div className="donut-center"><strong>{agents.length}</strong><span>identities</span></div></div><div className="donut-legend"><Legend color="var(--critical)" label="Critical" value={agents.filter(a=>a.riskLevel==='Critical').length}/><Legend color="var(--high)" label="High" value={agents.filter(a=>a.riskLevel==='High').length}/><Legend color="var(--medium)" label="Medium" value={agents.filter(a=>a.riskLevel==='Medium').length}/><Legend color="var(--low)" label="Low" value={agents.filter(a=>a.riskLevel==='Low').length}/></div></div><div className="trend-box"><div className="trend-label"><span>Risk signals · illustrative trend</span><strong>+12.8%</strong></div><div className="spark-bars">{[38,44,41,55,49,67,72,64,78,74,87,80,96,89,100,84,91,96,80,90,74,85,93,80,86,74,69,76,64,72,82,68].map((v,i)=><i key={i} style={{height:`${v}%`}} />)}</div><div className="trend-foot"><span>Nov 05</span><span>Nov 11</span></div><div className="trend-insight"><AlertTriangle size={15}/><span>Owner changes and dormant credentials account for most open signals.</span></div></div></div></section>
      <section className="panel quick-panel"><div className="panel-head"><div><h2>Needs your attention</h2><p>Prioritised sample risk signals</p></div><button className="text-link" onClick={()=>onPage('risk')}>View queue <ArrowRight size={14}/></button></div><div className="attention-list"><Attention icon={<UserDepartedIcon/>} title="Departed owner" desc={`${agents.filter(a=>a.ownerStatus==='Departed'&&a.status==='Active').length} active identities still have former owners`} count={agents.filter(a=>a.ownerStatus==='Departed'&&a.status==='Active').length} tone="red" onClick={()=>onPage('risk')}/><Attention icon={<KeyRound size={17}/>} title="Excessive privileges" desc={`${agents.filter(a=>a.flags.includes('Admin privilege')).length} identities retain admin access`} count={agents.filter(a=>a.flags.includes('Admin privilege')).length} tone="orange" onClick={()=>onPage('risk')}/><Attention icon={<Clock3 size={17}/>} title="Dormant credentials" desc={`${agents.filter(a=>a.daysInactive>=90).length} identities inactive for 90+ days`} count={agents.filter(a=>a.daysInactive>=90).length} tone="blue" onClick={()=>onPage('risk')}/></div><div className="quick-footer"><ShieldCheck size={15}/><span>Human approval is required before every remediation action.</span></div></section>
    </div>
    <section className="panel priority-panel"><div className="panel-head"><div><h2>Priority risk queue</h2><p>Identities with the highest potential impact</p></div><button className="text-link" onClick={()=>onPage('risk')}>Open risk queue <ArrowRight size={14}/></button></div><div className="table-wrap"><table><thead><tr><th>IDENTITY</th><th>OWNER</th><th>RISK SIGNAL</th><th>LAST ACTIVE</th><th>RISK SCORE</th><th></th></tr></thead><tbody>{priority.map(a=><tr key={a.id} onClick={()=>onOpen(a.id)} className="clickable-row"><td><div className="identity-cell"><div className={`identity-icon ${a.type==='AI Agent'?'agent-icon':'service-icon'}`}>{a.type==='AI Agent'?<Bot size={16}/>:<KeyRound size={16}/>}</div><div><strong>{a.name}</strong><small>{a.id} · {a.platform}</small></div></div></td><td><OwnerCell name={a.owner} status={a.ownerStatus}/></td><td><div className="signal-cell">{a.flags.slice(0,2).map(f=><span key={f}>{f}</span>)}</div></td><td className="muted-td">{a.lastActive}</td><td><div className="score-cell"><strong>{a.risk}</strong><div className="score-track"><i style={{width:`${a.risk}%`}} className={`fill-${riskClass(a.riskLevel)}`}/></div></div></td><td><ChevronRight size={16} className="row-chevron"/></td></tr>)}</tbody></table></div></section>
    <div className="content-grid bottom-grid"><section className="panel activity-panel"><div className="panel-head"><div><h2>Recent activity</h2><p>Latest governance events</p></div><button className="text-link" onClick={()=>onPage('audit')}>Full audit trail <ArrowRight size={14}/></button></div><EventList events={events.slice(0,4)}/></section><section className="panel review-panel"><div className="panel-head"><div><h2>Review workload</h2><p>Approval queue by urgency</p></div><button className="text-link" onClick={()=>onPage('reviews')}>Manage <ArrowRight size={14}/></button></div><div className="review-stats"><div><strong>{pending}</strong><span>Pending</span></div><div><strong>{dueToday}</strong><span>Due today</span></div><div><strong>{agents.filter(a=>a.reviewed).length}</strong><span>Reviewed</span></div></div><div className="review-progress"><div><span>Review completion</span><strong>{Math.round((agents.filter(a=>a.reviewed).length/agents.length)*100)}%</strong></div><div className="progress-track"><i style={{width:`${Math.round((agents.filter(a=>a.reviewed).length/agents.length)*100)}%`}}/></div></div></section></div>
  </>
}
function Metric({title,value,note,icon,trend,good,alert}:{title:string;value:string;note:string;icon:React.ReactNode;trend:string;good?:boolean;alert?:boolean}){return <div className="metric-card"><div className="metric-top"><div className={`metric-icon ${alert?'metric-alert':''}`}>{icon}</div><span className={good?'metric-good':alert?'metric-bad':'metric-neutral'}>{good?<ArrowUpRight size={13}/>:alert?<AlertTriangle size={13}/>:<Clock3 size={13}/>} {trend}</span></div><div className="metric-value">{value}</div><div className="metric-title">{title}</div><div className="metric-note">{note}</div></div>}
function Legend({color,label,value}:{color:string;label:string;value:number}){return <div className="legend-row"><i style={{background:color}}/><span>{label}</span><strong>{value}</strong></div>}
function Attention({icon,title,desc,count,tone,onClick}:{icon:React.ReactNode;title:string;desc:string;count:number;tone:string;onClick:()=>void}){return <button className="attention-row" onClick={onClick}><div className={`attention-icon ${tone}`}>{icon}</div><div className="attention-copy"><strong>{title}</strong><span>{desc}</span></div><span className="attention-count">{count}</span><ChevronRight size={15}/></button>}
function OwnerCell({name,status}:{name:string;status:OwnerStatus}){return <div className="owner-cell"><div className="owner-avatar">{status==='Unknown'?'?':initials(name.replace(' (Departed)',''))}</div><div><span>{name}</span><small className={status==='Active'?'owner-active':status==='Departed'?'owner-departed':'owner-unknown'}>{status==='Active'?'Active employee':status==='Departed'?'Departed':'Unassigned'}</small></div></div>}
function EventList({events}:{events:Event[]}){return <div className="event-list">{events.map(e=><div className="event-row" key={e.id}><div className={`event-icon event-${e.tone}`}>{e.tone==='danger'?<AlertOctagon size={15}/>:e.tone==='success'?<Check size={15}/>:e.tone==='warning'?<Clock3 size={15}/>:<Activity size={15}/>}</div><div className="event-copy"><strong>{e.action} <span>· {e.target}</span></strong><small>{e.detail}</small></div><time>{e.time}</time></div>)}</div>}
function UserDepartedIcon(){return <Users size={17}/>}

function Inventory({agents,search,setSearch,filter,setFilter,riskFilter,setRiskFilter,onOpen,onExport}:{agents:Agent[];search:string;setSearch:(v:string)=>void;filter:string;setFilter:(v:string)=>void;riskFilter:string;setRiskFilter:(v:string)=>void;onOpen:(id:string)=>void;onExport:()=>void}){
  return <><PageHeading eyebrow="IDENTITY DISCOVERY" title="Agent inventory" description="A unified view of AI agents, service accounts, API tokens, and their access footprint."><Button variant="secondary" icon={<Download size={15}/>} onClick={onExport}>Export CSV</Button><Button variant="secondary" icon={<RefreshCw size={15}/>} onClick={()=>{setSearch('');setFilter('All');setRiskFilter('All')}}>Reset filters</Button></PageHeading>
    <div className="inventory-summary"><div><strong>{agents.length}</strong><span>Identities in view</span></div><div><strong>{agents.filter(a=>a.ownerStatus!=='Active').length}</strong><span>Ownership gaps</span></div><div><strong>{agents.filter(a=>a.daysInactive>=90).length}</strong><span>Dormant 90+ days</span></div><div><strong>{agents.filter(a=>a.status==='Active').length}</strong><span>Currently active</span></div></div>
    <section className="panel inventory-panel"><div className="inventory-toolbar"><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search identities, owners, teams..."/><kbd>⌘ K</kbd></div><div className="toolbar-filters"><div className="filter-select"><Filter size={14}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Orphaned</option><option>Dormant</option><option>Active</option><option>Suspended</option></select><ChevronDown size={13}/></div><div className="filter-select"><SlidersHorizontal size={14}/><select value={riskFilter} onChange={e=>setRiskFilter(e.target.value)}><option>All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select><ChevronDown size={13}/></div></div></div>
      <div className="table-wrap"><table className="inventory-table"><thead><tr><th>IDENTITY</th><th>OWNER</th><th>TYPE</th><th>PLATFORM</th><th>STATUS</th><th>RISK</th><th>LAST ACTIVITY</th><th></th></tr></thead><tbody>{agents.map(a=><tr key={a.id} className="clickable-row" onClick={()=>onOpen(a.id)}><td><div className="identity-cell"><div className={`identity-icon ${a.type==='AI Agent'?'agent-icon':'service-icon'}`}>{a.type==='AI Agent'?<Bot size={16}/>:<KeyRound size={16}/>}</div><div><strong>{a.name}</strong><small>{a.id}</small></div></div></td><td><OwnerCell name={a.owner} status={a.ownerStatus}/></td><td><span className="type-text">{a.type}</span></td><td><span className="platform-text">{a.platform}</span></td><td><StatusBadge status={a.status}/></td><td><RiskBadge level={a.riskLevel}/></td><td className="muted-td">{a.lastActive}</td><td><ChevronRight size={16} className="row-chevron"/></td></tr>)}</tbody></table>{agents.length===0&&<div className="empty-state"><Search size={25}/><strong>No identities match your filters</strong><span>Try adjusting your search or filter criteria.</span></div>}</div>
      <div className="table-foot"><span>Showing <strong>{agents.length}</strong> identities · Sample data</span><span>Click any identity to inspect permissions and activity</span></div>
    </section>
  </>
}

function RiskQueue({agents,onOpen,onSimulate}:{agents:Agent[];onOpen:(id:string)=>void;onSimulate:()=>void}){
  const [tab,setTab]=useState('All signals')
  const list=agents.filter(a=>tab==='All signals'||(tab==='Ownership'&&a.ownerStatus!=='Active')||(tab==='Privilege'&&a.flags.some(f=>f.toLowerCase().includes('admin')||f.toLowerCase().includes('scope')))||(tab==='Dormancy'&&a.daysInactive>=90))
  return <><PageHeading eyebrow="RISK OPERATIONS" title="Risk queue" description="Investigate and prioritise identity risks before they become security incidents."><Button variant="secondary" icon={<Zap size={15}/>} onClick={onSimulate}>Simulate offboarding</Button></PageHeading>
    <div className="risk-callout"><div className="risk-callout-icon"><ShieldAlert size={19}/></div><div><strong>Prioritise context, not just severity.</strong><span>Each signal combines ownership, permissions, activity, and resource sensitivity. The score is illustrative and uses the rules documented in this prototype.</span></div><span className="callout-count">{agents.length} open signals</span></div>
    <div className="tabbar">{['All signals','Ownership','Privilege','Dormancy'].map(t=><button className={tab===t?'tab-active':''} onClick={()=>setTab(t)} key={t}>{t}{t==='All signals'&&<b>{agents.length}</b>}</button>)}</div>
    <div className="risk-list">{list.sort((a,b)=>b.risk-a.risk).map(a=><div className="risk-card" key={a.id}><div className="risk-card-main"><div className={`risk-score-bubble ${riskClass(a.riskLevel)}`}>{a.risk}</div><div className="risk-card-content"><div className="risk-title-row"><strong>{a.name}</strong><RiskBadge level={a.riskLevel}/><span className="risk-id">{a.id}</span></div><div className="risk-subline"><span>{a.team}</span><i>·</i><span>{a.platform}</span><i>·</i><span>{a.environment}</span></div><div className="risk-reasons">{a.flags.map(f=><span key={f}><AlertTriangle size={12}/>{f}</span>)}</div><div className="risk-owner-line"><OwnerCell name={a.owner} status={a.ownerStatus}/><span className="last-activity"><Clock3 size={13}/>{a.lastActive}</span></div></div></div><div className="risk-card-side"><div><small>RISK SCORE</small><strong>{a.risk}<span>/100</span></strong></div><Button variant="secondary" onClick={()=>onOpen(a.id)}>Investigate <ArrowRight size={14}/></Button></div></div>)}{list.length===0&&<div className="empty-state"><ShieldCheck size={25}/><strong>No open signals in this category</strong><span>There are no matching identities in the sample data.</span></div>}</div>
  </>
}

function Reviews({reviews,onComplete,onCreate}:{reviews:Review[];onComplete:(r:Review)=>void;onCreate:()=>void}){
  const [tab,setTab]=useState<'Pending'|'Completed'|'All'>('Pending')
  const shown=reviews.filter(r=>tab==='All'||(tab==='Pending'?r.status==='Pending':r.status!=='Pending'))
  return <><PageHeading eyebrow="ACCESS CERTIFICATION" title="Access reviews" description="Make ownership and permission decisions explicit, assigned, and auditable."><Button icon={<Plus size={16}/>} onClick={onCreate}>Create review</Button></PageHeading>
    <div className="review-kpis"><div className="review-kpi"><span>Awaiting decision</span><strong>{reviews.filter(r=>r.status==='Pending').length}</strong><small className="kpi-warn">Requires attention</small></div><div className="review-kpi"><span>Completed</span><strong>{reviews.filter(r=>r.status!=='Pending').length}</strong><small>In this demo session</small></div><div className="review-kpi"><span>Critical priority</span><strong>{reviews.filter(r=>r.status==='Pending'&&r.priority==='Critical').length}</strong><small className="kpi-warn">Expedite review</small></div><div className="review-kpi"><span>Average decision time</span><strong>—</strong><small>Not enough sample data</small></div></div>
    <section className="panel review-table-panel"><div className="panel-head"><div><h2>Review assignments</h2><p>Reviewers certify whether access is still appropriate.</p></div><div className="tab-pills">{(['Pending','Completed','All'] as const).map(t=><button key={t} className={tab===t?'pill-active':''} onClick={()=>setTab(t)}>{t}</button>)}</div></div><div className="review-cards">{shown.map(r=><div className="review-card" key={r.id}><div className="review-card-top"><div className={`review-priority ${r.priority.toLowerCase()}`}><i/>{r.priority}</div><span>{r.id}</span></div><h3>{r.title}</h3><div className="review-target"><Bot size={15}/><strong>{r.target}</strong></div><p>{r.reason}</p><div className="review-meta"><div><small>ASSIGNED TO</small><strong>{r.reviewer}</strong></div><div><small>DUE</small><strong>{r.due}</strong></div><div><small>STATUS</small><StatusBadge status={r.status}/></div></div><div className="review-card-actions">{r.status==='Pending'?<Button onClick={()=>onComplete(r)} icon={<Check size={15}/>}>Mark reviewed</Button>:<span className="completed-label"><CheckCircle2 size={15}/> Review completed</span>}</div></div>)}{shown.length===0&&<div className="empty-state"><FileCheck2 size={25}/><strong>No reviews in this view</strong><span>Create an access review to start a new certification workflow.</span></div>}</div></section>
  </>
}

function Audit({events,onExport}:{events:Event[];onExport:()=>void}){return <><PageHeading eyebrow="GOVERNANCE EVIDENCE" title="Audit trail" description="A chronological record of risk signals, access reviews, and simulated remediation decisions."><Button variant="secondary" icon={<Download size={15}/>} onClick={onExport}>Export inventory CSV</Button></PageHeading><div className="audit-banner"><div><ShieldCheck size={18}/><strong>Traceable by design</strong><span>Every action performed in this demo is recorded with an actor, target, timestamp, and outcome.</span></div><span>{events.length} events</span></div><section className="panel audit-panel"><div className="panel-head"><div><h2>Event history</h2><p>Newest events appear first.</p></div><span className="subtle-tag">All event types</span></div><div className="audit-table-head"><span>EVENT</span><span>ACTOR</span><span>TIME</span><span>DETAIL</span></div><div className="audit-rows">{events.map(e=><div className="audit-row" key={e.id}><div className="audit-event"><div className={`event-icon event-${e.tone}`}>{e.tone==='danger'?<AlertOctagon size={15}/>:e.tone==='success'?<Check size={15}/>:e.tone==='warning'?<Clock3 size={15}/>:<Activity size={15}/>}</div><div><strong>{e.action}</strong><span>{e.target}</span></div></div><div className="audit-actor">{e.actor}</div><div className="audit-time">{e.time}</div><div className="audit-detail">{e.detail}</div></div>)}</div></section></>}

function AgentDrawer({agent,onClose,onReview,onRemediate}:{agent:Agent;onClose:()=>void;onReview:(a:Agent)=>void;onRemediate:()=>void}){
  return <><div className="drawer-scrim" onClick={onClose}/><aside className="agent-drawer"><div className="drawer-head"><span>IDENTITY PROFILE</span><button className="icon-button" onClick={onClose}><X size={19}/></button></div><div className="drawer-title"><div className={`drawer-agent-icon ${agent.type==='AI Agent'?'agent-icon':'service-icon'}`}>{agent.type==='AI Agent'?<Bot size={22}/>:<KeyRound size={22}/>}</div><div><h2>{agent.name}</h2><span>{agent.id} · {agent.type}</span></div></div><div className="drawer-pills"><RiskBadge level={agent.riskLevel}/><StatusBadge status={agent.status}/><span className="subtle-tag">{agent.environment}</span></div><div className="risk-score-detail"><div><small>RISK SCORE</small><strong>{agent.risk}<span>/100</span></strong></div><div className="detail-score-track"><i style={{width:`${agent.risk}%`}} className={`fill-${riskClass(agent.riskLevel)}`}/></div><p>Signals: {agent.flags.length?agent.flags.join(' · '):'No active risk flags'}</p></div><div className="drawer-section"><div className="drawer-section-title">OWNERSHIP & SOURCE</div><div className="detail-grid"><Detail label="Owner" value={agent.owner}/><Detail label="Owner status" value={agent.ownerStatus}/><Detail label="Team" value={agent.team}/><Detail label="Discovery source" value={agent.discovery}/><Detail label="Platform" value={agent.platform}/><Detail label="Created" value={agent.created}/></div></div><div className="drawer-section"><div className="drawer-section-title">CREDENTIAL & ACTIVITY</div><div className="detail-grid"><Detail label="Credential type" value={agent.credential}/><Detail label="Last activity" value={agent.lastActive}/><Detail label="Inactive days" value={`${agent.daysInactive} days`}/></div></div><div className="drawer-section"><div className="drawer-section-title">PERMISSIONS & CONNECTED RESOURCES</div><div className="permission-list">{agent.scopes.map((scope,i)=><div className="permission-row" key={scope}><div className="permission-icon"><LockKeyhole size={14}/></div><div><strong>{scope}</strong><small>{agent.resources[i]||'Connected resource'}</small></div><span className={scope.toLowerCase().includes('admin')?'permission-elevated':'permission-standard'}>{scope.toLowerCase().includes('admin')?'Elevated':'Granted'}</span></div>)}</div></div><div className="drawer-section"><div className="drawer-section-title">RISK CONTEXT</div><div className="context-note"><AlertTriangle size={16}/><span>{agent.notes}</span></div></div><div className="drawer-actions"><Button variant="secondary" onClick={()=>onReview(agent)} icon={<CheckCheck size={15}/>}>Mark reviewed</Button><Button onClick={onRemediate} icon={<ShieldCheck size={15}/>}>Plan remediation</Button></div><div className="drawer-disclaimer">Demo only · No permissions, credentials, or identities are changed in connected systems.</div></aside></>}
function Detail({label,value}:{label:string;value:string}){return <div className="detail-item"><small>{label}</small><strong>{value}</strong></div>}

function RemediationModal({agent,onClose,onApply}:{agent:Agent;onClose:()=>void;onApply:(actions:string[],owner:string)=>void}){
  const [actions,setActions]=useState<string[]>([])
  const [owner,setOwner]=useState('Ava Patel')
  const [approved,setApproved]=useState(false)
  const options=[{name:'Reassign owner',desc:'Move accountability to an active employee.',icon:<Users size={16}/>,available:agent.ownerStatus!=='Active'},{name:'Remove admin access',desc:'Remove elevated roles from this identity.',icon:<LockKeyhole size={16}/>,available:agent.flags.includes('Admin privilege')||agent.scopes.some(s=>s.toLowerCase().includes('admin'))},{name:'Rotate credential',desc:'Record a credential rotation request.',icon:<KeyRound size={16}/>,available:true},{name:'Suspend agent',desc:'Disable the identity after impact is reviewed.',icon:<ShieldAlert size={16}/>,available:agent.status!=='Suspended'}]
  const toggle=(v:string)=>setActions(prev=>prev.includes(v)?prev.filter(x=>x!==v):[...prev,v])
  return <div className="modal-scrim"><div className="modal remediation-modal"><div className="modal-head"><div><span className="eyebrow">REMEDIATION PLANNER</span><h2>Plan a safe response</h2></div><button className="icon-button" onClick={onClose}><X size={18}/></button></div><div className="modal-subtitle">{agent.name} <span>· {agent.id}</span></div><div className="impact-warning"><AlertTriangle size={17}/><div><strong>Review the impact before proceeding</strong><span>Actions below are simulated. Nothing is executed against a live identity provider or application.</span></div></div><div className="modal-label">SELECT REMEDIATION STEPS</div><div className="action-options">{options.filter(x=>x.available).map(o=><button className={`action-option ${actions.includes(o.name)?'action-option-selected':''}`} key={o.name} onClick={()=>toggle(o.name)}><span className="action-option-icon">{o.icon}</span><span><strong>{o.name}</strong><small>{o.desc}</small></span><span className="check-box">{actions.includes(o.name)&&<Check size={13}/>}</span></button>)}</div>{actions.includes('Reassign owner')&&<div className="owner-select-wrap"><label>NEW ACCOUNTABLE OWNER</label><select value={owner} onChange={e=>setOwner(e.target.value)}><option>Ava Patel</option><option>Jordan Kim</option><option>Priya Nair</option><option>Marcus Lee</option><option>Sophia Chen</option></select></div>}<div className="impact-preview"><div><span>Selected steps</span><strong>{actions.length}</strong></div><div><span>Current risk score</span><strong>{agent.risk}/100</strong></div><div><span>Approval</span><strong>Admin required</strong></div></div><label className="approval-confirm"><input type="checkbox" checked={approved} onChange={e=>setApproved(e.target.checked)}/><span>I reviewed the proposed steps and approve this simulated action.</span></label><div className="modal-actions"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={()=>onApply(actions,owner)} disabled={actions.length===0||!approved}>Approve & record <ArrowRight size={15}/></Button></div></div></div>
}
function CreateReviewModal({agents,selected,setSelected,onClose,onCreate}:{agents:Agent[];selected:string;setSelected:(v:string)=>void;onClose:()=>void;onCreate:()=>void}){return <div className="modal-scrim"><div className="modal"><div className="modal-head"><div><span className="eyebrow">ACCESS CERTIFICATION</span><h2>Create access review</h2></div><button className="icon-button" onClick={onClose}><X size={18}/></button></div><p className="modal-description">Assign an explicit certification task for an identity. The reviewer and approval are simulated in this prototype.</p><label className="form-label">SELECT IDENTITY</label><select className="modal-select" value={selected} onChange={e=>setSelected(e.target.value)}>{agents.map(a=><option value={a.id} key={a.id}>{a.name} · {a.id}</option>)}</select><div className="modal-actions"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={onCreate}>Create review <ArrowRight size={15}/></Button></div></div></div>}
function HelpModal({onClose,onReset}:{onClose:()=>void;onReset:()=>void}){return <div className="modal-scrim"><div className="modal help-modal"><div className="modal-head"><div><span className="eyebrow">DEMO GUIDE</span><h2>Explore the workbench</h2></div><button className="icon-button" onClick={onClose}><X size={18}/></button></div><div className="guide-steps"><div><b>01</b><span><strong>Start with the risk queue</strong><small>Open Deal Desk Copilot and inspect its departed owner, elevated permissions, and connected resources.</small></span></div><div><b>02</b><span><strong>Plan a remediation</strong><small>Select reassignment, permission removal, credential rotation, or suspension. The prototype updates the sample workspace state; signed-in changes sync to Supabase.</small></span></div><div><b>03</b><span><strong>Try the offboarding scenario</strong><small>From Overview, simulate a former employee leaving. Watch a new risk signal and review assignment appear.</small></span></div><div><b>04</b><span><strong>Inspect the audit trail</strong><small>Every simulated action is recorded with an actor, timestamp, target, and explanatory detail.</small></span></div></div><div className="guide-note"><ShieldCheck size={17}/><span>All names, organisations, metrics, events, and permissions are fictional sample data. No live CloudEagle, Okta, Entra ID, or AWS integration is present.</span></div><div className="modal-actions"><Button variant="secondary" onClick={onReset}>Reset demo data</Button><Button onClick={onClose}>Got it</Button></div></div></div>}
