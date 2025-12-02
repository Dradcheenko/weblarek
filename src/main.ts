import './scss/styles.scss';

import { IBuyer } from './types/index';
import { Catalog } from './components/Models/Catalog';
import { Cart } from './components/Models/Cart';
import { Customer } from './components/Models/Customer';
import { ApiClient } from './components/Communication/ApiClient';
import { API_URL } from './utils/constants';

import { showValidErrors } from './utils/utils';

import { apiProducts } from './utils/data';

const catalogModel = new Catalog();
const cartModel = new Cart();
const customerModel = new Customer();
const apiClient = new ApiClient(API_URL);
const catalogFromApi = new Catalog();

const cartModelTwo = new Cart();
const cartModelThree = new Cart();

function testCatalog() {
  try {
    console.log('Тестируем Catalog');

    console.log('Получаем массив с товарами из тестового объекта');
    const products = apiProducts.items;
    if (!products.length) {
      throw new Error('Не смогли получить товары с тестового объекта');
    }
    console.log('Успешно список товаров из тестового объекта: ', products);

    console.log('Сохраняем список товаров в ');
    catalogModel.saveProducts(apiProducts.items);
    console.log('Получаем массив с товарами из ');
    const catalogIProducts = catalogModel.getProducts();
    if (!catalogIProducts.length) {
      throw new Error('В  отсутствуют товары');
    }
    console.log('Успешно сохранили товары  и получили их список: ', catalogIProducts);

    console.log('Получаем первый товар ');
    const firstProduct = catalogModel.getProductById(products[0].id);
    if (firstProduct && firstProduct.id !== products[0].id) {
      throw new Error('Получили не тот товар из Catalog');
    }
    console.log('Успешно получили нужный товар по его id: ', firstProduct);

    if (!firstProduct) {
      throw new Error('Отсутствует первый товар из списка (firstProduct)');
    }
    console.log('Выбираем первый товар для просмотра и записываем в currentItem');
    catalogModel.setCurrentProduct(firstProduct);
    console.log('Получаем товар, выбранный для просмотра');
    const currentProduct = catalogModel.getCurrentProduct();
    if (!currentProduct || firstProduct.id !== currentProduct.id) {
      throw new Error('Получили не тот товар из Catalog, выбранный для просмотра');
    }
    console.log('Успешно сохранили, а затем получили нужный для просмотра товар из Catalog: ', currentProduct);

    console.log('Тестирование Catalog завершилось успешно!');

  } catch(error) {
    console.log('Тестирование Catalog закончилось с ошибкой: ', error);
    throw error;
  }
}
testCatalog();
// END Тестируем Catalog

// Тестируем Cart
function testCart() {
  try {
    console.log('=============Тестируем Cart=============');

    const firstProduct = catalogModel.getProductById('854cef69-976d-4c2a-a18c-2aa45046c390');
    if (!firstProduct) {
      throw new Error('Отсутствует первый товар из списка (firstProduct)');
    }
    console.log('Добавляем первый товар в корзину: ', firstProduct);
    cartModel.addItem(firstProduct);

    const secondProduct = catalogModel.getProductById('412bcf81-7e75-4e70-bdb9-d3c73c9803b7');
    if (!secondProduct) {
      throw new Error('Отсутствует первый товар из списка (firstProduct)');
    }
    console.log('Добавляем второй товар в корзину: ', firstProduct);
    cartModel.addItem(secondProduct);

    const cartProducts = cartModel.getItems();
    if (
      cartProducts[0].id !== firstProduct.id ||
      cartProducts[0].description !== firstProduct.description ||
      cartProducts[0].image !== firstProduct.image ||
      cartProducts[0].title !== firstProduct.title ||
      cartProducts[0].category !== firstProduct.category ||
      cartProducts[0].price !== firstProduct.price ||
      cartProducts[1].id !== secondProduct.id ||
      cartProducts[1].description !== secondProduct.description ||
      cartProducts[1].image !== secondProduct.image ||
      cartProducts[1].title !== secondProduct.title ||
      cartProducts[1].category !== secondProduct.category ||
      cartProducts[1].price !== secondProduct.price
    ) {
      throw new Error('Добавленные товары отличаются от оригиналов');
    }
    console.log('Товары успешно добавлены в корзину', cartProducts);
    
    console.log('Получаем общую стоимость товаров в корзине');
    const cartTotal = cartModel.getTotalPrice();
    if (
      !firstProduct.price ||
      !secondProduct.price ||
      cartTotal !== (firstProduct.price + secondProduct.price)
    ) {
      throw new Error('Стоимость товаров в корзине не совпадает со стоимостью оригиналов');
    }
    console.log('Успешно посчитали стоимость товаров в корзине: ', cartTotal);

    console.log('Получаем общее количество товаров в корзине');
    const cartCount = cartModel.getTotalCount();
    if (
      cartCount !== 2
    ) {
      throw new Error('Количество товаров в корзине не равно 2');
    }
    console.log('Успешно посчитали количество товаров в корзине: ', cartCount);

    console.log('Проверяем, есть ли первый товар в корзине');
    const isInCartFirstProduct = cartModel.isInCart(firstProduct.id);
    if (!isInCartFirstProduct) {
      throw new Error('Первого товара нет в корзине');
    }
    console.log('Первый товар успешно найден в корзине: ', isInCartFirstProduct);

    console.log('Проверяем, есть ли второй товар в корзине');
    const isInCartSecondProduct = cartModel.isInCart(secondProduct.id);
    if (!isInCartSecondProduct) {
      throw new Error('Второго товара нет в корзине');
    }
    console.log('Второй товар успешно найден в корзине: ', isInCartSecondProduct);

    cartModelTwo.addItem(firstProduct);
    cartModelTwo.addItem(secondProduct);
    console.log('Удаляем второй товар');
    cartModelTwo.removeItem(secondProduct);
    
    if (cartModelTwo.getTotalCount() !== 1 || !cartModelTwo.isInCart(firstProduct.id)) {
      throw new Error('Первого товара нет в корзине, либо не удалился второй товар');
    }
    console.log('Успешно удалили второй товар из корзины: ', cartModelTwo.getItems());

    cartModelThree.addItem(firstProduct);
    cartModelThree.addItem(secondProduct);
    console.log('Очищаем корзину');
    cartModelThree.clear();
    
    if (cartModelThree.getTotalCount()) {
      throw new Error('В корзине есть товары');
    }
    console.log('Успешно очистили корзину: ', cartModelThree.getItems());

    console.log('Тестирование Cart завершилось успешно!');

  } catch(error) {
    console.log('тестирование Cart закончилось с ошибкой: ', error);
    throw error;
  }
}
testCart();

