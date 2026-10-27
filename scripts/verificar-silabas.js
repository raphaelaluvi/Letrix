// Compara a separação silábica das palavras do jogo (index.html) com o banco de referência.
// Uso: node scripts/verificar-silabas.js   (sai com código 1 se houver divergência)
const fs = require('fs');
const path = require('path');

const REFERENCIA = [
  { emoji: '🍌', palavra: 'BANANA', silabas: ['BA', 'NA', 'NA'] },
  { emoji: '🐱', palavra: 'GATO', silabas: ['GA', 'TO'] },
  { emoji: '🦋', palavra: 'BORBOLETA', silabas: ['BOR', 'BO', 'LE', 'TA'] },
  { emoji: '🚲', palavra: 'BICICLETA', silabas: ['BI', 'CI', 'CLE', 'TA'] },
  { emoji: '🍇', palavra: 'UVA', silabas: ['U', 'VA'] },
  { emoji: '🪁', palavra: 'PIPA', silabas: ['PI', 'PA'] },
  { emoji: '🐶', palavra: 'CACHORRO', silabas: ['CA', 'CHOR', 'RO'] },
  { emoji: '🍎', palavra: 'MAÇÃ', silabas: ['MA', 'ÇÃ'] },
  { emoji: '🐸', palavra: 'SAPO', silabas: ['SA', 'PO'] },
  { emoji: '🌻', palavra: 'GIRASSOL', silabas: ['GI', 'RAS', 'SOL'] },
  { emoji: '🐒', palavra: 'MACACO', silabas: ['MA', 'CA', 'CO'] },
  { emoji: '🍍', palavra: 'ABACAXI', silabas: ['A', 'BA', 'CA', 'XI'] },
  { emoji: '🐘', palavra: 'ELEFANTE', silabas: ['E', 'LE', 'FAN', 'TE'] },
  { emoji: '☀️', palavra: 'SOL', silabas: ['SOL'] },
  { emoji: '🏠', palavra: 'CASINHA', silabas: ['CA', 'SI', 'NHA'] },
];

const arquivo = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(arquivo, 'utf8');

const bloco = html.match(/const WORDS\s*=\s*\[([\s\S]*?)\];/);
if (!bloco) {
  console.error('ERRO: não encontrei "const WORDS = [...]" em index.html');
  process.exit(2);
}

const jogo = [...bloco[1].matchAll(/\{\s*emoji\s*:\s*'([^']*)'\s*,\s*parts\s*:\s*\[([^\]]*)\]\s*\}/g)].map(m => {
  const silabas = [...m[2].matchAll(/'([^']*)'/g)].map(s => s[1]);
  return { emoji: m[1], palavra: silabas.join(''), silabas };
});

const fmt = s => s.join(' · ');
let erros = 0;

console.log(`Palavras lidas de index.html: ${jogo.length}\n`);
jogo.forEach((p, i) => {
  const ref = REFERENCIA.find(r => r.palavra === p.palavra);
  const n = String(i + 1).padStart(2);
  if (!ref) {
    erros++;
    console.log(`${n}. ✗ ${p.emoji} ${p.palavra}: ${fmt(p.silabas)}  (palavra não existe no banco)`);
  } else if (fmt(ref.silabas) !== fmt(p.silabas) || ref.emoji !== p.emoji) {
    erros++;
    console.log(`${n}. ✗ ${p.emoji} ${p.palavra}: jogo = ${fmt(p.silabas)} ${p.emoji} | banco = ${fmt(ref.silabas)} ${ref.emoji}`);
  } else {
    console.log(`${n}. ✓ ${p.emoji} ${p.palavra}: ${fmt(p.silabas)}`);
  }
});

const ausentes = REFERENCIA.filter(r => !jogo.some(p => p.palavra === r.palavra));
if (ausentes.length) {
  console.log(`\nPalavras do banco que não estão no jogo (${ausentes.length}): ${ausentes.map(r => r.palavra).join(', ')}`);
}

console.log(`\nResultado: ${erros === 0 ? 'OK' : 'FALHOU'} — ${jogo.length - erros}/${jogo.length} palavras do jogo iguais ao banco.`);
process.exit(erros === 0 ? 0 : 1);
