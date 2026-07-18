// main.js - TRIJAL Wood-Pressed Oils
import { getAllProducts } from './db.js';

const WHATSAPP_NUMBER = "918296317095"; // TRIJAL WhatsApp Number

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Header Scroll Effect
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust for fixed header height
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Intersection Observer for Scroll Animations
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        animationObserver.observe(el);
    });

    // 4. Parallax Effect for Backgrounds and Images
    const parallaxElements = document.querySelectorAll('.parallax');
    const parallaxImages = document.querySelectorAll('.parallax-img');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(el => {
            const limit = el.offsetTop + el.offsetHeight;
            if (scrolled <= limit) {
                el.style.transform = `translateY(${scrolled * 0.4}px)`;
            }
        });
        
        parallaxImages.forEach(img => {
            const rect = img.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            const elementCenter = rect.top + (rect.height / 2);
            const distanceFromCenter = elementCenter - viewportCenter;
            
            if (Math.abs(distanceFromCenter) < window.innerHeight) {
                const yShift = distanceFromCenter * -0.05;
                img.style.transform = `scale(1.1) translateY(${yShift}px)`;
            }
        });
    });

    // 5. Floating Elements Animation
    const floatingContainer = document.getElementById('floating-elements');
    
    if (floatingContainer) {
        for (let i = 0; i < 15; i++) {
            createFloatingElement();
        }
    }
    
    function createFloatingElement() {
        const el = document.createElement('div');
        el.classList.add('floating-element', 'drop');
        
        const size = Math.random() * 15 + 5;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const animationDuration = Math.random() * 20 + 10;
        const animationDelay = Math.random() * 5;
        
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.left = `${left}%`;
        el.style.top = `${top}%`;
        el.style.opacity = Math.random() * 0.5 + 0.1;
        
        el.animate([
            { transform: 'translate(0, 0) rotate(0deg)' },
            { transform: `translate(${Math.random() * 50 - 25}px, -${Math.random() * 100 + 50}px) rotate(${Math.random() * 180}deg)` },
            { transform: 'translate(0, 0) rotate(360deg)' }
        ], {
            duration: animationDuration * 1000,
            iterations: Infinity,
            delay: animationDelay * 1000,
            direction: 'alternate',
            easing: 'ease-in-out'
        });
        
        floatingContainer.appendChild(el);
    }

    // 6. Dynamic Products & WhatsApp Integration
    async function renderProducts() {
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        const products = await getAllProducts();
        grid.innerHTML = '';

        products.forEach((product, index) => {
            const delay = (index + 1) * 0.1;
            
            const imageHtml = product.image 
                ? `<img src="${product.image}" alt="${product.name}" class="product-image">`
                : `<div class="placeholder-img"><span>Image Coming Soon</span></div>`;
                
            let hoverInfoHtml = '';
            if (product.hover_info && product.hover_info.length > 0) {
                hoverInfoHtml = product.hover_info.map(info => `<p>${info}</p>`).join('');
            }

            let optionsHtml = product.sizes.map((s, i) => {
                const selected = s.selected || (i===1 && !product.sizes.find(x=>x.selected)) ? 'selected' : '';
                return `<option value="${s.size}|${s.price}" ${selected}>${s.size} - ₹${s.price}</option>`;
            }).join('');

            const card = document.createElement('div');
            card.className = 'product-card fade-in-up';
            card.style.animationDelay = `${delay}s`;
            
            card.innerHTML = `
                <div class="product-image-wrapper">
                    ${imageHtml}
                    <div class="product-hover-info">
                        ${hoverInfoHtml}
                    </div>
                </div>
                <div class="product-details">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-short-desc">${product.desc}</p>
                    <div class="product-options">
                        <select class="size-select" id="select-${product.id}">
                            ${optionsHtml}
                        </select>
                    </div>
                    <div class="product-action">
                        <button class="btn btn-primary btn-full buy-btn" data-id="${product.id}" data-name="${product.name}">Buy on WhatsApp</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
            
            // Re-observe new elements
            animationObserver.observe(card);
        });

        // Add event listeners for buy buttons
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');
                const select = document.getElementById(`select-${id}`);
                
                if (select) {
                    const [size, price] = select.value.split('|');
                    const message = `Hi TRIJAL, I would like to purchase:\n\n*Product:* ${name}\n*Size:* ${size}\n*Price:* ₹${price}\n\nPlease let me know how to proceed with the payment and delivery.`;
                    
                    const encodedMessage = encodeURIComponent(message);
                    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
                    
                    window.open(whatsappUrl, '_blank');
                }
            });
        });
    }

    renderProducts();
});
