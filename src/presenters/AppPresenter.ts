import { ApiClient } from '../components/Communication/ApiClient';
import { Cart } from '../components/Models/Cart';
import { Catalog } from '../components/Models/Catalog';
import { Customer } from '../components/Models/Customer';
import { BasketView } from '../components/Views/BasketView';
import { GalleryView } from '../components/Views/GalleryView';
import { HeaderCartView } from '../components/Views/HeaderCartView';
import { ModalView } from '../components/Views/ModalView';
import { CardBasket } from '../components/Views/cards/CardBasket';
import { CardCatalog } from '../components/Views/cards/CardCatalog';
import { CardPreview } from '../components/Views/cards/CardPreview';
import { ContactsForm } from '../components/Views/forms/ContactsForm';
import { OrderForm } from '../components/Views/forms/OrderForm';
import { SuccessView } from '../components/Views/SuccessView';
import { EventEmitter } from '../components/base/Events';
import { IBuyer, IOrderRequest, IProduct } from '../types';

type ViewFactories = {
  createCatalogCard: () => CardCatalog;
  createBasketItem: () => CardBasket;
  createOrderForm: () => OrderForm;
  createContactsForm: () => ContactsForm;
  createSuccessView: () => SuccessView;
};

export class AppPresenter {
  private readonly modal: ModalView;
  private readonly header: HeaderCartView;
  private readonly basketView: BasketView;
  private readonly gallery: GalleryView;
  private readonly preview: CardPreview;
  private previewProduct: IProduct | null = null;
  private readonly orderForm: OrderForm;
  private readonly contactsForm: ContactsForm;
  private readonly successView: SuccessView;
  private readonly viewFactories: ViewFactories;

  constructor(
    private readonly catalogModel: Catalog,
    private readonly cartModel: Cart,
    private readonly customerModel: Customer,
    private readonly apiClient: ApiClient,
    private readonly eventBroker: EventEmitter,
    views: {
      modal: ModalView;
      header: HeaderCartView;
      basketView: BasketView;
      gallery: GalleryView;
      preview: CardPreview;
    },
    viewFactories: ViewFactories
  ) {
    this.modal = views.modal;
    this.header = views.header;
    this.basketView = views.basketView;
    this.gallery = views.gallery;
    this.preview = views.preview;
    this.viewFactories = viewFactories;
    this.orderForm = this.viewFactories.createOrderForm();
    this.contactsForm = this.viewFactories.createContactsForm();
    this.successView = this.viewFactories.createSuccessView();

    this.preview.setButtonHandler(() => {
      if (this.previewProduct) {
        this.toggleCartItem(this.previewProduct);
      }
    });

    this.bindEvents();
  }

  /**
   * Загружает товары и запускает приложение.
   */
  async init(): Promise<void> {
    await this.loadProducts();
  }

  private bindEvents(): void {
    this.eventBroker.on('basket:open', () => this.openBasket());

    this.eventBroker.on('catalog:changed', () => this.eventBroker.emit('products:update'));
    this.eventBroker.on('products:update', () => this.renderCatalog());
    this.eventBroker.on('catalog:product-selected', (product: IProduct) => this.openPreview(product));

    this.eventBroker.on('cart:changed', () => {
      this.header.count = this.cartModel.getTotalCount();
      this.updateBasket();
    });

    this.eventBroker.on('order:open', () => {
      this.showOrderForm();
      this.basketView.isOpen = false;
    });

    this.eventBroker.on('form:contacts-open', () => this.showContactsForm());
    this.eventBroker.on('order:submit', () => this.sendOrder());

    this.eventBroker.on('buyer:change', (data: { field: keyof IBuyer; value: string }) => {
      this.customerModel.saveData({ [data.field]: data.value } as Partial<IBuyer>);
    });

    this.eventBroker.on('order:update', () => this.applyBuyerState());

    this.modal.setCloseHandler(() => {
      this.modal.close();
      this.basketView.isOpen = false;
    });
  }

