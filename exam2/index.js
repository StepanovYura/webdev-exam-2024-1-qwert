"use strict";

let productArray = [];
let orderArray = JSON.parse(localStorage.getItem("goods")) || [];
let searchParameter = "";
let onlyDiscountProducts = false;
let priceFrom = 0;
let priceTo = 100000;
let sortType = "rating-desc";
let selectedCategories = [];

async function loadProducts() {
    const fullUrl = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=96013b59-dec6-4b31-a2d0-b6f7d056e18c";
    try {
        const response = await fetch(fullUrl);
        productArray = await response.json();
        console.log("Загруженные товары:", productArray);  // ✅ Проверка загрузки товаров
        generateCategories();
        displayProducts();
    } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
    }
}

function generateCategories() {
    const categoryContainer = document.getElementById("categories");
    if (!categoryContainer) {
        console.error("Контейнер для категорий не найден.");
        return;
    }

    const categories = [...new Set(productArray.map(product => product.category).filter(Boolean))];
    console.log("Найденные категории:", categories);  // ✅ Проверка категорий

    if (categories.length === 0) {
        categoryContainer.innerHTML = "<p>Категории не найдены</p>";
        return;
    }

    categoryContainer.innerHTML = categories.map(category => `
        <label>
            <input type="checkbox" value="${category.toLowerCase()}" class="category-filter"> ${category}
        </label>
    `).join('');
}

function displayProducts() {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    let filteredProducts = productArray.filter(product => {
        if (searchParameter && !product.name.toLowerCase().includes(searchParameter.toLowerCase())) {
            return false;
        }
        if (onlyDiscountProducts && !product.discount_price) {
            return false;
        }
        const price = product.discount_price || product.actual_price;
        if (price < priceFrom || price > priceTo) {
            return false;
        }
        if (selectedCategories.length > 0 && (!product.category || !selectedCategories.includes(product.category.toLowerCase()))) {
            return false;
        }
        return true;
    });

    filteredProducts.sort((a, b) => {
        const priceA = a.discount_price || a.actual_price;
        const priceB = b.discount_price || b.actual_price;
        switch (sortType) {
            case "rating-desc": return b.rating - a.rating;
            case "rating-asc": return a.rating - b.rating;
            case "price-desc": return priceB - priceA;
            case "price-asc": return priceA - priceB;
            default: return 0;
        }
    });

    if (filteredProducts.length === 0) {
        productList.innerHTML = "<p>Товары не найдены</p>";
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement("div");
        productCard.className = "product-card";
        let discountPercent = product.discount_price ? (1 - (product.discount_price / product.actual_price)) * 100 : 0;
        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" class="product-image">
            <p class="product-name" title="${product.name}">${product.name}</p>
            <p class="product-rating">Рейтинг: ${product.rating.toFixed(1)} ⭐</p>
            <div class="product-price">
                <p>Цена: ${product.discount_price ? `${product.discount_price}₽ <del class="old-price">${product.actual_price}₽</del> <span class="discount">${Math.round(discountPercent)}%</span>` : `${product.actual_price}₽`}</p>
            </div>
            <button class="addToCart" onclick="addToCart(${product.id})">Добавить</button>
        `;
        productList.appendChild(productCard);
    });
}

function addToCart(productId) {
    if (!orderArray.includes(productId)) {
        orderArray.push(productId);
        localStorage.setItem("goods", JSON.stringify(orderArray));
        alert("Товар добавлен в корзину!");
    }
}

document.querySelector(".search-form").addEventListener("submit", function (event) {
    event.preventDefault();
    searchParameter = document.getElementById("search").value;
    displayProducts();
});

document.getElementById("apply-filters").addEventListener("click", function () {
    priceFrom = parseFloat(document.getElementById("min-price").value) || 0;
    priceTo = parseFloat(document.getElementById("max-price").value) || 100000;
    onlyDiscountProducts = document.getElementById("discounts").checked;
    selectedCategories = Array.from(document.querySelectorAll(".category-filter:checked"))
        .map(checkbox => checkbox.value);
    displayProducts();
});

document.getElementById("sort-select").addEventListener("change", function (event) {
    sortType = event.target.value;
    displayProducts();
});

window.addEventListener("DOMContentLoaded", loadProducts);
