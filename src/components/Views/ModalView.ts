import { EventEmitter } from '../base/Events';
import { ensureElement } from '../../utils/utils';

export class ModalView {
  private container: HTMLElement;
  private closeButton: HTMLButtonElement;
  private contentElement: HTMLElement;
  public eventBroker: EventEmitter;

  constructor(eventBroker: EventEmitter) {
    this.eventBroker = eventBroker;

    this.container = ensureElement<HTMLElement>('#modal-container');
    this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);
    this.contentElement = ensureElement<HTMLElement>('.modal__content', this.container);
  }

  open(content: HTMLElement): void {
    this.contentElement.innerHTML = '';
    this.contentElement.appendChild(content);
    this.container.classList.add('modal_active');
  }

  close(): void {
    this.container.classList.remove('modal_active');
    this.contentElement.innerHTML = '';
    this.eventBroker.emit('modal:close');
  }

  setCloseHandler(handler: (event: MouseEvent) => void): void {
    this.closeButton.addEventListener('click', handler);
    this.container.addEventListener('click', (event) => {
      if (event.target === this.container) {
        handler(event as MouseEvent);
      }
    });
  }

  clearContent(): void {
    this.contentElement.innerHTML = '';
  }
}