  private async loadProducts(): Promise<void> {
    try {
      const products = await this.apiClient.getProductList();
      this.catalogModel.saveProducts(products.items);
    } catch (error) {
      console.error('Ошибка загрузки товаров с сервера:', error);
    }
  }

  private renderCatalog(): void {
    const products = this.catalogModel.getProducts();
    const items = products.map(product => {
      const card = this.viewFactories.createCatalogCard();

      card.setButtonHandler(() => this.catalogModel.setCurrentProduct(product));
      return card.render(product);
    });

    this.gallery.items = items;
  }

  private openPreview(product: IProduct): void {
    this.previewProduct = product;
    this.setPreviewButtonState(this.preview, product);

    this.modal.open(this.preview.render(product));
  }

  private setPreviewButtonState(preview: CardPreview, product: IProduct): void {
    if (product.price === null) {
      preview.setButtonDisabled(true, 'Недоступно');
      return;
    }

    preview.setButtonText(this.cartModel.isInCart(product.id) ? 'Удалить из корзины' : 'В корзину');
    preview.setButtonDisabled(false);
  }

  private toggleCartItem(product: IProduct): void {
    if (product.price === null) {
      return;
    }

    if (this.cartModel.isInCart(product.id)) {
      this.cartModel.removeItem(product);
    } else {
      this.cartModel.addItem(product);
    }

    this.modal.close();
  }

  private openBasket(): void {
    this.basketView.isOpen = true;
    this.modal.open(this.basketView.render());
  }

  private updateBasket(): void {
    const items = this.cartModel.getItems();
    const elements = items.map((item, index) => {
      const basketCard = this.viewFactories.createBasketItem();
      basketCard.setDeleteHandler(() => this.cartModel.removeItem(item));

      return basketCard.render({
        ...item,
        index: index + 1
      });
    });

    this.basketView.setItems(elements);
    this.basketView.setTotalPrice(this.cartModel.getTotalPrice());
    this.basketView.setButtonDisabled(items.length === 0);
  }

  private showOrderForm(): void {
    this.applyBuyerState();
    this.modal.open(this.orderForm.render());
  }

  private showContactsForm(): void {
    this.applyBuyerState();
    this.modal.open(this.contactsForm.render());
  }

  private restoreFormData(form: OrderForm | ContactsForm, customer: Partial<IBuyer>): void {
    if (form instanceof OrderForm) {
      if (customer.payment) {
        form.setPaymentMethod(customer.payment);
      }
      if (customer.address) {
        form.setAddress(customer.address);
      }
    }

    if (form instanceof ContactsForm) {
      if (customer.email) {
        form.setEmail(customer.email);
      }
      if (customer.phone) {
        form.setPhone(customer.phone);
      }
    }
  }

  private applyBuyerState(): void {
    const data = this.customerModel.getData() as IBuyer;
    const validation = this.customerModel.validate(data);

    this.restoreFormData(this.orderForm, data);
    const orderErrors = {
      payment: validation.errors.payment,
      address: validation.errors.address
    };
    this.orderForm.setValidations(orderErrors);
    this.orderForm.setButtonState(!!(orderErrors.payment || orderErrors.address));

    this.restoreFormData(this.contactsForm, data);
    const contactsErrors = {
      email: validation.errors.email,
      phone: validation.errors.phone
    };
    this.contactsForm.setValidations(contactsErrors);
    this.contactsForm.setButtonState(!!(contactsErrors.email || contactsErrors.phone));
  }

  private async sendOrder(): Promise<void> {
    try {
      const orderData: IOrderRequest = {
        ...(this.customerModel.getData() as IBuyer),
        items: this.cartModel.getItems().map(item => item.id),
        total: this.cartModel.getTotalPrice()
      };

      const result = await this.apiClient.createOrder(orderData);
      this.showSuccess(result.total);

      this.cartModel.clear();
      this.customerModel.clearData();
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
    }
  }

  private showSuccess(total: number): void {
    this.successView.setTotalPrice(total);
    this.successView.setCloseHandler(() => this.modal.close());
    this.modal.open(this.successView.render());
  }
}
