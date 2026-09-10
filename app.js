const fmt = n => new Intl.NumberFormat('es-CR',{style:'currency',currency:'CRC',maximumFractionDigits:0}).format(n);
const fmtM = n => '₡' + (n/1e6).toFixed(2).replace('.',',') + ' M';

const base = {
  trad:{ppm2:345000, days100:110, hh100:6160},
  gyp:{ppm2:285000, days100:75, hh100:3000},
  pref:{ppm2:273000, days100:60, hh100:1920}
};

function scaleDays(baseDays, area){
  return Math.max(1, Math.round(baseDays * Math.pow(area/100, 0.82)));
}
function scaleHH(baseHH, area){
  return Math.round(baseHH * Math.pow(area/100, 0.92));
}
function updateSimulator(){
  const area = +document.getElementById('area').value;
  document.getElementById('areaLabel').textContent = area + ' m²';
  ['trad','gyp','pref'].forEach(k=>{
    const cost=base[k].ppm2*area;
    const days=scaleDays(base[k].days100,area);
    const hh=scaleHH(base[k].hh100,area);
    const cap=k==='trad'?'Trad':k==='gyp'?'Gyp':'Pref';
    document.getElementById('cost'+cap).textContent=fmtM(cost);
    document.getElementById('days'+cap).textContent=`${days} días · ${hh.toLocaleString('es-CR')} HH`;
  });
}
document.getElementById('area').addEventListener('input',updateSimulator);

const chartOpts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'#eef2f7'}},x:{grid:{display:false}}}};
new Chart(document.getElementById('costChart'),{
  type:'bar',data:{labels:['Tradicional','Acero + Gypsum','Prefabricado'],datasets:[{data:[34.5,28.5,27.3],backgroundColor:['#94a3b8','#f97316','#2563eb'],borderRadius:8}]},
  options:{...chartOpts,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>'₡'+c.raw.toFixed(1)+' millones'}}}}
});
new Chart(document.getElementById('timeChart'),{
  type:'bar',data:{labels:['Tradicional','Acero + Gypsum','Prefabricado'],datasets:[{data:[110,75,60],backgroundColor:['#94a3b8','#f97316','#2563eb'],borderRadius:8}]},
  options:chartOpts
});
new Chart(document.getElementById('hhChart'),{
  type:'bar',data:{labels:['Tradicional','Acero + Gypsum','Prefabricado'],datasets:[{data:[6160,3000,1920],backgroundColor:['#94a3b8','#f97316','#2563eb'],borderRadius:8}]},
  options:chartOpts
});
new Chart(document.getElementById('radarChart'),{
  type:'radar',
  data:{labels:['Costo','Tiempo','Productividad','Durabilidad','Flexibilidad','Calidad'],
  datasets:[
    {label:'Tradicional',data:[3,2,2,5,4,3],borderColor:'#64748b',backgroundColor:'rgba(100,116,139,.12)',pointBackgroundColor:'#64748b'},
    {label:'Acero + Gypsum',data:[4,4,4,4,5,4],borderColor:'#f97316',backgroundColor:'rgba(249,115,22,.10)',pointBackgroundColor:'#f97316'},
    {label:'Prefabricado',data:[5,5,5,5,3,5],borderColor:'#2563eb',backgroundColor:'rgba(37,99,235,.10)',pointBackgroundColor:'#2563eb'}]},
  options:{responsive:true,maintainAspectRatio:false,scales:{r:{beginAtZero:true,max:5,ticks:{stepSize:1}}},plugins:{legend:{position:'bottom'}}}
});

const recs={
  balance:['Prefabricado','Obtiene el mejor puntaje global del modelo gracias a su combinación de costo, plazo y productividad.'],
  cost:['Prefabricado','En el caso base presenta el menor costo total estimado y el menor costo por metro cuadrado.'],
  time:['Prefabricado','Reduce el plazo del caso base a aproximadamente 60 días, cerca de 45% menos que el sistema tradicional.'],
  flex:['Acero + Gypsum','Su naturaleza liviana y modular facilita cambios de distribución, instalaciones y futuras modificaciones.'],
  durability:['Sistema Tradicional','Su robustez, resistencia al impacto y amplia experiencia constructiva lo hacen especialmente sólido para proyectos donde la durabilidad percibida es prioritaria.'],
  labor:['Prefabricado','Presenta la menor cantidad estimada de horas-hombre en obra, al trasladar parte del proceso productivo a fábrica.']
};
document.getElementById('recommendBtn').addEventListener('click',()=>{
  const v=document.getElementById('priority').value;
  const [name,txt]=recs[v];
  document.querySelector('#recommendation h3').textContent=name;
  document.querySelector('#recommendation p').textContent=txt;
});

