import { TPayment, IBuyer, IValidErrors, IValidResult } from '../../types/index';

export class Customer {
  private payment: TPayment = '';
  private email: string = '';
  private phone: string = '';
  private address: string = '';

  saveData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) {
      this.payment = data.payment;
    }

    if (data.email !== undefined) {
      this.email = data.email;
    }

    if (data.phone !== undefined) {
      this.phone = data.phone;
    }

    if (data.address !== undefined) {
      this.address = data.address;
    }
  }

  getData(): IBuyer {
    return {
      payment: this.payment,
      email: this.email,
      phone: this.phone,
      address: this.address
    };
  }

  clearData(): void {
    this.payment = '';
    this.email = '';
    this.phone = '';
    this.address = '';
  }

  validate(): IValidResult {
    let isValid = true;
    const errors: IValidErrors = {};

    // Проверяем способ оплаты
    if (this.payment !== 'card' && this.payment !== 'cash') {
      errors.payment = 'Неверный способ оплаты';
      isValid = false;
    }

    // Проверяем email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      errors.email = 'Неверный формат email';
      isValid = false;
    }

    // Проверяем телефон
    if (this.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Телефон должен содержать не менее 10 цифр';
      isValid = false;
    }

    // Проверяем адрес
    if (this.address.trim().length <= 5) {
      errors.address = 'Адрес должен содержать более 5 символов';
      isValid = false;
    }

    return { isValid, errors };
  }
}