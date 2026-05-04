const STORAGE_KEY='mc'
const SERVICE_STORAGE_KEY='mc-service'
const FUEL_STORAGE_KEY='mc-fuel'
let trips=[]
let serviceLogs=[]
let fuelLogs=[]


try{trips=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch(error){trips=[]}
try{serviceLogs=JSON.parse(localStorage.getItem(SERVICE_STORAGE_KEY)||'[]')}catch(error){serviceLogs=[]}
try{fuelLogs=JSON.parse(localStorage.getItem(FUEL_STORAGE_KEY)||'[]')}catch(error){fuelLogs=[]}


const dateInput=document.getElementById('date')
const odoInput=document.getElementById('odo')
const noteInput=document.getElementById('note')
const saveMessage=document.getElementById('saveMessage')
const serviceDateInput=document.getElementById('serviceDate')
const serviceOdoInput=document.getElementById('serviceOdo')
const serviceTypeInput=document.getElementById('serviceType')
const serviceNoteInput=document.getElementById('serviceNote')
const serviceMessage=document.getElementById('serviceMessage')
const fuelDateInput=document.getElementById('fuelDate')
const fuelOdoInput=document.getElementById('fuelOdo')
const fuelLitersInput=document.getElementById('fuelLiters')
const fuelPriceInput=document.getElementById('fuelPrice')
const fuelMessage=document.getElementById('fuelMessage')


const today=new Date().toISOString().split('T')[0]
dateInput.value=today
serviceDateInput.value=today
fuelDateInput.value=today


document.querySelectorAll('.tab').forEach(button=>{
 button.addEventListener('click',function(){showTab(Number(button.dataset.tab))})
})
document.getElementById('openSettings').addEventListener('click',function(){showTab(4)})
document.getElementById('saveTripBtn').addEventListener('click',addTrip)
document.getElementById('undoTripBtn').addEventListener('click',undoLastTrip)
document.getElementById('yearSelect').addEventListener('change',render)
document.getElementById('saveFuelBtn').addEventListener('click',addFuelLog)
document.getElementById('saveServiceBtn').addEventListener('click',addServiceLog)
document.getElementById('exportBtn').addEventListener('click',exportCSV)
document.getElementById('importBtn').addEventListener('click',importCSV)
document.getElementById('clearBtn').addEventListener('click',clearAll)


function showTab(index){
 document.querySelectorAll('.tab').forEach((tab,i)=>tab.classList.toggle('active',i===index))
 document.querySelectorAll('.section').forEach((section,i)=>section.classList.toggle('active',i===index))
}


function createId(){return String(Date.now())+'-'+String(Math.random()).slice(2)}
function saveTrips(){localStorage.setItem(STORAGE_KEY,JSON.stringify(trips))}
function saveServiceLogs(){localStorage.setItem(SERVICE_STORAGE_KEY,JSON.stringify(serviceLogs))}
function saveFuelLogs(){localStorage.setItem(FUEL_STORAGE_KEY,JSON.stringify(fuelLogs))}


function normalizeTrips(){
 trips=trips.map(trip=>({id:trip.id||createId(),date:trip.date,odo:Number(trip.odo),d:Number(trip.d||0),note:trip.note||''})).filter(trip=>trip.date&&!Number.isNaN(trip.odo))
 trips.sort((a,b)=>Number(a.odo)-Number(b.odo))
 recalculateDistances()
}


function recalculateDistances(){
 trips.sort((a,b)=>Number(a.odo)-Number(b.odo))
 trips=trips.map((trip,index)=>{
  const previous=trips[index-1]
  return {...trip,d:previous?Number(trip.odo)-Number(previous.odo):0}
 })
}


function getLatestTrip(){
 if(trips.length===0)return null
 return trips.reduce((highest,trip)=>Number(trip.odo)>Number(highest.odo)?trip:highest,trips[0])
}


function normalizeServiceLogs(){
 serviceLogs=serviceLogs.map(item=>({id:item.id||createId(),date:item.date,odo:Number(item.odo),type:item.type||'Diverse',note:item.note||''})).filter(item=>item.date&&!Number.isNaN(item.odo))
 serviceLogs.sort((a,b)=>Number(a.odo)-Number(b.odo))
}


function normalizeFuelLogs(){
 fuelLogs=fuelLogs.map(item=>({id:item.id||createId(),date:item.date,odo:Number(item.odo),l:Number(item.l),p:Number(item.p)})).filter(item=>item.date&&!Number.isNaN(item.odo)&&!Number.isNaN(item.l)&&!Number.isNaN(item.p))
 fuelLogs.sort((a,b)=>Number(a.odo)-Number(b.odo))
}


function undoLastTrip(){
 if(trips.length===0){alert('Ingen ture at fortryde');return}
 const newestTrip=trips.slice().sort((a,b)=>Number(b.odo)-Number(a.odo))[0]
 const newestNumber=trips.length
 if(!confirm('Er du sikker på, at du vil slette tur #' + newestNumber + '?'))return
 trips=trips.filter(trip=>String(trip.id)!==String(newestTrip.id))
 recalculateDistances()
 saveTrips()
 updateYearOptions()
 render()
 showMessage(saveMessage,'Tur #' + newestNumber + ' er slettet.',false)
}


function addTrip(){
 const date=dateInput.value
 const odo=Number(odoInput.value.replace(',','.'))
 saveMessage.textContent=''
 if(!date){showMessage(saveMessage,'Vælg en dato først.',true);return}
 if(!odo||Number.isNaN(odo)||odo<=0){showMessage(saveMessage,'Skriv km-tællerstand som et tal, fx 33.',true);return}
 const last=getLatestTrip()
 if(last&&odo<=Number(last.odo)){showMessage(saveMessage,'Km-tællerstanden skal være højere end sidste registrering: '+formatNumber(last.odo)+' km.',true);return}
 trips.push({id:createId(),date,odo,d:0,note:noteInput.value})
 recalculateDistances()
 saveTrips()
 odoInput.value=''
 noteInput.value=''
 updateYearOptions()
 render()
 showMessage(saveMessage,'Turen er gemt.',false)
}


function addFuelLog(){
 const date=fuelDateInput.value
 const odo=Number(fuelOdoInput.value.replace(',','.'))
 const liters=Number(fuelLitersInput.value.replace(',','.'))
 const price=Number(fuelPriceInput.value.replace(',','.'))
 fuelMessage.textContent=''
 if(!date){showMessage(fuelMessage,'Vælg en dato først.',true);return}
 if(!odo||Number.isNaN(odo)||odo<=0){showMessage(fuelMessage,'Skriv km-stand.',true);return}
 if(!liters||Number.isNaN(liters)||liters<=0){showMessage(fuelMessage,'Skriv liter tanket.',true);return}
 if(!price||Number.isNaN(price)||price<=0){showMessage(fuelMessage,'Skriv total pris.',true);return}
 fuelLogs.push({id:createId(),date,odo,l:liters,p:price})
 normalizeFuelLogs()
 saveFuelLogs()
 fuelOdoInput.value=''
 fuelLitersInput.value=''
 fuelPriceInput.value=''
 render()
 showMessage(fuelMessage,'Optankning er gemt.',false)
}


function addServiceLog(){
 const date=serviceDateInput.value
 const odo=Number(serviceOdoInput.value.replace(',','.'))
 const type=serviceTypeInput.value
 const note=serviceNoteInput.value.trim()
 serviceMessage.textContent=''
 if(!date){showMessage(serviceMessage,'Vælg en dato først.',true);return}
 if(!odo||Number.isNaN(odo)||odo<=0){showMessage(serviceMessage,'Skriv km-stand som et tal.',true);return}
 serviceLogs.push({id:createId(),date,odo,type,note})
 normalizeServiceLogs()
 saveServiceLogs()
 serviceOdoInput.value=''
 serviceNoteInput.value=''
 render()
 showMessage(serviceMessage,'Service er gemt.',false)
}


function showMessage(element,text,isError){
 element.textContent=text
 element.style.color=isError?'#b91c1c':'#166534'
}


function getSelectedYear(){return document.getElementById('yearSelect').value}


function updateYearOptions(){
 const select=document.getElementById('yearSelect')
 const current=select.value
 const years=[...new Set(trips.map(trip=>trip.date.substring(0,4)))].sort().reverse()
 select.innerHTML='<option value="all">Alle</option>'+years.map(year=>'<option value="'+year+'">'+year+'</option>').join('')
 if(current&&Array.from(select.options).some(option=>option.value===current))select.value=current
}


function render(){
 const selectedYear=getSelectedYear()
 const filtered=selectedYear&&selectedYear!=='all'?trips.filter(trip=>trip.date.startsWith(selectedYear)):trips
 const total=filtered.reduce((sum,trip)=>sum+Number(trip.d),0)
 document.getElementById('totalKm').textContent=formatNumber(total)
 document.getElementById('totalTrips').textContent=filtered.length
 document.getElementById('list').innerHTML=filtered.length?filtered.map((trip,index)=>'<div class="tripRow"><div>#'+(index+1)+'</div><div>'+formatNumber(trip.d)+' km</div><div>'+formatDate(trip.date)+'</div><div>'+formatNumber(trip.odo)+'</div></div>').join(''):'<div class="empty">Ingen ture endnu</div>'
 renderMonthOverview(filtered)
 renderMonthChart(filtered)


 const currentYear=String(new Date().getFullYear())
 const yearTrips=trips.filter(trip=>trip.date.startsWith(currentYear))
 const yearTotal=yearTrips.reduce((sum,trip)=>sum+Number(trip.d),0)
 document.getElementById('yearTitle').textContent=currentYear
 document.getElementById('yearTripsLog').textContent=yearTrips.length
 document.getElementById('yearKmLog').textContent=formatNumber(yearTotal)


 const reversed=trips.slice().reverse()
 document.getElementById('logTripList').innerHTML=reversed.length?reversed.map((trip,index)=>{
  const number=trips.length-index
  return '<div class="tripRow"><div>#'+number+'</div><div>'+formatNumber(trip.d)+' km</div><div>'+formatDate(trip.date)+'</div><div>'+formatNumber(trip.odo)+'</div></div>'
 }).join(''):'<div class="empty">Ingen ture endnu</div>'
 renderFuelLogs()
 renderServiceLogs()
}


function renderFuelLogs(){
 let km=0,l=0,c=0
 for(let i=1;i<fuelLogs.length;i++){
  km+=Number(fuelLogs[i].odo)-Number(fuelLogs[i-1].odo)
  l+=Number(fuelLogs[i].l)
  c+=Number(fuelLogs[i].p)
 }
 document.getElementById('avgKml').textContent=l?(km/l).toFixed(1):'0'
 document.getElementById('costPerKm').textContent=km?(c/km).toFixed(2):'0'
 const reversed=fuelLogs.slice().reverse()
 document.getElementById('fuelList').innerHTML=reversed.length?reversed.map((item,index)=>{
  const number=fuelLogs.length-index
  return '<div class="tripRow"><div>#'+number+'</div><div>'+formatNumber(item.l)+' L</div><div>'+formatNumber(item.p)+' kr</div><div>'+formatNumber(item.odo)+'</div></div>'
 }).join(''):'<div class="empty">Ingen tankninger endnu</div>'
}


function renderServiceLogs(){
 const reversed=serviceLogs.slice().reverse()
 document.getElementById('serviceList').innerHTML=reversed.length?reversed.map((item,index)=>{
  const number=serviceLogs.length-index
  const note=item.note?'<div class="hint" style="grid-column:2 / 5;margin:0">'+escapeHtml(item.note)+'</div>':''
  return '<div class="tripRow"><div>#'+number+'</div><div>'+escapeHtml(item.type)+'</div><div>'+formatDate(item.date)+'</div><div>'+formatNumber(item.odo)+'</div>'+note+'</div>'
 }).join(''):'<div class="empty">Ingen serviceposter endnu</div>'
}


function renderMonthChart(filteredTrips){
 const monthNames=['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Aug','Sep','Okt','Nov','Dec']
 const groups={}
 filteredTrips.forEach(trip=>{
  const key=trip.date.substring(0,7)
  if(!groups[key])groups[key]=0
  groups[key]+=Number(trip.d)
 })
 const keys=Object.keys(groups).sort()
 const max=Math.max(...keys.map(key=>groups[key]),0)
 document.getElementById('monthChart').innerHTML=keys.length?keys.map(key=>{
  const monthIndex=Number(key.substring(5,7))-1
  const height=max>0?Math.max(4,(groups[key]/max)*120):4
  return '<div class="chartBarWrap"><div class="chartValue">'+formatNumber(groups[key])+'</div><div class="chartBar" style="height:'+height+'px"></div><div class="chartLabel">'+monthNames[monthIndex]+'</div></div>'
 }).join(''):'<div class="empty">Ingen data til graf endnu</div>'
}


function renderMonthOverview(filteredTrips){
 const monthNames=['Januar','Februar','Marts','April','Maj','Juni','Juli','August','September','Oktober','November','December']
 const groups={}
 filteredTrips.forEach(trip=>{
  const key=trip.date.substring(0,7)
  if(!groups[key])groups[key]={km:0,count:0}
  groups[key].km+=Number(trip.d)
  groups[key].count+=1
 })
 const keys=Object.keys(groups).sort().reverse()
 document.getElementById('monthOverview').innerHTML=keys.length?keys.map(key=>{
  const year=key.substring(0,4)
  const monthIndex=Number(key.substring(5,7))-1
  const item=groups[key]
  return '<div class="monthRow"><div><div class="monthName">'+monthNames[monthIndex]+' '+year+'</div><div class="monthMeta">'+item.count+' '+(item.count===1?'tur':'ture')+'</div></div><div class="monthKm">'+formatNumber(item.km)+' km</div></div>'
 }).join(''):'<div class="empty">Ingen måneder at vise endnu</div>'
}


function formatDate(date){return new Date(date+'T00:00:00').toLocaleDateString('da-DK')}
function formatNumber(value){return Number(value).toLocaleString('da-DK',{maximumFractionDigits:1})}
function escapeHtml(text){return String(text||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function csvEscape(value){const text=String(value||'');return '"'+text.replaceAll('"','""')+'"'}


function exportCSV(){
 const rows=[
  ['type','dato','odo','distance','note','liter','pris','service_type'],
  ...trips.map(trip=>['log',trip.date,trip.odo,trip.d,trip.note||'','','','']),
  ...fuelLogs.map(item=>['brændstof',item.date,item.odo,'','',''+item.l,item.p,'']),
  ...serviceLogs.map(item=>['service',item.date,item.odo,'',item.note||'','','',item.type])
 ]
 const csv=rows.map(row=>row.map(csvEscape).join(',')).join('\n')
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'})
 const link=document.createElement('a')
 link.href=URL.createObjectURL(blob)
 link.download='mc-data.csv'
 link.click()
 URL.revokeObjectURL(link.href)
}


function importCSV(){
 const file=document.getElementById('importFile').files[0]
 if(!file){alert('Vælg en CSV fil');return}

 const reader=new FileReader()
 reader.onload=function(event){
  const text=String(event.target.result||'')
  const lines=text.split(/\r?\n/).map(line=>line.trim()).filter(Boolean)

  const importedTrips=[]
  const importedFuel=[]
  const importedService=[]

  lines.slice(1).forEach(line=>{
   const columns=parseCsvLine(line)

   const type=(columns[0]||'').trim()
   const date=(columns[1]||'').trim()
   const odo=Number((columns[2]||'').trim())
   const note=(columns[4]||'').trim()
   const liters=Number((columns[5]||'').trim())
   const price=Number((columns[6]||'').trim())
   const serviceType=(columns[7]||'').trim()

   if(type==='log' && date && !Number.isNaN(odo)){
    importedTrips.push({id:createId(),date,odo,d:0,note})
   }

   if(type==='brændstof' && date && !Number.isNaN(odo) && !Number.isNaN(liters) && !Number.isNaN(price)){
    importedFuel.push({id:createId(),date,odo,l:liters,p:price})
   }

   if(type==='service' && date && !Number.isNaN(odo)){
    importedService.push({id:createId(),date,odo,type:serviceType||'Diverse',note})
   }
  })

  if(importedTrips.length===0 && importedFuel.length===0 && importedService.length===0){
   alert('Der blev ikke fundet gyldige data i CSV-filen')
   return
  }

  trips=importedTrips
  fuelLogs=importedFuel
  serviceLogs=importedService

  normalizeTrips()
  normalizeFuelLogs()
  normalizeServiceLogs()

  saveTrips()
  saveFuelLogs()
  saveServiceLogs()

  updateYearOptions()
  render()

  alert('Data importeret')
 }

 reader.readAsText(file)
}


function parseCsvLine(line){
 const result=[]
 let current=''
 let insideQuotes=false
 for(let i=0;i<line.length;i++){
  const char=line[i]
  const next=line[i+1]
  if(char==='"'&&insideQuotes&&next==='"'){current+='"';i++}
  else if(char==='"'){insideQuotes=!insideQuotes}
  else if(char===','&&!insideQuotes){result.push(current);current=''}
  else{current+=char}
 }
 result.push(current)
 return result
}


function clearAll(){
 if(confirm('Slet alt?')){
  trips=[]
  serviceLogs=[]
  fuelLogs=[]
  saveTrips();saveServiceLogs();saveFuelLogs()
  updateYearOptions();render()
 }
}


normalizeTrips()
normalizeServiceLogs()
normalizeFuelLogs()
saveTrips()
saveServiceLogs()
saveFuelLogs()
updateYearOptions()
render()
