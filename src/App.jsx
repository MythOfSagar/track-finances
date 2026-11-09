import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, Check, CircleHelp, Command, Compass, CreditCard, LayoutGrid, Leaf, Search, SlidersHorizontal, Sparkle, Wallet, X } from 'lucide-react'
import fallbackData from './fallbackData.json'
import { metrics, money, number, itemName, categoryMetrics, typeLabels, monthsLabel } from './utils/financeUtils'
import './App.css'

const types = ['Spending', 'NonCIBILReturn', 'CIBILReturn', 'Saving']
const palette = ['#75c8a0', '#e3ba72', '#83bcdf', '#a99be9']
const KEY_STORAGE = 'finances.sheetdb.key'
const readStoredKey = () => { try { return window.localStorage.getItem(KEY_STORAGE)?.trim() || '' } catch { return '' } }

function MiniTree({ position, scale = 1, kind = 0, tint = '#47785a' }) {
  const crown = useRef()
  useFrame(({ clock }) => { if (crown.current) crown.current.rotation.z = Math.sin(clock.elapsedTime * .65 + position[0]) * .035 })
  const colors = kind === 1 ? ['#b98758','#c99a66','#d8b67a'] : [tint, '#4f855e', '#6b9861']
  return <group position={position} scale={scale}>
    <mesh position={[0,.53,0]} castShadow><cylinderGeometry args={[.09,.16,1.1,7]}/><meshStandardMaterial color="#76533b" roughness={.92}/></mesh>
    {[[-.12,.5,0],[.12,.62,0],[-.08,.72,0]].map(([x,y,z],i)=><mesh key={i} position={[x,y,z]} rotation={[0,0,(i-1)*.42]}><cylinderGeometry args={[.035,.055,.58,5]}/><meshStandardMaterial color="#79583e"/></mesh>)}
    <group ref={crown}>{[[0,1.1,0,.48],[.28,1.32,.02,.36],[-.27,1.32,-.03,.38],[0,1.55,.04,.31],[.03,.98,.22,.28]].map(([x,y,z,r],i)=><mesh key={i} position={[x,y,z]} scale={[1,.88,.9]} castShadow><dodecahedronGeometry args={[r,1]}/><meshStandardMaterial color={colors[i%colors.length]} roughness={.88}/></mesh>)}</group>
  </group>
}

function VillageHouse({ position, scale=1, color='#a98d68' }) {
  const chimneySmoke = useRef()
  useFrame(({clock})=>{if(chimneySmoke.current) chimneySmoke.current.position.y=.03+((clock.elapsedTime*.12)% .4)})
  return <group position={position} scale={scale}>
    <mesh position={[0,.48,0]} castShadow><boxGeometry args={[.92,.9,.78]}/><meshStandardMaterial color={color} roughness={.82}/></mesh>
    <mesh position={[0,.97,0]} castShadow><cylinderGeometry args={[.02,.66,.62,4,1,false,Math.PI/4]}/><meshStandardMaterial color="#654936" roughness={.9}/></mesh>
    <mesh position={[0,.22,.397]}><boxGeometry args={[.2,.43,.035]}/><meshStandardMaterial color="#59432f" roughness={.9}/></mesh>
    {[[-.27,.63,.4],[.27,.63,.4]].map(([x,y,z],i)=><group key={i} position={[x,y,z]}><mesh><boxGeometry args={[.19,.2,.035]}/><meshStandardMaterial color="#554a37"/></mesh><mesh position={[0,0,.022]}><planeGeometry args={[.13,.14]}/><meshBasicMaterial color="#ffd58a"/></mesh></group>)}
    <mesh position={[.3,1.28,-.15]}><boxGeometry args={[.13,.54,.13]}/><meshStandardMaterial color="#66503b"/></mesh>
    <group ref={chimneySmoke} position={[.3,1.6,-.15]}><mesh><sphereGeometry args={[.1,8,7]}/><meshBasicMaterial color="#e4e1cf" transparent opacity={.23}/></mesh></group>
  </group>
}

