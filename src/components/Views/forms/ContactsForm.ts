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

    this.emailInput = ensureElement<HTMLInputElement>('[name=\"email\"]', this.container);
    this.phoneInput = ensureElement<HTMLInputElement>('[name=\"phone\"]', this.container);
  }

  // Методы для обновления полей формы извне (например, presenter)
  setEmail(email: string): void {
    this.emailInput.value = email;
  }

  setPhone(phone: string): void {
    this.phoneInput.value = phone;
  }

  setInputHandler(handler: (field: keyof Partial<IBuyer>, value: string) => void): void {
    this.emailInput.addEventListener('input', () => {
      handler('email', this.emailInput.value);
      this.eventBroker?.emit('buyer:change', { field: 'email', value: this.emailInput.value });
    });
    this.phoneInput.addEventListener('input', () => {
      handler('phone', this.phoneInput.value);
      this.eventBroker?.emit('buyer:change', { field: 'phone', value: this.phoneInput.value });
    });
  }

  getData(): IBuyer {
    const formData = new FormData(this.form);
    return {
      payment: '' as IBuyer['payment'],
      email: (formData.get('email') as string) || '',
      phone: (formData.get('phone') as string) || '',
      address: ''
    };
  }
}
