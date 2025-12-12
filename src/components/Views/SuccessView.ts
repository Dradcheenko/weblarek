import { Component } from '../base/Component';
import { IOrderResponse } from '../../types/index';
import { ensureElement } from '../../utils/utils';

export class SuccessView extends Component<IOrderResponse> {
  private titleElement: HTMLElement;
  private descriptionElement: HTMLElement;
  private closeButton: HTMLButtonElement;

  constructor(container: HTMLElement) {
    super(container);

    this.titleElement = ensureElement<HTMLElement>('.order-success__title', this.container);
    this.descriptionElement = ensureElement<HTMLElement>('.order-success__description', this.container);
    this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
  }

  setTotalPrice(total: number): void {
    this.setText(this.descriptionElement, `Списано ${total} синапсов`);
  }

  setCloseHandler(handler: (event: MouseEvent) => void): void {
    this.closeButton.addEventListener('click', handler);
  }
}
