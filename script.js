// 1. Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDMIftgF8BitKzEMnu0S156eKMGPGKkyis",
    authDomain: "agendai-ec37a.firebaseapp.com",
    projectId: "agendai-ec37a",
    storageBucket: "agendai-ec37a.firebasestorage.app",
    messagingSenderId: "124139196353",
    appId: "1:124139196353:web:83e2117c8b3898eae32940",
    measurementId: "G-Q99HSXS8K2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Pega o ID do barbeiro pela URL (ex: ?b=vitor123)
const urlParams = new URLSearchParams(window.location.search);
let barbeiroId = urlParams.get('b') || "perfil_barbeiro";

let dadosBarbearia = {
    nome: "Agendai",
    whatsapp: "5511910362505",
    logo: "✂️"
};

let dataSelecionadaGlobal = "";

// Função para buscar as configurações personalizadas
function carregarConfiguracoes() {
    if (!barbeiroId) return;

    db.collection("configuracoes").doc(barbeiroId).get().then((doc) => {
        if (doc.exists) {
            dadosBarbearia = doc.data();
            
            const tituloTopo = document.querySelector('header h1');
            if(tituloTopo) tituloTopo.innerText = dadosBarbearia.nome;

            const logoPlaceholder = document.querySelector('.logo-placeholder');
            if (logoPlaceholder && dadosBarbearia.logo) {
                if (dadosBarbearia.logo.length > 50) { 
                    logoPlaceholder.innerHTML = `<img src="${dadosBarbearia.logo}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #cca43b;">`;
                } else {
                    logoPlaceholder.innerHTML = `<span>${dadosBarbearia.logo}</span>`;
                }
            }
        }
    });
}



// 2. Variáveis Globais
let servicoSelecionado = "";
let precoSelecionado = "";
const numeroBarbeiro = "5511910362505"; 

// 3. Funções do Cliente
function iniciarAgendamento() {
    const content = document.getElementById('main-content');
    
    const pCabelo = dadosBarbearia.precoCabelo || "40";
    const pBarba = dadosBarbearia.precoBarba || "30";
    const pCombo = dadosBarbearia.precoCombo || "60";

    content.innerHTML = `
        <section id="servico-screen">
            <h2 class="title-gold">O que vamos fazer?</h2>
            <div class="servicos-lista">
                <button class="btn-servico" onclick="escolherServico('Cabelo', 'R$ ${pCabelo}')">
                    <span>✂️ Cabelo</span> <span>R$ ${pCabelo}</span>
                </button>
                <button class="btn-servico" onclick="escolherServico('Barba', 'R$ ${pBarba}')">
                    <span>🪒 Barba</span> <span>R$ ${pBarba}</span>
                </button>
                <button class="btn-servico" onclick="escolherServico('Combo', 'R$ ${pCombo}')">
                    <span>🔥 Combo</span> <span>R$ ${pCombo}</span>
                </button>
            </div>
            <button class="btn-back" onclick="window.location.reload()">Voltar</button>
        </section>
    `;
}

function escolherServico(servico, preco) {
    servicoSelecionado = servico;
    precoSelecionado = preco;
    
    const content = document.getElementById('main-content');
    
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    
    const hojeLocal = `${ano}-${mes}-${dia}`;
    
    const maxDate = new Date();
    maxDate.setDate(agora.getDate() + 14);
    const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

    content.innerHTML = `
        <section id="agenda-screen">
            <h2 class="title-gold">${servico}</h2>
            <div class="calendar-box">
                <label class="label-gold">Escolha o dia:</label>
                <input type="date" id="data-agendamento" 
                       min="${hojeLocal}" max="${maxDateStr}" 
                       value="${hojeLocal}" 
                       onchange="atualizarHorariosDisponiveis(this.value)">
            </div>
            <div id="lista-horarios" class="horarios-grid">
                <p>Carregando horários...</p>
            </div>
            <button class="btn-back" onclick="iniciarAgendamento()">Voltar</button>
        </section>
    `;

    dataSelecionadaGlobal = hojeLocal;
    atualizarHorariosDisponiveis(hojeLocal);
}

function abrirFormulario(hora) {
    const content = document.getElementById('main-content');
    
    const dataResumo = dataSelecionadaGlobal.split('-').reverse().join('/');

    content.innerHTML = `
        <section id="cadastro-screen">
            <h2 class="title-gold">Resumo do Agendamento</h2>
            
            <div style="background: #1a1a1a; padding: 15px; border-radius: 10px; border: 1px solid #333; margin-bottom: 20px; text-align: left;">
                <p><strong>Serviço:</strong> ${servicoSelecionado}</p>
                <p><strong>Data:</strong> ${dataResumo}</p>
                <p><strong>Horário:</strong> ${hora}</p>
                <p><strong>Valor:</strong> <span style="color: #28a745; font-weight: bold;">${precoSelecionado}</span></p>
            </div>

            <h3 class="title-gold" style="font-size: 1.1em; margin-bottom: 10px;">Suas Informações</h3>
            <div class="form-group">
                <input type="text" id="cliente-nome" placeholder="Seu nome" class="input-dark">
                <input type="tel" id="cliente-whatsapp" 
                placeholder="WhatsApp (Apenas números)" 
                class="input-dark"
                maxlength="11"
                oninput="this.value = this.value.replace(/[^0-9]/g, '')">
            </div>

            <button class="btn-primary" onclick="confirmarAgendamento('${hora}')">Confirmar e Ir para o WhatsApp</button>
            <button class="btn-back" onclick="escolherServico('${servicoSelecionado}', '${precoSelecionado}')">Alterar Data/Hora</button>
        </section>
    `;
}

