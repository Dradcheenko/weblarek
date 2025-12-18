import './scss/styles.scss';

import { ApiClient } from './components/Communication/ApiClient';
import { Cart } from './components/Models/Cart';
import { Catalog } from './components/Models/Catalog';
import { Customer } from './components/Models/Customer';
import { BasketView } from './components/Views/BasketView';
import { GalleryView } from './components/Views/GalleryView';
import { HeaderCartView } from './components/Views/HeaderCartView';
import { ModalView } from './components/Views/ModalView';
import { CardBasket } from './components/Views/cards/CardBasket';
import { CardCatalog } from './components/Views/cards/CardCatalog';
import { CardPreview } from './components/Views/cards/CardPreview';
import { ContactsForm } from './components/Views/forms/ContactsForm';
import { OrderForm } from './components/Views/forms/OrderForm';
import { SuccessView } from './components/Views/SuccessView';
import { EventEmitter } from './components/base/Events';
import { AppPresenter } from './presenters/AppPresenter';
import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

const eventEmitter = new EventEmitter();

const catalogModel = new Catalog(eventEmitter);
const cartModel = new Cart(eventEmitter);
const customerModel = new Customer(eventEmitter);
const apiClient = new ApiClient(API_URL);

const header = new HeaderCartView(ensureElement<HTMLButtonElement>('.header__basket'), eventEmitter);
const modal = new ModalView(eventEmitter);
const basketView = new BasketView(cloneTemplate<HTMLElement>('#basket'), eventEmitter);
const galleryView = new GalleryView(ensureElement<HTMLElement>('.gallery'), eventEmitter);
const previewView = new CardPreview(cloneTemplate<HTMLElement>('#card-preview'));

const presenter = new AppPresenter(
  catalogModel,
  cartModel,
  customerModel,
  apiClient,
  eventEmitter,
  {
    modal,
    header,
    basketView,
    gallery: galleryView,
    preview: previewView
  },
  {
    createCatalogCard: () => new CardCatalog(cloneTemplate<HTMLElement>('#card-catalog')),
    createBasketItem: () => new CardBasket(cloneTemplate<HTMLElement>('#card-basket')),
    createOrderForm: () => new OrderForm(cloneTemplate<HTMLElement>('#order'), eventEmitter),
    createContactsForm: () => new ContactsForm(cloneTemplate<HTMLElement>('#contacts'), eventEmitter),
    createSuccessView: () => new SuccessView(cloneTemplate<HTMLElement>('#success'))
  }
);

presenter.init();
