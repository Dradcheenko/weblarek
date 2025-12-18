import { Component } from '../base/Component';
import { IBasketCount } from '../../types/index';
import { ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/Events';

export class HeaderCartView extends Component<IBasketCount> {
  private basketButton: HTMLButtonElement;
  private basketCounter: HTMLElement;
  private eventBroker: EventEmitter;

  constructor(container: HTMLButtonElement, eventBroker: EventEmitter) {
    super(container);

    this.basketButton = container;
    this.basketCounter = ensureElement('.header__basket-counter', this.basketButton);
    this.eventBroker = eventBroker;

    this.basketButton.addEventListener('click', () => {
      this.eventBroker.emit('basket:open');
    });
  }

  set count(count: number) {
    this.setText(this.basketCounter, count.toString());
  }
}
