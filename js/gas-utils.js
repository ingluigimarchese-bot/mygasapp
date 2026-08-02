const COSTANTE_GAS = 8314.4626; // J/(kmol*K)
const PRESSIONE_STD_PA = 97992; // Pa (0,97992 bara)
const TEMPERATURA_STD_K = 288.15; // K (15 C)

function densitaStandard(PM, Zs, R = COSTANTE_GAS, PS = PRESSIONE_STD_PA, TS = TEMPERATURA_STD_K) {
  return (PS * PM) / (Zs * R * TS);
}

function densitaFluido(fluido) {
  if (typeof fluido.densita_std === 'number') return fluido.densita_std;
  return densitaStandard(fluido.PM, fluido.Zs);
}