function testCustomer() {
  try {
  console.log('=============Запускаем тест Customer=============');
  
  // 1
  const firstData: Partial<IBuyer> = {
    payment: 'card',
    email: 'test@mail'
  };
  customerModel.saveData(firstData);
  const firstValid = customerModel.validate();
  if (firstValid.isValid) {
    showValidErrors(firstValid.errors);
    throw new Error('email должен быть НЕ валиден');
  }
  
  // 2
  const secondData: Partial<IBuyer> = {
    payment: 'coste',
    email: 'test@mail.ru'
  };
  customerModel.saveData(secondData);
  const secondValid = customerModel.validate();
  if (secondValid.isValid) {
    showValidErrors(secondValid.errors);
    throw new Error('payment должен быть НЕ валиден');
  }
  
  // 3 — полностью валидные данные
  const thirdData: Partial<IBuyer> = {
    payment: 'card',
    email: 'test@mail.ru'
  };
  customerModel.saveData(thirdData);
  const thirdValid = customerModel.validate();
  if (!thirdValid.isValid) {
    showValidErrors(thirdValid.errors);
    throw new Error('Третий набор должен быть валиден');
  }
  
  // сохраняем
  const part1 = customerModel.getData();
  console.log('После сохранения email+payment:', part1);
  
  // 4 — адрес слишком короткий
  const fourthData: Partial<IBuyer> = {
    phone: '+7 (928) 928-98-28',
    address: 'Рост'
  };
  customerModel.saveData(fourthData);
  const fourthValid = customerModel.validate();
  if (fourthValid.isValid) {
    showValidErrors(fourthValid.errors);
    throw new Error('address должен быть НЕ валиден');
  }
  
  // 5 — телефон короткий
  const fifthData: Partial<IBuyer> = {
    phone: '+7 (928) 928-98',
    address: 'Ростов-на-Дону'
  };
  customerModel.saveData(fifthData);
  const fifthValid = customerModel.validate();
  if (fifthValid.isValid) {
    showValidErrors(fifthValid.errors);
    throw new Error('phone должен быть НЕ валиден');
  }
  
  // 6 — валидный телефон+адрес
  const sixthData: Partial<IBuyer> = {
    phone: '+7 (928) 928-98-28',
    address: 'Ростов-на-Дону'
  };
  customerModel.saveData(sixthData);
  const sixthValid = customerModel.validate();
  if (!sixthValid.isValid) {
    showValidErrors(sixthValid.errors);
    throw new Error('Шестой набор должен быть валиден');
  }
  
  console.log('После сохранения телефона и адреса:', customerModel.getData());
  
  // 7 — телефон короткий
  const seventhData: Partial<IBuyer> = {
    phone: '+7 (928) 928-98'
  };
  customerModel.saveData(seventhData);
  const seventhValid = customerModel.validate();
  if (seventhValid.isValid) {
    showValidErrors(seventhValid.errors);
    throw new Error('Телефон не должен быть валиден');
  }
  
  console.log('Тестирование Customer завершилось успешно!');
  
  } catch (error) {
  console.log('Ошибка Customer: ', error);
  throw error;
  }
  }
  testCustomer();

async function testApi(): Promise<void> {
  try {
    console.log('=============Запускаем тест слоя коммуникации=============');

    console.log('Запрашиваем товары с сервера');
    const products = await apiClient.getProductList();
    console.log('Товары успешно получены с сервера: ', products.items);

    console.log('Количество полученных с сервера товаров: ', products.total);
    if (products.total > 0) {
      const firstProduct = products.items[0];
      console.log('Первый товар:', {
        id: firstProduct.id,
        description: firstProduct.description,
        image: firstProduct.image,
        title: firstProduct.title,
        category: firstProduct.category,
        price: firstProduct.price
      });
    }

    catalogFromApi.saveProducts(products.items);
    console.log('Товары сохранены в модель каталога');

    const savedProducts = catalogFromApi.getProducts();
    console.log('Количество товаров в модели: ', savedProducts.length);
    console.log('Список товаров в модели: ', savedProducts);

    if (savedProducts.length > 0) {
      const testProductId = savedProducts[0].id;
      const foundProduct = catalogFromApi.getProductById(testProductId);

      console.log('Поиск товара по ID (854cef69-976d-4c2a-a18c-2aa45046c390): ', foundProduct);
    }
    
    console.log('Тестирование ApiClient завершилось успешно!');

  } catch(error) {
    console.log('Ошибка во время тестирования Api', error);
    throw error;
  }
}
testApi();