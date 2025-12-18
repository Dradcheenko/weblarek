import { Component } from '../base/Component';
import { EventEmitter } from '../base/Events';

/**
 * Отображение витрины товаров.
 * Работает только с DOM, принимает уже готовые карточки.
 */
export class GalleryView extends Component<unknown> {
  constructor(container: HTMLElement, _eventBroker: EventEmitter) {
    super(container);
  }

  set items(items: HTMLElement[]) {
    this.container.replaceChildren(...items);
  }
}
