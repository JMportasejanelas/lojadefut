# 🚀 Implementação de Pagamento - Ginga7

## 📋 Visão Geral

O sistema de pagamento da Ginga7 agora está configurado para aceitar pedidos com duas opções principais:
1. **Mercado Pago** (pagamento online)
2. **WhatsApp** (pedido manual)

## 🔧 Configuração do Mercado Pago

### 1. Criar Conta Mercado Pago
1. Acesse [mercadopago.com](https://www.mercadopago.com.br)
2. Crie uma conta como vendedor
3. Complete o cadastro e verificação

### 2. Obter Credenciais
1. No painel, vá para **Credenciais**
2. Copie o **Access Token** de produção
3. Substitua `YOUR_ACCESS_TOKEN` no arquivo `script.js`

### 3. Configurar URLs de Retorno
No arquivo `script.js`, atualize as URLs:
```javascript
back_urls: {
    success: `${window.location.origin}/pedido-confirmado.html`,
    failure: `${window.location.origin}/pedido-falhou.html`,
    pending: `${window.location.origin}/pedido-pendente.html`
}
```

### 4. Criar Páginas de Retorno
Crie os seguintes arquivos:

#### pedido-confirmado.html
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedido Confirmado - Ginga7</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container" style="text-align: center; padding: 100px 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="font-size: 80px; color: #27ae60; margin-bottom: 20px;">✅</div>
            <h1 style="color: #0d4f2c; margin-bottom: 20px;">Pedido Confirmado!</h1>
            <p style="font-size: 18px; color: #666; margin-bottom: 30px;">
                Seu pagamento foi aprovado com sucesso! Seu pedido será processado e enviado em breve.
            </p>
            <a href="index.html" class="btn-primary">Voltar para Loja</a>
        </div>
    </div>
</body>
</html>
```

#### pedido-falhou.html
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedido Falhou - Ginga7</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container" style="text-align: center; padding: 100px 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="font-size: 80px; color: #e74c3c; margin-bottom: 20px;">❌</div>
            <h1 style="color: #0d4f2c; margin-bottom: 20px;">Pagamento Falhou</h1>
            <p style="font-size: 18px; color: #666; margin-bottom: 30px;">
                Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente ou entre em contato.
            </p>
            <a href="index.html" class="btn-primary">Voltar para Loja</a>
        </div>
    </div>
</body>
</html>
```

#### pedido-pendente.html
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedido Pendente - Ginga7</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container" style="text-align: center; padding: 100px 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="font-size: 80px; color: #f39c12; margin-bottom: 20px;">⏳</div>
            <h1 style="color: #0d4f2c; margin-bottom: 20px;">Pagamento Pendente</h1>
            <p style="font-size: 18px; color: #666; margin-bottom: 30px;">
                Seu pagamento está sendo processado. Você receberá uma atualização em breve.
            </p>
            <a href="index.html" class="btn-primary">Voltar para Loja</a>
        </div>
    </div>
</body>
</html>
```

## 📱 Configuração do WhatsApp

### 1. Atualizar Número
No arquivo `script.js`, linha 366, substitua:
```javascript
const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
```
Pelo seu número com DDD:
```javascript
const whatsappUrl = `https://wa.me/55SEUNUMERO?text=${encodeURIComponent(message)}`;
```

### 2. Opcional: Usar API de WhatsApp
Para integração profissional, considere:
- **Twilio WhatsApp API**
- **Z-API**
- **Evolution API**

## 🛡️ Segurança

### 1. Backend Obrigatório
Para produção, crie um backend que:
- Valide e processe pagamentos
- Armazene pedidos em banco de dados
- Implemente webhook do Mercado Pago
- Valide dados do cliente

### 2. Exemplo de Backend (Node.js)
```javascript
// server.js
const express = require('express');
const mercadopago = require('mercadopago');
const app = express();

mercadopago.configure({
    access_token: 'SEU_ACCESS_TOKEN'
});

app.post('/create-preference', async (req, res) => {
    try {
        const preference = await mercadopago.preferences.create(req.body);
        res.json(preference.body);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/webhook', (req, res) => {
    // Processar notificações do Mercado Pago
    const payment = req.body;
    
    if (payment.type === 'payment') {
        const paymentId = payment.data.id;
        // Atualizar status do pedido no banco
    }
    
    res.sendStatus(200);
});

app.listen(3000);
```

## 🔄 Fluxo Completo

### Cliente:
1. Adiciona produtos ao carrinho
2. Clica em "Fazer Pedido"
3. Preenche dados pessoais
4. Escolhe método de pagamento
5. Finaliza compra

### Sistema:
1. ✅ Valida dados do formulário
2. ✅ Envia para Mercado Pago ou WhatsApp
3. ✅ Processa pagamento
4. ✅ Redireciona para página de confirmação
5. ✅ Limpa carrinho
6. ✅ Envia notificações

## 📊 Monitoramento

### 1. Dashboard Mercado Pago
- Acesse o painel para ver vendas
- Monitore taxas e receitas
- Gere relatórios

### 2. Logs de Pedidos
- Implemente sistema de logs
- Monitore conversões
- Rastreie problemas

## 🚀 Deploy

### 1. Hospedagem
- Use serviços como Vercel, Netlify, ou servidor próprio
- Configure HTTPS obrigatório
- Configure domínio personalizado

### 2. Variáveis de Ambiente
```bash
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
WHATSAPP_NUMBER=55seunumero
DATABASE_URL=sua_conexao_db
```

## 📞 Suporte

Para dúvidas:
- 📧 Email: suporte@ginga7.com.br
- 📱 WhatsApp: (11) 9999-9999
- 🌐 Site: ginga7.com.br

---

**⚠️ Importante:** Teste sempre em ambiente de desenvolvimento antes de ir para produção!
