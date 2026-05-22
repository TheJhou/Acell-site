// ================= MENU MOBILE =================
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const icon = menuToggle.querySelector('i');
    if (navMenu.classList.contains('open')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-times');
    } else {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  });

  const closeMenu = () => {
    if (!navMenu.classList.contains('open')) return;
    navMenu.classList.remove('open');
    const icon = menuToggle.querySelector('i');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
  };

  // Fechar menu ao clicar em um link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fechar menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (!navMenu.classList.contains('open')) return;
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      closeMenu();
    }
  });

  // Fechar menu com tecla Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

// ================= HEADER SCROLL =================
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ================= BOTÃO VOLTAR AO TOPO =================
const btnTopo = document.getElementById('btn-topo');

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    btnTopo.classList.add('visible');
  } else {
    btnTopo.classList.remove('visible');
  }
});

if (btnTopo) {
  btnTopo.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ================= ANIMAÇÃO DE NÚMEROS =================
function animateNumbers() {
  const numeros = document.querySelectorAll('.numero');
  
  numeros.forEach(numero => {
    const target = parseInt(numero.getAttribute('data-target'));
    if (!target) return;
    
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      numero.textContent = Math.floor(current);
    }, 16);
  });
}

// Observer para animar números quando entrar na tela
const sobreSection = document.querySelector('.sobre');
if (sobreSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumbers();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(sobreSection);
}

// ================= ANIMAÇÕES DE SCROLL =================
function initScrollAnimations() {
  const elements = document.querySelectorAll(
    '.card, .diferencial-item, .servico-detalhe, .sobre-grid, .contato-container'
  );

  elements.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', initScrollAnimations);

// ================= FORMULÁRIO DE CONTATO =================
const contatoForm = document.getElementById('contato-form');

if (contatoForm) {
  const WHATSAPP_NUMBER = '5511983846167';
  const FETCH_TIMEOUT_MS = 20000;

  const ensureMessageBox = () => {
    let box = contatoForm.querySelector('.form-success');
    if (!box) {
      box = document.createElement('div');
      box.className = 'form-success';
      contatoForm.appendChild(box);
    }
    box.classList.remove('is-error');
    // Reexibe o WhatsApp flutuante caso esteja oculto de um envio anterior
    const fab = document.querySelector('.botao-whatsapp');
    if (fab) fab.classList.remove('is-hidden');
    return box;
  };

  const showError = (box, text) => {
    box.innerHTML = `<i class="fas fa-times-circle"></i> ${text}`;
    box.classList.add('show', 'is-error');
  };

  const floatingWpp = document.querySelector('.botao-whatsapp');

  const showSuccess = (box, nome, email, telefone, mensagem) => {
    const wppText = encodeURIComponent(
      `Olá! Meu nome é ${nome}.\nE-mail: ${email}\nTelefone: ${telefone}\n\nMensagem: ${mensagem}`
    );
    const wppLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${wppText}`;
    box.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <strong>Mensagem enviada!</strong> Entraremos em contato em breve.
      <a href="${wppLink}" target="_blank" rel="noopener" class="btn-wpp-inline">
        <i class="fab fa-whatsapp"></i> Falar agora no WhatsApp
      </a>
    `;
    box.classList.add('show');

    // Esconde o WhatsApp flutuante para não sobrepor a mensagem
    if (floatingWpp) floatingWpp.classList.add('is-hidden');

    // Rola até a mensagem para garantir visibilidade
    requestAnimationFrame(() => {
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  contatoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contatoForm.querySelector('button[type="submit"]');
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();

    const box = ensureMessageBox();

    // Validações no cliente
    if (nome.length < 2) return showError(box, 'Por favor, informe seu nome completo.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError(box, 'E-mail inválido.');
    if (telefone.replace(/\D/g, '').length < 10) return showError(box, 'Telefone inválido. Inclua DDD.');
    if (mensagem.length < 10) return showError(box, 'A mensagem precisa ter pelo menos 10 caracteres.');
    if (mensagem.length > 2000) return showError(box, 'Mensagem muito longa (máx. 2000 caracteres).');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone, mensagem }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        showSuccess(box, nome, email, telefone, mensagem);
        contatoForm.reset();
      } else {
        let erro = 'Erro ao enviar. Tente novamente.';
        try {
          const data = await res.json();
          if (data && data.erro) erro = data.erro;
        } catch (_) {}
        showError(box, erro);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        showError(box, 'O servidor demorou para responder. Tente novamente em instantes.');
      } else {
        showError(box, 'Falha na conexão. Verifique sua internet e tente novamente.');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
    }
  });
}

// ================= MÁSCARA DE TELEFONE =================
const telefoneInput = document.getElementById('telefone');

if (telefoneInput) {
  telefoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length > 6) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      } else if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else if (value.length > 0) {
        value = `(${value}`;
      }
    }
    
    e.target.value = value;
  });
}

// ================= FILTROS DA PÁGINA DE SERVIÇOS =================
function initServiceFilters() {
  const categoryButtons = document.querySelectorAll('.category-btn');
  const serviceCategories = document.querySelectorAll('.service-category');
  const searchInput = document.getElementById('search-servicos');
  const clearSearchButton = document.getElementById('clear-search');
  const resultCount = document.getElementById('result-count');
  const noResults = document.getElementById('no-results');

  if (!categoryButtons.length || !serviceCategories.length) {
    return;
  }

  const updateResults = (activeCategory = 'todos') => {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let visibleCount = 0;

    serviceCategories.forEach((section) => {
      const sectionCategory = section.dataset.category;
      const matchesCategory = activeCategory === 'todos' || sectionCategory === activeCategory;
      const textContent = section.textContent.toLowerCase();
      const matchesSearch = !query || textContent.includes(query);
      const shouldShow = matchesCategory && matchesSearch;

      section.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visibleCount += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = visibleCount === 0
        ? 'Nenhuma categoria encontrada'
        : `${visibleCount} categoria${visibleCount > 1 ? 's' : ''} encontrada${visibleCount > 1 ? 's' : ''}`;
    }

    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };

  const setActiveCategory = (category, scrollToSection = false) => {
    const validCategory = Array.from(categoryButtons).some((button) => button.dataset.category === category)
      ? category
      : 'todos';

    categoryButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.category === validCategory);
    });

    updateResults(validCategory);

    if (scrollToSection && validCategory !== 'todos') {
      const targetSection = document.querySelector(`.service-category[data-category="${validCategory}"]`);
      if (targetSection) {
        const headerHeight = document.getElementById('header')?.offsetHeight || 0;
        const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    }
  };

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveCategory(button.dataset.category, true);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const activeButton = document.querySelector('.category-btn.active');
      const activeCategory = activeButton ? activeButton.dataset.category : 'todos';
      updateResults(activeCategory);
    });
  }

  if (clearSearchButton && searchInput) {
    clearSearchButton.addEventListener('click', () => {
      searchInput.value = '';
      const activeButton = document.querySelector('.category-btn.active');
      const activeCategory = activeButton ? activeButton.dataset.category : 'todos';
      updateResults(activeCategory);
      searchInput.focus();
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('categoria') || 'todos';
  setActiveCategory(initialCategory, initialCategory !== 'todos');
}

document.addEventListener('DOMContentLoaded', initServiceFilters);

// ================= SMOOTH SCROLL PARA LINKS INTERNOS =================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      const headerHeight = document.getElementById('header').offsetHeight;
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});
