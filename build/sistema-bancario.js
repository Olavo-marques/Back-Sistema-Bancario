"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const data_1 = require("./data");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.listen(3003, () => {
    console.log("app rodando...");
});
app.get('/users/all', (req, res) => {
    try {
        if (!data_1.users) {
            res.statusCode = 500;
            throw new Error('Erro do Servidor Interno.');
        }
        res.status(200).send(data_1.users);
    }
    catch (error) {
        res.status(res.statusCode).send({ message: error.message });
    }
});
app.get('/users/balance', (req, res) => {
    try {
        const { cpf, name } = req.body;
        const nameLower = name.toLowerCase();
        const nameAdjusted = nameLower[0].toUpperCase() + nameLower.substr(1);
        if (!cpf || !nameAdjusted) {
            res.statusCode = 401;
            throw new Error('Informações não encontradas, revise os campos');
        }
        if (typeof cpf !== 'number') {
            res.statusCode = 401;
            throw new Error('Somente números no campo de cpf');
        }
        if (typeof nameAdjusted !== 'string') {
            res.statusCode = 401;
            throw new Error('Nome de usuário necessario');
        }
        const userCpf = data_1.users.find((user) => user.cpf === cpf && user.name === nameAdjusted);
        if (userCpf === undefined) {
            res.statusCode = 401;
            throw new Error('Usuário não encontrado.');
        }
        if (userCpf) {
            const balance = userCpf.balance;
            res.status(200).send(`Seu Saldo Total é ${balance.toFixed(2)}`);
        }
    }
    catch (error) {
        res.status(res.statusCode).send({ message: error.message });
    }
});
app.post('/users/payment/:cpf', (req, res) => {
    try {
        const cpfParms = req.params.cpf;
        const size = cpfParms.length;
        const cpfParmsNumb = Number(cpfParms);
        const { value, description } = req.body;
        const date = req.body.date;
        if (!cpfParms) {
            res.statusCode = 401;
            throw new Error('Necessário informar o cpf do usuário, somente números.');
        }
        else if (!value || !description) {
            res.statusCode = 401;
            throw new Error('Informações de pagamento não encontradas, revise os campos');
        }
        else if (size !== 11) {
            res.statusCode = 401;
            throw new Error('E esperado 11 caracteres para o cpf, digite somente números1.');
        }
        const usersFilter = data_1.users.filter((user) => user.cpf === cpfParmsNumb);
        if (!date) {
            usersFilter.map((user) => {
                const remainingBalance = user.balance - value;
                if (remainingBalance < 0) {
                    res.statusCode = 401;
                    throw new Error('O valor a ser pago e superior a seu saldo');
                }
                user.balance = remainingBalance;
                return user.spending.push({
                    value: value,
                    date: new Date().toLocaleDateString(),
                    description: description
                });
            });
            res.status(200).send('Transação realisada com sucesso.');
        }
        usersFilter.map((user) => {
            const remainingBalance = user.balance - value;
            if (remainingBalance < 0) {
                res.statusCode = 401;
                throw new Error('O valor a ser pago e superior a seu saldo');
            }
            user.balance = remainingBalance;
            return user.spending.push({
                value: value,
                date: date,
                description: description
            });
        });
        res.status(200).send('Transação realizada com sucesso.');
    }
    catch (error) {
        res.status(res.statusCode).send({ message: error.message });
    }
});
app.post('/users/created', (req, res) => {
    try {
        const { name, cpf, date } = req.body;
        const nameLower = name.toLowerCase();
        const nameAdjusted = nameLower[0].toUpperCase() + nameLower.substr(1);
        const cpfExisting = data_1.users.find((user) => user.cpf === cpf);
        const newDate = date.split('');
        const yearBirth = newDate[6] + newDate[7] + newDate[8] + newDate[9];
        const currentYearOne = new Date();
        const currentYearTwo = currentYearOne.getFullYear();
        const age = currentYearTwo - yearBirth;
        if (!nameAdjusted || !cpf || !date) {
            res.statusCode = 401;
            throw new Error('Dados necessários não informados, revise os campos.');
        }
        else if (typeof nameAdjusted !== "string") {
            res.statusCode = 401;
            throw new Error('O nome requer uma ou mais palavras.');
        }
        else if (typeof cpf !== "number") {
            res.statusCode = 401;
            throw new Error('Somente numeros no campo CPF.');
        }
        else if (cpfExisting) {
            res.statusCode = 401;
            throw new Error('Usuário já cadastrado.');
        }
        else if (age <= 17) {
            res.statusCode = 401;
            throw new Error('Apenas usuários maior de 18 anos podem criar uma conta.');
        }
        else if (nameAdjusted && cpf && date) {
            data_1.users.push({
                name: nameAdjusted,
                cpf,
                date,
                balance: 0,
                spending: []
            });
            res.status(201).send('Usuário criado com sucesso.');
        }
    }
    catch (error) {
        res.status(res.statusCode).send({ message: error.message });
    }
});
app.put('/users/funds', (req, res) => {
    try {
        const { cpf, name, value } = req.body;
        const nameLower = name.toLowerCase();
        const nameAdjusted = nameLower[0].toUpperCase() + nameLower.substr(1);
        if (!cpf || !nameAdjusted || !value) {
            res.statusCode = 401;
            throw new Error('Informações não encontradas, revise os campos');
        }
        const userFind = data_1.users.find((user) => user.cpf === cpf && user.name === nameAdjusted);
        if (userFind === undefined) {
            res.statusCode = 401;
            throw new Error('Usuário não encontrado.');
        }
        if (userFind) {
            if (userFind.name !== nameAdjusted) {
                res.statusCode = 401;
                throw new Error('Usuário não encontrado.');
            }
            userFind.spending.push({
                value,
                date: new Date().toLocaleDateString(),
                description: 'Depósito em dinheiro'
            });
            const currentBalance = userFind.balance = userFind.balance + value;
            res.status(200).send(`Seu saldo Atual é ${currentBalance}`);
        }
    }
    catch (error) {
        res.status(res.statusCode).send({ message: error.message });
    }
});
app.put('/users/transfer', (req, res) => {
    try {
        const { name, cpf, nameRecipient, cpfRecipient, valueRecipient } = req.body;
        const nameLower = name.toLowerCase();
        const nameAdjusted = nameLower[0].toUpperCase() + nameLower.substr(1);
        const nameLowerRecipient = nameRecipient.toLowerCase();
        const nameAdjustedRecipient = nameLowerRecipient[0].toUpperCase() + nameLowerRecipient.substr(1);
        const user = data_1.users.find((user) => user.cpf === cpf && user.name === nameAdjusted);
        const userRecipient = data_1.users.find((user) => user.cpf === cpfRecipient && user.name === nameAdjustedRecipient);
        if (user === undefined || userRecipient === undefined) {
            res.statusCode = 401;
            throw new Error('Usuário não encontrado.');
        }
        else if (valueRecipient < 10) {
            res.statusCode = 401;
            throw new Error(`Só e possivel tranferir valores apartir de 10,00`);
        }
        if (user && userRecipient) {
            if (user.balance < valueRecipient) {
                res.statusCode = 401;
                throw new Error(`Não foi possível transferir o valor de ${valueRecipient}, pois seu saldo é de ${user.balance.toFixed(2)} `);
            }
            user.spending.push({
                value: -valueRecipient,
                date: new Date().toLocaleDateString(),
                description: `Tranferência para ${nameAdjustedRecipient}`
            });
            userRecipient.spending.push({
                value: valueRecipient,
                date: new Date().toLocaleDateString(),
                description: `Valor tranferido de ${nameAdjusted}`
            });
            const currentBalance = user.balance = user.balance - valueRecipient;
            userRecipient.balance = userRecipient.balance + valueRecipient;
            res.status(200).send(`Transferência feita com sucesso, Você transferio o valor de ${valueRecipient.toFixed(2)} para ${userRecipient.name}, seu saldo atual e de ${currentBalance.toFixed(2)}`);
        }
    }
    catch (error) {
        res.status(res.statusCode).send({ message: error.message });
    }
});
