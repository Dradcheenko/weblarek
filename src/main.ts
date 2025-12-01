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
    // ... существующий код теста Catalog
  } catch(error) {
    console.log('Тестирование Catalog закончилось с ошибкой: ', error);
    throw error;
  }
}
testCatalog();

function testCart() {
  try {
    console.log('=============Тестируем Cart=============');
    // ... существующий код теста Cart
  } catch(error) {
    console.log('тестирование Cart закончилось с ошибкой: ', error);
    throw error;
  }
}
testCart();

function testCustomer() {
  try {
    console.log('=============Запускаем тест Customer=============');

    const firstData: Partial<IBuyer> = {
      payment: 'card',
      email: 'test@mail'
    };

    console.log('Проверяем первый набор данных', firstData);
    
    // ИСПРАВЛЕНИЕ: Сначала сохраняем данные, потом валидируем
    customerModel.saveData(firstData);
    const firstDataValid = customerModel.validate(); // Без параметров!
    
    if (firstDataValid.isValid) {
      console.log('Валидация не должна была быть пройдена, т.к. были ошибки в полях:');
      showValidErrors(firstDataValid.errors);
      throw new Error('Поле email не должно быть валидным в первом наборе данных');
    }
    console.log('Первый набор данных проверен, результат: ', firstDataValid);
    
    // Очищаем данные для следующего теста
    customerModel.clearData();

    const secondData: Partial<IBuyer> = {
      payment: 'coste',
      email: 'test@mail.ru'
    };

    console.log('Проверяем второй набор данных', secondData);
    
    // ИСПРАВЛЕНИЕ: Сначала сохраняем данные, потом валидируем
    customerModel.saveData(secondData);
    const secondDataValid = customerModel.validate(); // Без параметров!
    
    if (secondDataValid.isValid) {
      console.log('Валидация не должна была быть пройдена, т.к. были ошибки в полях:');
      showValidErrors(secondDataValid.errors);
      throw new Error('Поле payment не должно быть валидным во втором наборе данных');
    }
    console.log('Второй набор данных проверен, результат: ', secondDataValid);
    
    customerModel.clearData();

    const thirdData: Partial<IBuyer> = {
      payment: 'card',
      email: 'test@mail.ru'
    };

    console.log('Проверяем третий набор данных', thirdData);
    
    // ИСПРАВЛЕНИЕ: Сначала сохраняем данные, потом валидируем
    customerModel.saveData(thirdData);
    const thirdDataValid = customerModel.validate(); // Без параметров!
    
    if (!thirdDataValid.isValid) {
      console.log('Валидация должна была быть пройдена, но есть ошибки в полях:');
      showValidErrors(thirdDataValid.errors);
      throw new Error('Третий набор данных должен быть валидным');
    }
    console.log('Третий набор данных проверен, результат: ', thirdDataValid);
    
    // Сохраняем третий набор данных (уже сохранен выше)
    const firstPartCustomer = customerModel.getData();
    if (thirdData.email !== firstPartCustomer.email || thirdData.payment !== firstPartCustomer.payment) {
      throw new Error('Сохраненные данные отличаются от оригинала');
    }
    console.log('Добавили почту и способ оплаты в класс: ', firstPartCustomer);

    const fourthData: Partial<IBuyer> = {
      phone: '+7 (928) 928-98-28',
      address: 'Рост'
    };

    console.log('Проверяем четвертый набор данных', fourthData);
    
    // ИСПРАВЛЕНИЕ: Сначала сохраняем данные, потом валидируем
    customerModel.saveData(fourthData);
    const fourthDataValid = customerModel.validate(); // Без параметров!
    
    if (fourthDataValid.isValid) {
      console.log('Валидация не должна была быть пройдена, т.к. были ошибки в полях:');
      showValidErrors(fourthDataValid.errors);
      throw new Error('Поле address не должно быть валидным в четвертом наборе данных');
    }
    console.log('Четвертый набор данных проверен, результат: ', fourthDataValid);
    
    customerModel.clearData();

    const fifthData: Partial<IBuyer> = {
      phone: '+7 (928) 928-98',
      address: 'Ростов-на-Дону'
    };

    console.log('Проверяем пятый набор данных', fifthData);
    
    // ИСПРАВЛЕНИЕ: Сначала сохраняем данные, потом валидируем
    customerModel.saveData(fifthData);
    const fifthDataValid = customerModel.validate(); // Без параметров!
    
    if (fifthDataValid.isValid) {
      console.log('Валидация не должна была быть пройдена, т.к. были ошибки в полях:');
      showValidErrors(fifthDataValid.errors);
      throw new Error('Поле phone не должно быть валидным в пятом наборе данных');
    }
    console.log('Пятый набор данных проверен, результат: ', fifthDataValid);
    
    customerModel.clearData();

    const sixthData: Partial<IBuyer> = {
      phone: '+7 (928) 928-98-28',
      address: 'Ростов-на-Дону'
    };

    console.log('Проверяем шестой набор данных', sixthData);
    
    // ИСПРАВЛЕНИЕ: Сначала сохраняем данные, потом валидируем
    customerModel.saveData(sixthData);
    const sixthDataValid = customerModel.validate(); // Без параметров!
    
    if (!sixthDataValid.isValid) {
      console.log('Валидация должна была быть пройдена, но есть ошибки в полях:');
      showValidErrors(sixthDataValid.errors);
      throw new Error('Шестой набор данных должен быть валидным');
    }
    console.log('Шестой набор данных проверен, результат: ', sixthDataValid);
    
    // Сохраняем шестой набор данных (уже сохранен выше)
    const secondPartCustomer = customerModel.getData();
    if (sixthData.phone !== secondPartCustomer.phone || sixthData.address !== secondPartCustomer.address) {
      throw new Error('Сохраненные данные отличаются от оригинала');
    }
    console.log('Добавили телефон и адрес в класс: ', secondPartCustomer);

    const seventhData: Partial<IBuyer> = {
      phone: '+7 (928) 928-98'
    };

    console.log('Проверяем седьмой набор данных', seventhData);
    
    // ИСПРАВЛЕНИЕ: Сначала сохраняем данные, потом валидируем
    customerModel.saveData(seventhData);
    const seventhDataValid = customerModel.validate(); // Без параметров!
    
    if (seventhDataValid.isValid) {
      console.log('Валидация не должна была быть пройдена, т.к. были ошибки в полях:');
      showValidErrors(seventhDataValid.errors);
      throw new Error('Поле phone не должно быть валидным в седьмом наборе данных');
    }
    console.log('Седьмой набор данных проверен, результат: ', seventhDataValid);

    console.log('Тестирование Customer завершилось успешно!');

  } catch(error) {
    console.log('тестирование Customer закончилось с ошибкой: ', error);
    throw error;
  }
}
testCustomer();

async function testApi(): Promise<void> {
  try {
    console.log('=============Запускаем тест слоя коммуникации=============');
    // ... существующий код теста ApiClient
  } catch(error) {
    console.log('Ошибка во время тестирования Api', error);
    throw error;
  }
}
testApi();