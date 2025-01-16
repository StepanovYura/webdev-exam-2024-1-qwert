"use strict";

let apiKey = "api_key=96013b59-dec6-4b31-a2d0-b6f7d056e18c";
let mainUrl = "https://edu.std-900.ist.mospolytech.ru";

document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const filters = {
        minPrice: 100,
        maxPrice: 5000,
        discounts: false,
        sort: 'rating-desc',
    };

    async function fetchProducts() {
        let pathURL = "/exam-2024-1/api/goods";
        const response = await fetch(`${mainUrl}${pathURL}?${apiKey}`);
        const products = await response.json();
        renderProducts(products);
    }

    function renderProducts(products) {
        productList.innerHTML = '';
        products
            .filter(product => product.price >= filters.minPrice && product.price <= filters.maxPrice)
            .sort((a, b) => {
                if (filters.sort === 'price-asc') return a.price - b.price;
                if (filters.sort === 'price-desc') return b.price - a.price;
                if (filters.sort === 'rating-asc') return a.rating - b.rating;
                if (filters.sort === 'rating-desc') return b.rating - a.rating;
                return 0;
            })
            .forEach(product => {
                const productCard = document.createElement('div');
                productCard.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>${product.price} ₽</p>
                    <p>Рейтинг: ${product.rating}</p>
                `;
                productList.appendChild(productCard);
            });
    }

    document.getElementById('apply-filters').addEventListener('click', () => {
        filters.minPrice = +document.getElementById('min-price').value || 100;
        filters.maxPrice = +document.getElementById('max-price').value || 5000;
        filters.discounts = document.getElementById('discounts').checked;
        fetchProducts();
    });

    document.getElementById('sort').addEventListener('change', (e) => {
        filters.sort = e.target.value;
        fetchProducts();
    });

    fetchProducts();
});
