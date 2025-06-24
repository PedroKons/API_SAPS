import express from 'express';
import prisma from '../config/database.js';
import seedWords from '../services/seed.js';

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

// Rota para popular o banco de dados com as palavras
router.post('/seed', async (req, res) => {
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
router.post('/', async (req, res) => {
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
        word: word.trim().toLowerCase()
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

export default router;