"use strict";

// Функция для отображения корзины и подсчёта общей стоимости
function displayCart() {
    const cart = JSON.parse(localStorage.getItem('carts')) || [];
    const cartContainer = document.querySelector('.basket-items');
    const totalPriceElement = document.getElementById('total');
    const deliveryPriceElement = document.getElementById('delivery-price');    let totalPrice = 0;

    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Корзина пуста</p>';
        totalPriceElement.textContent = '0 ₽';
        deliveryPriceElement.textContent = '0 ₽';
        return;
    }

    cart.forEach(offer => {
        const item = document.createElement('div');
        item.classList.add('cart-item');
        item.innerHTML = `
        <img src="${offer.image}" alt="${offer.name}" class="offer-image">
        <p class="offer-name">${offer.name}</p>
        <p class="offer-rating">Рейтинг: ${offer.rating.toFixed(1)} ⭐</p>
        <div class="offer-price">
            <span class="current-price">${offer.price} ₽</span>
            ${offer.price < offer.old_price ? `<span class="old-price">${offer.old_price} ₽</span>` : ""}
        </div>
        <button class="remove-item" data-id="${offer.id}">Удалить</button>
        `;
        cartContainer.appendChild(item);
        totalPrice += offer.price;
    });
    totalPriceElement.textContent = `${totalPrice} ₽`;
    updateDeliveryPrice(totalPrice); 
}

// Функция для удаления товара из корзины с подтверждением
function removeFromCart(offerId) {
    let cart = JSON.parse(localStorage.getItem('carts')) || [];
    cart = cart.filter(item => item.id != Number(offerId));
    localStorage.setItem('carts', JSON.stringify(cart));
    unhighlightOffer(offerId);
    displayCart();
}

// Функция для снятия подсветки
function unhighlightOffer(offerId) {
    let selectedOffers = JSON.parse(localStorage.getItem('selectedOffers')) || [];
    selectedOffers = selectedOffers.filter(id => id != offerId);
    localStorage.setItem('selectedOffers', JSON.stringify(selectedOffers));
}

// Функция для снятия подсветки у всех элементов
function unhighlightOfferAll() {
    let selectedOffers = JSON.parse(localStorage.getItem('selectedOffers')) || [];
    selectedOffers = [];
    localStorage.setItem('selectedOffers', JSON.stringify(selectedOffers));
}

// Обработчик нажатия кнопки "Удалить"
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-item')) {
        const offerId = event.target.dataset.id;
        let cart = JSON.parse(localStorage.getItem('carts')) || [];
        const offer = cart.find(item => item.id == offerId); // Находим товар по id
        if (offer) {
            notificationDel(offer); // Передаём весь объект товара
        }
    }
});

// Сброс корзины и формы с подтверждением
const resetButton = document.querySelector('.reset-btn');
resetButton.addEventListener('click', function(event) {
    event.preventDefault();
    if (notificationDelAll()) {
        orderForm.reset();
    }
});

// Расчёт стоимости доставки
function updateDeliveryPrice(cartTotal) {
    const deliveryPriceElement = document.getElementById('delivery-price');
    const dateInput = document.getElementById('client-date').value;
    const timeInput = document.getElementById('client-time').value;
    
    let deliveryCost = 200;

    if (dateInput) {
        const selectedDate = new Date(dateInput);
        const day = selectedDate.getDay();
        const hour = parseInt(timeInput.split(':')[0]) || 0;

        if (day === 0 || day === 6) {
            deliveryCost += 300;
        } else if (hour >= 18) {
            deliveryCost += 200;
        }
    }

    deliveryPriceElement.textContent = `${deliveryCost + cartTotal} ₽`;
}

// Отправка формы с корзиной
const orderForm = document.querySelector('form');
orderForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(orderForm);
    const cart = JSON.parse(localStorage.getItem('carts')) || [];

    formData.append('cart', JSON.stringify(cart));

    // Добавляем итоговую стоимость с доставкой
    const totalWithDelivery = document.getElementById('delivery-price').textContent;
    formData.append('total-price', totalWithDelivery);

    fetch(orderForm.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        localStorage.removeItem('carts');
        displayCart();
        unhighlightOfferAll();
        notificationConfirm();
    })
    .catch(error => {
        alert('Ошибка при оформлении заказа. Попробуйте снова.');
        console.error('Ошибка:', error);
    });
});

function notificationDel(offer) {
    if (document.querySelector('.sms')) return;
    
    const sms = document.createElement('div');
    sms.classList.add('sms');

    const Text = document.createElement('p');
    Text.textContent = "Уверены, что хотите удалить товар из корзины?";
    sms.appendChild(Text);

    const YestButton = document.createElement('button');
    const NoButton = document.createElement('button');

    YestButton.textContent = 'Да';
    NoButton.textContent = 'Нет';

    YestButton.classList.add('sms-btn');
    NoButton.classList.add('sms-btn');

    NoButton.addEventListener('click', () => sms.remove());
    YestButton.addEventListener('click', () => {
        sms.remove();
        showNotification(`Товар "${offer.name}" удалён из корзины`, true); //допилить
        removeFromCart(offer.id);
    });
    sms.appendChild(YestButton);
    sms.appendChild(NoButton);

    document.body.appendChild(sms);
}

function notificationDelAll() {
    if (document.querySelector('.sms')) return;

    const sms = document.createElement('div');
    sms.classList.add('sms');

    const Text = document.createElement('p');
    Text.textContent = "Уверены, что хотите очистить корзину?";
    sms.appendChild(Text);

    const YestButton = document.createElement('button');
    const NoButton = document.createElement('button');

    YestButton.textContent = 'Да';
    NoButton.textContent = 'Нет';

    YestButton.classList.add('sms-btn');
    NoButton.classList.add('sms-btn');

    NoButton.addEventListener('click', () => {
        sms.remove();
    });
    YestButton.addEventListener('click', () => {
        sms.remove();
        showNotification('Корзина очищена', true); //допилить
        localStorage.removeItem('carts');
        displayCart();
        unhighlightOfferAll();
        orderForm.reset();
    });
    sms.appendChild(YestButton);
    sms.appendChild(NoButton);

    document.body.appendChild(sms);
}

function notificationConfirm() {
    if (document.querySelector('.sms')) return;

    const sms = document.createElement('div');
    sms.classList.add('sms');

    const Text = document.createElement('p');
    Text.textContent = 'Заказ оформлен! Для отслеживания заказа перейдите в личный кабинет';
    sms.appendChild(Text);

    const closeButton = document.createElement('button');

    closeButton.textContent = 'Окей👌';

    closeButton.classList.add('sms-btn');

    closeButton.addEventListener('click', () => {
        sms.remove();
        window.location.href = 'index.html';
    });
    sms.appendChild(closeButton);

    document.body.appendChild(sms);
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

// Показываем корзину при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    displayCart();
    // Динамическое обновление доставки
    document.getElementById('client-date').addEventListener('change', () => displayCart());
    document.getElementById('client-time').addEventListener('change', () => displayCart());
});