function confirmarAgendamento(hora) {
    const nome = document.getElementById('cliente-nome').value.trim();
    const whatsapp = document.getElementById('cliente-whatsapp').value.trim();

    // Validação de Nome
    if (!nome) {
        alert("Por favor, digite seu nome!");
        return;
    }

    // NOVA TRAVA: Verifica se tem pelo menos 10 ou 11 dígitos
    if (whatsapp.length < 10) {
        alert("Por favor, insira um WhatsApp válido com DDD (apenas números)!");
        return;
    }

    const dataFormatadaBR = dataSelecionadaGlobal.split('-').reverse().join('/');

    const textoBase = `Olá! Gostaria de confirmar meu agendamento:\n\n` +
                      `✂️ *Serviço:* ${servicoSelecionado}\n` +
                      `📅 *Data:* ${dataFormatadaBR}\n` +
                      `⏰ *Horário:* ${hora}\n` +
                      `👤 *Nome:* ${nome}`;
    
    const linkZap = `https://wa.me/${dadosBarbearia.whatsapp}?text=${encodeURIComponent(textoBase)}`;

    db.collection("agendamentos").add({
        barbeiroVinculado: barbeiroId,
        cliente: nome,
        whatsapp: whatsapp,
        servico: servicoSelecionado,
        valor: precoSelecionado,
        data: dataFormatadaBR,
        horario: hora,
        status: "pendente",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Agendamento realizado! ✅");
        window.open(linkZap, '_blank');
        window.location.reload(); 
    });
}

// 4. Funções do Barbeiro
function exibirLoginBarbeiro() {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <section id="login-screen">
            <h2 class="title-gold">Acesso do Barbeiro</h2>
            <div class="form-group">
                <input type="email" id="login-email" placeholder="E-mail" class="input-dark">
                <input type="password" id="login-senha" placeholder="Senha" class="input-dark">
            </div>
            <button class="btn-primary" onclick="fazerLogin()">Entrar no Painel</button>
            <button class="btn-back" onclick="window.location.reload()">Voltar</button>
        </section>
    `;
}

function fazerLogin() {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    
    firebase.auth().signInWithEmailAndPassword(email, senha)
        .then(() => { 
            // Agora sim! O login deu certo, vamos buscar o nome personalizado
            carregarConfiguracoes(); 
            verAgendaBarbeiro(); 
        })
        .catch((error) => { alert("Acesso negado: " + error.message); });
}

function verAgendaBarbeiro() {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="admin-header" style="text-align: center; margin-bottom: 20px;">
            <p style="font-size: 0.9em; opacity: 0.7; color: #cca43b; font-weight: bold;">PAINEL ADMINISTRATIVO</p>
            <p style="font-size: 0.8em; opacity: 0.7;">Gerencie sua barbearia com facilidade</p>
        </div>

        <div class="tab-menu" style="display: flex; gap: 5px; margin-bottom: 20px; background: #1a1a1a; padding: 5px; border-radius: 10px;">
            <button class="btn-tab active" id="tab-agenda" onclick="alternarAba('agenda')" style="flex:1; padding: 10px; border:none; border-radius: 8px; cursor:pointer; background: #cca43b; color: #000; font-weight: bold;">📅 Agenda</button>
            <button class="btn-tab" id="tab-financeiro" onclick="alternarAba('financeiro')" style="flex:1; padding: 10px; border:none; border-radius: 8px; cursor:pointer; background: transparent; color: #fff;">📊 Finanças</button>
            <button class="btn-tab" id="tab-ajustes" onclick="alternarAba('ajustes')" style="flex:1; padding: 10px; border:none; border-radius: 8px; cursor:pointer; background: transparent; color: #fff;">⚙️ Ajustes</button>
            <button class="btn-tab" id="tab-clientes" onclick="alternarAba('clientes')" style="flex:1; padding: 10px; border:none; border-radius: 8px; cursor:pointer; background: transparent; color: #fff;">👥 Clientes</button>
         </div>

        <div id="aba-conteudo-agenda" class="aba-item">
            <div id="bloco-bloqueio-container"></div>
            <h3 id="titulo-lista-agenda" class="title-gold" style="font-size: 1.1em;">Agendamentos</h3>
            <div id="lista-agendamentos">Carregando...</div>
        </div>

        <div id="aba-conteudo-financeiro" class="aba-item" style="display: none;">
            <div id="financeiro-container"></div>
        </div>

        <div id="aba-conteudo-ajustes" class="aba-item" style="display: none;">
            <div id="configuracoes-container"></div>
        </div>
        <div id="aba-conteudo-clientes" class="aba-item" style="display: none;">
    <div id="clientes-container"></div>
</div>

        <button class="btn-back" onclick="sairDoPainel()" style="margin-top: 30px; width: 100%;">Sair do Sistema</button>
    `;

    // Inicializa as visões
    renderizarAbaAgenda();
    renderizarListaHoje();
}

function concluirServico(id) {
    if(confirm("Deseja marcar este serviço como concluído?")) {
        db.collection("agendamentos").doc(id).update({ status: "concluido" }).then(() => {
            alert("✅ Atendimento finalizado! O valor foi somado ao seu faturamento.");
        });
    }
}

function excluirAgendamento(id) {
    if(confirm("Tem certeza que deseja apagar permanentemente este agendamento?")) {
        db.collection("agendamentos").doc(id).delete();
    }
}

function renderizarListaHoje(dataISO) {
    const dataAlvo = dataISO ? dataISO.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');
    const lista = document.getElementById('lista-agendamentos');
    
    lista.innerHTML = "<p style='text-align:center; opacity:0.5;'>Buscando agenda...</p>";

    db.collection("agendamentos")
      .where("data", "==", dataAlvo)
      .where("barbeiroVinculado", "==", barbeiroId) 
      .onSnapshot((snapshot) => {
        if (snapshot.empty) {
            lista.innerHTML = `
                <div style="text-align:center; padding:20px; opacity:0.5;">
                    <p>📭 Nenhum agendamento para ${dataAlvo}.</p>
                </div>`;
            return;
        }

        lista.innerHTML = "";
        snapshot.forEach((doc) => {
            lista.innerHTML += criarCardAgendamento(doc.id, doc.data());
        });
    });
}

