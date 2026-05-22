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
    const contatoForm = document.getElementById('contato-form');
    if (contatoForm) {
      contatoForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const contatoSection = document.getElementById('contato');
      if (contatoSection) {
        contatoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  });
}

const SELECTED_SERVICES_KEY = 'acell:selected-services';

function getSelectedServices() {
  try {
    const data = JSON.parse(localStorage.getItem(SELECTED_SERVICES_KEY) || '[]');
    return Array.isArray(data) ? data.filter(item => item && item.nome) : [];
  } catch {
    return [];
  }
}

function saveSelectedServices(services) {
  localStorage.setItem(SELECTED_SERVICES_KEY, JSON.stringify(services));
}

function clearSelectedServices() {
  localStorage.removeItem(SELECTED_SERVICES_KEY);
}

function slugifyServiceName(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildServiceObject(card) {
  const name = card.querySelector('span')?.textContent?.trim() || '';
  const category = card.closest('.service-category')?.dataset.category || '';
  return {
    id: `${category}-${slugifyServiceName(name)}`,
    nome: name,
    categoria: category,
  };
}

function serviceExists(services, serviceId) {
  return services.some(service => service.id === serviceId);
}

function renderSelectedServicesInForm() {
  const box = document.getElementById('selected-services-box');
  const list = document.getElementById('selected-services-list');
  const clearBtn = document.getElementById('selected-services-clear');

  if (!box || !list) return;

  const services = getSelectedServices();
  box.style.display = services.length ? 'block' : 'none';
  list.innerHTML = services.map(service => `
    <span class="selected-service-chip">
      ${service.nome}
      <button type="button" class="selected-service-remove" data-remove-service="${service.id}" aria-label="Remover ${service.nome}">
        <i class="fas fa-times"></i>
      </button>
    </span>
  `).join('');

  if (clearBtn) {
    clearBtn.style.display = services.length ? 'inline-flex' : 'none';
  }
}

function syncServiceCards() {
  const selectedServices = getSelectedServices();
  document.querySelectorAll('.service-card[data-service-selectable="true"]').forEach(card => {
    const service = buildServiceObject(card);
    const isSelected = serviceExists(selectedServices, service.id);
    card.classList.toggle('selected', isSelected);
    card.setAttribute('aria-pressed', String(isSelected));
    card.setAttribute('title', isSelected ? 'Serviço selecionado' : 'Clique para selecionar este serviço');
    const action = card.querySelector('.service-card-action');
    if (action) {
      action.textContent = isSelected ? 'Remover' : 'Adicionar';
    }
    const status = card.querySelector('.service-card-status');
    if (status) {
      status.textContent = isSelected ? 'Selecionado' : 'Disponível';
    }
  });
}

function renderServicesCart() {
  const cart = document.getElementById('services-cart');
  const count = document.getElementById('services-cart-count');
  const list = document.getElementById('services-cart-list');
  const clearBtn = document.getElementById('services-cart-clear');

  if (!cart || !count || !list) return;

  const services = getSelectedServices();
  cart.style.display = services.length ? 'block' : 'none';
  count.textContent = String(services.length);
  list.innerHTML = services.map(service => `
    <span class="services-cart-chip">
      ${service.nome}
      <button type="button" class="services-cart-remove" data-remove-service="${service.id}" aria-label="Remover ${service.nome}">
        <i class="fas fa-times"></i>
      </button>
    </span>
  `).join('');

  if (clearBtn) {
    clearBtn.style.display = services.length ? 'inline-flex' : 'inline-flex';
  }
}

function removeSelectedService(serviceId) {
  const next = getSelectedServices().filter(service => service.id !== serviceId);
  saveSelectedServices(next);
  renderSelectedServicesInForm();
  renderServicesCart();
  syncServiceCards();
}

function initSelectedServicesExperience() {
  const serviceCards = document.querySelectorAll('.service-card:not(.service-card-subtitle)');

  serviceCards.forEach(card => {
    const name = card.querySelector('span')?.textContent?.trim();
    if (!name) return;

    card.dataset.serviceSelectable = 'true';
    card.dataset.serviceName = name;
    card.setAttribute('role', 'button');
    if (!card.querySelector('.service-card-action')) {
      const action = document.createElement('span');
      action.className = 'service-card-action';
      action.textContent = 'Adicionar';
      card.appendChild(action);
    }
    if (!card.querySelector('.service-card-status')) {
      const status = document.createElement('span');
      status.className = 'service-card-status';
      status.textContent = 'Disponível';
      card.appendChild(status);
    }

    card.addEventListener('click', (e) => {
      e.preventDefault();
      const services = getSelectedServices();
      const service = buildServiceObject(card);
      const next = serviceExists(services, service.id)
        ? services.filter(item => item.id !== service.id)
        : [...services, service].slice(0, 15);

      saveSelectedServices(next);
      renderServicesCart();
      renderSelectedServicesInForm();
      syncServiceCards();
    });
  });

  document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-remove-service]');
    if (!removeBtn) return;
    e.preventDefault();
    removeSelectedService(removeBtn.dataset.removeService);
  });

  const cartClear = document.getElementById('services-cart-clear');
  if (cartClear) {
    cartClear.addEventListener('click', () => {
      clearSelectedServices();
      renderServicesCart();
      renderSelectedServicesInForm();
      syncServiceCards();
    });
  }

  const formClear = document.getElementById('selected-services-clear');
  if (formClear) {
    formClear.addEventListener('click', () => {
      clearSelectedServices();
      renderSelectedServicesInForm();
      renderServicesCart();
      syncServiceCards();
    });
  }

  document.querySelectorAll('.services-checkout-link, #services-cart-action').forEach(link => {
    link.addEventListener('click', () => {
      saveSelectedServices(getSelectedServices());
    });
  });

  document.querySelectorAll('a[href^="index.html#"]').forEach(link => {
    link.addEventListener('click', () => {
      saveSelectedServices(getSelectedServices());
    });
  });

  renderServicesCart();
  renderSelectedServicesInForm();
  syncServiceCards();
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
    const modal = document.getElementById('success-modal');
    if (modal) {
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  contatoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();
    const servicos = getSelectedServices().map(service => service.nome);
    const hasServices = servicos.length > 0;

    const box = ensureMessageBox();

    // Validações no cliente
    if (!nome || nome.length < 2) return showError(box, 'Por favor, informe seu nome completo.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError(box, 'E-mail inválido.');
    if (!telefone || telefone.replace(/\D/g, '').length < 10) return showError(box, 'Telefone inválido. Inclua DDD.');
    if (!hasServices && (!mensagem || mensagem.length < 10)) return showError(box, 'A mensagem precisa ter pelo menos 10 caracteres.');
    if (mensagem.length > 2000) return showError(box, 'Mensagem muito longa (máx. 2000 caracteres).');

    const proposalBtn = document.getElementById('btn-proposal');
    const meetingBtn = document.getElementById('btn-meeting');
    
    if (proposalBtn) {
      proposalBtn.disabled = true;
      proposalBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    }
    if (meetingBtn) {
      meetingBtn.disabled = true;
      meetingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone, mensagem, servicos }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        showSuccess(box, nome, email, telefone, mensagem);
        contatoForm.reset();
        clearSelectedServices();
        renderSelectedServicesInForm();
        renderServicesCart();
        syncServiceCards();
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
      if (proposalBtn) {
        proposalBtn.disabled = false;
        proposalBtn.innerHTML = '<i class="fas fa-file-alt"></i> Enviar proposta';
      }
      if (meetingBtn) {
        meetingBtn.disabled = false;
        meetingBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> Agendar reunião';
      }
    }
  });

  // Handle split button clicks
  const proposalBtn = document.getElementById('btn-proposal');
  const meetingBtn = document.getElementById('btn-meeting');

  if (proposalBtn) {
    proposalBtn.addEventListener('click', () => {
      const mensagemField = document.getElementById('mensagem');
      const servicos = getSelectedServices();
      
      if (servicos.length > 0) {
        mensagemField.value = mensagemField.value.trim() || 'Gostaria de receber uma proposta para os serviços selecionados.';
      }
      
      contatoForm.dispatchEvent(new Event('submit'));
    });
  }

  if (meetingBtn) {
    meetingBtn.addEventListener('click', () => {
      const mensagemField = document.getElementById('mensagem');
      const servicos = getSelectedServices();
      
      if (servicos.length > 0) {
        mensagemField.value = mensagemField.value.trim() || 'Gostaria de agendar uma reunião para discutir os serviços selecionados.';
      } else {
        mensagemField.value = mensagemField.value.trim() || 'Gostaria de agendar uma reunião.';
      }
      
      contatoForm.dispatchEvent(new Event('submit'));
    });
  }

  // Modal close handlers
  const modal = document.getElementById('success-modal');
  const modalBackdrop = document.getElementById('success-modal-backdrop');
  const modalCloseBtn = document.getElementById('success-modal-close');

  const closeModal = () => {
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }
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
    let visibleServices = 0;

    serviceCategories.forEach((section) => {
      const sectionCategory = section.dataset.category;
      const matchesCategory = activeCategory === 'todos' || sectionCategory === activeCategory;
      const cards = Array.from(section.querySelectorAll('.service-card:not(.service-card-subtitle)'));
      const subtitles = Array.from(section.querySelectorAll('.service-card-subtitle'));

      if (!matchesCategory) {
        section.style.display = 'none';
        cards.forEach((card) => {
          card.style.display = 'none';
        });
        subtitles.forEach((subtitle) => {
          subtitle.style.display = 'none';
        });
        return;
      }

      let sectionVisibleServices = 0;
      cards.forEach((card) => {
        const serviceName = (card.dataset.serviceName || card.textContent || '').toLowerCase();
        const shouldShowCard = !query || serviceName.includes(query);
        card.style.display = shouldShowCard ? '' : 'none';
        if (shouldShowCard) {
          sectionVisibleServices += 1;
        }
      });

      subtitles.forEach((subtitle) => {
        subtitle.style.display = sectionVisibleServices > 0 ? '' : 'none';
      });

      const shouldShowSection = sectionVisibleServices > 0;
      section.style.display = shouldShowSection ? '' : 'none';

      if (shouldShowSection) {
        visibleCount += 1;
        visibleServices += sectionVisibleServices;
      }
    });

    if (resultCount) {
      resultCount.textContent = visibleServices === 0
        ? 'Nenhum serviço encontrado'
        : `${visibleServices} serviço${visibleServices > 1 ? 's' : ''} em ${visibleCount} categoria${visibleCount > 1 ? 's' : ''}`;
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
document.addEventListener('DOMContentLoaded', initSelectedServicesExperience);

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
