/* ============================================================
   CONFIGURAÇÃO DOS EVENTOS
   ============================================================ */

const eventos = [
    "Festa Junina",
    "Setembro Amarelo",
    "Outubro Rosa",
    "Halloween",
    "Novembro Azul"
];

const eventosKeys = [
    "junina",
    "setembro",
    "outubro",
    "halloween",
    "novembro"
];

/* ============================================================
   FUNÇÃO PARA CRIAR OS BLOCOS DE ESTRELAS POR EVENTO
   ============================================================ */
function gerarBlocosEstrelas() {
    const grupos = document.querySelectorAll(".grupo-pergunta");

    grupos.forEach(grupo => {
        const chave = grupo.dataset.key;
        grupo.innerHTML = "";

        eventos.forEach((evento, index) => {
            const template = document.querySelector("#evento-template").content.cloneNode(true);
            const bloco = template.querySelector(".evento-bloco");

            bloco.querySelector(".evento-nome").textContent = evento;
            bloco.querySelector(".stars").dataset.target = `${chave}_${eventosKeys[index]}`;
            bloco.querySelector(".motivo").dataset.target = `${chave}_${eventosKeys[index]}_motivo`;

            grupo.appendChild(bloco);
        });
    });
}

/* ============================================================
   FUNÇÃO PARA CRIAR OS BLOCOS SIM/NÃO
   ============================================================ */
function gerarBlocosSimNao() {
    const grupos = document.querySelectorAll(".grupo-simnao");

    grupos.forEach(grupo => {
        const chave = grupo.dataset.key;
        grupo.innerHTML = "";

        eventos.forEach((evento, index) => {
            const template = document.querySelector("#simnao-template").content.cloneNode(true);
            const bloco = template.querySelector(".evento-bloco");

            bloco.querySelector(".evento-nome").textContent = evento;

            const radios = bloco.querySelectorAll("input[type='radio']");
            radios.forEach(radio => {
                radio.name = `${chave}_${eventosKeys[index]}`;
                radio.dataset.target = `${chave}_${eventosKeys[index]}`;
            });

            bloco.querySelector(".motivo-simnao").dataset.target = `${chave}_${eventosKeys[index]}_motivo`;

            grupo.appendChild(bloco);
        });
    });
}

/* ============================================================
   FUNÇÃO PARA CRIAR OS CAMPOS DE TEXTO POR EVENTO
   ============================================================ */
function gerarBlocosTexto() {
    const grupos = document.querySelectorAll(".grupo-texto");

    grupos.forEach(grupo => {
        const chave = grupo.dataset.key;
        grupo.innerHTML = "";

        eventos.forEach((evento, index) => {
            const div = document.createElement("div");
            div.classList.add("evento-bloco");

            div.innerHTML = `
                <h3 class="evento-nome">${evento}</h3>
                <textarea data-target="${chave}_${eventosKeys[index]}" placeholder="Escreva aqui..."></textarea>
            `;

            grupo.appendChild(div);
        });
    });
}

/* ============================================================
   CONFIGURAR ESTRELAS (seleção, hover, motivos)
   ============================================================ */
function configurarEstrelas() {
    document.querySelectorAll(".stars span").forEach(star => {

        star.addEventListener("mouseover", function () {
            const parent = this.parentNode;
            const val = parseInt(this.dataset.value);

            parent.querySelectorAll("span").forEach(s => {
                s.classList.toggle("active", parseInt(s.dataset.value) <= val);
            });
        });

        star.addEventListener("mouseout", function () {
            const parent = this.parentNode;
            const selected = parent.dataset.selected || 0;

            parent.querySelectorAll("span").forEach(s => {
                s.classList.toggle("active", parseInt(s.dataset.value) <= selected);
            });
        });

        star.addEventListener("click", function () {
            const parent = this.parentNode;
            const val = parseInt(this.dataset.value);

            parent.dataset.selected = val;

            parent.querySelectorAll("span").forEach(s => {
                s.classList.toggle("selected", parseInt(s.dataset.value) <= val);
            });

            const motivoCampo = parent.parentNode.querySelector(".motivo");
            if (val <= 3) motivoCampo.classList.remove("hidden");
            else motivoCampo.classList.add("hidden");
        });
    });
}

/* ============================================================
   CONFIGURAR SIM/NÃO + MOTIVO
   ============================================================ */
function configurarSimNao() {
    document.querySelectorAll(".grupo-simnao input[type='radio']").forEach(radio => {
        radio.addEventListener("change", function () {
            const key = this.dataset.target;
            const motivo = document.querySelector(`[data-target="${key}_motivo"]`);

            if (this.value === "Não") motivo.classList.remove("hidden");
            else motivo.classList.add("hidden");
        });
    });
}

/* ============================================================
   INICIAR TUDO
   ============================================================ */
window.onload = () => {
    gerarBlocosEstrelas();
    gerarBlocosSimNao();
    gerarBlocosTexto();
    configurarEstrelas();
    configurarSimNao();
};

/* ============================================================
   CAPTURA DE DADOS E ENVIO
   ============================================================ */
document.getElementById("npsForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const dados = {};
    const timestamp = new Date().toLocaleString("pt-BR");
    dados.timestamp = timestamp;

    /* ===== Capturar ESTRELAS ===== */
    document.querySelectorAll(".grupo-pergunta").forEach(grupo => {
        const chave = grupo.dataset.key;

        eventosKeys.forEach(ev => {
            const bloco = document.querySelector(`[data-target="${chave}_${ev}"]`);
            const nota = bloco.dataset.selected || "";
            const motivo = document.querySelector(`[data-target="${chave}_${ev}_motivo"]`).value.trim();

            dados[`${chave}_${ev}_nota`] = nota;
            dados[`${chave}_${ev}_motivo`] = motivo;
        });
    });

    /* ===== Capturar SIM/NÃO ===== */
    document.querySelectorAll(".grupo-simnao").forEach(grupo => {
        const chave = grupo.dataset.key;

        eventosKeys.forEach(ev => {
            const radios = document.querySelectorAll(`input[name="${chave}_${ev}"]`);
            let resposta = "";
            radios.forEach(r => { if (r.checked) resposta = r.value; });

            const motivo = document.querySelector(`[data-target="${chave}_${ev}_motivo"]`).value.trim();

            dados[`${chave}_${ev}`] = resposta;
            dados[`${chave}_${ev}_motivo`] = motivo;
        });
    });

    /* ===== Capturar TEXTO ===== */
    document.querySelectorAll(".grupo-texto").forEach(grupo => {
        const chave = grupo.dataset.key;

        eventosKeys.forEach(ev => {
            const value = document.querySelector(`[data-target="${chave}_${ev}"]`).value.trim();
            dados[`${chave}_${ev}`] = value;
        });
    });

    /* ===== Sugestões gerais ===== */
    dados["sugestoes_gerais"] = document.getElementById("sugestoes_gerais").value.trim();

    /* ===== ENVIO ===== */
    try {
        const resposta = await fetch("/api/sheets", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(dados)
        });

        if (resposta.ok) {
            alert("Obrigado! Suas respostas foram enviadas.");
            window.location.reload();
        } else {
            alert("Erro ao enviar. Tente novamente.");
        }
    } catch (e) {
        alert("Erro de conexão.");
        console.error(e);
    }
});
