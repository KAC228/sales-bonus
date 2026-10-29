/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
    const {discount, sale_price, quantity} = purchase;
    return sale_price*quantity*(1-discount/100);
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
    const {profit} = seller;
    if (index === 0) return profit*0.15;
    else if (index === 1|| index === 2) return profit*0.10;
    else if (index === total - 1) return 0;
    return profit*0.05;

}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных
    if (!data){
        throw new Error('Данные не переданы');
    }
    if (!Array.isArray(data.sellers) || data.sellers.length === 0) {
        throw new Error('Отсутсвтует или пусты данные о продавцах (sellers)');

    }
    if (!Array.isArray(data.products) || data.products.length === 0) {
        throw new Error('Отсутсвтует или пусты данные о товарах (products)')
    }
    if (!Array.isArray(data.purchase_records) || data.purchase_records.length === 0) {
         throw new Error('Отсутсвтует или пусты данные о продажах (purchase_records)');
    };
    if (!options || 
        typeof options.calculateRevenue !== 'function' ||
        typeof options.calculateBonus !== 'function') {
            throw new Error('В options должны быть переданы функции calculateRevenue и calculateBonus');
        }
    const {calculateRevenue, calculateBonus} = options;
    
    const productMap = new Map();
    data.products.forEach(product => {
        productMap.set(product.sku, product);
    })

    const sellerStats = data.sellers.map(seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    }));

    const sellerIndex = Object.fromEntries(sellerStats.map(seller => [seller.id, seller]));
    const productIndex = Object.fromEntries(data.products.map(product => [product.sku, product]));

    data.purchase_records.forEach(record => {
        const seller = sellerIndex[record.seller_id];
        seller.sales_count +=1;
        seller.revenue += record.total_amount;
        record.items.forEach(item =>{
            const product = productIndex[item.sku];
            const cost = product.purchase_price * item.quantity;
            const revenue = calculateRevenue(item, product);
            const profit = revenue - cost;
            seller.profit += profit;
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity;
        });
    });

    sellerStats.sort((a,b) => b.profit - a.profit);

    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, sellerStats.length, seller);
        seller.top_products = Object.entries(seller.products_sold)
        .map(([sku, quantity]) => ({sku, quantity}))
        .sort((a,b) => b.quantity - a.quantity)
        .slice(0,10); 
    })

    return sellerStats.map(seller => ({
        seller_id: seller.id,
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2)
    }));
    // @TODO: Проверка наличия опций

    // @TODO: Подготовка промежуточных данных для сбора статистики

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
}