const modalData={
tradicional:{
 title:'Sistema Tradicional',
 intro:'Concreto reforzado y mampostería ejecutados principalmente en obra.',
 ventajas:['Alta robustez','Materiales ampliamente disponibles','Mano de obra conocida','Buena resistencia al impacto y al fuego'],
 limitaciones:['Mayor tiempo de ejecución','Mayor cantidad de procesos húmedos','Más desperdicio en obra','Mayor intensidad de mano de obra'],
 proceso:'Cimentación → estructura → mampostería → instalaciones → repellos → cubierta → acabados.'
},
gypsum:{
 title:'Acero + Gypsum',
 intro:'Sistema liviano con estructura metálica y cerramientos secos modulares.',
 ventajas:['Menor peso propio','Alta velocidad','Facilidad para instalaciones','Gran flexibilidad arquitectónica'],
 limitaciones:['Mayor exigencia en detalles de humedad','Protección de acero','Menor resistencia superficial al impacto','Requiere instalación especializada'],
 proceso:'Cimentación → estructura metálica → perfilería → instalaciones → aislamiento → placas → juntas → acabados.'
},
prefabricado:{
 title:'Sistema Prefabricado',
 intro:'Elementos producidos bajo condiciones controladas y montados posteriormente en obra.',
 ventajas:['Montaje muy rápido','Alta productividad','Menor cantidad de personal en sitio','Control de calidad elevado'],
 limitaciones:['Mayor dependencia logística','Transporte especializado','Puede requerir grúa','Menor flexibilidad después de fabricar'],
 proceso:'Diseño y modulación → fabricación → cimentaciones → transporte → montaje → conexiones → acabados.'
}};
document.querySelectorAll('[data-modal]').forEach(btn=>btn.addEventListener('click',()=>{
 const d=modalData[btn.dataset.modal];
 document.getElementById('modalContent').innerHTML=`
 <span class="eyebrow">FICHA TÉCNICA</span><h2>${d.title}</h2><p>${d.intro}</p>
 <div class="modal-panel"><b>Secuencia constructiva</b><p>${d.proceso}</p></div>
 <div class="modal-grid">
   <div class="modal-panel"><h3>Ventajas</h3><ul>${d.ventajas.map(x=>`<li>${x}</li>`).join('')}</ul></div>
   <div class="modal-panel"><h3>Limitaciones</h3><ul>${d.limitaciones.map(x=>`<li>${x}</li>`).join('')}</ul></div>
 </div>`;
 document.getElementById('modal').classList.add('show');
}));
document.getElementById('closeModal').onclick=()=>document.getElementById('modal').classList.remove('show');
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')e.currentTarget.classList.remove('show')});

const catalogData={
  'Casa Urbana 120':{type:'Vivienda',area:'120 m²',system:'Acero + Gypsum / Prefabricado',desc:'Vivienda compacta contemporánea con distribución eficiente, pensada para familias pequeñas y lotes urbanos.',features:['2 habitaciones','2 baños','Sala-comedor integrada','Cocina abierta','Área de lavado']},
  'Casa Premium 180':{type:'Vivienda',area:'180 m²',system:'Tradicional / Prefabricado',desc:'Propuesta residencial de mayor escala con zonas sociales amplias y acabados de mayor especificación.',features:['3 habitaciones','2.5 baños','Terraza','Cochera doble','Área social integrada']},
  'Local Comercial 250':{type:'Comercial',area:'250 m²',system:'Acero + Gypsum',desc:'Espacio comercial flexible para adaptar divisiones, instalaciones y acabados según operación.',features:['Planta libre','Servicios sanitarios','Bodega','Área de atención','Fachada comercial']},
  'Bodega Modular 400':{type:'Industrial',area:'400 m²',system:'Prefabricado / Acero',desc:'Solución para almacenamiento y operación con prioridad en rapidez de montaje y posibilidad de expansión.',features:['Nave principal','Andén de carga','Área administrativa','Servicios','Expansión modular']},
  'Oficinas Flex 300':{type:'Corporativo',area:'300 m²',system:'Acero + Gypsum',desc:'Oficinas con alto nivel de flexibilidad para cambios de distribución y crecimiento futuro.',features:['Open office','Salas de reunión','Recepción','Cafetería','Cuartos técnicos']},
  'Condominio Modular':{type:'Residencial',area:'Escalable',system:'Prefabricado',desc:'Modelo repetitivo pensado para proyectos residenciales por etapas, con control de tiempos y estandarización.',features:['Unidades modulares','Áreas comunes','Crecimiento por etapas','Estandarización','Control de calidad']}
};
document.querySelectorAll('.catalog-btn').forEach(btn=>btn.addEventListener('click',()=>{
  const d=catalogData[btn.dataset.catalog];
  const modal=document.getElementById('modal');
  document.querySelector('.modal-card').classList.add('catalog-modal');
  document.getElementById('modalContent').innerHTML=`<span class="eyebrow">CATÁLOGO C360 · ${d.type.toUpperCase()}</span><h2>${btn.dataset.catalog}</h2><p>${d.desc}</p><div class="modal-grid"><div class="modal-panel"><h3>Ficha rápida</h3><p><b>Área:</b> ${d.area}</p><p><b>Sistema sugerido:</b> ${d.system}</p></div><div class="modal-panel"><h3>Incluye</h3><ul>${d.features.map(x=>`<li>${x}</li>`).join('')}</ul></div></div><div style="margin-top:20px"><a class="btn primary" href="#simulador" onclick="document.getElementById('modal').classList.remove('show')">Evaluar este tipo de proyecto</a></div>`;
  modal.classList.add('show');
}));
const oldClose=document.getElementById('closeModal').onclick;
document.getElementById('closeModal').onclick=()=>{document.getElementById('modal').classList.remove('show');document.querySelector('.modal-card').classList.remove('catalog-modal')};
