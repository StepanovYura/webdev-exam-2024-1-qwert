"use strict";
"array.js";

function applyFilters() {
    const searchText = document.querySelector('.str-request .search').value.trim().toLowerCase();  // Поиск
    const selectedCategories = Array.from(document.querySelectorAll('.sidebar input[type="checkbox"]:checked'))
        .filter(checkbox => checkbox.id !== 'onlyDiscounts')
        .map(checkbox => checkbox.id.replace('filter', '').toLowerCase());

    const minPrice = parseInt(document.querySelector('.sidebar input[placeholder="0"]').value) || 0;
    const maxPrice = parseInt(document.querySelector('.sidebar input[placeholder="15000"]').value) || 15000;
    const onlyDiscounts = document.getElementById('onlyDiscounts').checked;
    const sortOption = document.getElementById('sort-select').value;

    let filteredOffers = offers.filter(offer => {
        const inCategory = selectedCategories.length ? selectedCategories.includes(offer.category.toLowerCase()) : true;
        const inPriceRange = offer.price >= minPrice && offer.price <= maxPrice;
        const hasDiscount = onlyDiscounts ? (offer.old_price && offer.price < offer.old_price) : true;
        const matchesSearch = searchText ? offer.name.toLowerCase().includes(searchText) : true;
        return inCategory && inPriceRange && hasDiscount && matchesSearch;
    });

    filteredOffers = sortOffers(filteredOffers, sortOption);
    displayOffers(filteredOffers);
    restoreSelectedOffers();
}


function sortOffers(offersArray, sortOption) {
    return offersArray.sort((a, b) => {
        switch (sortOption) {
            case 'rating-down': return b.rating - a.rating;
            case 'rating-up': return a.rating - b.rating;
            case 'price-down': return b.price - a.price;
            case 'price-up': return a.price - b.price;
            default: return 0;
        }
    });
}

function displayOffers(filteredOffers = offers) {
    const catalogItemsContainer = document.querySelector('.catalog-items');
    catalogItemsContainer.innerHTML = "";  // Очистка каталога
    
    filteredOffers.forEach(offer => {
        const card = document.createElement('div');
        card.classList.add('offer-card');
        
        card.innerHTML = `
        <img src="${offer.image}" alt="${offer.name}" class="offer-image">
        <p class="offer-name">${offer.name}</p>
        <p class="offer-rating">Рейтинг: ${offer.rating.toFixed(1)} ⭐</p>
        <div class="offer-price">
            <span class="current-price">${offer.price} ₽</span>
            ${offer.price < offer.old_price ? `<span class="old-price">${offer.old_price} ₽</span>` : ""}
        </div>
        <button class="add-to-cart-btn" data-id="${offer.id}">Добавить</button>
        `;
        
        card.querySelector('button').onclick = () => addToCart(offer);

        catalogItemsContainer.appendChild(card);
    });
}

// Функция для добавления товара в корзину и отображения уведомления
function addToCart(offer) {
    let cart = JSON.parse(localStorage.getItem('carts')) || [];
    const existingOffer = cart.find(item => item.id === offer.id);
    if (existingOffer) {
        showNotification(`Товар "${offer.name}" уже в корзине!`, false);
        return;
    } else {
        cart.push(offer);
        localStorage.setItem('carts', JSON.stringify(cart));
        highlightSelectedOffer(offer.id);
        showNotification(`Товар "${offer.name}" добавлен в корзину!`, true);
    }
}


// Функция подсветки товара
function highlightSelectedOffer(offerId) {
    const offerCard = document.querySelector(`.add-to-cart-btn[data-id="${offerId}"]`).closest('.offer-card');
    offerCard.classList.add('selected');

    // Сохраняем выбранные товары в localStorage
    let selectedOffers = JSON.parse(localStorage.getItem('selectedOffers')) || [];
    if (!selectedOffers.includes(offerId)) {
        selectedOffers.push(offerId);
        localStorage.setItem('selectedOffers', JSON.stringify(selectedOffers));
    }
}

// Функция отображения уведомления
function showNotification(message, isSuccess) {
    const notificationContainer = document.querySelector('.notification');
    
    const notification = document.createElement('div');
    notification.classList.add('notification-item');
    notification.style.backgroundColor = isSuccess ? '#71bd6d' : '#ba5f5f';

    const text = document.createElement('span');
    text.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✖';
    closeBtn.classList.add('close-btn');
    closeBtn.onclick = () => notification.remove();

    notification.appendChild(text);
    notification.appendChild(closeBtn);
    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

//Поисковая строка
document.querySelector('.str-request form').addEventListener('submit', (event) => {
    event.preventDefault();  // Отключаем перезагрузку страницы
    applyFilters();          // Применяем все фильтры, включая поиск
});

// Восстановление подсветки при загрузке страницы или других монипуляциях с каталогом
function restoreSelectedOffers() {
    const selectedOffers = JSON.parse(localStorage.getItem('selectedOffers')) || [];
    selectedOffers.forEach(offerId => {
        highlightSelectedOffer(offerId);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    //localStorage.clear()
    displayOffers();
    restoreSelectedOffers();
    document.querySelector('.sidebar-btn').addEventListener('click', applyFilters);
    document.getElementById('sort-select').addEventListener('change', applyFilters);
});