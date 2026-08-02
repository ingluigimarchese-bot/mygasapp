let FLUIDI = [], DIAMETRI = [], PRESSIONI = [];

const VEL_CLASSES = [
  { max: 0.1, key: 'lte0_1', vcons: 40 },
  { max: 2, key: '0_1to2', vcons: 30 },
  { max: 5, key: '2to5', vcons: 25 },
  { max: Infinity, key: 'gt5', vcons: 20 }
];

function velClassFor(p){
  return VEL_CLASSES.find(c => p <= c.max) || VEL_CLASSES[VEL_CLASSES.length-1];
}

async function loadData(){
  const [f, d, p] = await Promise.all([
    fetch('../data/fluidi.json').then(r=>r.json()),
    fetch('../data/diametri.json').then(r=>r.json()),
    fetch('../data/pressioni.json').then(r=>r.json())
  ]);
  FLUIDI = f; DIAMETRI = d; PRESSIONI = p;
  populateSelects();
}

function populateSelects(){
  const fluidSel = document.getElementById('fluid');
  const prevFluid = fluidSel.value;
  let opts = '<option value="">' + t('portata.placeholders.fluid','Seleziona fluido') + '</option>';
  FLUIDI.forEach((fl,i)=>{ opts += '<option value="' + i + '">' + fl.name + '</option>'; });
  fluidSel.innerHTML = opts;
  if(prevFluid !== '') fluidSel.value = prevFluid;

  const pressureSel = document.getElementById('pressure');
  const prevPressure = pressureSel.value;
  let opts2 = '<option value="">' + t('portata.placeholders.pressure','Seleziona pressione') + '</option>';
  PRESSIONI.forEach(p=>{ opts2 += '<option value="' + p + '">' + p + ' bara</option>'; });
  pressureSel.innerHTML = opts2;
  if(prevPressure !== '') pressureSel.value = prevPressure;

  const diamSel = document.getElementById('diameter');
  const prevDiam = diamSel.value;
  let opts3 = '<option value="">' + t('portata.placeholders.diameter','Seleziona diametro') + '</option>';
  DIAMETRI.forEach((d,i)=>{ opts3 += '<option value="' + i + '">' + d.label + ' (DN' + d.dn + ')</option>'; });
  diamSel.innerHTML = opts3;
  if(prevDiam !== '') diamSel.value = prevDiam;
}

function updateMetrics(){
  const fluidSel = document.getElementById('fluid');
  const pressureSel = document.getElementById('pressure');
  const diamSel = document.getElementById('diameter');

  const fluid = FLUIDI[fluidSel.value];
  const pressure = parseFloat(pressureSel.value);
  const diam = DIAMETRI[diamSel.value];

  if(fluid && !isNaN(pressure)){
    const cls = velClassFor(pressure);
    document.getElementById('mVcons').textContent = cls.vcons + ' m/s';
    document.getElementById('infoVclass').textContent = t('portata.classes.' + cls.key, cls.key);
    const maxP = PRESSIONI[PRESSIONI.length-1];
    const msg = t('portata.messages.pmax','For {name} the maximum tabulated pressure is {value} bar.')
      .replace('{name}', fluid.name).replace('{value}', maxP);
    document.getElementById('mPmax').textContent = maxP + ' bara';
    document.getElementById('velocityHint').textContent = msg;
  } else {
    document.getElementById('mVcons').textContent = '-';
    document.getElementById('mPmax').textContent = '-';
    document.getElementById('infoVclass').textContent = '-';
  }

  if(diam){
    document.getElementById('mDi').textContent = diam.di_mm + ' mm';
    document.getElementById('mDn').textContent = 'DN' + diam.dn;
    document.getElementById('infoDe').textContent = diam.de_mm + ' mm';
    document.getElementById('infoSp').textContent = diam.spessore_mm + ' mm';
  } else {
    document.getElementById('mDi').textContent = '-';
    document.getElementById('mDn').textContent = '-';
    document.getElementById('infoDe').textContent = '-';
    document.getElementById('infoSp').textContent = '-';
  }

  compute();
}

function compute(){
  const fluidSel = document.getElementById('fluid');
  const pressureSel = document.getElementById('pressure');
  const diamSel = document.getElementById('diameter');
  const velInput = document.getElementById('velocity');

  const fluid = FLUIDI[fluidSel.value];
  const pressure = parseFloat(pressureSel.value);
  const diam = DIAMETRI[diamSel.value];
  const v = parseFloat(velInput.value);

  const resultEl = document.getElementById('resultValue');
  if(!fluid || !diam || isNaN(pressure) || isNaN(v)){
    resultEl.textContent = '-';
    return;
  }

  const PS_BARA = 0.97992;
  const Di_m = diam.di_mm / 1000;
  const A = Math.PI / 4 * Di_m * Di_m;
  const qActual_m3h = v * A * 3600;
  const qStd_m3h = qActual_m3h * (pressure / PS_BARA);

  resultEl.textContent = qStd_m3h.toFixed(2) + ' m3/h';
}

document.addEventListener('DOMContentLoaded', async ()=>{
  await loadData();
  ['fluid','pressure','diameter'].forEach(id=>{
    document.getElementById(id).addEventListener('change', updateMetrics);
  });
  document.getElementById('velocity').addEventListener('input', compute);

  document.getElementById('suggestBtn').addEventListener('click', ()=>{
    const pressure = parseFloat(document.getElementById('pressure').value);
    if(!isNaN(pressure)){
      const cls = velClassFor(pressure);
      document.getElementById('velocity').value = cls.vcons;
      compute();
    }
  });

  document.getElementById('resetBtn').addEventListener('click', ()=>{
    document.getElementById('fluid').value = '';
    document.getElementById('pressure').value = '';
    document.getElementById('diameter').value = '';
    document.getElementById('velocity').value = '';
    updateMetrics();
  });
});

document.addEventListener('languageChanged', ()=>{
  populateSelects();
  updateMetrics();
});