async function buscarFaturamentoPeriodo() {
    const inicioStr = document.getElementById('data-inicio').value;
    const fimStr = document.getElementById('data-fim').value;
    
    if (!inicioStr || !fimStr) return alert("Selecione as datas!");

    const inicio = new Date(inicioStr + "T00:00:00");
    const fim = new Date(fimStr + "T23:59:59");

    // Elementos da interface para atualizar
    const faturamentoEl = document.getElementById('faturamento-valor');
    const despesaEl = document.getElementById('despesa-valor');
    const lucroEl = document.getElementById('lucro-valor');

    faturamentoEl.innerText = "Calculando...";
    despesaEl.innerText = "Calculando...";

    try {
        // 1. Buscar Faturamento (Agendamentos Concluídos)
        const agendamentosSnap = await db.collection("agendamentos")
            .where("status", "==", "concluido")
            .where("barbeiroVinculado", "==", barbeiroId)
            .get();

        let totalGanhos = 0;
        agendamentosSnap.forEach(doc => {
            const dados = doc.data();
            const [dia, mes, ano] = dados.data.split('/');
            const dataObj = new Date(ano, mes - 1, dia);
            if (dataObj >= inicio && dataObj <= fim) {
                totalGanhos += parseFloat(dados.valor.replace('R$ ', '').replace(',', '.'));
            }
        });

        // 2. Buscar Despesas
        const despesasSnap = await db.collection("despesas")
            .where("barbeiroVinculado", "==", barbeiroId)
            .get();

        let totalGastos = 0;
        despesasSnap.forEach(doc => {
            const dados = doc.data();
            const dataObj = new Date(dados.dataISO + "T12:00:00");
            if (dataObj >= inicio && dataObj <= fim) {
                totalGastos += parseFloat(dados.valor);
            }
        });

        // 3. Cálculos Finais
        const lucroLiquido = totalGanhos - totalGastos;

        // Atualizar Tela
        faturamentoEl.innerText = `R$ ${totalGanhos.toFixed(2).replace('.', ',')}`;
        despesaEl.innerText = `R$ ${totalGastos.toFixed(2).replace('.', ',')}`;
        lucroEl.innerText = `R$ ${lucroLiquido.toFixed(2).replace('.', ',')}`;
        lucroEl.style.color = lucroLiquido >= 0 ? "#28a745" : "#ff4444";

    } catch (error) {
        console.error("Erro ao calcular financeiro:", error);
        alert("Erro ao processar dados.");
    }
}

// Função auxiliar para não repetir código do card
function criarCardAgendamento(id, agendamento) {
    const agora = new Date();
    const [hora, minuto] = agendamento.horario.split(':');
    const horaAgendamento = new Date();
    horaAgendamento.setHours(hora, minuto, 0);

    const ehBloqueio = agendamento.status === 'bloqueado';
    const passouDoTempo = agora > horaAgendamento && agendamento.status === 'pendente';
    
    // Define a cor da borda baseada no status
    const corBorda = ehBloqueio ? '#555' : (agendamento.status === 'concluido' ? '#28a745' : (passouDoTempo ? '#ff4444' : '#cca43b'));

    return `
        <div class="card-agendamento" style="display: flex; justify-content: space-between; align-items: center; background: #1e1e1e; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid ${corBorda}; opacity: ${ehBloqueio || agendamento.status === 'concluido' ? '0.6' : '1'}">
            <div>
                <p><strong>${agendamento.horario}</strong> - ${agendamento.cliente} ${passouDoTempo && !ehBloqueio ? '<span style="color:#ff4444">⚠️</span>' : ''}</p>
                <small>${agendamento.servico} ${ehBloqueio ? '' : `(${agendamento.status || 'pendente'})`}</small>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                ${!ehBloqueio ? `
                    <a href="https://wa.me/55${agendamento.whatsapp}" target="_blank" style="text-decoration: none; font-size: 18px;">💬</a>
                    ${agendamento.status !== 'concluido' ? `<button onclick="concluirServico('${id}')" style="background: none; border: none; cursor: pointer; font-size: 18px;">✅</button>` : ''}
                ` : ''}
                <button onclick="excluirAgendamento('${id}')" style="background: none; border: none; cursor: pointer; font-size: 18px; filter: grayscale(100%);">🗑️</button>
            </div>
        </div>
    `;
}

// O "Cérebro" que verifica o login automaticamente
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idDaUrl = urlParams.get('b');

    firebase.auth().onAuthStateChanged(async (user) => {
        if (idDaUrl) {
            // PRIORIDADE: Se tem ID na URL, carrega os dados do barbeiro do link
            console.log("Link de cliente detectado. ID:", idDaUrl);
            
            if (idDaUrl.length < 25) { 
                // Busca por nome amigável (slug)
                const querySnapshot = await db.collection("configuracoes").where("slug", "==", idDaUrl).get();
                if (!querySnapshot.empty) {
                    barbeiroId = querySnapshot.docs[0].id;
                } else {
                    barbeiroId = idDaUrl;
                }
            } else {
                barbeiroId = idDaUrl;
            }
            carregarConfiguracoes();
        } else if (user) {
            // Se NÃO tem link, mas o barbeiro está logado, abre o painel dele
            barbeiroId = user.uid;
            console.log("Barbeiro logado detectado:", user.email);
            carregarConfiguracoes(); 
            verAgendaBarbeiro();
        } else {
            // Se não tem link e não está logado, mostra a home padrão
            console.log("Página inicial do Agendai");
        }
    });
};

