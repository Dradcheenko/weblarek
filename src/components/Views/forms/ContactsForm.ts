import { Form } from './Form';
import { IBuyer } from '../../../types';
import { EventEmitter } from '../../base/Events';
import { ensureElement } from '../../../utils/utils';

export class ContactsForm extends Form<IBuyer> {
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  private eventBroker?: EventEmitter;

  constructor(container: HTMLElement, eventBroker?: EventEmitter) {
    super(container);
    this.eventBroker = eventBroker;

    this.emailInput = ensureElement<HTMLInputElement>('[name="email"]', this.container);
    this.phoneInput = ensureElement<HTMLInputElement>('[name="phone"]', this.container);

    this.emailInput.addEventListener('input', () => this.emitChange('email', this.emailInput.value));
    this.phoneInput.addEventListener('input', () => this.emitChange('phone', this.phoneInput.value));

    this.form.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();
      this.eventBroker?.emit('order:submit');
    });
  }

  setEmail(email: string): void {
    this.emailInput.value = email;
  }

  setPhone(phone: string): void {
    this.phoneInput.value = phone;
  }

  setInputHandler(): void {
    // Слушатели навешаны в конструкторе через event broker
  }

  private emitChange(field: keyof Partial<IBuyer>, value: string): void {
    this.eventBroker?.emit('buyer:change', { field, value });
  }
}
