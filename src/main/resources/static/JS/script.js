// ═══════════════════════════════════
    //  DATA STORES
    // ═══════════════════════════════════
    const db = {
      eventos: [], palestras: [], palestrantes: [],
      alunos: [], cursos: [], competencias: [],
      atribuicoes: [], associacoes: []
    };
    const ids = { eventos: 1, palestras: 1, palestrantes: 1, alunos: 1, cursos: 1, competencias: 1, atribuicoes: 1, associacoes: 1 };

    // ═══════════════════════════════════
    //  NAVIGATION
    // ═══════════════════════════════════
    const sectionMeta = {
      evento: { title: 'Cadastro de Evento', sub: 'Parte 1' },
      palestra: { title: 'Cadastro de Palestra', sub: 'Parte 2' },
      palestrante: { title: 'Cadastro de Palestrante', sub: 'Parte 3' },
      aluno: { title: 'Cadastro de Aluno', sub: 'Parte 4' },
      curso: { title: 'Cadastro de Curso', sub: 'Parte 5' },
      atribuir: { title: 'Atribuir Competência a Aluno', sub: 'Parte 6' },
      competencia: { title: 'Cadastro de Competência', sub: 'Parte 7' },
      associar: { title: 'Associar Aluno e Palestra', sub: 'Parte 8' },
    };

    function showSection(name) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.getElementById('section-' + name).classList.add('active');
      document.querySelector(`.nav-item[onclick="showSection('${name}')"]`).classList.add('active');
      document.getElementById('topbar-title').textContent = sectionMeta[name].title;
      document.getElementById('topbar-sub').textContent = '— ' + sectionMeta[name].sub;
      if (name === 'evento') refreshEventoPalestras();
      if (name === 'palestra') refreshPalestrantesList();
      if (name === 'atribuir') { refreshSelect('atr-aluno', db.alunos, 'nome'); refreshSelect('atr-competencia', db.competencias, 'nome'); }
      if (name === 'associar') { refreshSelect('ass-aluno', db.alunos, 'nome'); refreshSelect('ass-palestra', db.palestras, 'titulo'); }
    }

    // ═══════════════════════════════════
    //  UTILITIES
    // ═══════════════════════════════════
    function toast(msg, type = 'success') {
      const t = document.getElementById('toast');
      document.getElementById('toast-msg').textContent = msg;
      t.style.background = type === 'error' ? 'var(--danger)' : 'var(--accent3)';
      t.style.color = type === 'error' ? '#fff' : '#052e16';
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2800);
    }

    function clearForm() {
      document.querySelectorAll('.section.active input:not([readonly]), .section.active select, .section.active textarea').forEach(el => {
        if (el.tagName === 'SELECT') el.value = '';
        else if (el.type === 'checkbox') el.checked = false;
        else el.value = '';
      });
      // Clear tag containers
      document.querySelectorAll('.section.active .tags-container').forEach(tc => {
        tc.querySelectorAll('.tag').forEach(t => t.remove());
      });
    }

    function maskCPF(input) {
      let v = input.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      input.value = v;
    }

    function togglePass(id, btn) {
      const inp = document.getElementById(id);
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.innerHTML = show
        ? `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    }

    function getTagValues(containerId) {
      return Array.from(document.querySelectorAll(`#${containerId} .tag`)).map(t => t.dataset.value);
    }

    function addTag(event, containerId, inputId) {
      if (event.key !== 'Enter' && event.key !== ',') return;
      event.preventDefault();
      const input = document.getElementById(inputId);
      const val = input.value.trim();
      if (!val) return;
      const container = document.getElementById(containerId);
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.dataset.value = val;
      tag.innerHTML = `${val}<span class="tag-remove" onclick="this.parentElement.remove()">×</span>`;
      container.insertBefore(tag, input);
      input.value = '';
    }

    function renderDeleteBtn(store, id, renderFn) {
      return `<button class="btn btn-danger btn-sm" onclick="deleteItem('${store}',${id},${renderFn})">Excluir</button>`;
    }

    function deleteItem(store, id, renderFn) {
      const idx = db[store].findIndex(i => i.id === id);
      if (idx > -1) { db[store].splice(idx, 1); renderFn(); toast('Registro excluído'); }
    }

    function refreshSelect(selectId, arr, labelField) {
      const sel = document.getElementById(selectId);
      const cur = sel.value;
      sel.innerHTML = `<option value="">— Selecione —</option>` +
        arr.map(i => `<option value="${i.id}" ${i.id == cur ? 'selected' : ''}>${i.id} — ${i[labelField]}</option>`).join('');
    }

    // ═══════════════════════════════════
    //  PARTE 1 — EVENTO
    // ═══════════════════════════════════
    function refreshEventoPalestras() {
      const box = document.getElementById('ev-palestras-list');
      if (db.palestras.length === 0) {
        box.innerHTML = '<label style="color:var(--text-muted); font-style:italic;">Nenhuma palestra cadastrada ainda</label>';
        return;
      }
      box.innerHTML = db.palestras.map(p =>
        `<label><input type="checkbox" name="ev-palestra" value="${p.id}"> ${p.titulo}</label>`
      ).join('');
    }

    function saveEvento() {
      const titulo = document.getElementById('ev-titulo').value.trim();
      const dataInicio = document.getElementById('ev-dataInicio').value;
      const local = document.getElementById('ev-local').value.trim();
      if (!titulo || !dataInicio || !local) { toast('Preencha todos os campos obrigatórios', 'error'); return; }
      const palestras = Array.from(document.querySelectorAll('#ev-palestras-list input[type=checkbox]:checked')).map(c => parseInt(c.value));
      const ev = { id: ids.eventos++, titulo, dataInicio, local, palestras };
      db.eventos.push(ev);
      renderEventos();
      clearForm();
      toast(`Evento "${titulo}" salvo com sucesso!`);
    }

    function renderEventos() {
      const tbody = document.getElementById('ev-tbody');
      if (!db.eventos.length) { tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Nenhum evento cadastrado</td></tr>'; return; }
      tbody.innerHTML = db.eventos.map(ev => {
        const palestras = ev.palestras.map(pid => { const p = db.palestras.find(x => x.id === pid); return p ? `<span class="chip chip-blue">${p.titulo}</span>` : ''; }).join('');
        return `<tr>
      <td>${ev.id}</td><td>${ev.titulo}</td>
      <td>${ev.dataInicio}</td><td>${ev.local}</td>
      <td>${palestras || '<span style="color:var(--text-muted)">—</span>'}</td>
      <td>${renderDeleteBtn('eventos', ev.id, renderEventos)}</td>
    </tr>`;
      }).join('');
    }

    // ═══════════════════════════════════
    //  PARTE 2 — PALESTRA
    // ═══════════════════════════════════
    function refreshPalestrantesList() {
      const box = document.getElementById('pl-palestrantes-list');
      if (db.palestrantes.length === 0) {
        box.innerHTML = '<label style="color:var(--text-muted); font-style:italic;">Nenhum palestrante cadastrado ainda</label>';
        return;
      }
      box.innerHTML = db.palestrantes.map(p =>
        `<label><input type="checkbox" name="pl-palestrante" value="${p.id}"> ${p.nome}</label>`
      ).join('');
    }

    function savePalestra() {
      const titulo = document.getElementById('pl-titulo').value.trim();
      const inicio = document.getElementById('pl-inicio').value;
      const fim = document.getElementById('pl-fim').value;
      if (!titulo || !inicio || !fim) { toast('Preencha todos os campos obrigatórios', 'error'); return; }
      const competencias = getTagValues('pl-comp-tags');
      const palestrantes = Array.from(document.querySelectorAll('#pl-palestrantes-list input[type=checkbox]:checked')).map(c => parseInt(c.value));
      const pl = { id: ids.palestras++, titulo, competencias, palestrantes, inicio, fim };
      db.palestras.push(pl);
      renderPalestras();
      clearForm();
      toast(`Palestra "${titulo}" salva com sucesso!`);
    }

    function renderPalestras() {
      const tbody = document.getElementById('pl-tbody');
      if (!db.palestras.length) { tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Nenhuma palestra cadastrada</td></tr>'; return; }
      tbody.innerHTML = db.palestras.map(pl => {
        const comps = pl.competencias.map(c => `<span class="chip chip-purple">${c}</span>`).join('');
        return `<tr>
      <td>${pl.id}</td><td>${pl.titulo}</td>
      <td>${pl.inicio.replace('T', ' ')}</td><td>${pl.fim.replace('T', ' ')}</td>
      <td>${comps || '<span style="color:var(--text-muted)">—</span>'}</td>
      <td>${renderDeleteBtn('palestras', pl.id, renderPalestras)}</td>
    </tr>`;
      }).join('');
    }

    // ═══════════════════════════════════
    //  PARTE 3 — PALESTRANTE
    // ═══════════════════════════════════
    function savePalestrante() {
      const login = document.getElementById('ptr-login').value.trim();
      const senha = document.getElementById('ptr-senha').value;
      const nome = document.getElementById('ptr-nome').value.trim();
      const cpf = document.getElementById('ptr-cpf').value.trim();
      const email = document.getElementById('ptr-email').value.trim();
      if (!login || !senha || !nome || !cpf || !email) { toast('Preencha todos os campos obrigatórios', 'error'); return; }
      const formacao = getTagValues('ptr-form-tags');
      const ptr = { id: ids.palestrantes++, login, senha, nome, cpf, email, formacao };
      db.palestrantes.push(ptr);
      renderPalestrantes();
      clearForm();
      toast(`Palestrante "${nome}" salvo!`);
    }

    function renderPalestrantes() {
      const tbody = document.getElementById('ptr-tbody');
      if (!db.palestrantes.length) { tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Nenhum palestrante cadastrado</td></tr>'; return; }
      tbody.innerHTML = db.palestrantes.map(p => {
        const forms = p.formacao.map(f => `<span class="chip chip-green">${f}</span>`).join('');
        return `<tr>
      <td>${p.id}</td><td>${p.nome}</td><td>${p.login}</td>
      <td>${p.cpf}</td><td>${p.email}</td>
      <td>${forms || '<span style="color:var(--text-muted)">—</span>'}</td>
      <td>${renderDeleteBtn('palestrantes', p.id, renderPalestrantes)}</td>
    </tr>`;
      }).join('');
    }

    // ═══════════════════════════════════
    //  PARTE 4 — ALUNO
    // ═══════════════════════════════════
    function saveAluno() {
      const login = document.getElementById('al-login').value.trim();
      const senha = document.getElementById('al-senha').value;
      const nome = document.getElementById('al-nome').value.trim();
      const cpf = document.getElementById('al-cpf').value.trim();
      const email = document.getElementById('al-email').value.trim();
      const ra = document.getElementById('al-ra').value.trim();
      if (!login || !senha || !nome || !cpf || !email || !ra) { toast('Preencha todos os campos obrigatórios', 'error'); return; }
      const al = { id: ids.alunos++, login, senha, nome, cpf, email, ra };
      db.alunos.push(al);
      renderAlunos();
      clearForm();
      toast(`Aluno "${nome}" cadastrado!`);
    }

    function renderAlunos() {
      const tbody = document.getElementById('al-tbody');
      if (!db.alunos.length) { tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Nenhum aluno cadastrado</td></tr>'; return; }
      tbody.innerHTML = db.alunos.map(a =>
        `<tr>
      <td>${a.id}</td><td>${a.nome}</td><td>${a.login}</td>
      <td>${a.ra}</td><td>${a.cpf}</td><td>${a.email}</td>
      <td>${renderDeleteBtn('alunos', a.id, renderAlunos)}</td>
    </tr>`
      ).join('');
    }

    // ═══════════════════════════════════
    //  PARTE 5 — CURSO
    // ═══════════════════════════════════
    function saveCurso() {
      const nome = document.getElementById('cr-nome').value.trim();
      const sigla = document.getElementById('cr-sigla').value.trim().toUpperCase();
      if (!nome || !sigla) { toast('Preencha todos os campos obrigatórios', 'error'); return; }
      const cr = { id: ids.cursos++, nome, sigla };
      db.cursos.push(cr);
      renderCursos();
      clearForm();
      toast(`Curso "${sigla}" cadastrado!`);
    }

    function renderCursos() {
      const tbody = document.getElementById('cr-tbody');
      if (!db.cursos.length) { tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Nenhum curso cadastrado</td></tr>'; return; }
      tbody.innerHTML = db.cursos.map(c =>
        `<tr>
      <td>${c.id}</td>
      <td><span class="chip chip-blue">${c.sigla}</span></td>
      <td>${c.nome}</td>
      <td>${renderDeleteBtn('cursos', c.id, renderCursos)}</td>
    </tr>`
      ).join('');
    }

    // ═══════════════════════════════════
    //  PARTE 7 — COMPETÊNCIA
    // ═══════════════════════════════════
    function saveCompetencia() {
      const nome = document.getElementById('comp-nome').value.trim();
      const nivelMax = parseInt(document.getElementById('comp-nivel-max').value);
      if (!nome || !nivelMax) { toast('Preencha todos os campos obrigatórios', 'error'); return; }
      const comp = { id: ids.competencias++, nome, nivel_maximo: nivelMax };
      db.competencias.push(comp);
      renderCompetencias();
      clearForm();
      toast(`Competência "${nome}" cadastrada!`);
    }

    function renderCompetencias() {
      const tbody = document.getElementById('comp-tbody');
      if (!db.competencias.length) { tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Nenhuma competência cadastrada</td></tr>'; return; }
      tbody.innerHTML = db.competencias.map(c =>
        `<tr>
      <td>${c.id}</td><td>${c.nome}</td>
      <td><span class="chip chip-purple">${c.nivel_maximo}</span></td>
      <td>${renderDeleteBtn('competencias', c.id, renderCompetencias)}</td>
    </tr>`
      ).join('');
    }

    // ═══════════════════════════════════
    //  PARTE 6 — ATRIBUIR COMPETÊNCIA
    // ═══════════════════════════════════
    function saveAtribuicao() {
      const nome = document.getElementById('atr-nome').value.trim();
      const alunoId = parseInt(document.getElementById('atr-aluno').value);
      const compId = parseInt(document.getElementById('atr-competencia').value);
      const horas = parseFloat(document.getElementById('atr-horas').value);
      const nivel = parseInt(document.getElementById('atr-nivel').value);
      if (!nome || !alunoId || !compId || isNaN(horas) || isNaN(nivel)) { toast('Preencha todos os campos obrigatórios', 'error'); return; }
      const aluno = db.alunos.find(a => a.id === alunoId);
      const comp = db.competencias.find(c => c.id === compId);
      const atr = { id: ids.atribuicoes++, nome, alunoId, compId, horas, nivel };
      db.atribuicoes.push(atr);
      renderAtribuicoes();
      clearForm();
      toast(`Competência atribuída a ${aluno.nome}!`);
    }

    function renderAtribuicoes() {
      const tbody = document.getElementById('atr-tbody');
      if (!db.atribuicoes.length) { tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Nenhuma atribuição registrada</td></tr>'; return; }
      tbody.innerHTML = db.atribuicoes.map(a => {
        const aluno = db.alunos.find(x => x.id === a.alunoId);
        const comp = db.competencias.find(x => x.id === a.compId);
        return `<tr>
      <td>${a.id}</td><td>${a.nome}</td>
      <td>${aluno ? aluno.nome : '—'}</td>
      <td>${comp ? comp.nome : '—'}</td>
      <td>${a.horas}h</td>
      <td><span class="chip chip-purple">${a.nivel}</span></td>
      <td>${renderDeleteBtn('atribuicoes', a.id, renderAtribuicoes)}</td>
    </tr>`;
      }).join('');
    }

    // ═══════════════════════════════════
    //  PARTE 8 — ASSOCIAR ALUNO × PALESTRA
    // ═══════════════════════════════════
    function saveAssociacao() {
      const alunoId = parseInt(document.getElementById('ass-aluno').value);
      const palestraId = parseInt(document.getElementById('ass-palestra').value);
      const entrada = document.getElementById('ass-entrada').value;
      const saida = document.getElementById('ass-saida').value;
      if (!alunoId || !palestraId || !entrada || !saida) { toast('Preencha todos os campos obrigatórios', 'error'); return; }
      const aluno = db.alunos.find(a => a.id === alunoId);
      const palestra = db.palestras.find(p => p.id === palestraId);
      const ass = { id: ids.associacoes++, alunoId, palestraId, entrada, saida };
      db.associacoes.push(ass);
      renderAssociacoes();
      clearForm();
      toast(`${aluno.nome} associado a "${palestra.titulo}"!`);
    }

    function renderAssociacoes() {
      const tbody = document.getElementById('ass-tbody');
      if (!db.associacoes.length) { tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Nenhuma associação registrada</td></tr>'; return; }
      tbody.innerHTML = db.associacoes.map(a => {
        const aluno = db.alunos.find(x => x.id === a.alunoId);
        const palestra = db.palestras.find(x => x.id === a.palestraId);
        return `<tr>
      <td>${a.id}</td>
      <td>${aluno ? aluno.nome : '—'}</td>
      <td>${palestra ? palestra.titulo : '—'}</td>
      <td>${a.entrada.replace('T', ' ')}</td>
      <td>${a.saida.replace('T', ' ')}</td>
      <td>${renderDeleteBtn('associacoes', a.id, renderAssociacoes)}</td>
    </tr>`;
      }).join('');
    }