const fs = require('fs');
const path = require('path');
require('dotenv').config();

const inputJson = process.env.INPUT;
const outputJson = process.env.OUTPUT;

if (!inputJson || !outputJson) {
  console.error('Defina as variáveis INPUT e OUTPUT no arquivo .env.');
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), inputJson);
const outputPath = path.resolve(process.cwd(), outputJson);

if (!fs.existsSync(inputPath)) {
  console.error(`Arquivo de entrada não encontrado: ${inputPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(inputPath, 'utf8');
const data = JSON.parse(rawData);

const registros = Array.isArray(data) ? data : [data];

const resultado = registros.map(item => ({
  nomeComponente: item.nomeComponente,
  sigla: item.sigla,
  nomeTipoPlataformaAplicativo: item.tipoPlataformaAplicativo?.nomeTipoPlataformaAplicativo || null,
  urlGit: item.urlGit
}));

fs.writeFileSync(outputPath, JSON.stringify(resultado, null, 2), 'utf8');

console.log(`Arquivo tratado salvo em: ${outputPath}`);
console.log(JSON.stringify(resultado, null, 2));
