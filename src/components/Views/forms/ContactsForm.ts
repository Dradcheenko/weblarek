import { Form } from './Form';
import { IBuyer } from '../../../types';
import { EventEmitter } from '../../base/Events';
import { ensureElement } from '../../../utils/utils';

export class ContactsForm extends Form<IBuyer> {
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  private eventBroker: EventEmitter;

  constructor(container: HTMLElement, eventBroker: EventEmitter) {
    super(container);
    this.eventBroker = eventBroker;

    this.emailInput = ensureElement<HTMLInputElement>('[name="email"]', this.container);
    this.phoneInput = ensureElement<HTMLInputElement>('[name="phone"]', this.container);

    // Сразу подписываемся на input события и отправляем их через EventEmitter
    this.emailInput.addEventListener('input', () => {
      this.eventBroker.emit('buyer:change', 'email', this.emailInput.value);
    });

    this.phoneInput.addEventListener('input', () => {
      this.eventBroker.emit('buyer:change', 'phone', this.phoneInput.value);
    });
  }

  // Методы для обновления полей формы извне (например, presenter)
  setEmail(email: string): void {
    this.emailInput.value = email;
  }

  setPhone(phone: string): void {
    this.phoneInput.value = phone;
  }
}