function Walker({ position, color='#d4b781', pace=1 }) {
  const ref=useRef()
  useFrame(({clock})=>{if(ref.current){ref.current.position.x=position[0]+Math.sin(clock.elapsedTime*.3*pace)*.55;ref.current.rotation.y=Math.cos(clock.elapsedTime*.3*pace)*.18}})
  return <group ref={ref} position={position}>
    <mesh position={[0,.25,0]}><capsuleGeometry args={[.075,.25,3,6]}/><meshStandardMaterial color={color}/></mesh>
    <mesh position={[0,.48,0]}><sphereGeometry args={[.075,10,8]}/><meshStandardMaterial color="#d9b99a"/></mesh>
    <mesh position={[-.05,.07,0]} rotation={[0,0,.08]}><cylinderGeometry args={[.027,.035,.16,6]}/><meshStandardMaterial color="#283c39"/></mesh>
    <mesh position={[.05,.07,0]} rotation={[0,0,-.08]}><cylinderGeometry args={[.027,.035,.16,6]}/><meshStandardMaterial color="#283c39"/></mesh>
  </group>
}

function Terrain() {
  const water = useRef()
  const birds = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (water.current) water.current.position.y = -1.27 + Math.sin(t * .55) * .025
    if (birds.current) { birds.current.position.x = Math.sin(t * .16) * 5; birds.current.position.z = -6 + Math.cos(t * .16) * 2 }
  })
  const treePositions = Array.from({length: 30}, (_, i) => [(i % 10 - 4.5) * 2.05, -1.02, -2 - Math.floor(i / 10) * 3.3])
  const road = (points, color = '#d5b86f') => <mesh><tubeGeometry args={[new THREE.CatmullRomCurve3(points.map(([x,y,z]) => new THREE.Vector3(x,y,z))), 48, .035, 6, false]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.8} /></mesh>
  return <>
    <color attach="background" args={['#102638']} />
    <fog attach="fog" args={['#193448', 12, 34]} />
    <ambientLight intensity={1.4} />
    <directionalLight castShadow position={[-6, 12, 3]} intensity={3} color="#ffd5a0" shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={16} shadow-camera-bottom={-16} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}><planeGeometry args={[80, 80]} /><meshStandardMaterial color="#173c39" roughness={0.9} /></mesh>
    {/* Layered, sculpted island terrain creates a rolling shoreline and a raised central valley. */}
    <mesh position={[0,-1.55,-3.3]} scale={[14,.8,7.5]} receiveShadow><icosahedronGeometry args={[1,4]}/><meshStandardMaterial color="#315b43" roughness={1} flatShading/></mesh>
    <mesh position={[-6,-1.05,-4]} scale={[4.4,1.5,3.6]} receiveShadow><icosahedronGeometry args={[1,3]}/><meshStandardMaterial color="#426748" roughness={1} flatShading/></mesh>
    <mesh position={[5,-1.1,-4.8]} scale={[5,1.65,3.5]} receiveShadow><icosahedronGeometry args={[1,3]}/><meshStandardMaterial color="#365e47" roughness={1} flatShading/></mesh>
    <mesh ref={water} rotation={[-Math.PI / 2, 0, -.05]} position={[0, -1.27, 1]}><planeGeometry args={[34, 10, 1, 1]} /><meshStandardMaterial color="#367982" roughness={0.2} metalness={0.58} /></mesh>
    {/* A winding lit trail ties the settlements, lake and summit together. */}
    {road([[-9,-1.05,2],[-6,-.9,0],[-3,-.85,-1],[0,-.8,-3],[3,-.85,-1],[7,-.95,1]])}
    {road([[2,-.9,-1],[4,-.7,-4],[6,-.4,-7],[8,.1,-9]], '#b9d79b')}
    {/* Left bank: warm, inhabited spending district with varied rooflines. */}
    {Array.from({length:7},(_,i)=><VillageHouse key={`town${i}`} position={[-9+(i%4)*1.7,-.96,-1.1-Math.floor(i/4)*1.65]} scale={.72+(i%3)*.09} color={i%2?'#a58c69':'#bc9b70'}/>)}
    {/* Mid-bank homes and a small bridge. */}
    {Array.from({length:4},(_,i)=><VillageHouse key={`home${i}`} position={[-2.8+i*1.65,-.89,-4.5-(i%2)*.7]} scale={.72} color={i%2?'#87947b':'#a1a184'}/>)}
    <group position={[0,-.9,.4]}><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.09,.09,3,8]}/><meshStandardMaterial color="#997a4c"/></mesh>{[-1.3,1.3].map(x=><mesh key={x} position={[x,0,0]}><boxGeometry args={[.18,.7,.24]}/><meshStandardMaterial color="#6d6956"/></mesh>)}</group>
    {/* Summit lodge: the landmark for the largest active obligation. */}
    <VillageHouse position={[0,1.7,-4]} scale={1.55} color="#d1b88b"/>
    {/* Rich savings grove across the right bank. */}
    {treePositions.map(([x,y,z],i) => <MiniTree key={i} position={[x,y,z]} scale={.68+(i%4)*.14} kind={i%8===0?1:0} tint={i%3?'#376749':'#527d55'}/>)}
    {[[-6,-.92,-.1],[-3,-.92,-.65],[1,-.88,-.4],[4,-.88,-.2]].map((p,i)=><Walker key={`walker${i}`} position={p} color={['#d9bc86','#b98d70','#cad6bd','#d6a97f'][i]} pace={.8+i*.1}/>)}
    {/* Meandering canopy layers give the island depth and a soft horizon. */}
    {Array.from({length:22},(_,i)=><mesh key={`bush${i}`} position={[-12+(i%11)*2.4,-.95,-7-Math.floor(i/11)*3]} scale={[1.4,.5,.7]}><sphereGeometry args={[.8,10,8]}/><meshStandardMaterial color={i%2?'#294f42':'#345b48'}/></mesh>)}
    <group ref={birds} position={[0,3,-6]}>{[0,1,2].map(i=><group key={i} position={[i*.38,Math.sin(i*3)*.2,Math.cos(i*2)*.25]} rotation={[0,.3,0]}><mesh><coneGeometry args={[.07,.34,3]}/><meshStandardMaterial color="#e5d6b4"/></mesh><mesh position={[-.1,0,0]} rotation={[0,0,.48]}><planeGeometry args={[.22,.08]}/><meshStandardMaterial color="#b7c4b5" side={THREE.DoubleSide}/></mesh><mesh position={[.1,0,0]} rotation={[0,0,-.48]}><planeGeometry args={[.22,.08]}/><meshStandardMaterial color="#b7c4b5" side={THREE.DoubleSide}/></mesh></group>)}</group>
    {[[-9,4,-9],[3,5,-14],[11,3.7,-11]].map(([x,y,z],i)=><Float key={`cloud${i}`} speed={.16+i*.03} floatIntensity={.12}><group position={[x,y,z]}>{[-1,0,1].map((n)=><mesh key={n} position={[n*.55,Math.abs(n)*.13,0]} scale={[.85,.33,.35]}><sphereGeometry args={[1,10,8]}/><meshStandardMaterial color="#c0d1c6" transparent opacity={.16} roughness={1}/></mesh>)}</group></Float>)}
    <Sparkles count={75} scale={[30, 8, 22]} size={2.2} speed={0.2} color="#c5dfce" />
  </>
}

