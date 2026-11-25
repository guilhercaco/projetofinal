
document.addEventListener("DOMContentLoaded", () => {

    const botaoCarrinho = document.getElementById("adicionarCarrinho");
    const botaoCompra = document.getElementById("irParaCompra");

    async function adicionarProduto() {

        const clienteId = localStorage.getItem("id_cliente");
        const produtoId = document.body.dataset.produtoId;

        if (!clienteId) {
            alert("Faça login antes de adicionar produtos.");
            window.location.href = "conta.html";
            return false;
        }

        if (!produtoId) {
            alert("Não foi possível identificar o produto.");
            return false;
        }

        try {
            const resposta = await fetch("http://localhost:3000/carrinho", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cliente_id: Number(clienteId),
                    produto_id: Number(produtoId)
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.mensagem);
            }

            alert(dados.mensagem);
            return true;

        } catch (erro) {
            console.error("Erro ao adicionar produto:", erro);
            alert(erro.message || "Não foi possível adicionar o produto.");
            return false;
        }
    }
    if (botaoCarrinho) {
        botaoCarrinho.addEventListener("click", async () => {

            botaoCarrinho.disabled = true;

            try {
                await adicionarProduto();
            } finally {
                botaoCarrinho.disabled = false;
            }

        });
    }
    if (botaoCompra) {
        botaoCompra.addEventListener("click", async () => {

            botaoCompra.disabled = true;

            try {
                const adicionado = await adicionarProduto();

                if (adicionado) {
                    window.location.href = "compra.html";
                }

            } finally {
                botaoCompra.disabled = false;
            }

        });
    }

});
