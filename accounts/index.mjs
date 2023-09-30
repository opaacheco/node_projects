// modulos internos
import fs from "fs";

// modulos externos
import inquirer from "inquirer";
import chalk from "chalk";

//chamando a função
operations();

function operations() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer? ",
        choices: [
          "Criar conta",
          "Consultar saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answers) => {
      const action = answers["action"];
      if (action === "Criar conta") {
        createAccount();
      } else if (action === "Consultar saldo") {
        query();
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Sacar") {
        sacar();
      } else if (action === "Sair") {
        console.log(chalk.bgGreen("See you soon!!"));
        process.exit();
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

//create account
function createAccount() {
  console.log(chalk.bgGreen("Obrigado por nos escolher"));
  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o seu nome de conta?",
      },
    ])
    .then((answers) => {
      const nome = answers["accountName"];
      console.log(nome);
      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }
      if (fs.existsSync(`accounts/${nome}.json`)) {
        console.log(chalk.bgRed("essa conta ja existe meu caro"));
        buildAccount();
        return;
      }
      fs.writeFileSync(
        `accounts/${nome}.json`,
        '{"balance":0}',
        function (err) {
          console.log();
        }
      );
      console.log(chalk.green("parabéns conta criada"));
      operations();
    })

    .catch((err) => {
      console.log(err);
    });
}

//deposit
function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "What is your account name?",
      },
    ])
    .then((answers) => {
      const nome = answers["accountName"];
      if (verifyAccount(nome) === false) {
        return query();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "How much do you want to deposit?",
          },
        ])
        .then((answers) => {
          const amount = answers["amount"];
          if (!amount) {
            console.log(chalk.bgRed("Somethin is wrong, try again later!"));
            return deposit();
          }
          addAmount(nome, amount);
          return operations();
        })
        .catch((err) => {
          console.log(err);
        });
    });
}

//sacar dinheiro
function sacar() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "What is your account name?",
      },
    ])
    .then((answers) => {
      const nome = answers["accountName"];
      if (verifyAccount(nome) === false) {
        return query();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "How much do you want to withdraw?",
          },
        ])
        .then((answers) => {
          const amount = answers["amount"];
          if (!amount) {
            console.log(chalk.bgRed("Somethin is wrong, try again later!"));
            return deposit();
          }
          subAmount(nome, amount);
          return operations();
        })
        .catch((err) => {
          console.log(err);
        });
    });
}

//remover dinheiro
function subAmount(nome, amount) {
  //busca a conta
  const accountData = getAccount(nome);
  //para acrescentar o valor na variavel do JSON da conta
  if (accountData.balance >= amount) {
    accountData.balance = parseFloat(amount) - accountData.balance;
    //função do file system para ir e escrever no account file passar o json pra string
    fs.writeFileSync(
      `accounts/${nome}.json`,
      JSON.stringify(accountData),
      function (err) {
        console.log(err);
      }
    );
    //mostra o valor que foi depositado
    console.log(`saque de ${amount} efetuado com sucesso`);
    return;
  }
  console.log("Saldo insuficiente, tente novamente mais tarde!!!");
}

//consulta de saldo
function query() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "What is your account name?",
      },
    ])
    .then((answers) => {
      const nome = answers["accountName"];
      if (verifyAccount(nome) === false) {
        return query();
      }
      accountAmount(nome);
      operations();
    });
}

//para retornar o saldo
function accountAmount(nome) {
  //busca a conta
  const accountData = getAccount(nome);
  //saber o montante
  const amount = accountData.balance;
  console.log(chalk.bgGreen(`O seu saldo é de ${amount}`));
}

// verificar se conta existe
function verifyAccount(nome) {
  if (!fs.existsSync(`accounts/${nome}.json`)) {
    console.log(
      chalk.bgRed("this account does not exist! Try another account name!")
    );
    return false;
  }
  return true;
}

//adicionar montante
function addAmount(nome, amount) {
  //busca a conta
  const accountData = getAccount(nome);
  //para acrescentar o valor na variavel do JSON da conta
  accountData.balance = parseFloat(amount) + accountData.balance;
  //função do file system para ir e escrever no account file passar o json pra string
  fs.writeFileSync(
    `accounts/${nome}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );
  //mostra o valor que foi depositado
  console.log(`depósito de ${amount} efetuado com sucesso`);
}

//buscar conta
function getAccount(accountName) {
  //le o JSON da conta e transforma em variavel para retornar a conta
  const accountJson = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8", // para ler nomes com acentos
    flag: "r", // just read
  });

  return JSON.parse(accountJson);
}
