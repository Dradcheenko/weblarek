import { Form } from './Form';
import { IBuyer, TPayment } from '../../../types';
import { EventEmitter } from '../../base/Events';
import { ensureElement } from '../../../utils/utils';

export class OrderForm extends Form<Partial<IBuyer>> {
  private cardButton: HTMLButtonElement;
  private cashButton: HTMLButtonElement;
  private addressInput: HTMLInputElement;
  private eventBroker?: EventEmitter;

  constructor(container: HTMLElement, eventBroker?: EventEmitter) {
    super(container);
    this.eventBroker = eventBroker;

    this.cardButton = ensureElement<HTMLButtonElement>('[name="card"]', this.container);
    this.cashButton = ensureElement<HTMLButtonElement>('[name="cash"]', this.container);
    this.addressInput = ensureElement<HTMLInputElement>('[name="address"]', this.container);

    this.cardButton.addEventListener('click', () => this.handlePaymentClick('card'));
    this.cashButton.addEventListener('click', () => this.handlePaymentClick('cash'));
    this.addressInput.addEventListener('input', () => this.emitChange('address', this.addressInput.value));

    this.form.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();
      this.eventBroker?.emit('form:contacts-open');
    });
  }

  setPaymentMethod(method: TPayment): void {
    this.cardButton.classList.remove('button_alt-active');
    this.cashButton.classList.remove('button_alt-active');

    if (method === 'card') {
      this.cardButton.classList.add('button_alt-active');
    } else if (method === 'cash') {
      this.cashButton.classList.add('button_alt-active');
    }
  }

  setAddress(address: string): void {
    this.addressInput.value = address;
  }

  setInputHandler(): void {
    // Слушатели навешаны в конструкторе через event broker
  }

  private emitChange(field: keyof Partial<IBuyer>, value: string): void {
    this.eventBroker?.emit('buyer:change', { field, value });
  }

  private handlePaymentClick(method: TPayment): void {
    this.setPaymentMethod(method);
    this.emitChange('payment', method);
  }
}
