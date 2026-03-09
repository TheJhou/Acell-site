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

  // Fechar menu ao clicar em um link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      const icon = menuToggle.querySelector('i');
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    });
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
  contatoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const mensagem = document.getElementById('mensagem').value;

    // Criar mensagem para WhatsApp
    const whatsappMsg = encodeURIComponent(
      `Olá! Meu nome é ${nome}.\n` +
      `E-mail: ${email}\n` +
      `Telefone: ${telefone}\n\n` +
      `Mensagem: ${mensagem}`
    );

    // Mostrar mensagem de sucesso
    let successMsg = contatoForm.querySelector('.form-success');
    if (!successMsg) {
      successMsg = document.createElement('div');
      successMsg.className = 'form-success';
      successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Mensagem preparada! Você será redirecionado para o WhatsApp.';
      contatoForm.appendChild(successMsg);
    }
    successMsg.classList.add('show');

    // Redirecionar para WhatsApp após um breve delay
    setTimeout(() => {
      window.open(`https://wa.me/5500000000000?text=${whatsappMsg}`, '_blank');
    }, 1500);

    // Limpar formulário
    contatoForm.reset();

    // Esconder mensagem após 5 segundos
    setTimeout(() => {
      successMsg.classList.remove('show');
    }, 5000);
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
