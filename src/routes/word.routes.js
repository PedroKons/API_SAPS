import express from 'express';
import prisma from '../config/database.js';
import seedWords from '../services/seed.js';
import verifyToken from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const words = await prisma.word.findMany({
      select: {
        id: true,
        word: true,
        createdAt: true
      }
    });
    
    res.json({ 
      data: words,
    });
  } catch (error) {
    console.error('Erro ao buscar palavras:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
});

// Rota para buscar palavras com paginação
router.get('/paginated', async (req, res) => {
  try {
    // Parâmetros de paginação
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Buscar total de palavras para calcular paginação
    const totalWords = await prisma.word.count();

    // Buscar palavras com paginação
    const words = await prisma.word.findMany({
      select: {
        id: true,
        word: true,
        createdAt: true
      },
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular informações de paginação
    const totalPages = Math.ceil(totalWords / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({ 
      success: true,
      data: words,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalWords: totalWords,
        wordsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage
      }
    });
  } catch (error) {
    console.error('Erro ao buscar palavras paginadas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
});



// Rota para popular o banco de dados com as palavras
router.post('/seed', verifyToken, async (req, res) => {
  try {
    await seedWords();
    res.json({ 
      success: true,
      message: 'Banco de dados populado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao popular banco de dados:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao popular banco de dados',
      error: error.message 
    });
  }
});

// Rota para adicionar uma nova palavra
router.post('/', verifyToken, async (req, res) => {
  try {
    const { word } = req.body;
    
    if (!word || typeof word !== 'string' || word.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A palavra é obrigatória e deve ser uma string válida'
      });
    }
    
    const newWord = await prisma.word.create({
      data: {
        word: word.trim().toUpperCase()
      }
    });
    
    res.status(201).json({
      success: true,
      data: newWord,
      message: 'Palavra adicionada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao adicionar palavra:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Esta palavra já existe no banco de dados'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

//Rota para deletar uma palavra pelo ID (via query parameter)
router.delete('/', verifyToken, async (req, res) => {
  try {
    const { id } = req.query;
    
    // Validar se o ID foi fornecido e tem formato de UUID
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID é obrigatório e deve ser um UUID válido'
      });
    }
    
    const wordId = id.trim();
    
    // Verificar se a palavra existe antes de deletar
    const existingWord = await prisma.word.findUnique({
      where: { id: wordId }
    });
    
    if (!existingWord) {
      return res.status(404).json({
        success: false,
        message: 'Palavra não encontrada'
      });
    }
    
    // Deletar a palavra
    await prisma.word.delete({
      where: { id: wordId }
    });
    
    res.json({
      success: true,
      message: `Palavra "${existingWord.word}" deletada com sucesso!`,
      data: existingWord
    });
    
  } catch (error) {
    console.error('Erro ao deletar palavra:', error);
    
    // Tratar erro específico do Prisma quando registro não é encontrado
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Palavra não encontrada'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

export default router;

// Rota para deletar TODAS as palavras do banco (sem autenticação)
// router.delete('/all', async (req, res) => {
//   try {
//     // Contar quantas palavras existem antes de deletar
//     const totalWords = await prisma.word.count();
    
//     if (totalWords === 0) {
//       return res.json({
//         success: true,
//         message: 'Não há palavras para deletar',
//         data: { deletedCount: 0 }
//       });
//     }
    
//     // Deletar todas as palavras
//     const deleteResult = await prisma.word.deleteMany({});
    
//     res.json({
//       success: true,
//       message: `Todas as ${deleteResult.count} palavras foram deletadas com sucesso!`,
//       data: {
//         deletedCount: deleteResult.count,
//         totalWordsBefore: totalWords
//       }
//     });
    
//   } catch (error) {
//     console.error('Erro ao deletar todas as palavras:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erro interno do servidor',
//       error: error.message
//     });
//   }
// });