function exibirConfiguracoes() {
    const content = document.getElementById('main-content');
    const horariosTexto = (dadosBarbearia.horariosDisponiveis || ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]).join(', ');

    content.innerHTML = `
        <section id="perfil-screen">
            <h2 class="title-gold">Configurações</h2>
            <div class="form-group" style="margin-top: 20px;">
                <label style="color:#cca43b;">Nome da Barbearia:</label>
                <input type="text" id="conf-nome" class="input-dark" value="${dadosBarbearia.nome || ''}" style="width:100%; margin-bottom:15px;">
                
                <label style="color:#cca43b;">WhatsApp:</label>
                <input type="tel" id="conf-zap" class="input-dark" value="${dadosBarbearia.whatsapp || ''}" style="width:100%; margin-bottom:15px;">

                <label style="color:#cca43b;">Seus Horários (Separe por vírgula):</label>
                <textarea id="conf-horarios" class="input-dark" style="width:100%; height:80px; margin-bottom:20px; font-family: sans-serif;">${horariosTexto}</textarea>

                <label style="color:#cca43b;">Sua Logo:</label>
<div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; background: #111; padding: 12px; border-radius: 10px; border: 1px solid #333;">
    <img src="${dadosBarbearia.logo || '✂️'}" id="img-preview" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid #cca43b;">
    <div style="flex: 1;">
        <input type="file" id="file-logo" accept="image/*" style="display: none;" onchange="uploadLogo(this)">
        <button type="button" onclick="document.getElementById('file-logo').click()" class="btn-primary" style="font-size: 0.85em; width: 100%;">
            🖼️ Escolher Foto
        </button>
    </div>
</div>

                <h3 style="color:#cca43b; font-size: 1.1em; margin-bottom:15px; border-bottom: 1px solid #333; padding-bottom: 5px;">Tabela de Preços (R$)</h3>
<div style="display: flex; gap: 10px; margin-bottom: 25px; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 80px;">
        <label style="color:#888; font-size: 0.8em; display: block; margin-bottom: 5px;">✂️ Cabelo</label>
        <input type="number" id="preco-cabelo" class="input-dark" 
               value="${dadosBarbearia.precoCabelo || '40'}" 
               style="width: 100%;"
               oninput="this.value = this.value.replace(/[^0-9.]/g, '')">
    </div>
    <div style="flex: 1; min-width: 80px;">
        <label style="color:#888; font-size: 0.8em; display: block; margin-bottom: 5px;">🪒 Barba</label>
        <input type="number" id="preco-barba" class="input-dark" 
               value="${dadosBarbearia.precoBarba || '30'}" 
               style="width: 100%;"
               oninput="this.value = this.value.replace(/[^0-9.]/g, '')">
    </div>
    <div style="flex: 1; min-width: 80px;">
        <label style="color:#888; font-size: 0.8em; display: block; margin-bottom: 5px;">🔥 Combo</label>
        <input type="number" id="preco-combo" class="input-dark" 
               value="${dadosBarbearia.precoCombo || '60'}" 
               style="width: 100%;"
               oninput="this.value = this.value.replace(/[^0-9.]/g, '')">
    </div>
</div>
            </div>
            <button class="btn-primary" onclick="salvarPerfil()" style="width:100%; margin-bottom:10px;">💾 Salvar Tudo</button>
            <button class="btn-back" onclick="verAgendaBarbeiro()" style="width:100%;">⬅️ Voltar</button>
        </section>
    `;
}

function salvarPerfil() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Erro: Usuário não autenticado!");
        return;
    }

    // Captura dos elementos da tela (evita erro se algum campo não estiver visível)
    const nomeInput = document.getElementById('conf-nome');
    const zapInput = document.getElementById('conf-zap');
    const horariosInput = document.getElementById('conf-horarios');
    const slugInput = document.getElementById('conf-slug');
    const metaInput = document.getElementById('conf-meta');
    
    // Captura dos Preços
    const pCabelo = document.getElementById('preco-cabelo');
    const pBarba = document.getElementById('preco-barba');
    const pCombo = document.getElementById('preco-combo');

    // Montagem do objeto novosDados
    const novosDados = {
        nome: nomeInput ? nomeInput.value : (dadosBarbearia.nome || ""),
        whatsapp: zapInput ? zapInput.value : (dadosBarbearia.whatsapp || ""),
        horariosDisponiveis: horariosInput ? horariosInput.value.split(',').map(h => h.trim()) : (dadosBarbearia.horariosDisponiveis || []),
        slug: slugInput ? slugInput.value.toLowerCase().replace(/\s+/g, '') : (dadosBarbearia.slug || ""),
        
        // Salva a Meta Diária como número para o gráfico funcionar
        metaDiaria: metaInput ? parseFloat(metaInput.value) : (parseFloat(dadosBarbearia.metaDiaria) || 200),
        
        // Salva os Preços que o barbeiro definiu
        precoCabelo: pCabelo ? pCabelo.value : (dadosBarbearia.precoCabelo || "40"),
        precoBarba: pBarba ? pBarba.value : (dadosBarbearia.precoBarba || "30"),
        precoCombo: pCombo ? pCombo.value : (dadosBarbearia.precoCombo || "60"),
        
        // Mantém a logo atual se não houver upload novo
        logo: dadosBarbearia.logo || "✂️"
    };

    // Gravação no Firestore com merge: true para não apagar campos antigos
    db.collection("configuracoes").doc(user.uid).set(novosDados, { merge: true })
        .then(() => {
            alert("Configurações salvas com sucesso! ✅");
            location.reload(); // Recarrega para atualizar os dados globais
        })
        .catch(err => {
            console.error("Erro ao salvar perfil:", err);
            alert("Erro ao salvar. Tente novamente.");
        });
}
function enviarLembrete(whatsapp, nome, hora) {
    const mensagem = `Olá ${nome}! Passando para lembrar do seu horário às ${hora}. Confirma sua presença? ✂️`;
    const link = `https://wa.me/55${whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(link, '_blank');
}

function exibirCadastroBarbeiro() {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <section id="cadastro-barbeiro-screen">
            <h2 class="title-gold">Novo Barbeiro</h2>
            <div class="form-group">
                <input type="text" id="cad-nome-barbearia" placeholder="Nome da Barbearia" class="input-dark">
                <input type="email" id="cad-email" placeholder="E-mail de acesso" class="input-dark">
                <input type="tel" id="cad-whatsapp" placeholder="WhatsApp (Ex: 5511...)" class="input-dark">
                <input type="password" id="cad-senha" placeholder="Crie uma Senha" class="input-dark">
            </div>
            <button class="btn-primary" onclick="cadastrarBarbeiro()">Criar Minha Conta</button>
            <button class="btn-back" onclick="window.location.reload()">Voltar</button>
        </section>
    `;
}

