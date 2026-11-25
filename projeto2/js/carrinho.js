let carrinhoAtual = [];

const produtosSelecionados = document.getElementById(
    "produtos-selecionados"
);

const elementoTotal = document.getElementById("valor-total");

// CARREGAR CARRINHO
async function carregarCarrinho() {
    const clienteId = localStorage.getItem("id_cliente");

    if (!produtosSelecionados || !elementoTotal) {
        console.error("Elementos do carrinho não encontrados.");
        return;
    }

    if (!clienteId) {
        carrinhoAtual = [];
        window.carrinhoAtual = [];

        produtosSelecionados.innerHTML =
            "<p>Faça login para consultar seu carrinho.</p>";

        elementoTotal.textContent = "Total: R$ 0,00";
        return;
    }

    try {
        const resposta = await fetch(
            `http://localhost:3000/carrinho/${clienteId}`
        );

        const produtos = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                produtos.mensagem || "Erro ao carregar carrinho."
            );
        }

        carrinhoAtual = produtos;
        window.carrinhoAtual = produtos;

        produtosSelecionados.innerHTML = "";

        if (produtos.length === 0) {
            produtosSelecionados.innerHTML =
                "<p>Seu carrinho está vazio.</p>";

            elementoTotal.textContent = "Total: R$ 0,00";
            return;
        }

        const total = produtos.reduce((soma, produto) => {
            return soma + Number(produto.valor || 0);
        }, 0);

        elementoTotal.textContent =
            "Total: " + total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        produtos.forEach(produto => {

            const item = document.createElement("div");
            item.classList.add("produto-carrinho");

            const imagem = document.createElement("img");

            imagem.src = produto.imagem
                ? `../imagem/${produto.imagem.split("/").pop()}`
                : "";

            imagem.alt = produto.nome || "Produto";
            imagem.width = 120;
            imagem.height = 120;
            imagem.style.objectFit = "contain";

            const nome = document.createElement("h2");
            nome.textContent = produto.nome;

            const valor = document.createElement("p");

            valor.textContent = Number(produto.valor).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

            const botaoExcluir = document.createElement("button");

            botaoExcluir.textContent = "🗑️ Excluir";
            botaoExcluir.classList.add("botao-excluir");

            botaoExcluir.addEventListener("click", async () => {

                if (!confirm(
                    `Deseja remover ${produto.nome} do carrinho?`
                )) {
                    return;
                }

                try {
                    const respostaExcluir = await fetch(
                        `http://localhost:3000/carrinho/${produto.compra_id}`,
                        {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                cliente_id: Number(clienteId)
                            })
                        }
                    );

                    const dados = await respostaExcluir.json();

                    if (!respostaExcluir.ok) {
                        throw new Error(
                            dados.mensagem || "Erro ao excluir produto."
                        );
                    }

                    alert(dados.mensagem);

                    await carregarCarrinho();

                } catch (erro) {
                    console.error("Erro ao excluir:", erro);
                    alert(erro.message);
                }
            });

            item.appendChild(imagem);
            item.appendChild(nome);
            item.appendChild(valor);
            item.appendChild(botaoExcluir);

            produtosSelecionados.appendChild(item);
        });

    } catch (erro) {
        console.error("Erro ao carregar carrinho:", erro);

        produtosSelecionados.innerHTML =
            "<p>Não foi possível carregar os produtos.</p>";

        elementoTotal.textContent = "Total: R$ 0,00";

        carrinhoAtual = [];
        window.carrinhoAtual = [];
    }
}

// INICIAR
carregarCarrinho();
