import { Component } from '../base/Component';
import { EventEmitter } from '../base/Events';
import { ensureElement } from '../../utils/utils';

export class BasketView extends Component<unknown> {
  private listElement: HTMLElement;
  private priceElement: HTMLElement;
  private button: HTMLButtonElement;
  public eventBroker: EventEmitter;
  public isOpen: boolean = false;

  constructor(container: HTMLElement, eventBroker: EventEmitter) {
    super(container);
    this.eventBroker = eventBroker;

    this.listElement = ensureElement('.basket__list', this.container);
    this.priceElement = ensureElement('.basket__price', this.container);
    this.button = ensureElement<HTMLButtonElement>('.basket__button', this.container);
  }

  /**
   * Принимает ГОТОВЫЕ DOM-элементы списка покупок.
   * Формирование карточек происходит в presenter.
   */
  setItems(elements: HTMLElement[]): void {
    this.listElement.innerHTML = '';
    elements.forEach(el => this.listElement.appendChild(el));
  }

  setTotalPrice(price: number): void {
    this.setText(this.priceElement, `${price} синапсов`);
  }

  setButtonDisabled(disabled: boolean): void {
    this.setDisabled(this.button, disabled);
  }

  setOrderHandler(handler: (event: MouseEvent) => void): void {
    this.button.addEventListener('click', handler);
  }
}