function cadastrarBarbeiro() {
    const nome = document.getElementById('cad-nome-barbearia').value;
    const email = document.getElementById('cad-email').value;
    const whats = document.getElementById('cad-whatsapp').value;
    const senha = document.getElementById('cad-senha').value;

    if (!nome || !email || !whats || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    // Cria o login no Firebase Auth
    firebase.auth().createUserWithEmailAndPassword(email, senha)
        .then((userCredential) => {
            const uid = userCredential.user.uid;
            // Salva os dados específicos DESTE barbeiro usando o UID dele
            return db.collection("barbeiros").doc(uid).set({
                nome: nome,
                whatsapp: whats,
                email: email,
                logo: "✂️"
            });
        })
        .then(() => {
            alert("Conta criada com sucesso!");
            verAgendaBarbeiro();
        })
        .catch((error) => {
            alert("Erro ao cadastrar: " + error.message);
        });
}

function sairDoPainel() {
    if(confirm("Deseja realmente encerrar a sessão?")) {
        firebase.auth().signOut().then(() => {
            alert("Até logo!");
            window.location.reload(); // Volta para a Home "Agendai"
        });
    }
}

function exibirConfiguracoesIniciais() {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <section id="onboarding-screen" style="text-align: center;">
            <h2 class="title-gold">Bem-vindo ao Agendai! ✂️</h2>
            <p style="margin-bottom: 20px;">Falta pouco! Precisamos apenas do nome da sua barbearia para criar seu link exclusivo.</p>
            
            <div class="form-group">
                <input type="text" id="conf-nome" placeholder="Nome da sua Barbearia" class="input-dark" style="width:100%; margin-bottom:10px;">
                <input type="tel" id="conf-zap" placeholder="Seu WhatsApp (Ex: 5511...)" class="input-dark" style="width:100%; margin-bottom:20px;">
            </div>
            
            <button class="btn-primary" onclick="salvarPerfil()" style="width:100%;">🚀 Criar Meu Painel</button>
        </section>
    `;
}

function loginComGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((result) => {
        console.log("Logado com Google!", result.user);
    });
}

function copiarLink() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Erro: Você precisa estar logado para copiar seu link.");
        return;
    }
    const link = `https://agendai-ec37a.web.app/?b=${user.uid}`;
    navigator.clipboard.writeText(link).then(() => {
        alert("Link copiado com sucesso! 🎉\nAgora é só colar no seu Instagram ou WhatsApp.");
    });
}

function bloquearHorario(hora) {
    if(confirm(`Deseja bloquear o horário das ${hora} para novos agendamentos?`)) {
        const hoje = new Date().toLocaleDateString('pt-BR');
        
        db.collection("agendamentos").add({
            cliente: "HORÁRIO BLOQUEADO",
            whatsapp: "00000000000",
            horario: hora,
            barbeiroVinculado: barbeiroId,
            status: "bloqueado",
            servico: "Bloqueio Manual",
            valor: "R$ 0,00",
            data: hoje
        }).then(() => {
            alert("Horário bloqueado com sucesso!");
        });
    }
}

function executarBloqueio() {
    const hora = document.getElementById('select-bloqueio').value;
    bloquearHorario(hora);
}

function alternarAba(aba) {
    // 1. Esconde todas as seções de conteúdo
    document.querySelectorAll('.aba-item').forEach(div => {
        div.style.display = 'none';
    });

    // 2. Reseta o visual de todos os botões do menu
    document.querySelectorAll('.btn-tab').forEach(btn => {
        btn.style.background = 'transparent';
        btn.style.color = '#fff';
        btn.style.fontWeight = 'normal';
    });

    // 3. Mostra a seção que você clicou
    const abaAlvo = document.getElementById(`aba-conteudo-${aba}`);
    if (abaAlvo) {
        abaAlvo.style.display = 'block';
    }

    // 4. Destaca o botão que está ativo
    const btnAtivo = document.getElementById(`tab-${aba}`);
    if (btnAtivo) {
        btnAtivo.style.background = '#cca43b';
        btnAtivo.style.color = '#000';
        btnAtivo.style.fontWeight = 'bold';
    }

    // 5. Carrega os dados específicos daquela aba
    if (aba === 'agenda') renderizarAbaAgenda();
    if (aba === 'financeiro') renderizarAbaFinanceira();
    if (aba === 'ajustes') renderizarAbaConfiguracoes();
    if (aba === 'clientes') renderizarAbaClientes();
}

function renderizarAbaFinanceira() {
    const container = document.getElementById('financeiro-container');
    const hoje = new Date().toISOString().split('T')[0];

    container.innerHTML = `
        <div id="admin-content">
            <div class="resumo-financeiro">
                <p style="color: #cca43b; font-weight: bold; margin-bottom: 15px;">💰 Resumo de Período</p>
                <div class="form-group-datas">
                    <div>
                        <label class="label-gold">INÍCIO</label>
                        <input type="date" id="data-inicio" class="input-date" value="${hoje}">
                    </div>
                    <div>
                        <label class="label-gold">FIM</label>
                        <input type="date" id="data-fim" class="input-date" value="${hoje}">
                    </div>
                </div>
                <button onclick="buscarFaturamentoPeriodo()" class="btn-primary" style="width:100%;">📊 CALCULAR LUCRO REAL</button>
                
                <div id="resultado-lucro-real" style="margin-top: 20px; padding: 15px; background: #000; border-radius: 8px; border-left: 4px solid #28a745;">
                    <p style="font-size: 0.9em; color: #888;">Faturamento: <span id="faturamento-valor" style="color: #fff;">R$ 0,00</span></p>
                    <p style="font-size: 0.9em; color: #888;">Despesas: <span id="despesa-valor" style="color: #ff4444;">R$ 0,00</span></p>
                    <hr style="border: 0.5px solid #222; margin: 10px 0;">
                    <h3 class="title-gold" style="font-size: 1.2em;">Lucro Líquido: <span id="lucro-valor">R$ 0,00</span></h3>
                </div>
            </div>

            <div class="carrossel-graficos">
                <div class="slide-item" style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 15px;">
                    <p style="color: #cca43b; font-weight: bold; margin-bottom: 15px;">📈 Balanço Semanal (R$)</p>
                    <div style="position: relative; height:200px; width:100%;">
                        <canvas id="graficoFinanceiro"></canvas>
                    </div>
                </div>
                <div class="slide-item" style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 15px;">
                    <p style="color: #cca43b; font-weight: bold; margin-bottom: 15px;">🍕 Serviços Vendidos</p>
                    <div style="position: relative; height:200px; width:100%;">
                        <canvas id="graficoPizzaServicos"></canvas>
                    </div>
                </div>
            </div>

            <div class="card-despesas">
                <p style="color: #ff4444; font-weight: bold; margin-bottom: 15px;">📉 Registrar Despesa</p>
                <input type="text" id="despesa-nome" placeholder="Ex: Aluguel, Luz" class="input-dark" style="width:100%; margin-bottom:10px;">
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <input type="number" id="despesa-valor-input" placeholder="R$ Valor" class="input-dark" style="flex:2;">
                    <button onclick="salvarDespesa()" class="btn-primary" style="flex:1; background: #ff4444; margin:0;">Lançar</button>
                </div>
                <div id="lista-despesas-recentes"></div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        carregarListaDespesas();
        carregarGrafico();
    }, 300);
}

function salvarDespesa() {
    const nome = document.getElementById('despesa-nome').value;
    const valor = document.getElementById('despesa-valor-input').value;
    const hoje = new Date().toLocaleDateString('pt-BR');

    if(!nome || !valor) return alert("Preencha a despesa!");

    db.collection("despesas").add({
        descricao: nome,
        valor: parseFloat(valor),
        data: hoje,
        dataISO: new Date().toISOString().split('T')[0],
        barbeiroVinculado: barbeiroId
    }).then(() => {
        alert("Despesa registrada!");
        renderizarAbaFinanceira();
        document.getElementById('despesa-nome').value = '';
        document.getElementById('despesa-valor-input').value = '';
        carregarListaDespesas();
    });
}

// ABA 1: AGENDA
function renderizarAbaAgenda() {
    const container = document.getElementById('bloco-bloqueio-container');
    
    // Captura a data local para evitar o erro de pular o dia
    const agoraLocal = new Date();
    const ano = agoraLocal.getFullYear();
    const mes = String(agoraLocal.getMonth() + 1).padStart(2, '0');
    const dia = String(agoraLocal.getDate()).padStart(2, '0');
    const hojeISO = `${ano}-${mes}-${dia}`; 

    container.innerHTML = `
        <div class="card-filtro" style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #333;">
            <p style="color: #cca43b; margin-bottom: 10px; font-weight: bold;">📅 Ver Agenda de:</p>
            <input type="date" id="data-filtro-barbeiro" class="input-dark" 
                   value="${hojeISO}" 
                   style="width: 100%; margin-bottom: 15px;"
                   onchange="renderizarListaHoje(this.value)">
            
            <hr style="border: 0.5px solid #222; margin: 15px 0;">
            
            <p style="color: #cca43b; margin-bottom: 10px; font-weight: bold;">🔒 Bloquear Horário Manual:</p>
            <div style="display: flex; gap: 10px;">
                <select id="select-bloqueio" class="input-dark" style="flex: 2;">
                    ${(dadosBarbearia.horariosDisponiveis || ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]).map(h => `<option value="${h}">${h}</option>`).join('')}
                </select>
                <button onclick="executarBloqueio()" class="btn-primary" style="flex: 1; padding: 5px; font-size: 0.9em;">Bloquear</button>
            </div>
        </div>
    `;
    renderizarListaHoje(hojeISO); 
}

// ABA 3: AJUSTES (Onde o link e dados voltaram a aparecer)
function renderizarAbaConfiguracoes() {
    const container = document.getElementById('configuracoes-container');
    const horariosTexto = (dadosBarbearia.horariosDisponiveis || []).join(', ');
    const linkFinal = `https://agendai-ec37a.web.app/?b=${dadosBarbearia.slug || barbeiroId}`;

    container.innerHTML = `
        <div id="admin-content">
            <div class="resumo-financeiro">
                <p class="label-gold">⚙️ Configurações Gerais</p>
                
                <label class="label-gold">Nome da Barbearia:</label>
                <input type="text" id="conf-nome" class="input-dark" value="${dadosBarbearia.nome || ''}">
                
                <label class="label-gold">WhatsApp:</label>
                <input type="tel" id="conf-zap" class="input-dark" value="${dadosBarbearia.whatsapp || ''}" maxlength="11">

                <label class="label-gold">💰 Tabela de Preços (R$):</label>
                <div class="form-group-datas">
                    <div>
                        <label style="color:#888; font-size: 0.7em;">✂️ Cabelo</label>
                        <input type="number" id="preco-cabelo" class="input-dark" value="${dadosBarbearia.precoCabelo || '40'}">
                    </div>
                    <div>
                        <label style="color:#888; font-size: 0.7em;">🪒 Barba</label>
                        <input type="number" id="preco-barba" class="input-dark" value="${dadosBarbearia.precoBarba || '30'}">
                    </div>
                </div>

                <label class="label-gold">Horários:</label>
                <textarea id="conf-horarios" class="input-dark" style="height:60px;">${horariosTexto}</textarea>

                <button class="btn-primary" onclick="salvarPerfil()" style="margin-top:10px;">💾 SALVAR TUDO</button>
            </div>

            <div class="resumo-financeiro" style="border: 1px dashed #cca43b;">
                <p class="label-gold">Seu Link:</p>
                <code style="color: #fff; font-size: 0.75em; word-break: break-all;">${linkFinal}</code>
                <div class="form-group-datas" style="margin-top: 10px;">
                    <button onclick="copiarLink()" class="btn-primary" style="background:#333; font-size:0.7em; margin:0;">COPIAR</button>
                    <button onclick="compartilharLink()" class="btn-primary" style="background:#25d366; font-size:0.7em; margin:0;">ENVIAR</button>
                </div>
            </div>
        </div>
    `;
    setTimeout(verificarBotaoInstalacao, 100);
}

