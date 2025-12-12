import { Component } from '../base/Component';
import { IBasketCount } from '../../types/index';
import { ensureElement } from '../../utils/utils';

export class HeaderCartView extends Component<IBasketCount> {
  private basketButton: HTMLButtonElement;
  private basketCounter: HTMLElement;

  constructor(container: HTMLButtonElement) {
    super(container);

    this.basketButton = container;
    this.basketCounter = ensureElement('.header__basket-counter', this.basketButton);
  }

  set count(count: number) {
    this.setText(this.basketCounter, count.toString());
  }

  setBasketClickHandler(handler: (event: MouseEvent) => void): void {
    this.basketButton.addEventListener('click', handler);
  }
}