function Scene({ selected, onSelect }) {
  const coords = [[-5, 0, 1], [-1.8, .4, -2.5], [2, .5, 0], [5, .2, -3]]
  return <div className="scene"><Canvas shadows camera={{ position: [0, 7.5, 16], fov: 39 }} dpr={[1, 1.5]}><Terrain />{types.map((type, i) => <Float key={type} speed={1} floatIntensity={.3}><mesh position={coords[i]} onClick={() => onSelect(type)}><sphereGeometry args={[.24, 24, 24]} /><meshStandardMaterial color={palette[i]} emissive={palette[i]} emissiveIntensity={selected === type ? 1.3 : .35} /></mesh></Float>)}<OrbitControls enablePan={false} minPolarAngle={.8} maxPolarAngle={1.45} minDistance={13} maxDistance={24} /></Canvas></div>
}

function Ring({ percent }) { return <div className="ring" style={{ '--progress': `${Math.min(percent, 100)}%` }}><div className="ring-core"><span>{percent.toFixed(1)}%</span><small>given</small></div></div> }
function Panel({ className = '', children }) { return <motion.section className={`glass ${className}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>{children}</motion.section> }
function App() {
  const [apiKey, setApiKey] = useState(readStoredKey)
  const [keyDraft, setKeyDraft] = useState('')
  const [keyEntryOpen, setKeyEntryOpen] = useState(false)
  const [finances, setFinances] = useState(fallbackData)
  const [usingFallback, setUsingFallback] = useState(true)
  const [dataStatus, setDataStatus] = useState('loading')
  const [dataError, setDataError] = useState('')
  const [view, setView] = useState('Overview')
  const [selected, setSelected] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('Highest remaining')
  const [showAll, setShowAll] = useState(false)
  const [detail, setDetail] = useState(null)
  useEffect(() => {
    if (!apiKey) {
      setDataStatus('setup')
      setUsingFallback(true)
      return
    }
    setDataStatus('loading')
    setDataError('')
    const controller = new AbortController()
    fetch(`https://sheetdb.io/api/v1/${encodeURIComponent(apiKey)}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`SheetDB returned ${response.status}. Check your API key and sheet access.`)
        return response.json()
      })
      .then(rows => {
        if (!Array.isArray(rows)) throw new Error('SheetDB response should be an array of financial records.')
        setFinances(rows)
        setUsingFallback(false)
        setDataStatus('ready')
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setFinances(fallbackData)
          setUsingFallback(true)
          setDataError(error.message || 'Could not load records from SheetDB.')
          setDataStatus('error')
        }
      })
    return () => controller.abort()
  }, [apiKey])
  const saveApiKey = (event) => {
    event.preventDefault()
    const nextKey = keyDraft.trim()
    if (!nextKey) return
    try { window.localStorage.setItem(KEY_STORAGE, nextKey) } catch {
      setDataError('Your browser could not save the key. Enable local storage, then try again.')
      setDataStatus('error')
      return
    }
    setApiKey(nextKey)
    setKeyEntryOpen(false)
    setKeyDraft('')
  }
  const all = metrics(finances)
  const filtered = useMemo(() => {
    let rows = finances.filter(item => itemName(item).toLowerCase().includes(search.toLowerCase()))
    if (view === 'Release') rows = rows.filter(item => item.Essense === 'Release')
    if (view === 'Store') rows = rows.filter(item => item.Essense === 'Store')
    if (filter === 'Completed') rows = rows.filter(item => number(item['Amount Remain']) === 0)
    else if (filter === 'Pending') rows = rows.filter(item => number(item['Amount Remain']) > 0)
    else if (types.includes(filter)) rows = rows.filter(item => item.Type === filter)
    rows.sort((a,b) => sort === 'Alphabetical' ? itemName(a).localeCompare(itemName(b)) : sort === 'Highest total' ? number(b['To Give'])-number(a['To Give']) : sort === 'Highest completion' ? number(b['Percent Given'])-number(a['Percent Given']) : number(b['Amount Remain'])-number(a['Amount Remain']))
    return rows
  }, [view, filter, search, sort])
  const pending = finances.filter(i => number(i['Amount Remain']) > 0).sort((a,b) => number(b['Amount Remain']) - number(a['Amount Remain']))
  const completed = finances.filter(i => number(i['Amount Remain']) === 0)
  const sections = view === 'All Items' ? true : view !== 'Overview'

  return <main className="app-shell">
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <header className="topbar glass">
      <a className="brand" href="#"><span className="brand-icon"><Leaf size={18}/></span><span>finances<span className="brand-dot">.</span></span></a>
      <nav>{[['Overview',LayoutGrid],['Release',ArrowUpRight],['Store',Wallet],['All Items',Command]].map(([label,Icon])=><button key={label} className={view===label?'nav-active':''} onClick={()=>{setView(label);setFilter('All')}}><Icon size={15}/>{label}</button>)}</nav>
      <div className="top-actions"><span className="date-label"><span className="live-dot"/>Your money, in perspective</span><div className="avatar">A</div></div>
    </header>

    <div className="page-heading"><div><div className="eyebrow"><span/> PERSONAL FINANCIAL ATLAS <span className="eyebrow-line"/></div><h1>{view === 'Overview' ? <>A clearer view of<br/><em>what you are building.</em></> : view}</h1></div></div>
    {dataStatus === 'loading' && <div className="sync-loader" role="status" aria-live="polite"><div className="sync-orbit"><i/><i/><i/><span><Sparkle size={14}/></span></div><div className="sync-copy"><b>Gathering your financial world</b><span>Securely syncing records from your sheet</span><div className="sync-progress"><i/></div></div><span className="sync-status">SYNCING</span></div>}
    {usingFallback && <div className="data-notice fallback" role={dataStatus === 'error' ? 'alert' : 'status'}><span><b>TEST DATA</b> {dataStatus === 'error' ? `Live data unavailable: ${dataError}` : dataStatus === 'loading' ? 'Showing sample records while live data loads.' : 'Showing sample records. Connect SheetDB to load your live data.'}</span><button onClick={()=>{setKeyDraft(apiKey);setKeyEntryOpen(true)}}>{apiKey ? 'Update SheetDB key' : 'Connect SheetDB'}</button></div>}

    {view === 'Overview' ? <>
      <section className="hero-layout">
        <div className="hero-main"><Scene selected={selected} onSelect={setSelected}/><div className="scene-vignette"/><div className="scene-top"><span><Compass size={14}/> YOUR FINANCIAL LANDSCAPE</span><button onClick={()=>setSelected('')}><CircleHelp size={15}/></button></div>
          <div className="hero-score"><div className="hero-label"><span className="tiny-gold"/> TOTAL TRACKED FINANCIAL RECORDS</div><div className="hero-number">{money(all.total, true)}</div><div className="hero-exact">{money(all.total)} <span>across {finances.length} records</span></div><div className="score-foot"><div className="score-stats"><div><small>GIVEN</small><b>{money(all.given, true)}</b><span className="green-text"><ArrowUpRight size={13}/>{all.percent.toFixed(1)}% complete</span></div><div className="stat-divider"/><div><small>REMAINING</small><b>{money(all.remaining, true)}</b><span className="gold-text"><ArrowDownRight size={13}/>{(100-all.percent).toFixed(1)}% to go</span></div></div><Ring percent={all.percent}/></div></div>
          <div className="landscape-caption"><span className="caption-icon"><Sparkle size={13}/></span><span className="caption-text">A long view is built one step at a time</span></div>
          {types.map((type,i)=>{const m=categoryMetrics(type,finances);return <button key={type} className={`map-label map-${i} ${selected===type?'map-selected':''}`} onClick={()=>setSelected(selected===type?'':type)}><span style={{background:palette[i]}}/><span className="map-copy"><b>{typeLabels[type]}</b><small>{money(m.total,true)}  |  {m.percent.toFixed(0)}% given</small></span></button>})}
        </div>
        <Panel className="snapshot"><div className="panel-kicker">AT A GLANCE</div><h2>The bigger<br/>picture.</h2><p className="muted">Your commitments, savings and progress in one place.</p><div className="snapshot-progress"><div className="progress-head"><span>Overall progress</span><b>{all.percent.toFixed(1)}%</b></div><div className="progress-track"><i style={{width:`${all.percent}%`}}/></div><div className="progress-foot"><span>{money(all.given)} given</span><span>{money(all.remaining)} remaining</span></div></div><div className="snapshot-rule"/><div className="snapshot-stats"><div><small>MONTHLY FLOWS</small><b>{money(all.monthly)}<small> / mo</small></b></div><div><small>COMPLETED RECORDS</small><b>{completed.length}<small> of {finances.length}</small></b></div><div><small>OPEN OBLIGATIONS</small><b>{pending.length}<small> items</small></b></div></div><div className="secured-runway"><span className="runway-icon"><Wallet size={15}/></span><span className="runway-label"><b>SAVINGS RUNWAY</b><small>{money(all.totalSavings,true)}  /  {money(all.monthlyRelease,true)} per month</small></span><strong>{all.securedMonths === null ? 'Not specified' : `${all.securedMonths.toFixed(1)} mo`}</strong></div><div className="secured-runway net-runway"><span className="runway-icon"><ArrowUpRight size={15}/></span><span className="runway-label"><b>NET SECURED MONTHS</b><small>{money(all.totalSavings,true)} savings  -  {money(all.totalNonCibilRemainingReturn,true)} Non-CIBIL remaining returns  /  {money(all.monthlyRelease,true)} / mo</small></span><strong>{all.netSecuredMonths === null ? 'Not specified' : `${all.netSecuredMonths.toFixed(1)} mo`}</strong></div><button className="text-link" onClick={()=>setView('All Items')}>Explore all records <span><ArrowUpRight size={12}/></span></button></Panel>
      </section>
      <section className="category-section"><div className="section-heading"><div><div className="eyebrow">THE BREAKDOWN</div><h2>Every part has a place.</h2></div><span>SELECT A CATEGORY TO EXPLORE</span></div><div className="category-grid">{types.map((type,i)=>{const m=categoryMetrics(type,finances);return <button key={type} onClick={()=>setSelected(selected===type?'':type)} className={`category-card glass ${selected===type?'category-selected':''}`}><div className="category-top"><span className="category-icon" style={{'--accent':palette[i]}}>{[<ArrowDownRight size={15}/>,<ArrowUpRight size={15}/>,<CreditCard size={15}/>,<Sparkle size={15}/>][i]}</span><span className="category-arrow"><ArrowUpRight size={14}/></span></div><div className="category-title">{typeLabels[type]}</div><b className="category-value">{money(m.total,true)}</b><div className="category-meta"><span>{money(m.given,true)} given</span><span>{m.percent.toFixed(0)}%</span></div><div className="progress-track"><i style={{width:`${m.percent}%`,background:palette[i]}}/></div><div className="category-bottom"><span>{m.completed} complete</span><span>{money(m.remaining,true)} remaining</span></div></button>})}</div></section>
      <section className="lower-grid"><Panel><div className="panel-heading"><div><div className="eyebrow">YOUR MOMENTUM</div><h3>Progress by type</h3></div><span className="mini-badge"><Sparkle size={12}/> LIVE DATA</span></div>{types.map((type,i)=>{const m=categoryMetrics(type,finances);return <div className="type-row" key={type}><div className="type-row-top"><span><i style={{background:palette[i]}}/>{typeLabels[type]}</span><b>{m.percent.toFixed(1)}%</b></div><div className="progress-track"><i style={{width:`${m.percent}%`,background:palette[i]}}/></div><div className="type-row-foot"><span>{money(m.given)} given</span><span>of {money(m.total)}</span></div></div>})}</Panel>
      <Panel><div className="panel-heading"><div><div className="eyebrow">A LITTLE ATTENTION</div><h3>Key items</h3></div><button className="view-all" onClick={()=>setShowAll(!showAll)}>{showAll?'Show less':'View all'} <span><ArrowUpRight size={12}/></span></button></div><div className="record-list">{(showAll?pending:pending.slice(0,4)).map(item=><button className="record-row" key={item.For} onClick={()=>setDetail(item)}><span className="record-icon">{item.Type==='CIBILReturn'?<CreditCard size={15}/>:<ArrowUpRight size={15}/>}</span><span className="record-name"><b>{itemName(item)}</b><small>{monthsLabel(item['Months Remained'])}</small></span><span className="record-amount"><b>{money(number(item['Amount Remain']))}</b><small>{number(item['Percent Given']).toFixed(1)}% given</small></span><span className="row-chevron"><ArrowUpRight size={13}/></span></button>)}</div><div className="list-foot">{pending.length} outstanding records <span>{money(all.remaining)} remaining</span></div></Panel></section>
      <section className="savings-formats glass"><div className="section-heading"><div><div className="eyebrow">SAVINGS OVERVIEW</div><h2>Four ways to view your balance.</h2></div></div><div className="savings-format-grid">{[['CIBIL debt-free balance',all.savingsAfterCibilDebt],['Non-CIBIL debt-free balance',all.savingsAfterNonCibilDebt],['Current savings total',all.totalSavings],['Current total after all debt',all.realCurrentTotal]].map(([label,value],i)=><div className={i>1?'savings-format-highlight':''} key={label}><span>{label}</span><b>{new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:2,maximumFractionDigits:2}).format(value)}</b></div>)}</div></section>
      <Panel className="completed-panel"><div className="panel-heading"><div><div className="eyebrow">MILESTONES</div><h3>Recently completed</h3></div><button className="view-all" onClick={()=>setView('All Items')}>All records <span><ArrowUpRight size={12}/></span></button></div><div className="completed-row">{completed.slice(0,6).map(item=><button key={item.For} className="complete-item" onClick={()=>setDetail(item)}><span className="check-icon"><Check size={14}/></span><span><b>{itemName(item)}</b><small>{money(number(item['Amount Given']))} completed</small></span></button>)}</div></Panel>
    </> : <section className="records-view glass"><div className="records-heading"><div><div className="eyebrow">{view === 'Store'?'SAVINGS & INVESTMENTS':view==='Release'?'OBLIGATIONS & RELEASES':'YOUR FINANCIAL RECORDS'}</div><h2>{view==='All Items'?'Every detail, in view.':view==='Store'?'What you are growing.':'What you are working through.'}</h2><p>{filtered.length} records  |  {money(metrics(filtered).total)} tracked</p></div><div className="record-actions"><label className="searchbox"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search records"/><kbd>Ctrl K</kbd></label><label className="selectbox"><SlidersHorizontal size={15}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Completed</option><option>Pending</option>{types.map(t=><option key={t} value={t}>{typeLabels[t]}</option>)}</select></label><label className="selectbox"><select value={sort} onChange={e=>setSort(e.target.value)}><option>Highest remaining</option><option>Highest total</option><option>Highest completion</option><option>Alphabetical</option></select></label></div></div><div className="table-wrap"><table><thead><tr><th>ITEM</th><th>CLASSIFICATION</th><th>TOTAL</th><th>GIVEN</th><th>REMAINING</th><th>PROGRESS</th><th/></tr></thead><tbody>{filtered.map(item=><tr key={item.For} onClick={()=>setDetail(item)}><td><span className="table-icon">{item.Essense==='Store'?<Sparkle size={14}/>:<ArrowUpRight size={14}/>}</span><b>{itemName(item)}</b></td><td><span className={`type-pill ${item.Type}`}>{typeLabels[item.Type]}</span></td><td>{money(number(item['To Give']))}</td><td className="green-text">{money(number(item['Amount Given']))}</td><td className={number(item['Amount Remain'])?'gold-text':''}>{money(number(item['Amount Remain']))}</td><td><div className="table-progress"><div className="progress-track"><i style={{width:`${Math.min(number(item['Percent Given']),100)}%`}}/></div><small>{number(item['Percent Given']).toFixed(1)}%</small></div></td><td><ArrowUpRight size={13}/></td></tr>)}</tbody></table>{filtered.length===0&&<div className="empty-state">No records match this search.</div>}</div></section>}
    <footer><span><Sparkle size={12}/>Built for the long view.</span><span>FINANCES - PERSONAL FINANCIAL ATLAS</span></footer>
    <AnimatePresence>{keyEntryOpen&&<motion.div className="modal-backdrop key-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.form className="key-modal glass" onSubmit={saveApiKey} initial={{opacity:0,y:18,scale:.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:12,scale:.98}}><div className="key-emblem"><Leaf size={21}/><i/></div><div className="eyebrow">YOUR PRIVATE FINANCIAL ATLAS</div><h2>Connect your<br/><em>financial world.</em></h2><p>Enter your SheetDB key to bring your records into the landscape. It stays in this browser for your next visit.</p><label className="key-field"><span>SHEETDB API KEY</span><input autoFocus value={keyDraft} onChange={event=>setKeyDraft(event.target.value)} placeholder="Paste your SheetDB key" autoComplete="off" spellCheck="false" required/></label><button className="key-submit" type="submit">Open my dashboard <span><ArrowUpRight size={12}/></span></button><div className="key-foot"><span className="live-dot"/> Stored locally on this device</div></motion.form></motion.div>}</AnimatePresence>    <AnimatePresence>{detail&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setDetail(null)}><motion.div className="detail-modal glass" initial={{y:20,scale:.97}} animate={{y:0,scale:1}} exit={{y:20,scale:.97}} onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setDetail(null)}><X size={18}/></button><div className="eyebrow">RECORD DETAILS</div><h2>{itemName(detail)}</h2><span className="type-pill">{typeLabels[detail.Type]}  |  {detail.Essense}</span><div className="detail-total">{money(number(detail['To Give']))}<small>total commitment</small></div><div className="detail-progress"><div className="progress-track"><i style={{width:`${Math.min(number(detail['Percent Given']),100)}%`}}/></div><span>{number(detail['Percent Given']).toFixed(1)}% complete</span></div><div className="detail-grid">{[['Given',money(number(detail['Amount Given']))],['Remaining',money(number(detail['Amount Remain']))],['Monthly release',number(detail['Monthly Release'])?money(number(detail['Monthly Release'])):'Not specified'],['Months remaining',monthsLabel(detail['Months Remained'])],['Payment method',detail['Method ']||'Not specified'],['Essense',detail.Essense],['Type',detail.Type]].map(([label,value])=><div key={label}><small>{label}</small><b>{value}</b></div>)}</div></motion.div></motion.div>}</AnimatePresence>
  </main>
}
export default App