async function carregarListaDespesas() {
    const listaContainer = document.getElementById('lista-despesas-recentes');
    if (!listaContainer) return;

    listaContainer.innerHTML = "<p style='color: #888;'>Carregando despesas...</p>";

    try {
        const snapshot = await db.collection("despesas")
            .where("barbeiroVinculado", "==", barbeiroId)
            .orderBy("dataISO", "desc") 
            .limit(10)
            .get();

        if (snapshot.empty) {
            listaContainer.innerHTML = "<p style='color: #666;'>Nenhuma despesa lançada.</p>";
            return;
        }

        let html = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; color: #fff; font-size: 0.85em;">
                <thead>
                    <tr style="border-bottom: 1px solid #333; color: #cca43b; text-align: left;">
                        <th style="padding: 5px;">Data</th>
                        <th style="padding: 5px;">Descrição</th>
                        <th style="padding: 5px;">Valor</th>
                        <th style="padding: 5px;">Ação</th>
                    </tr>
                </thead>
                <tbody>
        `;

        snapshot.forEach(doc => {
            const d = doc.data();
            html += `
                <tr style="border-bottom: 1px solid #222;">
                    <td style="padding: 8px 5px;">${d.data}</td>
                    <td style="padding: 8px 5px;">${d.descricao}</td>
                    <td style="padding: 8px 5px; color: #ff4444;">- R$ ${d.valor.toFixed(2)}</td>
                    <td style="padding: 8px 5px;">
                        <button onclick="excluirDespesa('${doc.id}')" style="background:none; border:none; color:#666; cursor:pointer;">🗑️</button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        listaContainer.innerHTML = html;

    } catch (error) {
        console.error("Erro ao carregar despesas:", error);
        listaContainer.innerHTML = "<p style='color: #ff4444;'>Erro ao carregar lista.</p>";
    }
}

