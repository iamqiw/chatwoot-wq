function nav(active) {
  const items = [
    ['index.html', '总览'],
    ['domain-analysis.html', '业务域深度'],
    ['flow-analysis.html', '流程分析'],
    ['human-test-cases.html', '测试用例库'],
    ['domain-screenshots.html', '域截图看板'],
    ['feature-matrix.html', '功能矩阵'],
    ['captain-ai.html', 'Captain AI'],
    ['screenshots.html', '截图中心'],
    ['migration-checklist.html', '迁移验收'],
    ['limits.html', '限制说明']
  ];
  return `<nav class="nav">${items.map(([u, t]) => `<a class="${active===u?'active':''}" href="${u}">${t}</a>`).join('')}</nav>`;
}

function hero(active, subtitle='') {
  return `
    <section class="hero">
      <h1>Chatwoot 功能分析总报告（多页面交互版）</h1>
      <p>${subtitle || '用于 Java + React 重构的行为级基线与验收入口。'}</p>
      <div class="stats">
        <div class="stat"><b>${(window.SCREENSHOT_DATA||[]).length}</b><span>截图资产</span></div>
        <div class="stat"><b>702</b><span>后端路由信号</span></div>
        <div class="stat"><b>483</b><span>前端路由信号</span></div>
        <div class="stat"><b>${(window.FEATURE_DATA||[]).length}</b><span>行为规则</span></div>
      </div>
      ${nav(active)}
    </section>
  `;
}

function setupLightbox() {
  const lb = document.querySelector('#lightbox');
  if (!lb) return;
  let visible = [];
  let idx = -1;

  const img = document.querySelector('#lbImg');
  const title = document.querySelector('#lbTitle');
  const open = document.querySelector('#lbOpen');

  function render() {
    const item = visible[idx];
    if (!item) return;
    img.src = item.path;
    title.textContent = `${item.title} (${item.scope}/${item.group})`;
    open.href = item.path;
  }

  window.lightboxBind = items => {
    visible = items;
    document.querySelectorAll('.shot').forEach(card => {
      card.addEventListener('click', () => {
        idx = Number(card.dataset.idx);
        render();
        lb.classList.add('active');
      });
    });
  };

  document.querySelector('#lbPrev').addEventListener('click', () => {
    if (!visible.length) return;
    idx = (idx - 1 + visible.length) % visible.length;
    render();
  });
  document.querySelector('#lbNext').addEventListener('click', () => {
    if (!visible.length) return;
    idx = (idx + 1) % visible.length;
    render();
  });
  document.querySelector('#lbClose').addEventListener('click', e => {
    e.preventDefault();
    lb.classList.remove('active');
  });
  lb.addEventListener('click', e => {
    if (e.target.id === 'lightbox') lb.classList.remove('active');
  });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') lb.classList.remove('active');
    if (e.key === 'ArrowLeft') document.querySelector('#lbPrev').click();
    if (e.key === 'ArrowRight') document.querySelector('#lbNext').click();
  });
}
