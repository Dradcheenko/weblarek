import { ApiClient } from '../components/Communication/ApiClient';
import { Cart } from '../components/Models/Cart';
import { Catalog } from '../components/Models/Catalog';
import { Customer } from '../components/Models/Customer';
import { BasketView } from '../components/Views/BasketView';
import { HeaderCartView } from '../components/Views/HeaderCartView';
import { ModalView } from '../components/Views/ModalView';
import { CardBasket } from '../components/Views/cards/CardBasket';
import { CardCatalog } from '../components/Views/cards/CardCatalog';
import { CardPreview } from '../components/Views/cards/CardPreview';
import { ContactsForm } from '../components/Views/forms/ContactsForm';
import { OrderForm } from '../components/Views/forms/OrderForm';
import { SuccessView } from '../components/Views/SuccessView';
import { EventEmitter } from '../components/base/Events';
import { IBuyer, IOrderRequest, IProduct, IValidResult, ITimer } from '../types';
import { apiProducts } from '../utils/data';
import { cloneTemplate, debounce, ensureElement } from '../utils/utils';

type FormName = 'order' | 'contacts';

/**
 * Presenter, связывающий модели и представления приложения.
 */
export class AppPresenter {
  private readonly modal: ModalView;
  private readonly header: HeaderCartView;
  private readonly basketView: BasketView;
  private readonly gallery: HTMLElement;
  private readonly timer: ITimer = { delay: 800, timeoutId: null };
  private readonly templates: Record<string, HTMLTemplateElement>;
  private readonly basketRoot: HTMLElement;

  constructor(
    private readonly catalogModel: Catalog,
    private readonly cartModel: Cart,
    private readonly customerModel: Customer,
    private readonly apiClient: ApiClient,
    private readonly eventBroker: EventEmitter
  ) {
    this.modal = new ModalView(this.eventBroker);
    this.header = new HeaderCartView(ensureElement<HTMLButtonElement>('.header__basket'));
    this.templates = {
      catalog: ensureElement<HTMLTemplateElement>('#card-catalog'),
      preview: ensureElement<HTMLTemplateElement>('#card-preview'),
      basket: ensureElement<HTMLTemplateElement>('#basket'),
      basketItem: ensureElement<HTMLTemplateElement>('#card-basket'),
      order: ensureElement<HTMLTemplateElement>('#order'),
      contacts: ensureElement<HTMLTemplateElement>('#contacts'),
      success: ensureElement<HTMLTemplateElement>('#success')
    };

    this.gallery = ensureElement<HTMLElement>('.gallery');
    this.basketRoot = cloneTemplate<HTMLElement>(this.templates.basket);
    this.basketView = new BasketView(this.basketRoot, this.eventBroker);

    this.bindEvents();
  }

  /**
   * Загружает товары и запускает приложение.
   */
  async init(): Promise<void> {
    await this.loadProducts();
  }

  private bindEvents(): void {
    this.header.setBasketClickHandler(() => this.openBasket());

    this.catalogModel.eventBroker.on('catalog:changed', () => this.renderCatalog());
    this.catalogModel.eventBroker.on('catalog:product-selected', (product: IProduct) => this.openPreview(product));

    this.cartModel.eventBroker.on('cart:changed', () => {
      this.header.count = this.cartModel.getTotalCount();

      if (this.basketView.isOpen) {
        this.updateBasket();
      }
    });

    this.basketView.setOrderHandler(() => {
      this.showForm('order', ['payment', 'address']);
      this.basketView.isOpen = false;
    });

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
      console.error('Ошибка загрузки товаров, используем локальные данные:', error);
      this.catalogModel.saveProducts(apiProducts.items);
    }
  }

  private renderCatalog(): void {
    this.gallery.innerHTML = '';
    const products = this.catalogModel.getProducts();

    products.forEach(product => {
      const card = new CardCatalog(cloneTemplate<HTMLElement>(this.templates.catalog));

      card.setButtonHandler(() => this.catalogModel.setCurrentProduct(product));
      this.gallery.append(card.render(product));
    });
  }

  private openPreview(product: IProduct): void {
    const preview = new CardPreview(cloneTemplate<HTMLElement>(this.templates.preview));

    this.setPreviewButtonState(preview, product);
    preview.setButtonHandler(() => this.toggleCartItem(product, preview));

    this.modal.open(preview.render(product));
  }

  private setPreviewButtonState(preview: CardPreview, product: IProduct): void {
    if (product.price === null) {
      preview.setButtonDisabled(true, 'Недоступно');
      return;
    }

    preview.setButtonText(this.cartModel.isInCart(product.id) ? 'Удалить из корзины' : 'В корзину');
    preview.setButtonDisabled(false);
  }

  private toggleCartItem(product: IProduct, preview: CardPreview): void {
    if (product.price === null) {
      return;
    }

    if (this.cartModel.isInCart(product.id)) {
      this.cartModel.removeItem(product);
      preview.setButtonText('В корзину');
    } else {
      this.cartModel.addItem(product);
      preview.setButtonText('Удалить из корзины');
    }
  }

  private openBasket(): void {
    this.updateBasket();
    this.basketView.isOpen = true;
    this.modal.open(this.basketRoot);
  }

  private updateBasket(): void {
    const items = this.cartModel.getItems();
    const elements = items.map((item, index) => {
      const basketCard = new CardBasket(cloneTemplate<HTMLElement>(this.templates.basketItem));
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

  private showForm(templateName: FormName, customerParams?: (keyof IBuyer)[]): void {
    const form = this.getFormInstance(templateName);
    const customerData = this.customerModel.getData(customerParams);

    this.restoreFormData(form, customerData);

    const validate = () => this.validateForm(form, customerParams);
    const debouncedValidate = debounce(validate, this.timer);

    form.setInputHandler((field, value) => {
      this.customerModel.saveData({ [field]: value });
      debouncedValidate();
    });

    form.setSubmitHandler((event: SubmitEvent) => {
      event.preventDefault();
      if (templateName === 'contacts') {
        this.sendOrder();
      } else {
        this.showForm('contacts', ['email', 'phone']);
      }
    });

    validate();
    this.modal.open(form.render());
  }

  private getFormInstance(templateName: FormName): OrderForm | ContactsForm {
    switch (templateName) {
      case 'order':
        return new OrderForm(cloneTemplate<HTMLElement>(this.templates.order));
      case 'contacts':
      default:
        return new ContactsForm(cloneTemplate<HTMLElement>(this.templates.contacts), this.eventBroker);
    }
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

  private validateForm(form: OrderForm | ContactsForm, fields?: (keyof IBuyer)[]): void {
    const result = this.customerModel.validate(this.customerModel.getData(fields));
    this.applyValidation(form, result);
  }

  private applyValidation(form: OrderForm | ContactsForm, validation: IValidResult): void {
    form.setButtonState(!validation.isValid);

    if (Object.keys(validation.errors).length) {
      form.setValidations(validation.errors);
    } else {
      form.setValidations();
    }
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
    const successView = new SuccessView(cloneTemplate<HTMLElement>(this.templates.success));
    successView.setTotalPrice(total);
    successView.setCloseHandler(() => this.modal.close());

    this.modal.open(successView.render());
  }
}
