import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Obter ranking geral (top 10 usuários)
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        score: true,
        createdAt: true
      },
      orderBy: {
        score: 'desc'
      },
      take: 10
    });

    // Adicionar posição no ranking
    const leaderboardWithPosition = leaderboard.map((user, index) => ({
      ...user,
      position: index + 1
    }));

    res.json({
      success: true,
      data: leaderboardWithPosition
    });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Obter posição do usuário atual no ranking
router.get('/my-position', async (req, res) => {
  try {
    const userId = req.userId;

    // Buscar todos os usuários ordenados por pontuação
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        score: true
      },
      orderBy: {
        score: 'desc'
      }
    });

    // Encontrar a posição do usuário atual
    const userPosition = allUsers.findIndex(user => user.id === userId) + 1;

    // Buscar informações do usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        score: true
      }
    });

    res.json({
      success: true,
      data: {
        ...currentUser,
        position: userPosition,
        totalUsers: allUsers.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar posição do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Atualizar pontuação do usuário
router.put('/update-score', async (req, res) => {
  try {
    const userId = req.userId;
    const { score } = req.body;

    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({
        success: false,
        message: 'Pontuação deve ser um número positivo'
      });
    }

    // Atualizar pontuação do usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { score },
      select: {
        id: true,
        username: true,
        score: true,
        updatedAt: true
      }
    });

    // Buscar nova posição no ranking
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        score: true
      },
      orderBy: {
        score: 'desc'
      }
    });

    const newPosition = allUsers.findIndex(user => user.id === userId) + 1;

    res.json({
      success: true,
      data: {
        ...updatedUser,
        position: newPosition,
        totalUsers: allUsers.length
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar pontuação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Adicionar pontos ao usuário (incrementar pontuação)
router.post('/add-points', async (req, res) => {
  try {
    const userId = req.userId;
    const { points } = req.body;

    if (typeof points !== 'number' || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Pontos devem ser um número positivo'
      });
    }

    // Incrementar pontuação do usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        score: {
          increment: points
        }
      },
      select: {
        id: true,
        username: true,
        score: true,
        updatedAt: true
      }
    });

    // Buscar nova posição no ranking
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        score: true
      },
      orderBy: {
        score: 'desc'
      }
    });

    const newPosition = allUsers.findIndex(user => user.id === userId) + 1;

    res.json({
      success: true,
      data: {
        ...updatedUser,
        position: newPosition,
        totalUsers: allUsers.length,
        pointsAdded: points
      }
    });
  } catch (error) {
    console.error('Erro ao adicionar pontos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Obter ranking completo (todos os usuários)
router.get('/full-ranking', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          score: true,
          createdAt: true
        },
        orderBy: {
          score: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count()
    ]);

    // Adicionar posição no ranking
    const usersWithPosition = users.map((user, index) => ({
      ...user,
      position: skip + index + 1
    }));

    res.json({
      success: true,
      data: {
        users: usersWithPosition,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar ranking completo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router; 