function excluirDespesa(id) {
    if (confirm("Deseja apagar este lançamento?")) {
        db.collection("despesas").doc(id).delete().then(() => {
            alert("Despesa removida!");
            renderizarAbaFinanceira(); // Recarrega a aba toda
        });
    }
}

async function carregarGrafico() {
    const ctxBarra = document.getElementById('graficoFinanceiro');
    const ctxPizza = document.getElementById('graficoPizzaServicos');
    if (!ctxBarra || !ctxPizza) return;

    [Chart.getChart("graficoFinanceiro"), Chart.getChart("graficoPizzaServicos")].forEach(c => c?.destroy());

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hojeParaGrafico = new Date();
    let labelsBarra = [];
    let diasISO = [];
    const metaValor = parseFloat(dadosBarbearia.metaDiaria) || 200;

    for (let i = 6; i >= 0; i--) {
        let d = new Date();
        d.setDate(hojeParaGrafico.getDate() - i);
        labelsBarra.push(diasSemana[d.getDay()]);
        diasISO.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }

    let ganhosPorDia = [0, 0, 0, 0, 0, 0, 0];
    let gastosPorDia = [0, 0, 0, 0, 0, 0, 0]; 
    
    let contagemServicos = { "Cabelo": 0, "Barba": 0, "Combo": 0 };

    try {
        // 1. BUSCA GANHOS E CONTA SERVIÇOS (PIZZA)
        const agendamentosSnap = await db.collection("agendamentos")
            .where("barbeiroVinculado", "==", barbeiroId)
            .where("status", "==", "concluido") 
            .get();

        agendamentosSnap.forEach(doc => {
            const d = doc.data();
            
            if (d.servico && contagemServicos.hasOwnProperty(d.servico)) {
                contagemServicos[d.servico]++;
            } else if (d.servico) {
                contagemServicos[d.servico] = (contagemServicos[d.servico] || 0) + 1;
            }

            if (!d.data || d.data.length < 8) return;
            const partes = d.data.split('/');
            const dataISO = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            const idx = diasISO.indexOf(dataISO);
            if (idx !== -1) {
                let valor = parseFloat(d.valor.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
                ganhosPorDia[idx] += valor;
            }
        });

        const despesasSnap = await db.collection("despesas")
            .where("barbeiroVinculado", "==", barbeiroId)
            .get();

        despesasSnap.forEach(doc => {
            const d = doc.data();
            const index = diasISO.indexOf(d.dataISO);
            if (index !== -1) {
                gastosPorDia[index] += parseFloat(d.valor) || 0;
            }
        });

        // 3. RENDERIZA GRÁFICO DE BARRAS (FINANCEIRO)
        const coresGanhos = ganhosPorDia.map(v => v >= metaValor ? '#28a745' : '#cca43b');
        
        new Chart(ctxBarra, {
            data: {
                labels: labelsBarra,
                datasets: [
                    { type: 'line', label: 'Meta', data: new Array(7).fill(metaValor), borderColor: '#ff4444', borderDash: [5, 5], pointRadius: 0, fill: false },
                    { type: 'bar', label: 'Ganhos', data: ganhosPorDia, backgroundColor: coresGanhos, borderRadius: 5 },
                    // ADICIONADO O DATASET DE GASTOS ABAIXO:
                    { type: 'bar', label: 'Gastos', data: gastosPorDia, backgroundColor: '#ff4444', borderRadius: 5 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // 4. RENDERIZA GRÁFICO DE PIZZA
        new Chart(ctxPizza, {
            type: 'pie',
            data: {
                labels: Object.keys(contagemServicos),
                datasets: [{
                    data: Object.values(contagemServicos),
                    backgroundColor: ['#cca43b', '#666', '#fff'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#fff' } }
                }
            }
        });

    } catch (e) { console.error("Erro nos gráficos:", e); }
}

let promptInstalacao;

// 1. Escuta o evento do navegador (Só acontece se o PWA estiver OK)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    promptInstalacao = e;
    console.log("✅ PWA detectado: Sistema pronto para baixar!");
    
    // Tentamos mostrar o botão se o barbeiro já estiver na aba de ajustes
    const btn = document.getElementById('btn-instalar');
    if (btn) btn.style.display = 'block';
});

// 2. Lógica de clique unificada usando delegação de evento
document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'btn-instalar') {
        if (promptInstalacao) {
            promptInstalacao.prompt();
            const { outcome } = await promptInstalacao.userChoice;
            if (outcome === 'accepted') {
                console.log('🎉 Barbeiro instalou o app!');
            }
            promptInstalacao = null;
            e.target.style.display = 'none';
        }
    }
});

// 3. Garante que o botão apareça ao entrar na aba Ajustes se o prompt já existir
function verificarBotaoInstalacao() {
    const btn = document.getElementById('btn-instalar');
    if (btn && promptInstalacao) {
        btn.style.display = 'block';
    }
}

function atualizarHorariosDisponiveis(dataISO) {
    if (!dataISO) return;
    
    dataSelecionadaGlobal = dataISO; 
    const container = document.getElementById('lista-horarios');
    if (!container) return;

    const dataBr = dataISO.split('-').reverse().join('/');
    
    const horariosPadrao = (dadosBarbearia && dadosBarbearia.horariosDisponiveis && dadosBarbearia.horariosDisponiveis.length > 0) 
        ? dadosBarbearia.horariosDisponiveis 
        : ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

    container.innerHTML = "<p style='color:#888;'>Verificando horários...</p>";

    db.collection("agendamentos")
      .where("data", "==", dataBr)
      .where("barbeiroVinculado", "==", barbeiroId)
      .get()
      .then((querySnapshot) => {
        let ocupados = [];
        querySnapshot.forEach(doc => {
            const agend = doc.data();
            if (agend.status !== "cancelado") {
                ocupados.push(agend.horario);
            }
        });

        container.innerHTML = horariosPadrao.map(hora => {
            const taOcupado = ocupados.includes(hora);
            return `
                <button class="btn-hora ${taOcupado ? 'ocupado' : ''}" 
                        ${taOcupado ? 'disabled' : `onclick="abrirFormulario('${hora}')"`}>
                    ${hora} ${taOcupado ? '(Ocupado)' : ''}
                </button>
            `;
        }).join('');
    }).catch(err => {
        console.error("Erro ao buscar horários:", err);
        container.innerHTML = "<p>Erro ao carregar.</p>";
    });
}

async function renderizarAbaClientes() {
    const containerLista = document.getElementById('clientes-container');
    if (!containerLista) return;

    containerLista.innerHTML = `<p style="text-align:center; color:#cca43b; padding: 20px;">Carregando ranking de clientes...</p>`;

    try {
        const snapshot = await db.collection("agendamentos")
            .where("barbeiroVinculado", "==", barbeiroId)
            .get();

        const clientesMap = new Map();

        snapshot.forEach(doc => {
    const d = doc.data();
    const nome = (d.nomeCliente || d.cliente || d.nome || "").trim();
    const fone = (d.telefoneCliente || d.telefone || d.whatsapp || "Sem número").trim();
    
    // FILTRO: Ignora bloqueios e agendamentos sem nome real
    const ehBloqueio = !nome || 
                       nome.toUpperCase().includes("BLOQUEADO") || 
                       d.status === "bloqueado";

    if (!ehBloqueio) {
        if (!clientesMap.has(nome)) {
            clientesMap.set(nome, { nome, fone, visitas: 1 });
        } else {
            const c = clientesMap.get(nome);
            c.visitas++;
            if (c.fone === "Sem número" && fone !== "Sem número") c.fone = fone;
        }
    }
});
        const ranking = Array.from(clientesMap.values()).sort((a, b) => b.visitas - a.visitas);

        let html = `<div style="display: grid; gap: 10px; margin-top: 10px;">`;
        
        ranking.forEach((c, i) => {
            const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}º`;
            const foneLimpo = c.fone.replace(/\D/g, '');
            
            html += `
                <div style="background: #1a1a1a; padding: 15px; border-radius: 12px; border: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
                    <div style="text-align: left;">
                        <strong style="color: #fff; font-size: 1.1em; display: block;">${medalha} ${c.nome}</strong>
                        ${c.fone !== "Sem número" ? 
                            `<a href="https://wa.me/${foneLimpo}" target="_blank" style="color: #25d366; text-decoration: none; font-size: 0.9em; display: flex; align-items: center; gap: 5px; margin-top: 5px;">
                                📱 ${c.fone}
                             </a>` : 
                            `<span style="color: #444; font-size: 0.9em;">📱 Sem número</span>`
                        }
                    </div>
                    <div style="background: #cca43b; color: #000; padding: 4px 12px; border-radius: 15px; font-weight: bold; font-size: 0.85em;">
                        ${c.visitas}x
                    </div>
                </div>`;
        });

        if (ranking.length === 0) {
            html = `<p style="color:#888; text-align:center; padding: 20px;">Nenhum cliente agendado ainda.</p>`;
        }
        
        containerLista.innerHTML = html + `</div>`;

    } catch (e) {
        console.error(e);
        containerLista.innerHTML = "<p style='color:red; text-align:center;'>Erro ao carregar dados.</p>";
    }
}

// Função auxiliar para comparar qual data é mais recente
function compararDatas(d1, d2) {
    const parts1 = d1.split('/');
    const parts2 = d2.split('/');
    const date1 = new Date(parts1[2], parts1[1]-1, parts1[0]);
    const date2 = new Date(parts2[2], parts2[1]-1, parts2[0]);
    return date1 > date2;
}

function compartilharLink() {
    const user = firebase.auth().currentUser;
    if (!user) return alert("Logue para compartilhar.");

    // Define o link (usa o slug se existir, senão usa o UID)
    const linkDinamico = `https://agendai-ec37a.web.app/?b=${dadosBarbearia.slug || user.uid}`;
    
    const dadosCompartilhamento = {
        title: `Agende na ${dadosBarbearia.nome}`,
        text: `Fala fera! Agora você pode agendar seu horário na ${dadosBarbearia.nome} direto pelo meu app. Escolha o melhor dia aqui:`,
        url: linkDinamico
    };

    // Verifica se o navegador suporta o compartilhamento nativo (comum em celulares)
    if (navigator.share) {
        navigator.share(dadosCompartilhamento)
            .then(() => console.log('Compartilhado com sucesso!'))
            .catch((error) => console.log('Erro ao compartilhar:', error));
    } else {
        // Caso seja um PC antigo ou navegador sem suporte, abre o zap direto
        const msgZap = `${dadosCompartilhamento.text} ${linkDinamico}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msgZap)}`, '_blank');
    }
}
function uploadLogo(input) {
    const file = input.files[0];
    if (!file) return;

    // LIMITE DE SEGURANÇA: 500KB (Metade de 1MB para garantir que o resto dos dados caiba)
    if (file.size > 512000) { 
        alert("Ops! Essa foto é muito pesada. Escolha uma imagem menor ou tire um 'print' da foto para diminuir o tamanho.");
        return;
    }

    const reader = new FileReader();
    const btn = input.nextElementSibling;
    
    btn.innerText = "Salvando... ⏳";
    btn.disabled = true;

    reader.onload = async function(e) {
    const base64Image = e.target.result;
    try {
        await db.collection("configuracoes").doc(barbeiroId).update({ logo: base64Image });
        
        // MUITO IMPORTANTE: Atualiza a variável na memória para o salvarPerfil não resetar ela
        dadosBarbearia.logo = base64Image; 

        document.getElementById('img-preview').src = base64Image;
        alert("Foto carregada! Agora clique em 'Salvar Tudo' para confirmar.");
    } catch (error) {
        console.error(error);
    }
};
    reader.readAsDataURL(file);
}
