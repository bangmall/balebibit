/* BaleBibit Interactive Logic */

document.addEventListener('DOMContentLoaded', () => {

    /* Sticky Header on Scroll */
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = "0 2px 15px rgba(0,0,0,0.1)";
        } else {
            header.style.boxShadow = "none";
        }
    });

    /* Mobile Menu Toggle & Overlay */
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.querySelector('.nav-menu');
    const menuOverlay = document.getElementById('menuOverlay');

    function toggleMenu() {
        navMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';

        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    mobileToggle.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);

    /* Smooth Scroll & Close Menu */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }

            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* Scroll to Top */
    const scrollTopBtn = document.getElementById('scrollTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    /* Reveal on Scroll Animation */
    const revealItems = document.querySelectorAll('[data-reveal]');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    revealItems.forEach(item => revealObserver.observe(item));

    /* Cart System */
    let cart = [];

    const cartCountEl = document.getElementById('cartCount');
    const checkoutCartListEl = document.getElementById('checkoutCartList');
    const checkoutTotalEl = document.getElementById('checkoutTotal');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');

    // Add to Cart Function
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = parseInt(btn.getAttribute('data-price'));

            // Check if item exists
            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.qty++;
            } else {
                cart.push({ id, name, price, qty: 1 });
            }

            updateCartUI();

            // Interaction Feedback
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Masuk Keranjang';
            btn.classList.add('btn-success');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-success');
            }, 1000);
        });
    });

    // Update Cart UI
    function updateCartUI() {
        // Update Header Count
        const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
        cartCountEl.innerText = totalQty;
        cartCountEl.style.transform = "scale(1.2)";
        setTimeout(() => cartCountEl.style.transform = "scale(1)", 200);

        // Update Checkout List
        checkoutCartListEl.innerHTML = '';
        let totalPrice = 0;

        if (cart.length === 0) {
            checkoutCartListEl.innerHTML = '<li class="empty-cart-msg">Keranjang masih kosong.</li>';
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.qty;
                totalPrice += itemTotal;

                // Bonus Logic: Buy 10 Get 1 Free (Per item type)
                let bonusText = "";
                if (item.qty >= 10) {
                    const bonusQty = Math.floor(item.qty / 10);
                    bonusText = `<div style="color: var(--primary); font-size: 0.8rem; margin-top:5px;">
                        <i class="fas fa-gift"></i> Bonus: Gratis ${bonusQty} Bibit!
                    </div>`;
                }

                const li = document.createElement('li');
                li.className = 'cart-item-row';
                li.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-top">
                            <span class="cart-item-name">${item.name}</span>
                            <button class="remove-item" data-index="${index}"><i class="fas fa-trash"></i></button>
                        </div>
                        <div class="cart-item-bottom">
                            <div class="qty-control">
                                <label>Jumlah:</label>
                                <input type="number" class="qty-input" value="${item.qty}" min="1" data-index="${index}">
                            </div>
                            <span class="cart-item-subtotal">Rp ${itemTotal.toLocaleString()}</span>
                        </div>
                        ${bonusText}
                    </div>
                `;
                checkoutCartListEl.appendChild(li);
            });

            // Add events for quantity change
            document.querySelectorAll('.qty-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const idx = parseInt(e.target.getAttribute('data-index'));
                    let newQty = parseInt(e.target.value);
                    if (isNaN(newQty) || newQty < 1) newQty = 1;
                    cart[idx].qty = newQty;
                    updateCartUI();
                });
            });

            // Add events for remove item
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                    cart.splice(idx, 1);
                    updateCartUI();
                });
            });
        }

        checkoutTotalEl.innerText = "Rp " + totalPrice.toLocaleString();
    }

    /* Checkout / WhatsApp Integration */
    const orderForm = document.getElementById('orderForm');

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert("Keranjang masih kosong. Silakan pilih bibit terlebih dahulu.");
            document.querySelector('#produk').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const payment = document.getElementById('payment').value;

        // Construct Message
        let message = `Halo BaleBibit, saya mau pesan bibit pepaya.%0A%0A`;
        message += `*Data Pemesan:*%0A`;
        message += `Nama: ${name}%0A`;
        message += `Alamat: ${address}%0A`;
        message += `No. HP: ${phone}%0A%0A`;

        message += `*Detail Pesanan:*%0A`;
        let grandTotal = 0;
        cart.forEach(item => {
            const subtotal = item.price * item.qty;
            grandTotal += subtotal;
            message += `- ${item.name} (${item.qty} pohon): Rp ${subtotal.toLocaleString()}%0A`;

            if (item.qty >= 10) {
                const bonusQty = Math.floor(item.qty / 10);
                message += `  _(Bonus: ${bonusQty} Pohon Gratis)_%0A`;
            }
        });

        message += `%0ATotal Tagihan: *Rp ${grandTotal.toLocaleString()}*%0A`;
        message += `Pembayaran: ${payment}%0A`;
        message += `Tolong disiapkan ya!`;

        // Open WhatsApp
        const waLink = `https://wa.me/6285955347125?text=${message}`;
        window.open(waLink, '_blank');

        // Optional: Reset form
        // orderForm.reset();
        // cart = [];
        // updateCartUI();
    });

    // Cart Icon Scroll to Order
    document.getElementById('cartBtn').addEventListener('click', () => {
        document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    });
});
