import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function seedWords() {
  try {
    console.log('🌱 Iniciando seed das palavras...');
    
    // Lê o arquivo words.json
    const wordsPath = path.join(__dirname, 'words.json');
    const wordsData = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));
    
    console.log(`📚 Encontradas ${wordsData.length} palavras para adicionar`);
    
    // Verifica se já existem palavras no banco
    const existingWordsCount = await prisma.word.count();
    
    if (existingWordsCount > 0) {
      console.log(`⚠️  Já existem ${existingWordsCount} palavras no banco de dados`);
      console.log('🔄 Limpando tabela words...');
      await prisma.word.deleteMany();
      console.log('✅ Tabela words limpa');
    }
    
    // Adiciona todas as palavras
    console.log('📝 Adicionando palavras ao banco de dados...');
    
    const createdWords = await prisma.word.createMany({
      data: wordsData.map(item => ({
        word: item.word
      })),
      skipDuplicates: true
    });
    
    console.log(`✅ ${createdWords.count} palavras adicionadas com sucesso!`);
    
    // Verifica o resultado final
    const finalCount = await prisma.word.count();
    console.log(`📊 Total de palavras no banco: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executa o seed se o arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedWords()
    .then(() => {
      console.log('🎉 Seed concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal durante o seed:', error);
      process.exit(1);
    });
}

export default seedWords;
