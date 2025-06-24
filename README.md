# SAPS Game API

API REST para o jogo SAPS usando Node.js, Express e Prisma com ES Modules.

## 🏗️ Estrutura do Projeto

```
api_saps/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do Prisma Client
│   ├── middleware/
│   │   └── auth.middleware.js   # Middleware de autenticação JWT
│   ├── routes/
│   │   └── auth.routes.js       # Rotas de autenticação
│   └── server.js                # Servidor principal
├── prisma/
│   └── schema.prisma            # Schema do banco de dados
├── package.json
└── README.md
```

## 🚀 Instalação

1. **Instale as dependências:**
```bash
npm install
```

2. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/saps_game?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3000
```

3. **Configure o banco de dados:**
```bash
# Gera o cliente Prisma
npm run db:generate

# Sincroniza o schema com o banco (desenvolvimento)
npm run db:push

# Ou use migrations (produção)
npm run db:migrate
```

4. **Inicie o servidor:**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📡 Rotas da API

### 🔐 Autenticação

#### `POST /api/auth/register`
Registra um novo usuário.

**Body:**
```json
{
  "username": "Teste",
  "email": "teste@email.com",
  "password": "123456"
}
```

#### `POST /api/auth/login`
Faz login do usuário.

**Body:**
```json
{
  "email": "teste@email.com",
  "password": "123456"
}
```

#### `GET /api/auth/me`
Retorna informações do usuário logado (requer token JWT).

**Headers:**
```
Authorization: Bearer <token>
```

### 🏥 Health Check

#### `GET /health`
Verifica o status da API.

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento |
| `npm start` | Inicia o servidor em modo produção |
| `npm run db:generate` | Gera o cliente Prisma |
| `npm run db:push` | Sincroniza o schema com o banco |
| `npm run db:migrate` | Executa as migrações |
| `npm run db:studio` | Abre o Prisma Studio |

## 🧪 Testando no Postman

### Registro de Usuário
- **URL**: `http://localhost:3000/api/auth/register`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
    "username": "Teste",
    "email": "teste@email.com",
    "password": "123456"
}
```

### Login
- **URL**: `http://localhost:3000/api/auth/login`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
    "email": "teste@email.com",
    "password": "123456"
}
```

## ✨ Vantagens da Nova Estrutura

- ✅ **ES Modules**: Sintaxe moderna e nativa do JavaScript
- ✅ **Estrutura organizada**: Pasta `src` para código fonte
- ✅ **Padrões modernos**: Seguindo as melhores práticas
- ✅ **Health Check**: Endpoint para monitoramento
- ✅ **Logs melhorados**: Console com emojis para melhor visualização
- ✅ **Graceful Shutdown**: Desligamento limpo do servidor

## 🔧 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM moderno
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **ES Modules** - Sistema de módulos moderno

## 🌱 Seed de Palavras

O script de seed (`src/services/seed.js`) adiciona automaticamente todas as 754 palavras do arquivo `words.json` na tabela `words` do banco de dados.

**Características do script:**
- ✅ Lê automaticamente o arquivo `words.json`
- ✅ Verifica se já existem palavras no banco
- ✅ Limpa a tabela antes de adicionar (evita duplicatas)
- ✅ Usa `createMany` para inserção em lote (mais eficiente)
- ✅ Inclui `skipDuplicates: true` para segurança extra
- ✅ Fornece feedback detalhado do processo
- ✅ Trata erros adequadamente

**Para executar:**
```bash
npm run db:seed
```

## Rotas de Palavras

### GET /api/words
Retorna todas as palavras do banco de dados.

**Resposta de sucesso:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "word": "água",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### POST /api/words/seed
Popula o banco de dados com as palavras do arquivo `words.json`.

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Banco de dados populado com sucesso!"
}
```

### POST /api/words
Adiciona uma nova palavra ao banco de dados.

**Corpo da requisição:**
```json
{
  "word": "nova palavra"
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "word": "nova palavra",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Palavra adicionada com sucesso!"
}
```

## Como usar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar banco de dados:**
   ```bash
   npx prisma migrate dev
   ```

3. **Popular o banco de dados (opcional):**
   ```bash
   # Via API
   curl -X POST http://localhost:3000/api/words/seed
   
   # Ou via script
   node src/services/seed.js
   ```

4. **Iniciar o servidor:**
   ```bash
   npm start
   ```

5. **Testar as rotas:**
   ```bash
   # Buscar todas as palavras
   curl http://localhost:3000/api/words
   
   # Adicionar uma nova palavra
   curl -X POST http://localhost:3000/api/words \
     -H "Content-Type: application/json" \
     -d '{"word": "exemplo"}'
   ``` 