const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Simulação de banco de dados
let accounts = [
    { id: 1, balance: 10000, owner: 'João Silva' },
    { id: 2, balance: 5000, owner: 'Maria Santos' }
];

let transactions = [];

// Middleware de validação
const validateTransfer = (req, res, next) => {
    const { fromAccountId, toAccountId, amount } = req.body;
    
    if (!fromAccountId || !toAccountId || !amount) {
        return res.status(400).json({ 
            error: 'Dados incompletos',
            message: 'fromAccountId, toAccountId e amount são obrigatórios'
        });
    }
    
    if (amount <= 0) {
        return res.status(400).json({
            error: 'Valor inválido',
            message: 'O valor da transferência deve ser maior que zero'
        });
    }
    
    next();
};

// Endpoint de transferência
router.post('/transfer', validateTransfer, (req, res) => {
    const { fromAccountId, toAccountId, amount, description } = req.body;
    
    try {
        const fromAccount = accounts.find(acc => acc.id === fromAccountId);
        if (!fromAccount) {
            return res.status(404).json({
                error: 'Conta não encontrada',
                message: `Conta de origem ${fromAccountId} não existe`
            });
        }
        
        const toAccount = accounts.find(acc => acc.id === toAccountId);
        if (!toAccount) {
            return res.status(404).json({
                error: 'Conta não encontrada',
                message: `Conta de destino ${toAccountId} não existe`
            });
        }
        
        if (fromAccount.balance < amount) {
            return res.status(400).json({
                error: 'Saldo insuficiente',
                message: `Saldo atual: R$ ${fromAccount.balance.toFixed(2)}`
            });
        }
        
        const transactionId = uuidv4();
        
        const transaction = {
            id: transactionId,
            fromAccountId,
            toAccountId,
            amount,
            description: description || 'Transferência entre contas',
            timestamp: new Date().toISOString(),
            status: 'completed'
        };
        
        transactions.push(transaction);
        
        fromAccount.balance -= amount;
        toAccount.balance += amount;
        
        res.status(200).json({
            success: true,
            message: 'Transferência realizada com sucesso',
            transactionId: transactionId,
            newBalance: fromAccount.balance,
            timestamp: transaction.timestamp
        });
        
    } catch (error) {
        console.error('Erro na transferência:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível processar a transferência'
        });
    }
});

// Endpoint para consultar saldo
router.get('/accounts/:id/balance', (req, res) => {
    const accountId = parseInt(req.params.id);
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
        return res.status(404).json({
            error: 'Conta não encontrada'
        });
    }
    
    res.json({
        accountId: account.id,
        balance: account.balance,
        owner: account.owner
    });
});

module.exports = router;
