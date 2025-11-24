const linksForm = document.querySelectorAll(".abrir-form");
const formContainer = document.getElementById("formContainer");
const fechar = document.getElementById("fechar");
const enviar = document.getElementById("enviar");

// Regras
const WA_COUNTRY_CODE = '55'; // Brasil
const MAX_MESSAGE_CHARS = 4096;

// Aplica máscara + limita a 11 dígitos
const numeroElem = document.getElementById("numero");
if (numeroElem) {
    numeroElem.addEventListener("input", function () {
        let valor = this.value.replace(/\D/g, ""); // só números

        // 🔒 LIMITA A 11 DÍGITOS
        valor = valor.substring(0, 11);

        // máscara automática
        if (valor.length > 0) valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
        if (valor.length > 10) valor = valor.replace(/(\d{5})(\d{4})$/, "$1-$2");

        this.value = valor;
    });
}

// Abre o formulário
linksForm.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        if (formContainer) formContainer.style.display = "block";
    });
});

// Fecha o formulário
if (fechar) fechar.onclick = () => { 
    if (formContainer) formContainer.style.display = "none"; 
};

// Checagem opcional via servidor
async function verifyWhatsappNumber(fullNumber) {
    try {
        const resp = await fetch('php/verify_whatsapp.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: fullNumber })
        });
        if (!resp.ok) return { exists: null, message: 'Verificação indisponível' };
        return await resp.json();
    } catch (err) {
        return { exists: null, message: 'Erro na verificação' };
    }
}

// Envio da mensagem
if (enviar) enviar.onclick = async () => {
    const nome = (document.getElementById("nome")?.value || "").trim();
    const mensagem = (document.getElementById("mensagem")?.value || "").trim();
    let numero = numeroElem ? numeroElem.value.replace(/\D/g, "") : "";

    // Campos obrigatórios
    if (!nome || !numero || !mensagem) {
        const errMsg = 'Preencha todos os campos!';
        if (window.mostrarPopupErro) { window.mostrarPopupErro(errMsg); } else { alert(errMsg); }
        return;
    }

    // Limite de caracteres da mensagem
    if (mensagem.length > MAX_MESSAGE_CHARS) {
        const errMsg = `Mensagem muito longa. Limite de ${MAX_MESSAGE_CHARS} caracteres.`;
        if (window.mostrarPopupErro) { window.mostrarPopupErro(errMsg); } else { alert(errMsg); }
        document.getElementById('mensagem')?.focus();
        return;
    }

    // ✔️ VALIDAÇÃO FINAL
    if (numero.length !== 11 || numero[2] !== "9") {
        const errMsg = "Número inválido! Digite no formato: (19) 99999-9999";
        if (window.mostrarPopupErro) { window.mostrarPopupErro(errMsg); } else { alert(errMsg); }
        numeroElem?.focus();
        return;
    }

    // Remove zeros à esquerda
    numero = numero.replace(/^0+/, '');

    // Número final com DDI
    const fullNumber = WA_COUNTRY_CODE + numero;

    // Verificação opcional no servidor
    const verification = await verifyWhatsappNumber(fullNumber);
    if (verification?.exists === false) {
        const proceed = confirm('Esse número não parece ter WhatsApp. Deseja continuar mesmo assim?');
        if (!proceed) return;
    }

    // Redireciona para o WhatsApp
    const text = `Olá, meu nome é ${nome}. ${mensagem}`;
    const encodedText = encodeURIComponent(text);
    window.location.href = `https://wa.me/${fullNumber}?text=${encodedText}`;
};
