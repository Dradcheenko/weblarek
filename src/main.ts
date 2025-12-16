import './scss/styles.scss';

import { ApiClient } from './components/Communication/ApiClient';
import { Cart } from './components/Models/Cart';
import { Catalog } from './components/Models/Catalog';
import { Customer } from './components/Models/Customer';
import { EventEmitter } from './components/base/Events';
import { AppPresenter } from './presenters/AppPresenter';
import { API_URL } from './utils/constants';

const eventEmitter = new EventEmitter();

const presenter = new AppPresenter(
  new Catalog(eventEmitter),
  new Cart(eventEmitter),
  new Customer(eventEmitter),
  new ApiClient(API_URL),
  eventEmitter
);

presenter.init();
