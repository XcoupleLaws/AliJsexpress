document.addEventListener('DOMContentLoaded', () => {
    "use strict";
    const search = document.querySelector('.search'),
            cartBtn = document.getElementById('cart'),
            wishlistBtn = document.getElementById('wishlist'),
            goodsWrapper = document.querySelector('.goods-wrapper'),
            cart = document.querySelector('.cart'),
            category = document.querySelector('.category'),
            wishCounter = wishlistBtn.querySelector('.counter'),
            cartCounter = cartBtn.querySelector('.counter'),
            cartWrapper = document.querySelector('.cart-wrapper');
    
    
    const wishlist= [];
    const cartlist= {};
        



    const loading = (nameFunc) =>{
        const spinner= `<div id="spinner">
        <div class="spinner-loading"><div><div><div></div></div>
        <div><div></div></div><div><div></div></div>
        <div><div></div></div></div></div>
        </div>`;
        if(nameFunc=== 'renderCard'){
            goodsWrapper.innerHTML= spinner;
        }

        if(nameFunc=== 'renderCart'){
            cartWrapper.innerHTML= spinner;
        }

    };


    //Запрос на сервер  
    const getGoods = (filter, handler) =>{
        loading(handler.name);
        fetch('./db/db.json')
        .then(response=>response.json())
            .then(filter)
                .then(handler);
    };
    


    //Генерация карточек

    const createCardGoods= (id, title, price, img) =>{
        const card = document.createElement('div');
        card.className= "card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3";
        card.innerHTML= `<div class="card">
                                <div class="card-img-wrapper">
                                    <img class="card-img-top" src="${img}" alt="">
                                    <button class="card-add-wishlist ${wishlist.includes(id)? 'active': ''}"
                                        data-goods-id="${id}"></button>
                                </div>
                                <div class="card-body justify-content-between">
                                    <a href="#" class="card-title">${title}</a>
                                    <div class="card-price">${price} ₽</div>
                                    <div>
                                        <button class="card-add-cart" data-goods-id="${id}">Добавить в корзину</button>
                                    </div>
                                </div>
                            </div>
                        `;
        return card;
    };
    
    const createCardCart= (id, title, price, img) =>{
        const card = document.createElement('div');
        card.className= "goods";
        card.innerHTML= `   <div class="goods-img-wrapper">
                                <img class="goods-img" src="${img}" alt="">

                            </div>
                            <div class="goods-description">
                                <h2 class="goods-title">${title}</h2>
                                <p class="goods-price">${price} ₽</p>

                            </div>
                            <div class="goods-price-count">
                                <div class="goods-trigger">
                                    <button class="goods-add-wishlist ${wishlist.includes(id)? 'active': ''}"
                                    data-goods-id="${id}"></button>
                                    <button class="goods-delete"
                                    data-goods-id="${id}"></button>
                                </div>
                                <div class="goods-count">${cartlist[id]}</div>
                            </div>
                        `;
        return card;
    };



    //Рендер карточек

    const renderCard = items => {
        goodsWrapper.textContent= '';
        if(items.length){
            items.forEach(item=>{
                const { id, title, price, imgMin } = item;
                goodsWrapper.appendChild(createCardGoods(id, title, price, imgMin));
            });
        }else{
            goodsWrapper.textContent= '❌ Извините, мы не нашли товаров по вашему запросу!';
        }
    };
 
    const renderCart = items => {
        cartWrapper.textContent= '';            
        if(items.length){
            items.forEach(item=>{
                const { id, title, price, imgMin } = item;
                cartWrapper.appendChild(createCardCart(id, title, price, imgMin));
            });
        }else{
            cartWrapper.innerHTML= `<div id="cart-empty">
                                    Ваша корзина пока пуста
                                </div>`;
        }
    };



    //Калькуляция

    const countChecker= () =>{
        wishCounter.textContent= wishlist.length;
        cartCounter.textContent= Object.keys(cartlist).length;
    };

    const calcTotalPrice = array =>{
        let totalPrice= array.reduce((accum,item)=>{
            return accum+item.price*cartlist[item.id];
        },0);
        cart.querySelector('.cart-total>span').textContent= totalPrice.toFixed(2);
    };


    //Фильтры

    const filterCart = items =>{ 
        const cartFilter= items.filter(item=> cartlist[item.id]);
        calcTotalPrice(cartFilter);
        console.log('cartFilter: ', cartFilter);
        return cartFilter;
        
    };
    
    const randomSort =(items)=>{
        items.sort(()=>Math.random()-0.5);
        return items;
    };
    
    const renderWish = () =>{
        getGoods(items=> items.filter(item=> wishlist.includes(item.id)), renderCard);
    };



    //Работа с хранилищами

    const getCookie= name => {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
      };
    
    const localQuery = get =>{
        if(get){
            if(localStorage.getItem('wishlist')){
                wishlist.push(...JSON.parse(localStorage.getItem('wishlist')));
                countChecker();
            }
        }else{
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
        
    };

    const cookieQuery = (get)=>{
        if(get){
            if(getCookie('cartlist')){
                Object.assign(cartlist, JSON.parse(getCookie('cartlist')));
                countChecker();
            }
            
        }else{
            document.cookie = `cartlist=${JSON.stringify(cartlist)}; max-age=86400e3`;
        }
    };




    //События

    const closeCart= (event)=>{
        const target = event.target;
        if(target === cart || target.classList.contains('cart-close') || event.keyCode===27){
            cart.style.display= '';
            document.removeEventListener('keydown', closeCart);
        }
    };

    const openCart= (event) =>{
        document.addEventListener('keydown', closeCart);
        cart.style.display= 'flex';

        event.preventDefault();
        getGoods(filterCart, renderCart);
        
        cartWrapper.addEventListener('click', cartHandler);
    };
    
    const choiceCategory = (event) =>{
        event.preventDefault();
        const target= event.target;

        if(target.classList.contains('category-item')){
            
            const cat= event.target.dataset.category;
            const filterByCategory= items => items.filter(item=> item.category.includes(cat));
            
            getGoods(filterByCategory, renderCard);
        }
    };

    const searchGoods = (event)=>{
        event.preventDefault();
        const input= event.target.elements.searchGoods;
        const inputValue= input.value.trim();
        if(inputValue !== ""){
            const searchFiltredGoods= (items)=>{
                const searchString = new RegExp(inputValue, 'i');
                return items.filter(item=>searchString.test(item.title));
            };
            getGoods(searchFiltredGoods, renderCard);
        }else{
            search.classList.add('error');
            setTimeout(() =>{
                search.classList.remove('error');
            }, 2000 );
        }
        
        input.value= "";
    };

    const toggleWishList= (id, target)=>{

        if(wishlist.includes(id)){
            wishlist.splice(wishlist.indexOf(id), 1);
            target.classList.remove('active');
        }else{
            wishlist.push(id);
            target.classList.add('active');
        }

        console.log(wishlist);
    };

    const addGoodsCart = id =>{
        if(cartlist[id]){
            cartlist[id] += 1;
        }else{
            cartlist[id] = 1;
        }
        console.log('cartlist: ', cartlist);
    };

    const deleteGoodsCart= (id, target) =>{
        delete cartlist[id];
        getGoods(filterCart, renderCart);
    };

    

    
    //Handlers
    
    const goodsHandler= event =>{
        const target= event.target;
        if(target.classList.contains('card-add-wishlist')){
            toggleWishList(target.dataset.goodsId, target);
        }
        if(target.classList.contains('card-add-cart')){
            addGoodsCart(target.dataset.goodsId);
        }
        cookieQuery();
        localQuery();
        countChecker();
    };

    const cartHandler= event =>{
        const target= event.target;
        if(target.classList.contains('goods-add-wishlist')){
            toggleWishList(target.dataset.goodsId, target);
        }

        if(target.classList.contains('goods-delete')){
            deleteGoodsCart(target.dataset.goodsId);
        }

        cookieQuery();
        localQuery();
        countChecker();
    };
    
    


    

    
    //Инициализация
    
    
    {
        getGoods(randomSort, renderCard);
        localQuery(true);
        cookieQuery(true);



    cartBtn.addEventListener('click', openCart);
    cart.addEventListener('click', closeCart);
    category.addEventListener('click', choiceCategory);
    search.addEventListener('submit', searchGoods);
    goodsWrapper.addEventListener('click', goodsHandler);
    wishlistBtn.addEventListener('click', renderWish);

    }
}); 