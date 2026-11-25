const botaoPagar = document.getElementById("botaoPagar");
const opcoesCartao = document.getElementById("opcoes-cartao");

const formasPagamento = document.querySelectorAll(
    'input[name="pagamento"]'
);

// MOSTRAR OPÇÕES DO CARTÃO
function atualizarFormaPagamento() {

    const selecionado = document.querySelector(
        'input[name="pagamento"]:checked'
    );

    if (opcoesCartao) {
        opcoesCartao.hidden =
            !selecionado || selecionado.value !== "cartao";
    }
}

formasPagamento.forEach(opcao => {
    opcao.addEventListener("change", atualizarFormaPagamento);
});

atualizarFormaPagamento();

// FINALIZAR PAGAMENTO
if (botaoPagar) {

    botaoPagar.addEventListener("click", async () => {

        const clienteId = localStorage.getItem("id_cliente");

        if (!clienteId) {
            alert("Faça login para continuar.");
            return;
        }

        const selecionado = document.querySelector(
            'input[name="pagamento"]:checked'
        );

        if (!selecionado) {
            alert("Selecione Pix ou cartão.");
            return;
        }

        const carrinho = window.carrinhoAtual || [];

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const forma = selecionado.value;
        let tipoCartao = null;

        if (forma === "cartao") {

            tipoCartao =
                document.getElementById("tipoCartao")?.value;

            if (!["credito", "debito"].includes(tipoCartao)) {
                alert("Selecione crédito ou débito.");
                return;
            }
        }

        const total = carrinho.reduce((soma, produto) => {
            return soma + Number(produto.valor || 0);
        }, 0);

        if (!Number.isFinite(total) || total <= 0) {
            alert("Valor da compra inválido.");
            return;
        }

        const nomeForma = forma === "pix"
            ? "Pix"
            : `Cartão de ${tipoCartao}`;

        const confirmar = confirm(
            `CONFIRMAR PEDIDO\n\n` +
            `Forma: ${nomeForma}\n` +
            `Total: ${total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            })}\n\nDeseja continuar?`
        );

        if (!confirmar) return;

        botaoPagar.disabled = true;

        try {

            const resposta = await fetch(
                "http://localhost:3000/pagamento",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        cliente_id: Number(clienteId),
                        forma_pagamento: forma,
                        tipo_cartao: tipoCartao
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || "Erro ao registrar pagamento."
                );
            }

            alert(
                `Pedido registrado com sucesso!\n\n` +
                `Forma: ${nomeForma}\n` +
                `Total: ${Number(dados.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                })}\n` +
                `Status: ${dados.status}\n\n` +
                `Seu carrinho está vazio!`
            );

            // ATUALIZAR A VARIÁVEL GLOBAL
            window.carrinhoAtual = [];

            // LIMPAR A TELA
            const lista = document.getElementById(
                "produtos-selecionados"
            );

            const totalElemento = document.getElementById(
                "valor-total"
            );

            if (lista) {
                lista.innerHTML =
                    "<p>Seu carrinho está vazio!</p>";
            }

            if (totalElemento) {
                totalElemento.textContent = "Total: R$ 0,00";
            }

        } catch (erro) {

            console.error("Erro no pagamento:", erro);
            alert(erro.message);

        } finally {
            botaoPagar.disabled = false;
        }
    });
}
